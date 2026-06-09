# KAIA — Datenauswertung & SQL-Referenz

Dieses Dokument sammelt alle Abfragen und Methoden zur Auswertung der Studie.
Gilt für den PostgreSQL 16-Datenbankstand auf dem Produktionsserver.

Verbindung auf dem Server:
```bash
docker compose -f infra/docker-compose.prod.yml exec db psql -U kaia -d kaia
```

---

## 1. Teilnehmende

### Alle aktiven Studien-Teilnehmenden
```sql
SELECT id, username, email, created_at, status
FROM users
WHERE status = 'active'
  AND email NOT LIKE '%@kaia.internal'  -- admin-Test-Accounts ausschließen
ORDER BY created_at;
```

### Anzahl Teilnehmende
```sql
SELECT COUNT(*) AS n_teilnehmende
FROM users
WHERE status = 'active'
  AND email NOT LIKE '%@kaia.internal';
```

### Einwilligung vorhanden?
```sql
SELECT username, email, consent_data, created_at
FROM users
WHERE consent_data IS NOT TRUE
  AND email NOT LIKE '%@kaia.internal';
```

---

## 2. Sessions

### Alle Sessions pro Teilnehmende (Überblick)
```sql
SELECT
  u.username,
  COUNT(s.id)                              AS n_sessions,
  MIN(s.started_at)                        AS erste_session,
  MAX(s.started_at)                        AS letzte_session,
  ROUND(AVG(EXTRACT(EPOCH FROM (s.ended_at - s.started_at)) / 60), 1) AS avg_min
FROM chat_sessions s
JOIN users u ON u.id = s.user_id
WHERE u.email NOT LIKE '%@kaia.internal'
GROUP BY u.id, u.username
ORDER BY u.username;
```

### Sessions die Mindestanforderung (3 Sessions) erfüllen
```sql
SELECT u.username, COUNT(s.id) AS n_sessions
FROM chat_sessions s
JOIN users u ON u.id = s.user_id
WHERE u.email NOT LIKE '%@kaia.internal'
GROUP BY u.id, u.username
HAVING COUNT(s.id) >= 3
ORDER BY u.username;
```

### Session-Details (Charakter, Länge, Nachrichtenanzahl)
```sql
SELECT
  s.id,
  u.username,
  s.session_number,
  s.character,
  s.started_at,
  s.ended_at,
  ROUND(EXTRACT(EPOCH FROM (s.ended_at - s.started_at)) / 60, 1) AS dauer_min,
  COUNT(m.id)                              AS n_nachrichten,
  SUM(CASE WHEN m.role = 'user' THEN 1 ELSE 0 END) AS n_user,
  SUM(CASE WHEN m.role = 'assistant' THEN 1 ELSE 0 END) AS n_kaia
FROM chat_sessions s
JOIN users u ON u.id = s.user_id
LEFT JOIN messages m ON m.session_id = s.id
WHERE u.email NOT LIKE '%@kaia.internal'
GROUP BY s.id, u.username
ORDER BY s.started_at;
```

---

## 3. Nachrichten & Inhalte

### Alle KAIA-Antworten mit Analyse-Rohdaten
```sql
SELECT
  u.username,
  s.session_number,
  s.character,
  m.created_at,
  m.content                                AS kaia_antwort,
  m.thinking_raw                           AS interne_analyse
FROM messages m
JOIN chat_sessions s ON s.id = m.session_id
JOIN users u ON u.id = s.user_id
WHERE m.role = 'assistant'
  AND m.thinking_raw IS NOT NULL
  AND u.email NOT LIKE '%@kaia.internal'
ORDER BY m.created_at;
```

### Thinking-Blocks nach Lazarus-Signal (Häufigkeit)
```sql
SELECT
  CASE
    WHEN thinking_raw ILIKE '%Lazarus%[ressourcen]%'    THEN 'ressourcen'
    WHEN thinking_raw ILIKE '%Lazarus%[bedrohung]%'     THEN 'bedrohung'
    WHEN thinking_raw ILIKE '%Lazarus%[herausforderung]%' THEN 'herausforderung'
    WHEN thinking_raw ILIKE '%Lazarus%[verlust]%'       THEN 'verlust'
    WHEN thinking_raw ILIKE '%Lazarus%[irrelevant]%'    THEN 'irrelevant'
    ELSE 'sonstig/unklar'
  END AS lazarus_signal,
  COUNT(*) AS haeufigkeit
FROM messages
WHERE role = 'assistant'
  AND thinking_raw IS NOT NULL
GROUP BY lazarus_signal
ORDER BY haeufigkeit DESC;
```

