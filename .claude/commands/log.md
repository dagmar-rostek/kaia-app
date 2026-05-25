---
description: Tageseintrag in docs/DAILY_LOG.md schreiben
argument-hint: "Schwerpunkt heute + was wurde abgeschlossen"
---

Schreibe einen neuen Tageseintrag in `docs/DAILY_LOG.md`.

Der Nutzer hat folgendes angegeben:
$ARGUMENTS

Gehe so vor:

1. Lies `docs/DAILY_LOG.md` um das bestehende Format zu verstehen.
2. Lies `docs/RELEASE_NOTES.md` um die heutigen Commits zu kennen.
3. Frage den Nutzer falls nötig nach:
   - Schwerpunkt des Tages (falls nicht in $ARGUMENTS)
   - Was abgeschlossen wurde
   - Was offen bleibt / morgen ansteht
   - Geschätzte Claude Code Kosten (falls bekannt, sonst weglassen)
4. Erstelle einen neuen Eintrag oben in der Datei (nach dem Header, vor dem ersten `---`).

**Format:**

```markdown
## YYYY-MM-DD (Wochentag)

**Schwerpunkt:** ...

**Abgeschlossen:**
- ...
- ...

**Commits:** SHA1, SHA2, ...

**Claude Code Session:** ca. $X–Y (Schätzung — echte Zahl in Anthropic Console)

**Offen → nächste Session:**
- ...
```

Halte den Eintrag präzise — Stichpunkte, keine Romane. Der Log ist für dich als Forscherin: Womit hast du den Tag verbracht, was hast du geschafft.
