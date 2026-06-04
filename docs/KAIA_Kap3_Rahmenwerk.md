# Kapitel 3 — Konzeptionelles Rahmenwerk

> **Stand:** 04. Juni 2026 · **Version:** 0.3-DRAFT  
> **Reviewer:** Architect · AI Engineer · Psychologe (ausstehend)  
> **Geplanter Umfang:** ca. 15–18 Seiten (~4.000–4.500 Wörter)  
> **Status:** Grundstruktur vorhanden, Abschnitte 3.3–3.5 noch ausbaufähig

---

## Überblick

Dieses Kapitel entwickelt das konzeptionelle Rahmenwerk von KAIA — die theoretisch begründete Designarchitektur, aus der die technische Implementierung (Kapitel 4) unmittelbar folgt. Die vier Kernkomponenten des Rahmenwerks (Zustandserkennung, Adaptionslogik, Sokratisches Prompt-System, Gedächtnisarchitektur) werden hergeleitet, begründet und in ihrem Zusammenhang dargestellt.

---

## 3.1 Vom theoretischen Rahmen zur Designentscheidung

Das in Kapitel 2 entwickelte theoretische Fundament — Konstruktivismus, Selbstwirksamkeit, Lazarus, Flow/Teigen, Expertise Reversal Effect, Computational Empathy — legt eine Reihe von Designanforderungen nahe, die in diesem Abschnitt explizit gemacht werden.

Eine KI-gestützte Lernbegleitung, die Selbstwirksamkeit stärken will, muss demnach:

1. **Eigenleistung schützen** — keine Antworten geben, die den kognitiv notwendigen Eigenanteil ersetzen (Kalyuga et al., 2003)
2. **Subjektive Bewertung adressieren** — nicht den Schwierigkeitsgrad objektiv reduzieren, sondern die wahrgenommene Ressource stärken (Lazarus & Folkman, 1984)
3. **Aktivierungsniveau balancieren** — zwischen Unterforderung (Langeweile) und Überforderung (Angst) navigieren (Csikszentmihalyi, 1990; Teigen, 1994)
4. **Transparent kommunizieren** — explizit als KI auftreten, keine menschliche Empathie simulieren (Decety & Jackson, 2004)
5. **Adaptiv reagieren** — auf individuelle Zustandssignale, nicht auf generische Nutzerprofile

Diese fünf Anforderungen strukturieren das konzeptionelle Rahmenwerk in vier Komponenten.

---

## 3.2 Komponente 1: Zustandserkennung

### 3.2.1 Das Problem der textbasierten Zustandsinferenz

Neuroadaptive Systeme im klinischen oder militärischen Einsatz nutzen physiologische Sensoren (EEG, Herzratenvariabilität) zur Zustandsmessung. Für eine DSGVO-konforme Webanwendung sind diese Zugänge nicht realisierbar. KAIA operiert ausschließlich auf der Basis von Texteingaben.

Die textbasierte Zustandsinferenz ist epistemisch beschränkt: Sie liefert Indikatoren, keine Messungen. Folgende Signale werden als Proxys für kognitive und emotionale Zustände eingesetzt:

- **Antwortlänge und -tempo**: Kurze, fragmentierte Antworten können auf Überforderung oder Desengagement hinweisen
- **Wiederholungsmuster**: Mehrfaches Rückfragen nach demselben Konzept signalisiert Verständnisprobleme
- **Emotionale Markierungen**: Explizite Frustrationsausdrücke ("Das verstehe ich nicht", "Ich komme nicht weiter")
- **Elaborationstiefe**: Ausführliche, elaborierte Antworten signalisieren Flow oder hohes Engagement

Diese Indikatoren werden nicht deterministisch ausgewertet, sondern dem Sprachmodell als Kontextinformation übergeben. Die Zustandsinferenz ist damit modellbasiert und erbt die Unsicherheiten des jeweiligen LLM.

### 3.2.2 Drei Zustandskategorien

KAIA unterscheidet drei operative Zustandskategorien:

| Zustand | Indikatoren | Systemreaktion |
|---|---|---|
| **Explorativ** (Flow) | Lange, elaborierte Antworten; eigenständige Hypothesenbildung | Offene, erweiternde Fragen |
| **Orientierungslos** (Überforderung) | Kurze Fragmente; wiederholte Rückfragen; explizite Verwirrung | Strukturierende, einschränkende Fragen |
| **Reflektierend** | Metakognitive Aussagen; Selbstbewertungen | Rückspiegelnde, vertiefende Fragen |

Diese Kategorisierung ist operational, nicht diagnostisch. KAIA diagnostiziert keine psychologischen Zustände — es passt seinen Gesprächsstil an wahrgenommene Gesprächsmuster an.

---

## 3.3 Komponente 2: Sokratisches Prompt-System

### 3.3.1 Operationalisierung der Sokratischen Methode für LLMs

Die Sokratische Methode (vgl. Kapitel 2.1) lässt sich für Sprachmodelle in einem strukturierten Prompt-System operationalisieren. Das System enthält vier Ebenen:

1. **Systemprompt (Charakter und Grundhaltung)**: Definiert KAIAs Persönlichkeit, Gesprächsregeln (niemals Antworten geben), ethische Leitlinien (Crisis-Detection, KI-Disclosure) und den aktiven Interaktionsmodus
2. **Nutzerprofil (kontextuelles Gedächtnis)**: Aggregierte Informationen über bisherige Gesprächsthemen, Lernbereiche und erkannte Präferenzen
3. **Gesprächs-Retrieval (episodisches Gedächtnis)**: Semantisch relevante Ausschnitte aus früheren Sitzungen via pgvector
4. **Aktueller Gesprächskontext**: Die laufende Konversation der aktuellen Session

