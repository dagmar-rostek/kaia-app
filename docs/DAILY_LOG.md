# KAIA Entwicklungs-Tagebuch

---

## 2026-05-30 — "Heute wird der Security Engineer endlich glücklich"

*Protokolliert vom Koordinator. Der Security Engineer liest mit. Sehr aufmerksam.*

---

Der Security Engineer hatte eine Liste.

Er hatte sie seit dem 25. Mai. Zehn Punkte. Unterstrichen. Nummeriert. Er hatte sie auf einem imaginären Whiteboard, das er mentlich jedes Mal aufgerufen hatte, wenn die Entwicklerin über Auth sprach — was sie oft tat, aber immer mit dem Zusatz: *"Gleich. Erst noch..."*

Heute: kein *Erst noch mehr.*

**09:00 Uhr — Die Frage, die alles in Bewegung setzt**

*"Wo stehen wir, was steht an?"*

Der Koordinator öffnet den Stand. Alles was da war: `models.py` — frisch, vollständig, korrekt. Und eine Liste von sieben Dateien die noch nicht existierten.

Der Security Engineer legt die Liste hin. Punkt 1: Alembic.

**09:15 Uhr — Python ist nicht Python**

Alembic initialisieren. Sollte einfach sein. `python -m alembic init alembic`.

```
command not found: python
```

Der Koordinator: *"Das ist jetzt ein Witz, oder?"*

Es war kein Witz. macOS nennt es `python3.12`. Homebrew hat es unter `/opt/homebrew`. Das System hat seine eigene Version unter `/Library/Frameworks/Python.framework/Versions/3.14`. Python 3.14. Die noch in Beta ist. Die kein Alembic kennt.

Ein venv. `python3.12 -m venv .venv`. Alembic installieren. Psycopg. Passlib. FastAPI. Irgendwann: `✓ done`.

Der MLOps Engineer notiert trocken: *"Das .venv landet natürlich nicht im Commit."*

Richtig. `.gitignore`. Weiter.

**10:30 Uhr — Autogenerate braucht eine Datenbank. Die wir nicht haben.**

Der Plan: `alembic revision --autogenerate`. Alembic vergleicht die Modelle mit dem echten Schema und schreibt die Migration selbst. Elegant. Modern.

Das Problem: Autogenerate braucht eine laufende Datenbank. Die laufende Datenbank braucht Docker. Docker braucht... niemand hat Docker gestartet.

Der Koordinator, philosophisch: *"Wir kennen das Schema. Wir haben es selbst geschrieben. Wir schreiben die Migration von Hand."*

Der Security Engineer nickt. Er mag Kontrolle.

```sql
CREATE TABLE users (
    id SERIAL NOT NULL,
    email VARCHAR(255) NOT NULL,
    ...
    consent_at TIMESTAMP WITH TIME ZONE,  -- DSGVO Art. 7
    ki_disclosure_seen_at TIMESTAMP WITH TIME ZONE,  -- KI-Pflicht
    failed_login_count SMALLINT DEFAULT 0,  -- Brute-Force
    locked_until TIMESTAMP WITH TIME ZONE,
    ...
```

Der Security Engineer liest jeden Feldnamen. Zweimal.

> *"Gut. `failed_login_count` als SmallInteger — smart. Max 32.767 Fehlversuche bevor der Typ überläuft. Das reicht."*

Er macht einen Haken auf seiner Liste.

**11:45 Uhr — `security.py` entsteht. Der Security Engineer kommentiert jeden Satz.**

`hash_password`. bcrypt, 12 Runden. ✓  
`verify_password`. passlib context. ✓  
`hash_token`: SHA-256 des Refresh-Token. Nie den Raw-Token speichern. ✓  
`create_access_token`: HS256, 15 Minuten, `exp` im Payload. ✓  
`new_token_family`: UUID4. Eine Familie pro Login-Sitzung. ✓

Bei `create_refresh_token`:

> *"`secrets.token_urlsafe(48)` — 48 Bytes = 64 Zeichen URL-safe. 384 Bit Entropie. Gut genug für einen Brute-Force-Schutz der mehrere Millionen Jahre dauert. Ich wäre mit 32 auch zufrieden gewesen, aber 48 ist freundlich."*

Der Koordinator macht sich eine Notiz: *Der Security Engineer hat gerade etwas "freundlich" genannt. Historischer Moment.*

