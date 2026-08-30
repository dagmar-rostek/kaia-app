#!/usr/bin/env bash
# =============================================================================
# KAIA Pilotstudie — Datenexport für R-Auswertung
# Ausführen: auf dem Produktionsserver (Hetzner) oder lokal via SSH-Tunnel
#
# Voraussetzung:
#   docker compose -f infra/docker-compose.prod.yml up -d db
#
# Verwendung:
#   bash docs/analyse/01_export_data.sh
#
# Output: alle CSV-Dateien in docs/analyse/data/
# =============================================================================

set -euo pipefail

COMPOSE="docker compose -f infra/docker-compose.prod.yml"
DB_CMD="$COMPOSE exec -T db psql -U kaia -d kaia"
OUTDIR="docs/analyse/data"

mkdir -p "$OUTDIR"
echo "=== KAIA Datenexport startet === $(date)"

# Hilfsfunktion: SQL-Query in CSV schreiben
run_query() {
  local filename="$1"
  local query="$2"
  echo "  → $filename"
  $DB_CMD -c "\COPY ($query) TO STDOUT CSV HEADER" > "$OUTDIR/$filename"
}

# ---------------------------------------------------------------------------
# 1. TEILNEHMENDE (Stichprobenbeschreibung)
# ---------------------------------------------------------------------------
run_query "teilnehmende.csv" "
SELECT
  u.username,
  u.created_at::date AS registriert_am,
  u.status,
  u.consent_data     AS einwilligung
FROM users u
WHERE u.email NOT LIKE '%@kaia.internal'
  AND u.status = 'active'
ORDER BY u.created_at
"

# ---------------------------------------------------------------------------
# 2. SESSION-ÜBERSICHT pro Teilnehmende
# ---------------------------------------------------------------------------
run_query "sessions_summary.csv" "
SELECT
  u.username,
  COUNT(DISTINCT s.id)                                                        AS n_sessions,
  MIN(s.started_at)::date                                                     AS erste_session,
  MAX(s.started_at)::date                                                     AS letzte_session,
  ROUND(AVG(EXTRACT(EPOCH FROM (s.ended_at - s.started_at)) / 60)::numeric, 1) AS avg_min,
  SUM(CASE WHEN s.ended_at IS NOT NULL THEN 1 ELSE 0 END)                    AS sessions_abgeschlossen
FROM chat_sessions s
JOIN users u ON u.id = s.user_id
WHERE u.email NOT LIKE '%@kaia.internal'
GROUP BY u.username
ORDER BY u.username
"

# ---------------------------------------------------------------------------
# 3. SESSION-DETAILS (pro Session)
# ---------------------------------------------------------------------------
run_query "sessions_details.csv" "
SELECT
  u.username,
  s.session_number,
  s.character,
  s.started_at::date                                                           AS datum,
  ROUND(EXTRACT(EPOCH FROM (s.ended_at - s.started_at)) / 60::numeric, 1)    AS dauer_min,
  COUNT(m.id)                                                                  AS n_nachrichten,
  SUM(CASE WHEN m.role = 'user' THEN 1 ELSE 0 END)                           AS n_user_nachrichten,
  SUM(CASE WHEN m.role = 'assistant' THEN 1 ELSE 0 END)                      AS n_kaia_nachrichten
FROM chat_sessions s
JOIN users u ON u.id = s.user_id
LEFT JOIN messages m ON m.session_id = s.id
WHERE u.email NOT LIKE '%@kaia.internal'
GROUP BY u.username, s.id, s.session_number, s.character, s.started_at, s.ended_at
ORDER BY u.username, s.session_number
"

# ---------------------------------------------------------------------------
# 4. GSE PRÄ/POST
# ---------------------------------------------------------------------------
run_query "gse_praepost.csv" "
SELECT
  u.username,
  pre.total_score                                          AS gse_pre,
  pre.created_at::date                                     AS gse_pre_datum,
  post.total_score                                         AS gse_post,
  post.created_at::date                                    AS gse_post_datum,
  ROUND((post.total_score - pre.total_score)::numeric, 2)  AS delta
