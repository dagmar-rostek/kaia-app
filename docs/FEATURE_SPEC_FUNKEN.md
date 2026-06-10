# KAIA Funken — Feature-Spec

**Erstellt:** 2026-06-10
**Status:** Ready for Review
**Autor:** Product Owner (nach Team-Session mit Didaktiker, Psychologe, UX Designer)
**Scope:** "Funken" — eigenständige Lernreflexionen nach Sessions, exportierbar (DSGVO Art. 20)

---

## Inhaltsverzeichnis

1. [Wissenschaftliche Grundlage](#wissenschaft)
2. [STORY-003: Funken speichern und abrufen](#story-003)
3. [STORY-004: Funken-Export](#story-004)
4. [Backend-Änderungen](#backend)
5. [Datenbankschema](#db)
6. [Microcopy-Inventar](#microcopy)
7. [Was explizit NICHT gebaut wird](#nicht-gebaut)
8. [Studien-methodologischer Hinweis](#studie)
9. [Offene Fragen](#open)

---

## Wissenschaftliche Grundlage {#wissenschaft}

| Prinzip | Quelle | Implikation für KAIA |
|---|---|---|
| Elaborative Encoding | Craik & Lockhart (1972) | Eigenes Formulieren vertieft Gedächtnisspur — nicht Lesen von KI-Text |
| Generation Effect | Slamecka & Graf (1978) | Selbstgeneriertes Material wird besser behalten als Rezipiertes |
| Retrieval Practice | Roediger & Karpicke (2006) | Eigene Aufzeichnungen in Folgesessions reaktiviert → Testing Effect |
| Self-Regulated Learning | Zimmermann (2000) | Führen persönlicher Notizen stärkt Metakognition und Selbstregulation |
| Ownership & Autonomieerleben | Deci & Ryan (1985) | Eigene Formulierung = eigene Attribution = Selbstwirksamkeit ↑ |
| Andragogisches Grundbedürfnis | Knowles (1984) | Erwachsene brauchen Kontrolle über ihre Lernspuren |

### Wichtige Einschränkung (Didaktiker, 2026-06-10)

Die Metapher "Funken" impliziert Flüchtigkeit. Um dem Framing-Effekt entgegenzuwirken (Lakoff & Johnson, 1980): In späteren Sessions (ab Session 5) referenziert KAIA vorherige Funken explizit — *"Was hat dein Funken aus Session 3 inzwischen entzündet?"* — damit die Metapher eine Entwicklungsdimension bekommt und nicht auf "kleinen, flüchtigen Gedanken" beschränkt bleibt. Dies ist ein KAIA-Prompt-Erweiterungsthema (→ STORY-003b, noch nicht spezifiziert).

### Nicht-Verhandelbares Designprinzip

**KAIA schreibt keinen Text in den Funken-Inhalt.** Keine Zusammenfassungen, keine Vorschläge, keine Strukturierungshilfen. Die kognitive Syntheseleistung — Auswählen, Verdichten, Formulieren — ist die eigentliche Lernarbeit. Sie der KI zu übertragen negiert den Wirkpfad zu Selbstwirksamkeit (Bandura, 1997) und widerspricht dem sokratischen Kernprinzip.

---

## STORY-003: Funken speichern und abrufen {#story-003}

**Status:** Ready
**Priorität:** Should (Pre-Pilot — vor Studienstart, nicht kriegsentscheidend für Chat-Core-Sprint)
**Geschätzter Aufwand:** M
**Abhängigkeit:** STORY-001 (Session-Abschluss-Flow) muss existieren — Funken wird im Closing-State ausgelöst

### User Story

Als lernende Person möchte ich nach jeder Session einen eigenen Gedanken in eigenen Worten festhalten, damit ich meine Lernreise persönlich dokumentiere — und damit dieser Gedanke mir gehört, nicht KAIA.

### Akzeptanzkriterien

**AC-FUNKEN-001: Funken-Input erscheint im Closing-State**

```
Given  KAIA hat die Closing-Bubble generiert (STORY-001, AC-001)
And    streaming: false ist gesetzt auf der Closing-Bubble
When   die Closing-Phase aktiv ist
Then   erscheint direkt unterhalb der KAIA-Closing-Bubble eine Textarea
And    die Textarea hat Placeholder: "Schreib auf, was bleibt…"
And    darunter: primärer Button "Diesen Funken speichern" (volle Breite Mobile)
And    darunter: sekundärer Ghost-Link "Überspringen"
And    die Textarea erscheint NICHT während KAIA noch streamt
And    die Textarea erscheint NICHT außerhalb der Closing-Phase (nicht mid-Session)
```

**AC-FUNKEN-002: Funken speichern**

```
Given  der User hat Text in die Textarea eingegeben (mind. 1 Zeichen)
When   der User auf "Diesen Funken speichern" klickt
Then   wird POST /api/v1/sessions/{id}/funken aufgerufen
And    content = User-Text, user_id = aktueller User, session_id = aktuelle Session
And    kein KI-Text wird hinzugefügt, kein Preprocessing
And    nach erfolgreichem Speichern wandelt sich die Textarea zu einer readonly-Darstellung
And    darunter erscheint in muted-Schrift: "Gespeichert. Du findest ihn unter Meine Funken."
And    "Meine Funken" ist ein Link auf /funken
And    kein Toast, kein Modal
```

**AC-FUNKEN-003: Überspringen**

```
Given  die Funken-Textarea ist sichtbar
When   der User auf "Überspringen" klickt
Then   wird kein Funken gespeichert
And    kein Hinweis, keine Nachfrage ("Bist du sicher?")
And    der Closing-Flow läuft normal weiter (AC-004 aus STORY-001)
And    aria-label: "Funken-Eingabe überspringen"
```

**AC-FUNKEN-004: Leere Textarea → Speichern**

```
Given  die Textarea ist leer
When   der User auf "Diesen Funken speichern" klickt
Then   kein Fehlertext, keine Ermahnung
And    das Feld erhält focus() und einen sichtbaren Fokus-Ring
And    kein API-Call
```

**AC-FUNKEN-005: Funken-Liste (/funken)**

```
Given  der User navigiert zu /funken
Then   wird Seitenüberschrift "Meine Funken" angezeigt (h1)
And    darunter: Chip-Filter "Alle | Heute | Gestern | Letzte Woche"
And    jeder Eintrag zeigt: Datum + Session-Nummer oben klein ("3. Juni 2026 · Session 7")
And    darunter: Funken-Text (2-Zeilen-Clamp, Klick expandiert inline)
And    Einträge sind umgekehrt chronologisch sortiert (neueste oben)
And    Chips sind per Tastatur navigierbar (aria-pressed)
```

**AC-FUNKEN-006: Leerzustand**

```
Given  der User hat noch keine Funken gespeichert
When   er /funken aufruft
Then   erscheint:
         "Noch keine Funken."
         "Am Ende einer Session fragt KAIA dich, was du mitnehmen möchtest.
          Was du dann schreibst, landet hier."
And    kein CTA-Button, kein Bild, kein Gamification-Nudge
```

**AC-FUNKEN-007: Funken löschen**

```
Given  ein Funken-Eintrag ist aufgeklappt (expanded)
When   der User auf das Löschen-Icon klickt
Then   erscheint ein <dialog role="alertdialog">
And    Button-Reihenfolge: "Behalten" (primär, links/oben) · "Löschen" (text-red-600, rechts/unten)
And    bei "Löschen": DELETE /api/v1/funken/{id}
And    nach Löschen: Eintrag verschwindet aus Liste, aria-live="polite" Bestätigung
And    Funken können NICHT bearbeitet werden — kein Edit-Button
```

**AC-FUNKEN-008: Accessibility**

```
Then   hat die Textarea aria-label="Dein Funken — schreib auf, was du aus dieser Session mitnimmst"
And    aria-required="false"
And    aria-describedby verweist auf Screen-Reader-only Hint: "Optional. Dein Text wird gespeichert und ist nur für dich sichtbar."
And    Bestätigung nach Speichern: aria-live="polite" aria-atomic="true"
And    Filter-Nav: <nav aria-label="Zeitraum-Filter">
And    Chip-Buttons: aria-pressed="true/false"
```

---

## STORY-004: Funken-Export (DSGVO Art. 20) {#story-004}

**Status:** Ready
**Priorität:** Must (DSGVO Art. 20 Datenportabilität ist Pflicht — Funken sind personenbezogene Daten)
**Geschätzter Aufwand:** S

### User Story

Als lernende Person möchte ich alle meine Funken als PDF herunterladen, damit mir meine Lernreflexionen auch außerhalb von KAIA gehören und ich die Plattform jederzeit verlassen kann.

### Akzeptanzkriterien

**AC-EXPORT-001: Export-Trigger**

```
Given  der User hat mindestens einen Funken gespeichert
When   er /funken aufruft
Then   erscheint am Ende der Liste: Button "Nimm deine Funken mit" (volle Breite Mobile)
And    bei 0 Funken: kein Export-Button sichtbar
```

**AC-EXPORT-002: Export-Dialog**

```
Given  der User klickt "Nimm deine Funken mit"
Then   erscheint ein Dialog mit Text:
         "Alle gespeicherten Funken werden als PDF exportiert.
          Du kannst sie speichern, ausdrucken oder mit dir nehmen.
          Sie verlassen damit KAIA."
         (darunter, sichtbar:) "Das entspricht deinem Recht auf Datenportabilität (DSGVO Art. 20)."
And    Button: "PDF herunterladen" (primär) · "Abbrechen" (Ghost)
And    aria-label des Export-Buttons: "Alle Funken als PDF exportieren und herunterladen"
```

**AC-EXPORT-003: PDF-Inhalt**

```
Given  der User bestätigt den Export
When   GET /api/v1/users/me/funken/export aufgerufen wird
Then   enthält das PDF:
         - Seitenüberschrift: "Meine Funken — KAIA"
         - Exportdatum
         - Für jeden Funken: Datum, Session-Nummer, Funken-Text
         - Footer: "Exportiert gemäß DSGVO Art. 20 — kaia.rostek-dagmar.eu"
And    kein KI-Text, keine KAIA-Antworten, nur Nutzer-Inhalte
And    Dateiname: kaia-funken-export-YYYY-MM-DD.pdf
```

**AC-EXPORT-004: Fehlerfall**

```
Given  der Export fehlschlägt
Then   erscheint Inline-Meldung:
         "Das PDF konnte nicht erstellt werden. Deine Funken sind sicher gespeichert —
          versuche den Export in ein paar Minuten erneut."
And    kein Datenverlust, kein Auto-Retry
```

---

## Backend-Änderungen {#backend}

| # | Typ | Beschreibung |
|---|-----|--------------|
| B1 | Neuer Endpoint | `POST /api/v1/sessions/{id}/funken` — Funken speichern |
| B2 | Neuer Endpoint | `GET /api/v1/users/me/funken` — alle Funken abrufen (Query-Params: `filter=today|yesterday|last_week`) |
| B3 | Neuer Endpoint | `DELETE /api/v1/funken/{id}` — Funken löschen (nur eigene) |
| B4 | Neuer Endpoint | `GET /api/v1/users/me/funken/export` — PDF-Export (ReportLab oder WeasyPrint) |
| B5 | Alembic-Migration | Neue Tabelle `funken` (→ DB-Schema) |
| B6 | Auth | Alle Funken-Endpoints: JWT-Auth required, user_id als Pflichtfilter (Row-Level-Security) |

---

## Datenbankschema {#db}

```sql
CREATE TABLE funken (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id  UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_funken_user_id ON funken(user_id);
CREATE INDEX idx_funken_session_id ON funken(session_id);
CREATE INDEX idx_funken_created_at ON funken(user_id, created_at DESC);
```

**Constraint-Begründung:** Max. 2000 Zeichen verhindert Missbrauch als allgemeines Notiz-Tool. Ein Funken ist ein kurzer, eigener Gedanke — kein Essay.

**Kein `updated_at`:** Funken sind unveränderlich. Kein Bearbeiten by Design.

---

## Microcopy-Inventar {#microcopy}

| Kontext | Text |
|---------|------|
| Textarea Placeholder | *"Schreib auf, was bleibt…"* |
| Primär-Button (speichern) | *"Diesen Funken speichern"* |
| Sekundär-Button | *"Überspringen"* |
| Bestätigung inline | *"Gespeichert. Du findest ihn unter [Meine Funken]."* |
| Seiten-Überschrift | *"Meine Funken"* |
| Leerzustand Zeile 1 | *"Noch keine Funken."* |
| Leerzustand Zeile 2 | *"Am Ende einer Session fragt KAIA dich, was du mitnehmen möchtest. Was du dann schreibst, landet hier."* |
| Filter-Chips | *"Alle · Heute · Gestern · Letzte Woche"* |
| Export-Button | *"Nimm deine Funken mit"* |
| Export-Dialog Intro | *"Alle gespeicherten Funken werden als PDF exportiert. Du kannst sie speichern, ausdrucken oder mit dir nehmen. Sie verlassen damit KAIA."* |
| Export-Dialog DSGVO | *"Das entspricht deinem Recht auf Datenportabilität (DSGVO Art. 20)."* |
| Export Fehler | *"Das PDF konnte nicht erstellt werden. Deine Funken sind sicher gespeichert — versuche den Export in ein paar Minuten erneut."* |
| Löschen-Dialog Primär | *"Behalten"* |
| Löschen-Dialog Destruktiv | *"Löschen"* |

---

## Was explizit NICHT gebaut wird {#nicht-gebaut}

| Feature | Begründung |
|---------|------------|
| KI-Zusammenfassung des Funken | Negiert Selbstwirksamkeitspfad (Bandura); widerspricht sokratischem Kernprinzip |
| Funken bearbeiten | Funken sind Momentaufnahmen; nachträgliche Edits ändern die Erinnerung und sind wissenschaftlich ein Validitätsproblem |
| Auto-Tagging / KI-Kategorisierung | KAIA interpretiert keine Nutzer-Inhalte |
| Erinnerungen / Proaktive Anzeige | Empfehlungslogik auf Nutzerdaten ohne Psychologe + Compliance Sign-off |
| Streaks / Fortschrittsbalken | Erzeugen Pflichtgefühl, bestrafen Aussetzer → Autonomieverlust |
| Teilen-Funktion | Verändert Schreibverhalten durch sozialen Druck; Datenschutz-Risiko |
| Funken-Vergleich ("gestern vs. heute") | Impliziert Bewertung; erzeugt Selbstüberschätzungs-Bias |
| Mid-Session Notiz | Unterbricht sokratischen Fluss; Micro-Sessions haben dafür keine Zeit |

---

## Studien-methodologischer Hinweis {#studie}

**Psychologe, 2026-06-10:** Das Funken-Feature schwächt die interne Validität des GSE-Prä/Post-Vergleichs, wenn es unkontrolliert bleibt. Nutzungsintensität (Anzahl Funken pro Session) und Nutzungshäufigkeit müssen als Kovariaten in der Studienauswertung dokumentiert werden.

**Maßnahmen:**
1. `funken`-Tabelle enthält `session_id` → Nutzungsintensität ist automatisch messbar
2. AUSWERTUNG.md: Funken-Nutzung als Kovariate hinzufügen
3. Teilnahmevereinbarung: Funken-Feature erwähnen, Nutzung freiwillig, Inhalte können mit separatem Consent als qualitative Daten ausgewertet werden
4. Thesis-Limitationen-Kapitel: Konfundierung transparent benennen

---

## Offene Fragen {#open}

| # | Frage | Für wen |
|---|-------|---------|
| OQ-F1 | PDF-Bibliothek: ReportLab (Python-nativ, mehr Kontrolle) oder WeasyPrint (HTML→PDF, einfacheres Styling)? | Architect |
| OQ-F2 | Cross-Session-Referenz (STORY-003b): Ab welcher Session fragt KAIA "Was hat dein Funken entzündet?"? Feste Session-Nummer (ab 5) oder adaptive Logik? | AI Engineer + Didaktiker |
| OQ-F3 | Funken in KAIA-Kontext: Soll der session_summary-Extract `funken_saved: bool` als Feld enthalten (für Routing-Kontext)? | AI Engineer |
| OQ-F4 | DSGVO: Benötigen Funken-Inhalte in der Datenschutzerklärung eine eigene Sektion oder sind sie unter "Chatinhalte" ausreichend abgedeckt? | Compliance |
| OQ-F5 | 2000-Zeichen-Limit: Zeichen-Zähler im UI sichtbar (spart Frustration) oder unsichtbar (reduziert Gamification-Druck)? | UX Designer |