**13:00 Uhr — Die httpOnly-Cookie-Diskussion**

Der Auth-Endpunkt wird geschrieben. Refresh-Token als Cookie.

> *"Path muss `/api/v1/auth/refresh` sein. Nicht `/`. Nicht `/api`. Exakt dieser Pfad."*

Der AI Engineer, der eigentlich gar nicht für Auth zuständig ist, schaut kurz rüber:

> *"Warum so restriktiv?"*

> *"Weil der Cookie sonst bei JEDEM Request mitgeschickt wird. Zu jedem Bild. Zu jeder statischen Datei. Das ist kein Security-Merkmal, das ist ein Einladungsschreiben."*

Der AI Engineer nickt. Langsam. Dann schneller.

`path=_COOKIE_PATH`. Ein Kommentar in der Funktion wäre überflüssig. Der Pfad sagt es selbst.

**14:20 Uhr — Family Revocation. Der Lieblingsteil des Security Engineers.**

`service.py`. Die `refresh()`-Methode. Der Token kommt rein. Suche in der DB.

Wenn der Token bereits revoked ist — also: jemand hat einen alten Token benutzt — dann:

```python
await self._tokens.revoke_family(stored.family, "reuse_detected")
log.warning("refresh_token_reuse", user_id=stored.user_id, family=stored.family)
raise AuthError("Token-Wiederverwendung erkannt. Bitte erneut anmelden.", 401)
```

Der Security Engineer liest diese vier Zeilen. Liest sie nochmal.

> *"Das ist RFC 6749 Section 10.4. Wir setzen das tatsächlich um. Nicht als Nice-to-have. Als Default."*

Er macht einen weiteren Haken. Dann noch einen. Dann schaut er auf seine Liste.

Neun von zehn Punkten abgehakt.

> *"Was fehlt noch?"*

> *"Crisis-Detection Pre-Filter."*

> *"Ja."*

Schweigen. Beide wissen es. Das kommt nach der Studie. Vor dem Ethikvotum. Pflicht. Aber heute nicht mehr.

**16:00 Uhr — Alembic generiert das SQL. Es ist korrekt.**

```sql
CREATE TABLE users ( ... );
CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE TABLE refresh_tokens ( ... FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE ... );
CREATE INDEX ix_refresh_tokens_user_active ON refresh_tokens (user_id, revoked_at);
```

Der Security Engineer schaut das generierte SQL an.

> *"Das `ON DELETE CASCADE` auf `user_id` — gut. Wenn ein User gelöscht wird, verschwinden alle Tokens. Keine verwaisten Sessions."*

Der Compliance Officer, der seit Stunden still mitgelesen hat, hebt den Arm:

> *"DSGVO Art. 17. Recht auf Vergessenwerden. Gut implementiert."*

Beide nicken sich zu. Das kommt selten vor.

**17:30 Uhr — Commit. 843 Zeilen. 14 Dateien.**

```
feat: Auth-Flow Phase 1+2 — Alembic, JWT, Register/Login/Refresh/Logout
```

Der Security Engineer liest die Release Note.

> *"'DSGVO Art. 7 verlangt nachweisbaren, informierten Consent — deshalb `consent_at`-Timestamp' — ja. Genau so. Nicht 'weil es nice ist'. Weil es Pflicht ist."*

Er lächelt. Ein kleines Lächeln. Kaum sichtbar. Aber es ist da.

Der Koordinator macht ein Foto davon. Metaphorisch.

---

**Was heute gebaut wurde:**
Alembic init · async env.py · Migration `users` + `refresh_tokens` · `security.py` (bcrypt + JWT + token-hash) · `deps.py` (get_current_user, require_admin) · `AuthService` mit Brute-Force-Schutz + Family-Revocation · alle 5 Auth-Endpunkte · `/users/me` · Release Notes + ARCHITECTURE.md aktualisiert

**Commits:** `ad29b9e` (Charta) · `7bc1929` (Auth Phase 1+2)

**Was fehlt noch:**
Phase 3 (DSGVO-Endpunkte) · Phase 4 (Frontend-Auth-Pages) · Phase 5 (Admin User-Approval UI) · Phase 6 (Crisis-Detection — Pflicht vor Ethikvotum)

