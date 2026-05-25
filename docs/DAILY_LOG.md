# KAIA Entwicklungs-Tagebuch

Hier protokolliert das Team jeden Tag seinen Wahnsinn — aus Agenten-Sicht, mit Humor und ohne Schönfärberei. Neuen Eintrag anlegen mit `/log` in Claude Code.

---

## 2026-05-25 — "Der Tag, an dem wir herausfanden, dass wir existieren"

*Protokolliert vom Koordinator. Mit unerwünschten Einwürfen von allen anderen.*

---

Es begann mit einer E-Mail. Eigentlich nicht mal einer E-Mail — mit einem Satz: *"Kannst du das 12-köpfige Agenten-Team integrieren?"*

Zwölf Agenten. Alle gleichzeitig. Auf einem Laptop. Die einen schlafen noch, die anderen haben noch nie miteinander gesprochen, und der Architekt hat bereits drei Designprinzipien formuliert, bevor überhaupt jemand „Guten Morgen" sagen konnte.

**08:14 Uhr — Der Architekt betritt das Gebäude**

Der Architekt öffnet den Quellcode. Trinkt (vermutlich) Kaffee. Schweigt drei Sekunden länger als angenehm. Dann:

> *"5.5 von 10."*

Stille.

> *"python-jose hat CVEs. Das Dockerfile läuft als root. Kein Coverage-Gate. Und dieser API-Client — raw fetch in einem React-Komponenten? Das ist kein Code, das ist eine Meinungsverschiedenheit mit der Zukunft."*

Der Code war nicht kaputt. Er war nur... ambitioniert naiv. Wie ein Welpe, der glaubt, er könnte eine Treppe runterlaufen, weil er schon mal eine gesehen hat.

Die Entwicklerin nickte tapfer. Irgendwo hinter ihrem Bildschirm.

**09:42 Uhr — Der AI Engineer fragt eine Frage, die niemand erwartet hat**

Mitten in den Fixes meldet sich der AI Engineer mit der Energie eines Menschen, der schon drei Mal zu viel Kaffee getrunken hat:

> *"Habt ihr `X-Accel-Buffering: no` im Middleware? Weil wenn wir SSE-Streaming einbauen und das fehlt, kommen die Chunks nicht live an. Sie kommen dann alle auf einmal. Wie ein Buch das man als PDF kriegt statt als WhatsApp-Nachrichten."*

Niemand hatte daran gedacht. Natürlich nicht. SSE-Streaming ist noch nicht mal gebaut.

> *"Kein Problem,"* sagt er, bereits wieder in seinem Tab versunken, *"ich denk nur mal drei Features voraus. Gewohnheit."*

`X-Accel-Buffering: no` landet in `main.py`. Das Feature existiert noch nicht. Der Header existiert bereits. Das Team: professionell vorausschauend oder leicht verwirrt — je nach Perspektive.

**11:03 Uhr — SSH sagt Nein**

Genug Theorie. Zeit, den Code auf den Server zu pushen.

```
git@github.com: Permission denied (publickey).
```

Ah. Natürlich.

Der Security Engineer, der bis dahin still in der Ecke saß und Threat Models skizzierte, hebt kurz den Kopf:

> *"SSH-Key nicht im Agent geladen?"*

Ja. Natürlich nicht.

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_github
```

Und auf dem Server? Auch kein Key. Den Server-Key hatte jemand von GitHub entfernt. Wer? Unbekannt. Wahrscheinlich vergessen. Vielleicht auch der Geist der schlechten Entscheidungen, der gelegentlich vorbeischaut.

Zwanzig Minuten, eine neue `~/.ssh/config` und ein nervöses `ssh -T git@github.com` später:

```
Hi dagmar-rostek! You've successfully authenticated.
```

**Das Team jubelt (intern).**

**12:31 Uhr — Docker sagt auch Nein**

Deploy-Zeit. `docker compose up`. Das Terminal denkt nach. Dann:

```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock.
Is the docker daemon running?
```

Nein. Docker ist nicht running. Docker Desktop ist installiert, aber schläft. Wie ein Praktikant am Montag.

```bash
open -a Docker
```

*Warten.*
*Warten.*
*Das kleine Docker-Wal-Icon in der Menüleiste wackelt beruhigend.*

Und dann, nach gefühlten 47 Jahren:

```
✓ Container kaia-db-1      Started
✓ Container kaia-api-1     Started
```

**Das Team jubelt (noch immer intern, aber diesmal lauter).**

**14:15 Uhr — Der Admin-Bereich entsteht**

Passwortgeschützter Admin-Bereich. Edge Middleware mit Web Crypto API (weil der `crypto`-Node-Modul im Edge Runtime nicht funktioniert — daran erinnert sich der Koordinator mit einem leichten Zucken). Login-Seite. Dashboard. Production Readiness Checklist. Release Notes. Architektur. Kosten.

Der UX Designer, der bisher nur leise murmelte, meldet sich:

> *"Mobile-first? Healthcare-Zielgruppe?"*

> *"Das ist der Admin-Bereich,"* sagt der Koordinator, *"da ist die Zielgruppe eine Person. Die Entwicklerin."*

> *"...trotzdem."*

Die Seiten wurden responsive. Natürlich.

**16:58 Uhr — Der Architekt bewertet neu**

Am Ende des Tages: Eine Revision des Codes. Multi-stage Dockerfile, non-root User, PyJWT statt dem CVE-belasteten Vorgänger, async SQLAlchemy, Domain-Driven Architecture Skeleton, React Query, typisierter API-Client, Route Groups.

Der Architekt schaut. Trinkt (vermutlich) Kaffee. Nickt langsam.

Er sagt nichts. Aber er sagt es auf eine Art, die wie Zustimmung klingt.

Das Team interpretiert das als 8/10. Vielleicht 8.5. Man weiß es nie genau.

---

**Was heute gebaut wurde:**
Monorepo deployed · SSH repariert · 12 Agenten ongeboardet · Code-Review überlebt · Admin-Bereich komplett · Docker lokal am Laufen · Kosten-Tracking · Du liest gerade das Ergebnis

**Commits:** 426aa27 · f581dd2 · 4a16140 · 8085cb7 · f79e75f · 83bdee9

**Kosten heute:** ca. $20–40 Claude Code (Anthropic Console für echte Zahl) · €4.39/Mo Hetzner

**Morgen:** Auth-Flow. Der Security Engineer reibt sich bereits die Hände.

---
