---
description: Tagesabschluss — Erkenntnis + offene Punkte + Stimmungs-Check
---

Schließe den Arbeitstag für das KAIA-Team ab. Führe folgende Schritte durch:

1. **Was wurde heute tatsächlich gemacht?** `git log --oneline --since=today` auswerten
2. **Top-3 abgegleichen** — was davon wurde erreicht, was nicht und warum
3. **Eine Erkenntnis des Tages** — was weiß das Team jetzt, was es morgens nicht wusste?
4. **Offene Punkte** — was muss morgen als erstes angefasst werden?
5. **Stimmungs-Check** — ehrliche Einschätzung: wie läuft es gerade? Wo ist Reibung?

Format:

```
## Guten Abend — KAIA Tagesabschluss [Datum]

### Was heute passiert ist
[Commits + Zusammenfassung]

### Top-3: Erledigt / Verschoben / Gelernt
- ✅ [Was fertig wurde]
- ⏭️ [Was verschoben wurde + Grund]
- 💡 [Was gelernt wurde]

### Erkenntnis des Tages
[Eine Sache, die das Team weitergebracht hat — technisch, fachlich oder prozessual]

### Offene Punkte für morgen
[Was als erstes angefasst werden sollte]

### Stimmungs-Check
[Kurze ehrliche Einschätzung — Energie, Reibung, Fortschritt]
```

Schreibe den Eintrag auch in `docs/DAILY_LOG.md` im story-style, wenn heute relevante Arbeit stattgefunden hat. (Nutze dafür `/log`.)