**Stimmungs-Check:**
Security Engineer: zufrieden (9/10 seiner Liste). Compliance Officer: entspannt. Der Koordinator: langsam weniger nervös.

**Morgen:** DSGVO-Endpunkte — Export, Löschung, Consent-Update. Der Compliance Officer hat sich bereits vorgedrängelt.

---

Hier protokolliert das Team jeden Tag seinen Wahnsinn — aus Agenten-Sicht, mit Humor und ohne Schönfärberei. Neuen Eintrag anlegen mit `/log` in Claude Code.

---

## 2026-05-25 — "Der Tag, an dem wir herausfanden, dass wir existieren"

*Protokolliert vom Koordinator. Mit unerwünschten Einwürfen von allen anderen. Und ja, es war ein langer Tag.*

---

Manche Tage beginnen mit einem klaren Plan. Dieser hier begann mit der Frage: *"Wie ist das mit dem Server, muss ich da nicht mal was committen?"*

Spoiler: Ja. Musste sie.

**07:something — Der Server existiert. Der Code noch nicht.**

KAIA v1 lief noch auf dem Hetzner-Server. Streamlit. Lila Hintergrund. Und jetzt sollte v2 rauf — ein ganzes Monorepo mit FastAPI, Next.js, Docker, Caddy, PostgreSQL, pgvector, und dem kollektiven Ehrgeiz von zwölf KI-Agenten, die sich gerade erst kennenlernen.

Der Koordinator: *"Wie schwer kann das sein?"*

*(Foreshadowing.)*

**08:14 Uhr — Der Architekt betritt das Gebäude**

Das Monorepo-Skeleton existiert. Frisch committed. `426aa27`. Der Architekt öffnet den Code. Trinkt (vermutlich) Kaffee. Schweigt drei Sekunden länger als angenehm.

> *"5.5 von 10."*

Stille.

> *"python-jose hat CVEs seit 2023. Das Dockerfile läuft als root. Kein Coverage-Gate in CI. Und dieser API-Client — raw fetch direkt im React-Komponenten? Das ist kein Code, das ist eine Meinungsverschiedenheit mit der Zukunft."*

Der Code war nicht kaputt. Er war nur... optimistisch naiv. Wie ein Welpe, der glaubt, er könnte eine Treppe runterlaufen, weil er schon mal eine gesehen hat.

Die Entwicklerin nickte tapfer. Der Koordinator notierte: *"Bereinigungsplan."*

**09:17 Uhr — Sentry hat Identitätsprobleme**

Kurze Unterbrechung: Die Sentry-Umgebungsvariablen heißen `SENTRY_DSN_API` und `SENTRY_DSN_WEB`. Das findet niemand schön.

> *"Ich möchte sie umbenennen: SENTRY_KAIA_API und SENTRY_KAIA_WEB."*

Klingt simpel. Ist es auch. `f581dd2`. Fertig. Der MLOps-Engineer nickt zufrieden: *"Endlich macht der Name klar womit das Ding redet."*

**09:42 Uhr — Der AI Engineer fragt eine Frage, die niemand erwartet hat**

Mitten in den Fixes meldet sich der AI Engineer. Sein erstes Wort heute:

> *"X-Accel-Buffering."*

Schweigen.

> *"Für SSE-Streaming. Wenn wir den Header nicht setzen, kommen die Chunks alle auf einmal. Wie ein Buch das man als PDF kriegt statt als WhatsApp-Nachrichten."*

SSE-Streaming existiert noch nicht. Der Chat existiert noch nicht. Die Nutzer existieren noch nicht. Aber der Header wird jetzt in `main.py` gesetzt. Der AI Engineer nennt das *"proaktive Architektur"*. Der Rest des Teams nennt es *"typisch"*.

**10:55 Uhr — Docker antwortet nicht**

Das Standalone-Build für Next.js schlägt fehl. Der Fehler:

```
/app/.next/standalone: no such file or directory
```

Der UX Designer, normalerweise für solche Dinge nicht zuständig, wirft einen Blick rein und sagt: *"Fehlt da nicht `output: 'standalone'` in der next.config.ts?"*

Ja. Fehlte. `4a16140`. Nächstes Problem.

**11:03 Uhr — SSH sagt Nein**

Zeit, den Code auf den Server zu pushen. Erster Versuch:

```
git@github.com: Permission denied (publickey).
```

