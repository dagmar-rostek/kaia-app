# Analytics — Plausible

KAIA nutzt [Plausible Analytics](https://plausible.io) — datenschutzkonform, kein Cookie-Banner nötig, DSGVO-konform, EU-Server.

**Dashboard:** https://plausible.io/kaia.rostek-dagmar.eu

---

## Eigene Aufrufe aus dem Tracking ausschließen

Damit deine eigenen Besuche auf der Website nicht in die Statistik einfließen, einmalig pro Browser in der Konsole ausführen:

**Schritt 1:** Website öffnen → F12 → Tab "Console"

**Schritt 2:** Bei Chrome/Edge zuerst eintippen und Enter:
```
allow pasting
```

**Schritt 3:** Dann eintippen und Enter:
```javascript
localStorage.setItem('plausible_ignore', 'true')
```

**Kontrolle:** Gibt `'true'` zurück:
```javascript
localStorage.getItem('plausible_ignore')
```

**Gilt:** Dauerhaft in diesem Browser (überlebt Browser-Schließen).  
**Nicht gilt:** Inkognito-Fenster, andere Browser, andere Geräte → dort einmalig wiederholen.

**Rückgängig machen:**
```javascript
localStorage.removeItem('plausible_ignore')
```

---

## Pre-Commit Hook deaktivieren (Notfall)

```bash
git commit --no-verify
```

---

## Setup neuer Rechner / neuer Entwickler

```bash
bash scripts/setup-hooks.sh
```