### Fragetyp-Verteilung
```sql
SELECT
  REGEXP_REPLACE(thinking_raw, '.*Fragetyp[^[]*\[([^\]]+)\].*', '\1', 'gs') AS fragetyp,
  COUNT(*) AS haeufigkeit
FROM messages
WHERE role = 'assistant'
  AND thinking_raw IS NOT NULL
  AND thinking_raw ~ 'Fragetyp'
GROUP BY fragetyp
ORDER BY haeufigkeit DESC;
```

### Crisis-Check ausgelöst (Wie oft hat KAIA einen Krisenhinweis erkannt?)
```sql
SELECT
  u.username,
  m.created_at,
  m.content AS nachricht
FROM messages m
JOIN chat_sessions s ON s.id = m.session_id
JOIN users u ON u.id = s.user_id
WHERE m.role = 'user'
  AND s.id IN (
    -- Sessions mit Crisis-Response
    SELECT DISTINCT session_id FROM messages
    WHERE role = 'assistant'
      AND content LIKE '%Telefonseelsorge%'
  )
ORDER BY m.created_at;
```

---

## 4. GSE-Messung (Selbstwirksamkeitserwartung)

### Alle GSE-Messungen
```sql
SELECT
  u.username,
  g.measurement_type,
  g.total_score,
  g.items,
  g.created_at
FROM gse_results g
JOIN users u ON u.id = g.user_id
WHERE u.email NOT LIKE '%@kaia.internal'
ORDER BY u.username, g.measurement_type;
```

### Prä-Post-Vergleich je Teilnehmende
```sql
SELECT
  u.username,
  pre.total_score  AS gse_pre,
  post.total_score AS gse_post,
  ROUND((post.total_score - pre.total_score)::numeric, 2) AS delta
FROM users u
LEFT JOIN gse_results pre  ON pre.user_id  = u.id AND pre.measurement_type  = 'pre'
LEFT JOIN gse_results post ON post.user_id = u.id AND post.measurement_type = 'post'
WHERE u.email NOT LIKE '%@kaia.internal'
ORDER BY u.username;
```

### Mittelwert + Standardabweichung (Gruppen-Ebene)
```sql
SELECT
  measurement_type,
  ROUND(AVG(total_score)::numeric, 3)    AS mean,
  ROUND(STDDEV(total_score)::numeric, 3) AS sd,
  COUNT(*)                               AS n
FROM gse_results g
JOIN users u ON u.id = g.user_id
WHERE u.email NOT LIKE '%@kaia.internal'
GROUP BY measurement_type;
```

---

## 5. LLM-Nutzung & Kosten

### Gesamtkosten der Studie
```sql
SELECT
  provider,
  model,
  SUM(input_tokens)                         AS gesamt_input_tokens,
  SUM(output_tokens)                        AS gesamt_output_tokens,
  ROUND(SUM(cost_eur)::numeric, 4)          AS gesamt_eur,
  COUNT(*)                                  AS n_anfragen
FROM llm_usage
GROUP BY provider, model
ORDER BY gesamt_eur DESC;
```

### Kosten pro Teilnehmende
```sql
SELECT
  u.username,
  ROUND(SUM(l.cost_eur)::numeric, 4) AS kosten_eur,
  SUM(l.input_tokens)                AS input_tokens,
  SUM(l.output_tokens)               AS output_tokens,
  COUNT(l.id)                        AS n_anfragen
FROM llm_usage l
JOIN users u ON u.id = l.user_id
WHERE u.email NOT LIKE '%@kaia.internal'
GROUP BY u.id, u.username
ORDER BY kosten_eur DESC;
```

### Token-Verbrauch pro Session (Effizienz)
```sql
SELECT
  s.id AS session_id,
  u.username,
  s.character,
  s.session_number,
  SUM(l.input_tokens)  AS input_tokens,
  SUM(l.output_tokens) AS output_tokens,
  ROUND(SUM(l.cost_eur)::numeric, 4) AS kosten_eur
FROM llm_usage l
JOIN chat_sessions s ON s.id = l.session_id
JOIN users u ON u.id = s.user_id
WHERE u.email NOT LIKE '%@kaia.internal'
GROUP BY s.id, u.username
ORDER BY s.started_at;
```

---

## 6. Charakter-Vergleich (Warm / Herausfordernd / Überraschend)

### Nachrichten pro Charakter (Engagement-Proxy)
```sql
SELECT
  s.character,
  COUNT(DISTINCT s.id)              AS n_sessions,
  ROUND(AVG(msg_count.n), 1)        AS avg_nachrichten_pro_session,
  ROUND(AVG(s.ended_at - s.started_at) * 24 * 60, 1) AS avg_min
FROM chat_sessions s
JOIN users u ON u.id = s.user_id
JOIN (
  SELECT session_id, COUNT(*) AS n FROM messages GROUP BY session_id
) msg_count ON msg_count.session_id = s.id
WHERE s.ended_at IS NOT NULL
  AND u.email NOT LIKE '%@kaia.internal'
GROUP BY s.character;
```