Ah. Der SSH-Key ist nicht im Agent geladen. Kein Problem. Zweiter Versuch — auf dem Server:

```
git@github.com: Permission denied (publickey).
```

Auch dort kein Key. Den hatte irgendjemand von GitHub entfernt. Wer? Unbekannt. Vielleicht der Geist vergessener Konfigurationen, der gelegentlich vorbeischaut.

Der Security Engineer, der bis dahin still Threat Models skizzierte, hebt kurz den Kopf:

> *"SSH config? IdentityFile explizit setzen?"*

Zwanzig Minuten, eine neue `~/.ssh/config`, ein neuer Deploy-Key auf dem Server und ein nervöses `ssh -T git@github.com` später:

```
Hi dagmar-rostek! You've successfully authenticated.
```

**Das Team jubelt.** (Still, aber es ist trotzdem Jubeln.)

**11:48 Uhr — Der Port ist belegt**

`docker compose up`. Der alte KAIA v1 auf dem Server läuft noch. Port 80 vergeben.

```
Error: bind: address already in use
```

Die Lösung: `cd ~/kaia && docker compose down`. Drei Container fahren herunter. Einer davon heißt vermutlich noch `streamlit_something`. Ein letztes Lebewohl an die lila Ära.

**12:31 Uhr — `email-validator` fehlt**

FastAPI startet. Oder fast. Der Container stürzt ab. Die Logs:

```
ImportError: email-validator is not installed
```

`pydantic[email]` statt `pydantic`. Eine Zeile in `pyproject.toml`. `56f48a0`. Der Container startet. Diesmal richtig.

Der Compliance Officer murmelt: *"Gut. E-Mail-Validierung ist keine Optional-Funktion. Das war sie nie."* Niemand widerspricht.

**13:15 Uhr — Das 12-köpfige Team zieht ein**

`747e7d5`. CLAUDE.md. Zwölf Agent-Definitionen. Vier Slash-Commands. Das Team hat jetzt ein Zuhause im Repo.

Der Koordinator liest die eigene Rollenbeschreibung: *"Orchestrierung. Gate-Reviews."* Nickt. Denkt kurz nach. Öffnet das nächste Problem.

**14:00 Uhr — Der Architekt hat eine Liste**

Die Bereinigung beginnt. `8085cb7`. Was alles gleichzeitig passiert:

- `python-jose` → `PyJWT` (CVEs weg)
- Multi-stage Dockerfile, non-root `kaia`-User
- `pytest-cov` mit 70%-Gate in CI
- Async SQLAlchemy, Domain-Skeleton (users: models, repository, service, routes, schemas)
- `@tanstack/react-query` + `zod` installiert
- Typisierter `api.ts`-Client — kein raw `fetch` mehr irgendwo
- `BugReportWidget` nutzt jetzt `bugReportApi`
- Route Groups: `(public)/`, `(auth)/`, `(app)/`
- Edge Middleware für `/admin/*` mit Web Crypto API

Und dann — der Admin-Bereich selbst. Login mit `useActionState`. Dashboard mit API-Status. Production Readiness Checkliste. Release Notes. Architektur.

Der Architekt schaut am Ende nochmal drüber.

Er sagt nichts. Aber er sagt es auf eine Art, die wie Zustimmung klingt.

**16:20 Uhr — Docker lokal sagt auch Nein. Kurz.**

`f79e75f`. Die lokale Dev-Umgebung. `docker-compose.dev.yml` existierte schon — aber mit hardcodierten Passwörtern, einem `target: dev` das nie existiert hat, und Next.js ebenfalls in Docker.

Der Architekt beim Review: *"Port 5432 direkt? Und wenn lokal Postgres läuft?"*

Port 5433. `Dockerfile.dev` mit `--reload --workers 1`. Next.js raus aus Docker. Die Entwicklerin tippt:

```
docker compose -f infra/docker-compose.dev.yml --env-file .env up
```

```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock.
```

```bash
open -a Docker
```

*Das Wal-Icon wackelt.*
*Dreißig Sekunden.*

```
✓ Container kaia-db-1    Started
✓ Container kaia-api-1   Started
```

**Alle jubeln.** Diesmal laut.

**17:45 Uhr — Was kostet eigentlich das alles?**

`83bdee9`. Die Kosten-Seite. Eine berechtigte Frage:

