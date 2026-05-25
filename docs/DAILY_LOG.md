# KAIA Entwicklungs-Tagebuch

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