FROM users u
LEFT JOIN gse_results pre  ON pre.user_id  = u.id AND pre.measurement_type  = 'pre'
LEFT JOIN gse_results post ON post.user_id = u.id AND post.measurement_type = 'post'
WHERE u.email NOT LIKE '%@kaia.internal'
  AND u.status = 'active'
ORDER BY u.username
"

# GSE Items (für Item-Analyse falls nötig)
run_query "gse_items.csv" "
SELECT
  u.username,
  g.measurement_type,
  g.items,
  g.total_score,
  g.created_at
FROM gse_results g
JOIN users u ON u.id = g.user_id
WHERE u.email NOT LIKE '%@kaia.internal'
ORDER BY u.username, g.measurement_type
"

# ---------------------------------------------------------------------------
# 5. MSLQ (34 Items, einmalig)
# ---------------------------------------------------------------------------
run_query "mslq_raw.csv" "
SELECT
  u.username,
  r.item_code,
  r.subscale,
  r.response,
  r.created_at
FROM mslq_responses r
JOIN users u ON u.id = r.user_id
WHERE u.email NOT LIKE '%@kaia.internal'
ORDER BY u.username, r.subscale, r.item_code
"

run_query "mslq_subscales.csv" "
SELECT
  u.username,
  r.subscale,
  COUNT(r.item_code)                        AS n_items,
  ROUND(AVG(r.response::numeric), 3)        AS mean_score,
  ROUND(STDDEV(r.response::numeric), 3)     AS sd_score
FROM mslq_responses r
JOIN users u ON u.id = r.user_id
WHERE u.email NOT LIKE '%@kaia.internal'
GROUP BY u.username, r.subscale
ORDER BY u.username, r.subscale
"

# ---------------------------------------------------------------------------
# 6. FEEDBACKMARKER / LAZARUS-SIGNALE
# ---------------------------------------------------------------------------
run_query "adaptionssignale.csv" "
SELECT
  u.username,
  s.session_number,
  s.character,
  CASE
    WHEN m.thinking_raw ILIKE '%[ressourcen]%'      THEN 'ressourcen'
    WHEN m.thinking_raw ILIKE '%[bedrohung]%'       THEN 'bedrohung'
    WHEN m.thinking_raw ILIKE '%[herausforderung]%' THEN 'herausforderung'
    WHEN m.thinking_raw ILIKE '%[verlust]%'         THEN 'verlust'
    WHEN m.thinking_raw ILIKE '%[irrelevant]%'      THEN 'irrelevant'
    ELSE 'unklar'
  END AS lazarus_signal,
  COUNT(*) AS n_nachrichten
FROM messages m
JOIN chat_sessions s ON s.id = m.session_id
JOIN users u ON u.id = s.user_id
WHERE m.role = 'assistant'
  AND m.thinking_raw IS NOT NULL
  AND u.email NOT LIKE '%@kaia.internal'
GROUP BY u.username, s.session_number, s.character,
  CASE
    WHEN m.thinking_raw ILIKE '%[ressourcen]%'      THEN 'ressourcen'
    WHEN m.thinking_raw ILIKE '%[bedrohung]%'       THEN 'bedrohung'
    WHEN m.thinking_raw ILIKE '%[herausforderung]%' THEN 'herausforderung'
    WHEN m.thinking_raw ILIKE '%[verlust]%'         THEN 'verlust'
    WHEN m.thinking_raw ILIKE '%[irrelevant]%'      THEN 'irrelevant'
    ELSE 'unklar'
  END
ORDER BY u.username, s.session_number
"

# Fragetyp-Verteilung
run_query "fragetypen.csv" "
SELECT
  u.username,
  s.session_number,
  s.character,
  REGEXP_REPLACE(m.thinking_raw, '.*Fragetyp[^[]*\[([^\]]+)\].*', '\1', 'gs') AS fragetyp,
  COUNT(*) AS n
FROM messages m
JOIN chat_sessions s ON s.id = m.session_id
JOIN users u ON u.id = s.user_id
WHERE m.role = 'assistant'
  AND m.thinking_raw IS NOT NULL
  AND m.thinking_raw ~ 'Fragetyp'
  AND u.email NOT LIKE '%@kaia.internal'
GROUP BY u.username, s.session_number, s.character,
  REGEXP_REPLACE(m.thinking_raw, '.*Fragetyp[^[]*\[([^\]]+)\].*', '\1', 'gs')