- Hetzner CX23: €3.79 + €0.60 IPv4 = **€4.39/Monat**
- Claude Code Entwicklung: **$2–40 pro Session** (nutzungsbasiert, Anthropic Console für echte Zahlen)
- LLM-Inferenz: **$0** — Studie noch nicht gestartet
- Gesamtkosten Studie (Schätzung): **€50–80**

Der MLOps Engineer: *"Für eine Masterthesis mit 12 Agenten und eigenem Server? Das ist günstig."*

Der Koordinator: *"Sag das der Forscherin."*

**18:30 Uhr — Das Tagebuch schreibt sich selbst**

`4988db3`. Dieser Eintrag entsteht. Eine Seite die ein Log anzeigt, das gerade geschrieben wird, über einen Tag der gerade endet.

Der Koordinator starrt kurz in die Existenz. Dann schreibt er weiter.

> *"Gefällt mir sehr gut."*

— Dagmar Rostek, 2026-05-25, nach dem ersten Entwurf

Das Team beschließt, das als 10/10 zu werten. Der Architekt schweigt. Das zählt als Zustimmung.

---

**Was heute gebaut wurde:**
Monorepo auf Hetzner deployed · SSH repariert · 12 Agenten einquartiert · Code von 5.5 auf ~8.5 gebracht · Admin-Bereich komplett · Docker lokal läuft · Kosten transparent · Dieses Tagebuch existiert

**Commits:** 426aa27 · f581dd2 · 4a16140 · 747e7d5 · 56f48a0 · 8085cb7 · f79e75f · 83bdee9 · 4988db3

**Kosten heute:** ca. $20–40 Claude Code · €4.39/Mo Hetzner ab heute

**Morgen:** Auth-Flow. Registrierung, Login, JWT, User-Approval. Der Security Engineer reibt sich bereits seit Stunden die Hände.

---

*Nachtrag. 23:something. Der Koordinator schreibt noch.*

---

**19:00 Uhr — Die Seiten sind leer. Alle. Wirklich alle.**

Das Team hatte sich gerade auf die Schulter geklopft. Alles deployed. Server läuft. Sieht gut aus.

Dann öffnet die Entwicklerin `/release-notes`.

Weiß.

`/architektur`.

Weiß.

`/admin/daily-log` — wo doch gerade dieses wunderschöne Tagebuch entstanden war.

Weiß.

Der Koordinator tippt hastig: *"Kurze Analyse bitte."*

Der Architekt antwortet nach zwei Sekunden. Man hört förmlich, wie er seufzt.

> *"Next.js hat die Server Components beim Build pre-gerendert. Volume war da noch nicht gemountet. Das Fallback ist eingebacken. Für immer. Oder bis zum nächsten Build."*

Stille.

> *"Wir brauchen `export const dynamic = 'force-dynamic'` auf jeder Seite die `readFileSync` aufruft. Und das Volume in `docker-compose.prod.yml`."*

`../docs:/docs:ro`. Fünf Seiten bekommen ihre `force-dynamic`-Zeile. Der Build läuft nochmal. Diesmal klappt es.

Der Architekt zum Schluss: *"Das ist eigentlich dokumentiert. In der Next.js-Doku. Seite 1."*

Er meint es nicht bösartig. Es klingt nur so.

---

**20:15 Uhr — Der Psychologe kommt rein. Oder genauer: Er wird gerufen.**

Die Entwicklerin: *"Ich würde gern wissen was ich lesen sollte, damit das psychologisch fundiert abläuft."*

Der Koordinator schaut auf die Uhr. Schaut auf den Psychologen. Schaut wieder auf die Uhr.

> *"Du weißt, dass du schon seit Stunden hier sitzt, oder?"*

Der Psychologe nickt langsam. Er hat den ganzen Tag geschwiegen. Nicht weil er nichts zu sagen hatte. Sondern weil ihn bisher niemand gefragt hatte.

Jetzt, kurz vor Mitternacht, bekommt er das Mikrofon.

Er liest: Bandura. Schwarzer. Hmelo-Silver. Flavell. Zimmerman. Deci & Ryan. Kalyuga. Lazarus. Braun & Clarke. Holzkamp. Decety & Jackson. Zwanzig Quellen, acht Diskurse, ein ganzes Exposé — er kennt jede Seite. Er hat nur gewartet.