### Lazarus-Signal-Verteilung nach Charakter
```sql
SELECT
  s.character,
  CASE
    WHEN m.thinking_raw ILIKE '%[ressourcen]%'      THEN 'ressourcen'
    WHEN m.thinking_raw ILIKE '%[bedrohung]%'       THEN 'bedrohung'
    WHEN m.thinking_raw ILIKE '%[herausforderung]%' THEN 'herausforderung'
    WHEN m.thinking_raw ILIKE '%[verlust]%'         THEN 'verlust'
    ELSE 'sonstig'
  END AS lazarus,
  COUNT(*) AS n
FROM messages m
JOIN chat_sessions s ON s.id = m.session_id
JOIN users u ON u.id = s.user_id
WHERE m.role = 'assistant'
  AND m.thinking_raw IS NOT NULL
  AND u.email NOT LIKE '%@kaia.internal'
GROUP BY s.character, lazarus
ORDER BY s.character, n DESC;
```

---

## 7. Einwilligungs-Audit (DSGVO Art. 7)

### Alle Consent-Events pro Teilnehmende
```sql
SELECT
  u.username,
  cl.event_type,
  cl.timestamp,
  cl.ip_address
FROM consent_logs cl
JOIN users u ON u.id = cl.user_id
WHERE u.email NOT LIKE '%@kaia.internal'
ORDER BY u.username, cl.timestamp;
```

### Fehlende Einwilligungen (Pflicht vor Studienstart)
```sql
SELECT u.username, u.email
FROM users u
WHERE u.email NOT LIKE '%@kaia.internal'
  AND u.id NOT IN (
    SELECT DISTINCT user_id FROM consent_logs
    WHERE event_type = 'ki_disclosure'
  );
```

---

## 8. Vollständiger Datensatz-Export (für R/Python)

### Export aller Studien-Daten als CSV (auf Server ausführen)
```bash
docker compose -f infra/docker-compose.prod.yml exec db psql -U kaia -d kaia -c \
  "\COPY (
    SELECT
      u.username,
      s.id AS session_id,
      s.session_number,
      s.character,
      s.started_at,
      s.ended_at,
      m.id AS message_id,
      m.role,
      m.content,
      m.thinking_raw,
      m.created_at AS message_at,
      pre.total_score  AS gse_pre,
      post.total_score AS gse_post
    FROM chat_sessions s
    JOIN users u ON u.id = s.user_id
    JOIN messages m ON m.session_id = s.id
    LEFT JOIN gse_results pre  ON pre.user_id  = u.id AND pre.measurement_type  = 'pre'
    LEFT JOIN gse_results post ON post.user_id = u.id AND post.measurement_type = 'post'
    WHERE u.email NOT LIKE '%@kaia.internal'
    ORDER BY u.username, s.session_number, m.id
  ) TO '/tmp/kaia_export.csv' CSV HEADER"
```

Dann lokal runterladen:
```bash
docker cp kaia-infra-db-1:/tmp/kaia_export.csv ~/kaia_export.csv
```

---

## 9. Qualitätsprüfung vor Studienende

### Mindestanforderungen erfüllt? (3 Sessions, beide GSE-Messungen)
```sql
SELECT
  u.username,
  COUNT(DISTINCT s.id)                              AS n_sessions,
  MAX(CASE WHEN pre.id  IS NOT NULL THEN 1 ELSE 0 END) AS gse_pre_vorhanden,
  MAX(CASE WHEN post.id IS NOT NULL THEN 1 ELSE 0 END) AS gse_post_vorhanden,
  CASE
    WHEN COUNT(DISTINCT s.id) >= 3
      AND MAX(CASE WHEN pre.id  IS NOT NULL THEN 1 ELSE 0 END) = 1
      AND MAX(CASE WHEN post.id IS NOT NULL THEN 1 ELSE 0 END) = 1
    THEN 'vollstaendig'
    ELSE 'unvollstaendig'
  END AS status
FROM users u
LEFT JOIN chat_sessions s  ON s.user_id  = u.id
LEFT JOIN gse_results pre  ON pre.user_id  = u.id AND pre.measurement_type  = 'pre'
LEFT JOIN gse_results post ON post.user_id = u.id AND post.measurement_type = 'post'
WHERE u.email NOT LIKE '%@kaia.internal'
  AND u.status = 'active'
GROUP BY u.id, u.username
ORDER BY status, u.username;
```