ORDER BY u.username, s.session_number, n DESC
"

# ---------------------------------------------------------------------------
# 7. KRISENERKENNUNGS-EREIGNISSE
# ---------------------------------------------------------------------------
run_query "krisen_events.csv" "
SELECT
  u.username,
  s.session_number,
  m.created_at,
  LEFT(m.content, 200) AS content_preview
FROM messages m
JOIN chat_sessions s ON s.id = m.session_id
JOIN users u ON u.id = s.user_id
WHERE m.role = 'assistant'
  AND m.content ILIKE '%Telefonseelsorge%'
  AND u.email NOT LIKE '%@kaia.internal'
ORDER BY m.created_at
"

# ---------------------------------------------------------------------------
# 8. LLM-KOSTEN
# ---------------------------------------------------------------------------
run_query "llm_kosten.csv" "
SELECT
  provider,
  model,
  SUM(input_tokens)                AS gesamt_input_tokens,
  SUM(output_tokens)               AS gesamt_output_tokens,
  ROUND(SUM(cost_eur)::numeric, 4) AS gesamt_eur,
  COUNT(*)                         AS n_anfragen
FROM llm_usage
GROUP BY provider, model
ORDER BY gesamt_eur DESC
"

run_query "llm_kosten_pro_user.csv" "
SELECT
  u.username,
  ROUND(SUM(l.cost_eur)::numeric, 4)  AS kosten_eur,
  SUM(l.input_tokens)                 AS input_tokens,
  SUM(l.output_tokens)                AS output_tokens,
  COUNT(l.id)                         AS n_anfragen
FROM llm_usage l
JOIN users u ON u.id = l.user_id
WHERE u.email NOT LIKE '%@kaia.internal'
GROUP BY u.username
ORDER BY kosten_eur DESC
"

# ---------------------------------------------------------------------------
# 9. VOLLSTÄNDIGKEIT-CHECK (Wer erfüllt Mindestanforderung?)
# ---------------------------------------------------------------------------
run_query "vollstaendigkeits_check.csv" "
SELECT
  u.username,
  COUNT(DISTINCT s.id)                                      AS n_sessions,
  MAX(CASE WHEN pre.id  IS NOT NULL THEN 1 ELSE 0 END)     AS gse_pre_vorhanden,
  MAX(CASE WHEN post.id IS NOT NULL THEN 1 ELSE 0 END)     AS gse_post_vorhanden,
  CASE
    WHEN COUNT(DISTINCT s.id) >= 3
      AND MAX(CASE WHEN pre.id  IS NOT NULL THEN 1 ELSE 0 END) = 1
      AND MAX(CASE WHEN post.id IS NOT NULL THEN 1 ELSE 0 END) = 1
    THEN 'eingeschlossen'
    ELSE 'ausgeschlossen'
  END AS auswertungsstatus
FROM users u
LEFT JOIN chat_sessions s  ON s.user_id  = u.id
LEFT JOIN gse_results pre  ON pre.user_id  = u.id AND pre.measurement_type = 'pre'
LEFT JOIN gse_results post ON post.user_id = u.id AND post.measurement_type = 'post'
WHERE u.email NOT LIKE '%@kaia.internal'
  AND u.status = 'active'
GROUP BY u.username
ORDER BY auswertungsstatus, u.username
"

# ---------------------------------------------------------------------------
# 10. SESSION-SUMMARIES (Cross-Session-Gedächtnis)
# ---------------------------------------------------------------------------
run_query "session_summaries.csv" "
SELECT
  u.username,
  s.session_number,
  s.character,
  s.ended_at::date AS datum,
  s.session_summary::json->>'first_step'               AS first_step,
  s.session_summary::json->>'mood'                     AS mood,
  s.session_summary::json->>'observation'              AS observation,
  s.session_summary::json->>'insight_for_next_session' AS insight
FROM chat_sessions s
JOIN users u ON u.id = s.user_id
WHERE s.session_summary IS NOT NULL
  AND u.email NOT LIKE '%@kaia.internal'
ORDER BY u.username, s.session_number
"

echo ""
echo "=== Export abgeschlossen === $(date)"
echo "Dateien in: $OUTDIR/"
ls -lh "$OUTDIR/"