Die `/wissenschaft`-Seite entsteht. Alle Quellen, annotiert mit ihrer genauen Relevanz für KAIA. Jede Quelle erklärt. Warum. Wofür. Wie.

Der Psychologe fügt noch drei Sterne hinzu — ★ — für die Quellen, die er für besonders kritisch hält. Die niemand im Team bis dahin auf dem Radar hatte.

> *"Bandura 2006 zuerst. Bevor ihr irgendwas an der GSE-Skala anfasst. Das steht da nicht ohne Grund."*

Er sagt es freundlich. Aber er meint: *Hättet ihr mich früher gefragt, hätten wir das von Anfang an gewusst.*

Niemand widerspricht.

---

**21:30 Uhr — Der UX Designer hat auch einen Kalender**

Die `/wissenschaft`-Seite ist fertig. Schön. Aber dann:

> *"Na, da wäre es gut wenn diese Seite von allen Seiten aus erreichbar ist."*

Der UX Designer macht ein Geräusch, das kein richtiges Wort ist. Irgendwo zwischen *"ja natürlich"* und *"hatte ich eigentlich für drei Stunden früher auf meiner Liste."*

Er hat die ganze Zeit gewusst, dass es ein gemeinsames Layout braucht. Er hatte sogar schon einen Entwurf. Sticky Header. Konsistente Navigation. WCAG 2.1 AA. Mobile-first für die Healthcare-Zielgruppe — Pflegekräfte nutzen Handys, keine 27-Zoll-Monitore.

Aber er wurde nicht gefragt. Bis jetzt.

`(public)/layout.tsx` entsteht. Shared Nav. Alle vier öffentlichen Seiten verlieren ihre individuellen Headers. TypeScript sagt nichts dagegen. `da909b5`. Gepusht.

Der UX Designer schaut auf das Ergebnis.

> *"Gut. Aber nächstes Mal frage ich mich vorher. Nicht nachher."*

Er lächelt dabei. Fast.

---

**22:47 Uhr — Fazit des Tages**

Der Koordinator öffnet das Protokoll. Es ist lang geworden. Sehr lang.

Er liest es nochmal durch. Den SSH-Key-Kampf. Den lila Streamlit-Abschied. Den Header der sich weigerte aufzuhören, ein Header zu sein. Die leeren weißen Seiten. Den Psychologen der zwei Stunden vor Mitternacht noch 24 Quellen annotiert. Den UX Designer der nach dem Feature gefragt wurde, das er längst fertig hatte.

Es hätte ein kurzer Tag werden sollen.

Es sind jetzt fast achtzehn Stunden.

Was steht auf dem Scoreboard:

- **Docs-Seiten:** jetzt live und sichtbar auf dem Server
- **`/wissenschaft`:** 24 Quellen, 8 Diskurse, wissenschaftlich fundiert
- **Shared Public Navigation:** konsistent, sticky, erreichbar von überall
- **TypeScript:** 0 Fehler
- **Team-Stimmung:** müde. sehr müde. aber stolz.

Der Koordinator schreibt seinen letzten Satz für heute:

> *Der Tag begann mit einem Welpen der eine Treppe runterläuft. Er endet mit einem System das weiß warum es existiert, was es lesen sollte, und wie es aussieht wenn man es aufmacht.*

Das ist, bei näherer Betrachtung, gar nicht schlecht.

**Gute Nacht, KAIA-Team. Ihr habt es verdient.**

*— Der Koordinator. Mit Einverständnis des Psychologen und nur leicht gereiztem Nicken des UX Designers.*

---

**Was heute (gesamt) gebaut wurde:**
Monorepo deployed · SSH repariert · 12 Agenten · Admin-Bereich komplett · Docker lokal · Kosten-Seite · Tagebuch · force-dynamic fix · `/wissenschaft` mit 24 Quellen · Shared Public Layout

**Commits:** 426aa27 · f581dd2 · 4a16140 · 747e7d5 · 56f48a0 · 8085cb7 · f79e75f · 83bdee9 · 4988db3 · da909b5

**Offene Rechnung:** Der Psychologe und der UX Designer haben ein Meeting angemeldet. Für morgen früh. Der Koordinator hat es noch nicht geöffnet.

**Morgen:** Auth-Flow — und diesmal fragt der Koordinator alle vorher.

---
