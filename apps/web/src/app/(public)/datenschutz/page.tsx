export const metadata = {
  title: "Datenschutzerklärung — KAIA",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

export default function DatenschutzPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Datenschutzerklärung</h1>
        <p className="text-sm text-muted-foreground">
          Stand: Juni 2026 · Gültig für die KAIA-Pilotstudie im Rahmen einer Masterthesis
          an der SRH Fernhochschule Riedlingen
        </p>
      </div>

      <Section title="1. Verantwortliche Person">
        <p>
          Verantwortlich im Sinne der DSGVO (Art. 4 Nr. 7) für die Verarbeitung personenbezogener
          Daten im Rahmen der KAIA-Pilotstudie ist:
        </p>
        <div className="rounded-lg border border-border p-4 text-sm space-y-1">
          <p className="font-medium text-foreground">Dagmar Rostek</p>
          <p>Masterstudentin M.Sc. Data Science &amp; Analytics</p>
          <p>SRH Fernhochschule Riedlingen</p>
          <p>
            Kontakt:{" "}
            <a href="mailto:dagmar.rostek@wbstraining.de" className="underline hover:text-foreground transition-colors">
              dagmar.rostek@wbstraining.de
            </a>
          </p>
        </div>
      </Section>

      <Section title="2. Zweck und Rechtsgrundlage der Verarbeitung">
        <p>
          KAIA (Kinetic AI Agent) ist ein KI-gestütztes Lernbegleitungssystem, das im Rahmen
          einer wissenschaftlichen Pilotstudie erprobt wird. Die Verarbeitung personenbezogener
          Daten dient ausschließlich:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>der Durchführung der Pilotstudie (Forschungszweck)</li>
          <li>der Bereitstellung der Anwendungsfunktionen während der Studienlaufzeit</li>
          <li>der Sicherstellung der technischen Integrität des Systems</li>
        </ul>
        <p>
          <strong className="text-foreground">Rechtsgrundlage:</strong> Einwilligung gemäß
          Art. 6 Abs. 1 lit. a DSGVO. Für besondere Kategorien personenbezogener Daten
          (psychologische Selbsteinschätzungen im Rahmen der GSE-Messung) gilt zusätzlich
          Art. 9 Abs. 2 lit. a DSGVO (ausdrückliche Einwilligung zu Forschungszwecken).
          Die Einwilligung wird bei der Registrierung explizit und getrennt eingeholt.
        </p>
        <p>
          Die Teilnahme ist freiwillig. Die Einwilligung kann jederzeit ohne Angabe von Gründen
          und ohne Nachteile widerrufen werden (Art. 7 Abs. 3 DSGVO).
        </p>
      </Section>

      <Section title="3. Erhobene Daten">
        <p>Im Rahmen der Studie werden folgende Datenkategorien verarbeitet:</p>
        <div className="space-y-3">
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="font-medium text-foreground text-xs uppercase tracking-wider">Registrierungsdaten</p>
            <p>E-Mail-Adresse, Benutzername, verschlüsseltes Passwort (bcrypt, 12 Runden),
              Zeitpunkt der Einwilligung, IP-Adresse bei Registrierung (für Sicherheitszwecke).</p>
          </div>
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="font-medium text-foreground text-xs uppercase tracking-wider">Chat-Gespräche</p>
            <p>Texteingaben und Antworten der KI während der Nutzungssessions.
              Diese Daten sind pseudonymisiert (Benutzer-ID statt Klarname) und werden
              für die Transkriptanalyse im Rahmen der Studie verwendet.</p>
          </div>
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="font-medium text-foreground text-xs uppercase tracking-wider">GSE-Messungen</p>
            <p>Antworten auf die Skala zur Allgemeinen Selbstwirksamkeitserwartung
              (Schwarzer &amp; Jerusalem, 1995) — 10 Items, erhoben zu Beginn und Ende der Studie.
              Dies sind besondere Kategorien personenbezogener Daten (psychologische Daten).</p>
          </div>
          <div className="rounded-lg border border-border p-3 space-y-1">
            <p className="font-medium text-foreground text-xs uppercase tracking-wider">Nutzungsdaten (optional)</p>
            <p>Login-Zeitpunkte, Session-Dauer, gewählter KAIA-Charakter — nur wenn bei
              der Registrierung explizit zugestimmt (consent_analytics = true).</p>
          </div>
        </div>
      </Section>

      <Section title="4. Speicherdauer und Löschung">
        <p>
          Alle personenbezogenen Daten werden <strong className="text-foreground">6 Monate nach
          offiziellem Abschluss der Pilotstudie</strong> automatisch und vollständig gelöscht.
          Das Enddatum der Studie wird auf dieser Seite bekannt gegeben.
        </p>
        <p>
          Für die wissenschaftliche Publikation und Thesis werden ausschließlich vollständig
          anonymisierte Daten verwendet — kein Rückschluss auf einzelne Personen ist möglich.
        </p>
        <p>
          Du kannst die Löschung deiner Daten jederzeit selbst anstoßen (Art. 17 DSGVO) —
          siehe Abschnitt 6 (Deine Rechte).
        </p>
      </Section>

      <Section title="5. Technische Infrastruktur und Auftragsverarbeiter">
        <p>
          <strong className="text-foreground">Hosting:</strong> Der KAIA-Server läuft auf einem
          Hetzner-Server (CX23, Standort Helsinki, Finnland — EU). Hetzner Online GmbH ist
          Auftragsverarbeiter gemäß Art. 28 DSGVO. Der Serverstandort in der EU stellt sicher,
          dass keine Daten in Drittländer übermittelt werden (kein Schrems-II-Problem für
          Hostingdaten).
        </p>
        <p>
          <strong className="text-foreground">LLM-Anbieter:</strong> Für die KI-Verarbeitung
          werden Sprachmodelle von Anthropic (Claude), OpenAI (GPT-4o) und Mistral AI eingesetzt.
          Chat-Inhalte werden an diese Dienste übermittelt. Die Nutzung erfolgt nur mit
          abgeschlossenen Auftragsverarbeitungsverträgen (Data Processing Agreements).
        </p>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <p className="font-medium text-amber-700 dark:text-amber-400">Hinweis zu US-Anbietern</p>
          <p className="mt-1">Anthropic und OpenAI haben ihren Sitz in den USA. Die Übermittlung
          erfolgt auf Basis von Standardvertragsklauseln (SCCs) gemäß Art. 46 DSGVO.
          Angesichts des Schrems-II-Urteils wird in der Datenschutzerklärung und der
          Teilnahmevereinbarung explizit auf diesen Umstand hingewiesen. Mistral AI
          hat seinen Sitz in der EU (Paris, Frankreich).</p>
        </div>
        <p>
          <strong className="text-foreground">Fehler-Monitoring:</strong> Technische Fehler
          werden über Sentry (sentry.io) protokolliert. Sentry erhält keine Chat-Inhalte,
          nur technische Fehlermeldungen und Stack Traces.
        </p>
      </Section>

      <Section title="6. Deine Rechte (Art. 15–21 DSGVO)">
        <p>Du hast das Recht auf:</p>
        <ul className="space-y-2">
          {[
            { art: "Art. 15", right: "Auskunft", desc: "Welche Daten wir über dich gespeichert haben." },
            { art: "Art. 16", right: "Berichtigung", desc: "Korrektur unrichtiger personenbezogener Daten." },
            { art: "Art. 17", right: "Löschung", desc: "Löschung deiner Daten — jederzeit, ohne Angabe von Gründen." },
            { art: "Art. 18", right: "Einschränkung", desc: "Einschränkung der Verarbeitung in bestimmten Fällen." },
            { art: "Art. 20", right: "Datenportabilität", desc: "Export deiner Daten in einem maschinenlesbaren Format (JSON)." },
            { art: "Art. 21", right: "Widerspruch", desc: "Widerspruch gegen die Verarbeitung zu Forschungszwecken." },
          ].map(({ art, right, desc }) => (
            <li key={art} className="flex gap-3">
              <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5 w-14">{art}</span>
              <span><strong className="text-foreground">{right}:</strong> {desc}</span>
            </li>
          ))}
        </ul>
        <p>
          Alle DSGVO-Rechte sind im eingeloggten Bereich unter{" "}
          <strong className="text-foreground">Profil → Datenschutz</strong> als Self-Service
          verfügbar (in Entwicklung — wird vor Studienstart vollständig implementiert).
        </p>
        <p>
          Du hast außerdem das Recht, Beschwerde bei der zuständigen Datenschutzaufsichtsbehörde
          einzulegen. Zuständig ist der <strong className="text-foreground">Landesbeauftragte
          für den Datenschutz Baden-Württemberg</strong>.
        </p>
      </Section>

      <Section title="7. Keine automatisierte Einzelentscheidung">
        <p>
          KAIA trifft keine automatisierten Entscheidungen mit rechtlicher oder ähnlich
          erheblicher Wirkung (Art. 22 DSGVO). Die KI-Ausgaben sind Gesprächsbeiträge,
          keine Diagnosen, Bewertungen oder Empfehlungen mit Verbindlichkeit.
        </p>
        <p>
          Alle von der KI abgeleiteten Messwerte (z.B. Stimmungseinschätzungen aus
          Gesprächstranskripten) werden im Rahmen der Forschung ausgewertet,
          haben aber keinen Einfluss auf den Systemzugang oder andere Entscheidungen.
        </p>
      </Section>

      <Section title="8. Krisenprävention">
        <p>
          KAIA enthält einen automatischen Krisenerkennungs-Filter. Wenn Eingaben auf eine
          psychische Notlage hinweisen, wird keine KI-Antwort generiert — stattdessen erscheint
          ein Hinweis auf professionelle Hilfsangebote (Telefonseelsorge 0800 111 0 111,
          Notruf 112). KAIA ist kein Ersatz für psychologische oder psychiatrische Behandlung.
        </p>
      </Section>

      <Section title="9. Änderungen dieser Erklärung">
        <p>
          Diese Datenschutzerklärung kann vor Studienbeginn aktualisiert werden.
          Wesentliche Änderungen werden allen registrierten Teilnehmenden per E-Mail
          mitgeteilt. Das Datum der letzten Aktualisierung ist oben angegeben.
        </p>
      </Section>

      <div className="rounded-lg border border-border p-4 text-xs text-muted-foreground">
        Bei Fragen zum Datenschutz:{" "}
        <a href="mailto:dagmar.rostek@wbstraining.de" className="underline hover:text-foreground transition-colors">
          dagmar.rostek@wbstraining.de
        </a>
      </div>
    </main>
  )
}