### 3.3.2 Neuroadaptiver Modus als Prompt-Parameter

Der neuroadaptive Modus wird als expliziter Parameter im Systemprompt kodiert:

```
Aktueller Modus: [explorativ | orientierungslos | reflektierend]
Anweisung: Passe deinen Fragestil entsprechend an. Im explorativen Modus: 
öffnende, hypothesengenerierende Fragen. Im orientierungslosen Modus: 
strukturierende Fragen mit eng umrissenen Schritten. Im reflektierenden 
Modus: metakognitive Rückspiegel-Fragen.
```

Diese Kodierung ist intentional vereinfacht — die Differenzierung zwischen den Modi liegt beim Sprachmodell, nicht bei einer regelbasierten Heuristik. Der LLM-Evaluationsbericht (Kapitel 5) untersucht systematisch, welche Modelle diese Differenzierung am zuverlässigsten umsetzen.

### 3.3.3 Prompt-Management in der Datenbank

Alle Prompt-Templates werden in der PostgreSQL-Datenbank verwaltet und via Jinja2 gerendert. Dies ermöglicht:
- Editieren ohne Re-Deployment
- Versionierung und Auditierbarkeit
- Study-Lock: Bei `STUDY_MODE=locked` werden Prompt-Änderungen von der CI blockiert (reproduzierbare Studienkonditionen)

---

## 3.4 Komponente 3: Zwei-Schicht-Gedächtnisarchitektur

### 3.4.1 Architekturprinzip

KAIAs Gedächtnisarchitektur kombiniert zwei komplementäre Datenspeicher:

**Schicht 1: Strukturiertes Gedächtnis (PostgreSQL)**
- User-Profil: Präferenzen, Lernbereiche, Einwilligungsstatus
- Sitzungshistorie: Timestamps, Dauer, Modus-Verläufe
- GSE-Messdaten: Prä- und Post-Werte

**Schicht 2: Semantisches Gedächtnis (pgvector)**
- Vektorisierte Gesprächsfragmente
- Semantische Ähnlichkeitssuche für Cross-Session-Kontext
- Row-Level-Security: user_id als Pflichtparameter — kein Cross-User-Leak

### 3.4.2 Das Cross-Session-Gedächtnis als Differenzierungsmerkmal

Das semantische Gedächtnis ermöglicht KAIA, frühere Gesprächsthemen natürlich zu referenzieren: "Du hast letzte Woche erwähnt, dass du mit Statistik kämpfst — bist du dort weitergekommen?" Diese Eigenschaft unterscheidet KAIA von stateless Chatbots und ist die technische Grundlage für das Erleben von Kontinuität und Beziehungsaufbau — ein Faktor, der nach Decety und Jackson (2004) für Computational Empathy zentral ist.

### 3.4.3 DSGVO-Konformität der Gedächtnisarchitektur

Alle gespeicherten Gesprächsdaten sind pseudonymisiert (user_id statt Klarname). Die 6-Monate-Löschfrist nach Studienende ist technisch implementiert. Das Recht auf Datenlöschung (Art. 17 DSGVO) ist als Self-Service im Benutzerprofil zugänglich. Die Gedächtnisarchitektur ist damit nicht nur ein funktionales, sondern auch ein datenschutzrechtliches Designmerkmal.

---

## 3.5 Komponente 4: Character-System als Engagement-Faktor

### 3.5.1 Begründung

KAIAs Character-System — 10 distinkte Persönlichkeitsvarianten plus "Normal" und "Crazy" mit täglichem Wechsel — ist auf den ersten Blick ein UX-Feature. Es hat jedoch eine theoretische Begründung: Variabilität in der Stimulus-Präsentation kann Habituation (und damit Desengagement) reduzieren. Csikszentmihalyi (1990) beschreibt, dass Flow unter anderem durch Neuheit und Überraschung begünstigt wird.

Die empirische Wirkung des Character-Systems wird in der Pilotstudie nicht systematisch untersucht — die Stichprobengröße und der explorative Charakter lassen keine isolierte Wirkungsanalyse zu. Das System wird im LLM-Evaluationsbericht (Kapitel 5) im Hinblick auf Konsistenz und Kohärenz der Charakterdarstellung bewertet.

---

## 3.6 Synthese: Das KAIA-Rahmenwerk als Designartefakt

*[Abschluss-Abschnitt — wird nach Abschluss von Kapitel 4 vervollständigt]*

Das konzeptionelle Rahmenwerk von KAIA lässt sich als Designartefakt im Sinne von Hevner et al. (2004) beschreiben: Es übersetzt empirisch fundierte Theorien in operative Designentscheidungen. Die vier Komponenten (Zustandserkennung, Sokratisches Prompt-System, Gedächtnis, Character-System) bilden keine unabhängigen Teilsysteme, sondern ein kohärentes Ganzes, in dem jede Komponente theoretisch begründet und empirisch motiviert ist.

---

## Literaturverzeichnis (Kapitel 3)

*Alle Quellen aus Kapitel 2 bleiben gültig. Zusätzliche Quellen:*

Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*. Harper & Row.

Decety, J., & Jackson, P. L. (2004). The functional architecture of human empathy. *Behavioral and Cognitive Neuroscience Reviews, 3*(2), 71–100.

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75–105.

Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist, 38*(1), 23–31.

Lazarus, R. S., & Folkman, S. (1984). *Stress, Appraisal, and Coping*. Springer.

Teigen, K. H. (1994). Yerkes-Dodson: A law for all seasons. *Theory & Psychology, 4*(4), 525–547.
