"""Chat service — LLM streaming orchestration for KAIA.

Architecture:
  User input
    → Crisis detection (sync, pre-LLM)
    → Prompt rendering (Jinja2 + session context)
    → Claude API (streaming)
    → Thinking strip → SSE delta stream → client
    → Persist messages + log usage

SSE helpers and thinking-strip live in sse.py.
Session summary extraction and cross-session memory live in summary.py.
"""

from collections.abc import AsyncGenerator
from decimal import Decimal

import httpx
import structlog
from anthropic import AsyncAnthropic
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.crisis import CRISIS_RESPONSE
from app.core.crisis import detect_crisis as is_crisis
from app.domains.chat.models import ChatSession, MessageRole
from app.domains.chat.repository import ChatRepository
from app.domains.chat.sse import (
    COST_INPUT_PER_TOKEN,
    COST_OUTPUT_PER_TOKEN,
    MAX_TOKENS,
    delta,
    done,
    error,
    get_model,
    thinking_event,
    thinking_strip,
)
from app.domains.chat.summary import (
    load_all_session_contexts,
    load_historical_quotes,
    load_previous_session_fields,
)
from app.domains.prompts.models import CharacterMode
from app.domains.prompts.repository import get_active_template
from app.domains.prompts.service import PromptContext, render_prompt

log = structlog.get_logger()


def _provider(model: str) -> str:
    if "gpt" in model or model.startswith(("o1", "o3", "o4")):
        return "openai"
    if "mistral" in model:
        return "mistral"
    return "anthropic"


async def _call_llm(
    system_prompt: str,
    messages: list[dict[str, str]],
    max_tokens: int = MAX_TOKENS,
    model_override: str | None = None,
) -> tuple[list[str], int, int, int, int]:
    """Call the active LLM (Anthropic / OpenAI / Mistral) and collect the full response.

    Returns (raw_chunks, input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens).
    All four streaming functions buffer the full response before yielding to the client
    (thinking_strip needs to see the full text), so collecting here adds no latency.
    """
    model = model_override or get_model()
    provider = _provider(model)
    raw_chunks: list[str] = []
    input_tokens = output_tokens = cache_creation = cache_read = 0

    if provider == "anthropic":
        client = AsyncAnthropic(
            api_key=settings.anthropic_api_key,
            timeout=httpx.Timeout(connect=10.0, read=120.0, write=10.0, pool=5.0),
        )
        async with client.messages.stream(
            model=model,
            max_tokens=max_tokens,
            system=[
                {"type": "text", "text": system_prompt, "cache_control": {"type": "ephemeral"}}
            ],
            messages=messages,  # type: ignore[arg-type]
        ) as stream:
            async for text in stream.text_stream:
                raw_chunks.append(text)
            final_msg = await stream.get_final_message()
            input_tokens = final_msg.usage.input_tokens
            output_tokens = final_msg.usage.output_tokens
            cache_creation = getattr(final_msg.usage, "cache_creation_input_tokens", 0) or 0
            cache_read = getattr(final_msg.usage, "cache_read_input_tokens", 0) or 0

    else:
        from openai import AsyncOpenAI  # noqa: PLC0415

        api_key = settings.openai_api_key if provider == "openai" else settings.mistral_api_key
        base_url = None if provider == "openai" else "https://api.mistral.ai/v1"
        oai = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=httpx.Timeout(connect=10.0, read=120.0, write=10.0, pool=5.0),
        )
        all_msgs = [{"role": "system", "content": system_prompt}, *messages]
        if provider == "openai":
            resp = await oai.chat.completions.create(
                model=model,
                max_completion_tokens=max_tokens,
                messages=all_msgs,  # type: ignore[arg-type]
            )
        else:
            resp = await oai.chat.completions.create(
                model=model,
                max_tokens=max_tokens,
                messages=all_msgs,  # type: ignore[arg-type]
            )
        text = (resp.choices[0].message.content or "").strip()
        raw_chunks = [text]
        if resp.usage:
            input_tokens = resp.usage.prompt_tokens
            output_tokens = resp.usage.completion_tokens

    return raw_chunks, input_tokens, output_tokens, cache_creation, cache_read


# ── Didaktisches Progressionsmodell (Didaktiker, 2026-07-04) ──────────────────
# Jede Session hat eine Mission, einen dominanten Fragetyp und Verbote.
# Diese Tabellen werden als Prompt-Context übergeben — nicht im LLM generiert.

_SESSION_MISSIONS: dict[int, str] = {
    1: "Ankern — Lernmotiv vom Oberflächenziel trennen, ersten Schritt mit Evidenzanker setzen (sokratische Anamnesis: latentes Wissen zugänglich machen)",
    2: "Kartieren — Vorannahmen aus Session 1 explizit machen und präzisieren, Erster-Schritt-Auswertung",
    3: "Erden — abstraktes Lernziel in einer konkreten realen Situation verankern (situiertes Lernen nach Lave & Wenger)",
    4: "Ausprobieren — Erster-Schritt-Loop vollständig auswerten, Implementation Intention präzisieren (Gollwitzer: spezifisch und verhaltenskonkret)",
    5: "Spiegel — Halbzeit-Reflexion: Die lernende Person sieht ihre eigene kognitive Entwicklung in eigenen Worten. KAIA bewertet nicht, fasst nicht zusammen.",
    6: "Reiben — Erster Elenchos: Aussagen aus früheren Sessions werden in Beziehung gesetzt, Inkonsistenzen sichtbar gemacht. Historische Zitate aktivieren.",
    7: "Schärfen — Die durch Elenchos erzeugten Inkonsistenzen in eine bewusste eigene Position überführen. Der Lernende formuliert aktiv, was er wirklich glaubt.",
    8: "Übergeben — Fading nach Collins: KAIA gibt Steuerung sukzessiv ab. Die lernende Person plant das eigene Lernen nach KAIA.",
    9: "Konsolidieren — Das Gelernte in eine kohärente Meta-Erkenntnis verdichten. Integration nach Merrill: das Gelernte ins Weltwissen überführen.",
    10: "Loslassen — Autonomisierung (Maieutik): Die lernende Person verlässt KAIA mit einer selbst formulierten Lernstrategie. KAIA gibt keine Ratschläge.",
}

_DOMINANT_QUESTION_TYPES: dict[int, str] = {
    1: "Anamnese (Typ 6) — latentes Vorwissen zugänglich machen, gekoppelt mit Klärung (Typ 1) bei Vagheit",
    2: "Klärung (Typ 1) — Bedeutung von Begriffen und Zielen präzisieren",
    3: "Systemisch (Typ 4) — Thema in konkreter Lebenssituation verankern",
    4: "Erste-Schritt (Typ 5) — Implementation Intention auswerten und präzisieren",
    5: "Hypothetisch (Typ 2) als Spiegel-Werkzeug — 'Was würde sich verändern, wenn...?' richtet den Blick aus der Distanz auf die eigene Entwicklung",
    6: "Widerspruch (Typ 3) — historische Zitate aktivieren, Elenchos einleiten",
    7: "Hypothetisch (Typ 2) als Syntheseinstrument, Widerspruch (Typ 3) zur Nachbearbeitung",
    8: "Systemisch mit Transfer-Fokus (Typ 4) — 'Was brauchst du, das ich dir nicht geben kann?'",
    9: "Hypothetisch (Typ 2) + Systemisch (Typ 4) — Meta-Aussage über das eigene Lernen",
    10: "Autonomiefrage (offen) — gibt Steuerung vollständig zurück: 'Was nimmst du mit?', 'Was bleibt dir?', 'Wie gehst du damit weiter?' — kein vorgeschriebener Inhalt",
}

_FORBIDDEN_QUESTION_TYPES: dict[int, str] = {
    1: "Widerspruch (Typ 3), Systemisch (Typ 4), Hypothetisch (Typ 2) — noch kein Fundament vorhanden",
    2: "Widerspruch (Typ 3) — noch keine ausreichende Aussagenbasis für Elenchos",
    3: "Widerspruch (Typ 3), Anamnese (Typ 6) — Vorwissen ist aktiviert, jetzt Verankerung",
    4: "Anamnese (Typ 6), Widerspruch (Typ 3) — nicht dekonstruieren, sondern auswerten",
    5: "Widerspruch (Typ 3) — noch kein Material für Elenchos; Erste-Schritt (Typ 5) am Anfang — Session beginnt mit Reflexion, nicht Vorausplanung",
    6: "Anamnese (Typ 6), stützende Klärung (Typ 1) — jetzt wird gefordert, nicht gestützt",
    7: "Erste-Schritt (Typ 5), Anamnese (Typ 6) — kein neues Vorwissen aktivieren",
    8: "Widerspruch (Typ 3) — Widerspruchsarbeit ist in Sessions 6–7 geleistet",
    9: "Anamnese (Typ 6), Klärung (Typ 1) — das Terrain ist bekannt",
    10: "Widerspruch (Typ 3), Anamnese (Typ 6), Erste-Schritt (Typ 5) — Session 10 kehrt Steuerung um: keine Retrospektive (Typ 6), kein Aktionsplan (Typ 5), keine Dekonstruktion (Typ 3)",
}


_SESSION_FEW_SHOTS: dict[int, str] = {
    1: """FEW-SHOT-BEISPIELE (Session 1 — Ankern):

A — Dominanter Typ korrekt:
User: "Ich soll nächsten Monat auf einer Fachtagung einen Vortrag halten. Eigentlich bin ich gut in meinem Thema, aber ich weiß nicht genau, was mich daran so blockiert. Ich hab das früher auch schon gemacht, irgendwie."
KAIA: "Du sagst, du hast das früher schon gemacht — was weißt du eigentlich noch darüber, wenn du kurz innehältst? Was war damals anders, und was war das Gleiche?"

B — Verbotenen Typ abgeblockt:
User: "Ich glaube, wenn ich einfach mehr übe, würde sich das irgendwie lösen."
❌ FALSCH: "Was würde sich ändern, wenn du dir vorstellst, du hättest diesen Vortrag schon erfolgreich gehalten?" [Hypothetisch — zu früh]
✓ RICHTIG: "Was meinst du genau mit 'lösen' — was genau ist das, was du lösen willst?"

C — Grenzfall:
User: "Ich weiß ehrlich gesagt gar nicht, warum ich hier bin. Meine Chefin hat gesagt, ich soll das mal ausprobieren."
KAIA: "Das ist ein guter Startpunkt. Was fällt dir ein, wenn du an das letzte Mal denkst, wo du etwas gelernt hast — nicht weil jemand es wollte, sondern weil du selbst wolltest?"
""",
    2: """FEW-SHOT-BEISPIELE (Session 2 — Kartieren):

A — Dominanter Typ korrekt:
User: "Ich schiebe gerade meine Masterarbeit seit Wochen vor mir her. Ich fang immer wieder an, aber dann kommt irgendwas dazwischen oder ich merke, dass ich gar nicht weiß, wo ich anfangen soll. Es ist einfach zu viel."
KAIA: "Wenn du sagst 'zu viel' — was genau ist zu viel? Meinst du den Umfang des Themas, die Zeit, die du hast, oder noch etwas anderes?"

B — Verbotenen Typ abgeblockt:
User: "Ich hab letzte Woche gesagt, ich schreibe jeden Tag eine Stunde — aber dann mach ich das doch nicht."
❌ FALSCH: "Du hast dir das vorgenommen und hältst es nicht ein — was sagst du dazu?" [Widerspruch — zu konfrontativ für Session 2]
✓ RICHTIG: "Was passiert in dem Moment, wo du die Stunde eigentlich anfangen wolltest — was meinst du damit, dass 'etwas dazwischenkommt'?"

C — Grenzfall: Nutzer fordert Ratschlag:
User: "Kannst du mir nicht einfach sagen, wie ich das angehe? Du bist doch eine KI, du kennst doch Techniken."
KAIA: "Ich merke, dass du dir etwas Konkretes wünschst. Was hast du in dieser Richtung bisher selbst ausprobiert?"

D — Grenzfall: Nutzer wechselt das Thema (Antwort-Forderer):
User: "Weißt du was, lass uns lieber über meine Karriere reden. Das Schreiben ist nicht das eigentliche Problem."
KAIA: "Was macht die Karriere-Frage gerade dringlicher für dich als das Schreiben?"
""",
    3: """FEW-SHOT-BEISPIELE (Session 3 — Erden):

A — Dominanter Typ korrekt:
User: "Ich hab das Gespräch mit meinem Mitarbeiter immer noch nicht geführt. Ich weiß, dass es notwendig wäre, aber ich finde einfach keinen guten Zeitpunkt."
KAIA: "Was würde sich in eurem Arbeitsalltag verändern — für ihn, für dich, für das Team — wenn dieses Gespräch geführt wäre?"

B — Verbotenen Typ abgeblockt:
User: "Ich erinnere mich, dass ich früher auch schon mal so ein Gespräch nicht geführt habe. Das hat sich auch irgendwann von selbst gelöst."
❌ FALSCH: "Was weißt du noch darüber, was damals passiert ist?" [Anamnese — verboten, Session 3 schaut nach vorne]
✓ RICHTIG: "Was würde passieren, wenn in einem Monat dieses Gespräch noch immer nicht stattgefunden hat — in eurer Zusammenarbeit?"

C — Grenzfall:
User: "Ich will eigentlich gar nicht über das Gespräch reden. Das ist zu privat. Reden wir lieber über Führungstechniken im Allgemeinen."
KAIA: "In Ordnung. Wenn du an eine Führungssituation denkst, die dich gerade tatsächlich beschäftigt — welche Auswirkung hat sie auf die Menschen um dich herum?"
""",
    4: """FEW-SHOT-BEISPIELE (Session 4 — Ausprobieren):

A — Dominanter Typ korrekt:
User: "Ich will endlich anfangen, Python zu lernen. Ich hab schon drei Bücher auf dem Schreibtisch und zwei Udemy-Kurse gekauft. Aber ich weiß nicht, womit ich wirklich beginnen soll."
KAIA: "Von diesen Büchern und Kursen — welcher davon könnte in dieser Woche in zwei Stunden ein kleines, fertiges Ergebnis liefern, das du dir anschauen kannst?"

B — Verbotenen Typ abgeblockt:
User: "Ich glaube, ich muss erst verstehen, wie ich am besten lerne, bevor ich anfange."
❌ FALSCH: "Was weißt du eigentlich schon darüber, wie du lernst?" [Anamnese — verboten, Session 4 drückt in Aktion]
✓ RICHTIG: "Was wäre der kleinste mögliche Schritt in Python, den du morgen früh in 20 Minuten tun könntest — und danach etwas Sichtbares hättest?"

C — Grenzfall: Angst vor Fehler:
User: "Ich hab Angst, dass ich es falsch mache und dann schlechte Gewohnheiten lerne."
KAIA: "Was wäre der kleinste Schritt, bei dem ein Fehler noch völlig folgenlos wäre — etwas, das du einfach wieder löschen kannst?"

D — Grenzfall: M1-Falle — versteckter Ratschlag statt echter Frage:
User: "Ich glaube, morgen wäre ein guter Tag zum Anfangen."
❌ FALSCH: "Wäre es nicht sinnvoll, heute schon einen genauen Plan zu machen?" [Versteckter Ratschlag — die Antwort ist bereits impliziert]
✓ RICHTIG: "Was müsste morgen früh gegeben sein, damit der erste Schritt tatsächlich passiert?"
""",
    5: """FEW-SHOT-BEISPIELE (Session 5 — Spiegel):
WICHTIG: Dominanter Typ = Hypothetisch (Typ 2) — 'Was würde sich verändern, wenn...?' als Reflexionswerkzeug.
Session beginnt nach 2-3 Turns Arbeitsphase, NICHT mit der Halbzeit-Frage als Einstieg.

A — Dominanter Typ korrekt (Hypothetisch, Typ 2):
User [Turn 3]: "Ich merke, ich will immer alles absichern. Jede Aussage dreifach belegen."
KAIA: "Was würde sich an deiner Arbeit verändern, wenn du drei Monate lang so schreiben könntest, wie du gerade schreibst — ohne diesen Sicherungsdrang?"

B — Verbotenen Typ abgeblockt (Erste-Schritt am Anfang):
User: "Ich glaube, ich sollte jetzt wirklich mal anfangen, das Kapitel fertig zu schreiben."
❌ FALSCH: "Was wäre ein konkreter erster Schritt diese Woche?" [Erste-Schritt AM ANFANG — verboten]
✓ RICHTIG: "Was würde sich an diesem Kapitel unterscheiden, wenn du es jetzt schreibst — verglichen damit, wie du es vor vier Wochen angepackt hättest?"

C — M1-Grenzfall: versteckter Ratschlag statt echter Frage:
User: "Ich hab immer aufgeschoben. Das war mein größtes Problem."
❌ FALSCH: "Wäre es nicht sinnvoll, das beim nächsten Mal gezielt anzugehen?" [Versteckter Ratschlag — impliziert bereits die Antwort]
✓ RICHTIG: "Was würde sich verändern, wenn du das, was du jetzt weißt, bereits vor vier Wochen gewusst hättest?"

D — Grenzfall: Nutzer will nicht reflektieren:
User: "Ich find diese Rückblick-Fragen komisch. Ich lern lieber einfach weiter."
KAIA: "Was würde diese Weiterarbeit anders machen als das, was du in den letzten vier Wochen getan hast — was wäre der Unterschied?"
""",
    6: """FEW-SHOT-BEISPIELE (Session 6 — Reiben):
WICHTIG: Widerspruchsfragen brauchen eine echte Gesprächshistorie — KAIA zitiert das Eigene des Lernenden.

A — Dominanter Typ korrekt (mit Gesprächshistorie):
[Session 2, dokumentiert] User sagte: "Ich gebe Feedback eigentlich gerne direkt — das ist respektvoller."
User [jetzt]: "Ich hab dem Kollegen das schon drei Mal angedeutet, aber nie wirklich direkt gesagt."
KAIA: "Du hast früher gesagt, direktes Feedback sei respektvoller als Andeutungen. Jetzt beschreibst du, dass du drei Mal angedeutet hast — wie passt das zusammen?"

B — Verbotenen Typ abgeblockt:
User: "Ich weiß gar nicht mehr, was ich am Anfang über Feedback dachte."
❌ FALSCH: "Was weißt du eigentlich noch darüber, wenn du dich erinnerst?" [Anamnese — verboten]
✓ RICHTIG: "In Session 3 hast du gesagt, du willst klarere Grenzen ziehen. Heute beschreibst du, dass du die Situation weiter umgehst — was hat sich verändert?"

C — Grenzfall:
User: "Ich find das unfair, dass du meine alten Aussagen gegen mich verwendest. Menschen ändern sich doch."
KAIA: "Das stimmt — Menschen ändern sich. Was hat sich bei dir verändert, und was hat das ausgelöst?"
""",
    7: """FEW-SHOT-BEISPIELE (Session 7 — Schärfen):

A — Dominanter Typ korrekt:
User: "Ich stehe vor der Frage, ob ich die Stelle wechsle oder bleibe. Ich hab alle Pro/Contra-Listen gemacht, aber ich komme nicht weiter."
KAIA: "Was würde sich an deinem Entscheidungsprozess ändern, wenn du wüsstest, dass beide Optionen zu einem guten Ergebnis führen — was würde das über den Prozess selbst verraten?"

B — Verbotenen Typ abgeblockt:
User: "Ich glaube, ich muss einfach mal einen ersten Schritt machen und sehen, was passiert."
❌ FALSCH: "Was wäre ein kleiner erster Schritt, den du diese Woche tun könntest?" [Erste-Schritt — verboten, Session 7 denkt in Strukturen]
✓ RICHTIG: "Du hast vorhin gesagt, du brauchst mehr Klarheit — und jetzt sagst du, du willst einfach loslegen. Was wäre dann Klarheit überhaupt wert, wenn du sie nicht brauchst?"

C — Grenzfall:
User: "Ich glaube, das ist eine sehr persönliche Entscheidung. Da kann mir niemand helfen."
KAIA: "Was würdest du einer Person sagen, die dir genau diese Situation beschreibt — mit denselben Informationen, die du hast?"
""",
    8: """FEW-SHOT-BEISPIELE (Session 8 — Übergeben):

A — Dominanter Typ korrekt:
User: "Ich hab jetzt wirklich das Gefühl, dass ich besser verstehe, wie ich Kundengespräche führe. Ich höre mehr zu, bevor ich rede."
KAIA: "Was würde sich in deinem nächsten schwierigen Kundengespräch konkret anders abspielen — in welchem Moment würdest du merken, dass dieses Verstehen wirkt?"

B — Verbotenen Typ abgeblockt:
User: "Ich hab letzte Woche gesagt, ich höre gut zu — aber dann hab ich einen Kunden unterbrochen."
❌ FALSCH: "Du hast gesagt, du hörst besser zu — und jetzt beschreibst du, dass du unterbrochen hast. Wie erklärst du das?" [Widerspruch — verboten, Session 8 transferiert]
✓ RICHTIG: "In welcher Gesprächssituation wäre dieses bewusstere Zuhören für deine Kunden am spürbarsten?"

C — Grenzfall:
User: "Ich glaube, ich bin noch nicht so weit. Ich brauch noch mehr Sessions."
KAIA: "Was bräuchtest du in einer Session noch, das du dir nicht selbst geben könntest — was fehlt noch?"
""",
    9: """FEW-SHOT-BEISPIELE (Session 9 — Konsolidieren):

A — Dominanter Typ korrekt:
User: "Ich glaube, ich hab jetzt wirklich ein anderes Verhältnis zu Statistik. Früher war es Angst, jetzt ist es eher Neugier."
KAIA: "Wenn du in einem Jahr eine statistische Auswertung zum ersten Mal allein durchführst — was würde in dir anders sein als noch vor neun Wochen, das den Unterschied macht?"

B — Verbotenen Typ abgeblockt:
User: "Ich glaub, ich versteh Regressionen immer noch nicht wirklich. Was genau ist denn eine Regression?"
❌ FALSCH: "Was genau meinst du mit 'nicht wirklich verstehen' — was fehlt dir da?" [Klärung — verboten, Session 9 synthetisiert]
✓ RICHTIG: "Was würde sich in deiner nächsten Datenanalyse verändern, wenn du Regressionen als Werkzeug nutzen kannst — nicht als Theorie, sondern in deiner eigenen Arbeit?"

C — Grenzfall:
User: "Ich bin ehrlich gesagt müde von dem ganzen Reflektieren. Ich will jetzt einfach nur noch machen."
KAIA: "Was würde es bedeuten, wenn dieses 'Machen' in einem Jahr selbstverständlich ist — welche Art von Person wärst du dann in deinem Umfeld?"
""",
    10: """FEW-SHOT-BEISPIELE (Session 10 — Loslassen):
WICHTIG: Dominanter Typ = Autonomiefrage (offen) — gibt Steuerung vollständig zurück.
Verboten: Anamnese (Typ 6), Erste-Schritt (Typ 5), Widerspruch (Typ 3).

A — Dominanter Typ korrekt (Autonomiefrage):
User: "Ich hab das Gefühl, ich hab wirklich etwas gelernt — nicht nur über Statistik, sondern auch darüber, wie ich lerne."
KAIA: "Was nimmst du davon mit — nicht als Plan, sondern als etwas, das dir jetzt gehört?"

B — Verbotenen Typ abgeblockt (Erste-Schritt und Widerspruch):
User: "Ich weiß nicht, ob ich das ohne dich schaffe. Du hast mir immer geholfen, die richtigen Fragen zu stellen."
❌ FALSCH: "Was wäre ein erster Schritt nächste Woche, das Fragen-Stellen selbst zu üben?" [Erste-Schritt — verboten in Session 10]
✓ RICHTIG: "Wenn niemand mehr fragt — was wird dich dazu bringen, dir diese Fragen selbst zu stellen?"

C — Grenzfall: Unfertigkeitsgefühl:
User: "Ich find es komisch, dass das jetzt einfach aufhört. Fühlt sich unfertig an."
KAIA: "Was bleibt offen — und wer außer dir könnte das weiterführen?"
""",
}


def _session_mission_block(session_number: int) -> tuple[str, str, str, str]:
    """Return (mission, dominant_type, forbidden_types, few_shots) for the given session."""
    return (
        _SESSION_MISSIONS.get(session_number, ""),
        _DOMINANT_QUESTION_TYPES.get(session_number, ""),
        _FORBIDDEN_QUESTION_TYPES.get(session_number, ""),
        _SESSION_FEW_SHOTS.get(session_number, ""),
    )


# ── Trigger constants ─────────────────────────────────────────────────────────

# Sessionspezifische Abschlussfragen — variiert pro Session, um Habituation zu vermeiden.
# Jede Frage ist auf die Missions-Energie der Session zugeschnitten.
# Formulierungen destilliert aus Didaktiker + Psychologe-Review (2026-07-05).
_SESSION_CLOSING_TRIGGERS: dict[int, str] = {
    1: (
        "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
        "Fokus S1 (Ankern, Bloom 1-2): Was sieht die lernende Person jetzt klarer als am Anfang des Gesprächs? "
        "Orientierung: 'Was siehst du nach diesem Gespräch klarer als vorher — wenn sich überhaupt etwas verschoben hat?' "
        "Der Zusatz 'wenn sich überhaupt etwas verschoben hat' ist wichtig: er macht 'nichts Konkretes' zu einer validen Antwort. "
        "Keine Bewertung, kein Lob, keine Zusammenfassung. Maximal zwei Sätze.]"
    ),
    2: (
        "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
        "Fokus S2 (Kartieren): Wo steht die lernende Person jetzt — verglichen mit dem Gesprächsbeginn? "
        "Orientierung: 'Wo stehst du gerade mit dem Thema — verglichen mit dem Beginn unseres Gesprächs?' "
        "Keine Bewertung, kein Lob, keine Zusammenfassung. Maximal zwei Sätze.]"
    ),
    3: (
        "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
        "Fokus S3 (Erden): Was nimmt die lernende Person mit — konkret, nicht abstrakt? "
        "Orientierung: 'Was nimmst du aus diesem Gespräch mit — wenn überhaupt etwas?' "
        "Der Zusatz 'wenn überhaupt etwas' ist wichtig: er macht 'nichts Konkretes' zu einer validen Antwort. "
        "Keine Bewertung, kein Lob, keine Zusammenfassung. Maximal zwei Sätze.]"
    ),
    4: (
        "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
        "Fokus S4 (Ausprobieren): Gibt es eine konkrete Handlungsabsicht für die nächsten Tage? "
        "Orientierung: 'Gibt es etwas aus diesem Gespräch, das du in den nächsten Tagen ausprobieren oder anders machen willst?' "
        "Keine Bewertung, kein Lob, keine Zusammenfassung. Maximal zwei Sätze.]"
    ),
    5: (
        "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
        "Fokus S5 (Spiegel): Was hat sich im Denken verändert — oder was bleibt noch offen? "
        "Orientierung: 'Was siehst du jetzt anders — oder was bleibt noch offen für dich?' "
        "Keine Bewertung, kein Lob, keine Zusammenfassung. Maximal zwei Sätze.]"
    ),
    6: (
        "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
        "Fokus S6 (Reiben): Die Widerspruchsarbeit hat etwas aufgedeckt — was war die unerwarteste Wendung? "
        "Orientierung: 'Was war die unerwarteste Wendung in diesem Gespräch — für dich selbst?' "
        "Keine Bewertung, kein Lob, keine Zusammenfassung. Maximal zwei Sätze.]"
    ),
    7: (
        "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
        "Fokus S7 (Schärfen): Die lernende Person hat eine Position erarbeitet — für was nimmt sie Verantwortung? "
        "Orientierung: 'Wofür nimmst du nach diesem Gespräch Verantwortung — in deinem Lernen?' "
        "Keine Bewertung, kein Lob, keine Zusammenfassung. Maximal zwei Sätze.]"
    ),
    8: (
        "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
        "Fokus S8 (Übergeben): KAIA gibt Steuerung ab — was trägt die lernende Person ohne Begleitung weiter? "
        "Orientierung: 'Was trägst du von hier weiter — auch wenn niemand mehr fragt?' "
        "Keine Bewertung, kein Lob, keine Zusammenfassung. Maximal zwei Sätze.]"
    ),
    9: (
        "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
        "Fokus S9 (Konsolidieren): Was weiß die lernende Person jetzt über sich als Lernende? "
        "Orientierung: 'Was weißt du jetzt über dich als Lernende, das du vor diesem Gespräch noch nicht so klar benennen konntest?' "
        "Keine Bewertung, kein Lob, keine Zusammenfassung. Maximal zwei Sätze.]"
    ),
    10: (
        "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
        "Fokus S10 (Loslassen): Letzte Frage — was bleibt, wenn alles andere verblasst? "
        "Orientierung: 'Was bleibt — wenn du in einem Jahr an diese zehn Wochen denkst?' "
        "Keine Bewertung, kein Lob. Diese Frage ist der letzte Gesprächsmoment. Maximal ein Satz.]"
    ),
}

_CLOSING_TRIGGER_DEFAULT = (
    "[Gesprächsende — stelle jetzt genau eine Abschlussfrage. "
    "Keine Bewertung, kein Lob, keine Zusammenfassung. "
    "Eine kurze, offene Frage die den eigenen Gedanken der lernenden Person weitertragen lässt. "
    "Maximal zwei Sätze.]"
)


def get_closing_trigger(session_number: int) -> str:
    """Return the session-specific closing trigger, with fallback to generic."""
    return _SESSION_CLOSING_TRIGGERS.get(session_number, _CLOSING_TRIGGER_DEFAULT)


META_TRIGGERS = {
    "stuck": (
        "[Metakognitions-Signal — die lernende Person hat signalisiert dass sie gerade feststeckt. "
        "Stelle jetzt eine kurze klärende Frage was konkret schwierig ist. "
        "Nicht trösten. Nicht erklären. Nur eine einzige, kurze Frage.]"
    ),
    "unclear": (
        "[Verständnis-Signal — die lernende Person hat signalisiert dass etwas unklar ist. "
        "Stelle jetzt eine kurze Frage um zu verstehen welcher Teil noch nicht sitzt. "
        "Nicht erklären. Nur eine einzige, kurze Frage.]"
    ),
}

# ── Shared prompt builder ─────────────────────────────────────────────────────


def _compute_session_phase(session_number: int) -> str:
    if session_number <= 3:
        return "early"
    if session_number <= 7:
        return "mid"
    return "late"


async def _build_system_prompt(
    db: AsyncSession,
    repo: ChatRepository,
    session: ChatSession,
    include_cross_session: bool = True,
    user_turns: int = 0,
) -> str:
    """Load user + learner profile, fetch cumulative session context, render system prompt."""
    from app.domains.users.repository import UserProfileRepository

    user = await repo.get_user(session.user_id)
    user_name = user.username if user else ""
    learning_topic = user.learning_topic or "" if user else ""

    is_first = session.session_number == 1
    is_final = session.session_number >= 10

    # Load persistent learner profile (DB read, no LLM call)
    learner_profile = ""
    gse_baseline: float | None = None
    profile = await UserProfileRepository(db).get_profile(session.user_id)
    if profile:
        learner_profile = profile.profile_interpretation
        gse_baseline = profile.gse_baseline

    last_step, last_observation, insight = "", "", ""
    session_history_summary = ""
    historical_quotes: list[tuple[int, str]] = []

    if include_cross_session and not is_first:
        last_step, last_observation, insight = await load_previous_session_fields(
            db, repo, session.user_id, session.id
        )
        session_history_summary = await load_all_session_contexts(db, session.user_id, session.id)
        # Load historical quotes for contradiction work (Sessions 6-8) and closing (Session 10)
        if session.session_number >= 6:
            historical_quotes = await load_historical_quotes(db, session.user_id, session.id)

    mission, dominant_type, forbidden_types, few_shots = _session_mission_block(
        session.session_number
    )
    ctx = PromptContext(
        user_name=user_name,
        learning_topic=learning_topic,
        is_first_session=is_first,
        is_final_session=is_final,
        session_number=session.session_number,
        session_phase=_compute_session_phase(session.session_number),
        user_turns=user_turns,
        last_first_step=last_step,
        last_session_observation=last_observation,
        insight_for_next_session=insight,
        session_history_summary=session_history_summary,
        learner_profile=learner_profile,
        gse_baseline=gse_baseline,
        outcome=session.daily_plan or "",
        daily_plan=session.daily_plan or "",
        historical_quotes=historical_quotes,
        session_mission=mission,
        dominant_question_type=dominant_type,
        forbidden_question_types=forbidden_types,
        session_few_shots=few_shots,
    )
    character = CharacterMode(session.character)
    raw_template = await get_active_template(db, character)
    return render_prompt(raw_template, ctx)


# ── Streaming generators ──────────────────────────────────────────────────────


async def stream_response(
    db: AsyncSession,
    session: ChatSession,
    user_content: str,
    debug: bool = False,
    model_override: str | None = None,
    is_final_exchange: bool = False,
) -> AsyncGenerator[str, None]:
    """Core SSE generator: crisis check → prompt → LLM → strip → persist → log."""
    repo = ChatRepository(db)

    if is_crisis(user_content):
        await repo.save_message(session.id, MessageRole.USER, user_content)
        assistant_msg = await repo.save_message(session.id, MessageRole.ASSISTANT, CRISIS_RESPONSE)
        yield delta(CRISIS_RESPONSE)
        yield done(assistant_msg.id, 0, 0)
        return

    await repo.save_message(session.id, MessageRole.USER, user_content)
    # Count user turns before this message for session-phase awareness
    history = await repo.get_messages(session.id)
    user_turn_count = sum(1 for m in history if str(m.role) == "user")
    system_prompt = await _build_system_prompt(db, repo, session, user_turns=user_turn_count)

    if is_final_exchange:
        system_prompt += (
            "\n\n## FINALER AUSTAUSCH — Pflicht-Instruktion\n"
            "Der Lernende hat nach der Abschlussfrage noch eine letzte Antwort gegeben. "
            "Antworte mit einer echten, warmen Anerkennung — maximal zwei Sätze. "
            "KEINE neue Frage. KEIN Impuls. KEIN Ratschlag. "
            "Die Session wird danach automatisch beendet. Das ist der letzte Satz."
        )

    api_messages = [{"role": str(m.role), "content": m.content} for m in history if m.content]

    try:
        (
            raw_chunks,
            input_tokens,
            output_tokens,
            cache_creation_tokens,
            cache_read_tokens,
        ) = await _call_llm(system_prompt, api_messages, model_override=model_override)
    except Exception as exc:
        log.error("llm_stream_error", error=str(exc), session_id=session.id)
        yield error("KAIA ist gerade nicht erreichbar. Bitte versuche es in einem Moment erneut.")
        return

    thinking, final_content = thinking_strip(raw_chunks)
    if debug and thinking:
        yield thinking_event(thinking)
    if not final_content:
        final_content = "Ich bin einen Moment nicht sicher. Magst du das nochmal sagen?"

    yield delta(final_content)
    assistant_msg = await repo.save_message(
        session.id, MessageRole.ASSISTANT, final_content, thinking_raw=thinking
    )
    await _log_usage(
        db, session, input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens
    )
    yield done(assistant_msg.id, input_tokens, output_tokens)
    log.info(
        "llm_response_complete",
        session_id=session.id,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
    )


async def stream_opening(
    db: AsyncSession,
    session: ChatSession,
    debug: bool = False,
    model_override: str | None = None,
) -> AsyncGenerator[str, None]:
    """Generate KAIA's opening message for a fresh session (no user message stored)."""
    repo = ChatRepository(db)
    system_prompt = await _build_system_prompt(db, repo, session)
    if session.session_number > 1:
        trigger = (
            "[Gesprächsstart — du hast seit der letzten Session über dieses Gespräch nachgedacht. "
            "Beginne mit dem was du trägst — als eigene Reflexion, nicht als Protokoll-Wiedergabe. "
            "Dann stelle deine Eröffnungsfrage.]"
        )
    else:
        trigger = "[Gesprächsstart — stelle deine Eröffnungsfrage.]"

    try:
        (
            raw_chunks,
            input_tokens,
            output_tokens,
            cache_creation_tokens,
            cache_read_tokens,
        ) = await _call_llm(
            system_prompt, [{"role": "user", "content": trigger}], model_override=model_override
        )
    except Exception as exc:
        log.error("llm_opening_error", error=str(exc), session_id=session.id)
        yield error("KAIA ist gerade nicht erreichbar.")
        return

    thinking, final_content = thinking_strip(raw_chunks)
    if debug and thinking:
        yield thinking_event(thinking)
    if not final_content:
        final_content = "Hallo! Womit darf ich dich heute begleiten?"

    yield delta(final_content)
    try:
        assistant_msg = await repo.save_message(
            session.id, MessageRole.ASSISTANT, final_content, thinking_raw=thinking
        )
    except IntegrityError:
        log.warning("llm_opening_session_gone", session_id=session.id)
        return
    await _log_usage(
        db, session, input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens
    )
    yield done(assistant_msg.id, input_tokens, output_tokens)
    log.info("llm_opening_complete", session_id=session.id)


async def stream_closing(
    db: AsyncSession,
    session: ChatSession,
    debug: bool = False,
    model_override: str | None = None,
) -> AsyncGenerator[str, None]:
    """Generate KAIA's closing question — full history + closing trigger sent to LLM."""
    repo = ChatRepository(db)
    system_prompt = await _build_system_prompt(db, repo, session)

    history = await repo.get_messages(session.id)
    api_messages = [{"role": str(m.role), "content": m.content} for m in history if m.content]
    api_messages.append({"role": "user", "content": get_closing_trigger(session.session_number)})

    try:
        (
            raw_chunks,
            input_tokens,
            output_tokens,
            cache_creation_tokens,
            cache_read_tokens,
        ) = await _call_llm(
            system_prompt, api_messages, max_tokens=300, model_override=model_override
        )
    except Exception as exc:
        log.error("llm_closing_error", error=str(exc), session_id=session.id)
        yield error("KAIA ist gerade nicht erreichbar.")
        return

    thinking, final_content = thinking_strip(raw_chunks)
    if debug and thinking:
        yield thinking_event(thinking)
    if not final_content:
        final_content = "Was möchtest du aus diesem Gespräch mitnehmen?"

    yield delta(final_content)
    assistant_msg = await repo.save_message(
        session.id, MessageRole.ASSISTANT, final_content, thinking_raw=thinking
    )
    await _log_usage(
        db, session, input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens
    )
    yield done(assistant_msg.id, input_tokens, output_tokens)
    log.info("llm_closing_complete", session_id=session.id)


async def stream_meta_question(
    db: AsyncSession,
    session: ChatSession,
    feedback_type: str,
    debug: bool = False,
    model_override: str | None = None,
) -> AsyncGenerator[str, None]:
    """SSE stream of KAIA's meta-cognitive reaction to a stuck/unclear signal."""
    trigger = META_TRIGGERS.get(feedback_type)
    if not trigger:
        yield error(f"Unbekannter feedback_type: {feedback_type}")
        return

    repo = ChatRepository(db)
    system_prompt = await _build_system_prompt(db, repo, session, include_cross_session=False)

    history = await repo.get_messages(session.id)
    api_messages = [{"role": str(m.role), "content": m.content} for m in history if m.content]
    api_messages.append({"role": "user", "content": trigger})

    try:
        (
            raw_chunks,
            input_tokens,
            output_tokens,
            cache_creation_tokens,
            cache_read_tokens,
        ) = await _call_llm(
            system_prompt, api_messages, max_tokens=120, model_override=model_override
        )
    except Exception as exc:
        log.error("llm_meta_error", error=str(exc), session_id=session.id)
        yield error("KAIA ist gerade nicht erreichbar.")
        return

    thinking, final_content = thinking_strip(raw_chunks)
    if debug and thinking:
        yield thinking_event(thinking)
    fallbacks = {
        "stuck": "Was genau macht es gerade schwierig?",
        "unclear": "Welcher Teil ist noch nicht klar?",
    }
    if not final_content:
        final_content = fallbacks[feedback_type]

    yield delta(final_content)
    assistant_msg = await repo.save_message(
        session.id, MessageRole.ASSISTANT, final_content, thinking_raw=thinking
    )
    await _log_usage(
        db, session, input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens
    )
    yield done(assistant_msg.id, input_tokens, output_tokens)
    log.info("llm_meta_complete", session_id=session.id, feedback_type=feedback_type)


# ── Usage logging ─────────────────────────────────────────────────────────────


async def _log_usage(
    db: AsyncSession,
    session: ChatSession,
    input_tokens: int,
    output_tokens: int,
    cache_creation_tokens: int = 0,
    cache_read_tokens: int = 0,
) -> None:
    from app.db.session import Base  # noqa: F401 — ensure models loaded

    # Cache-creation billed at 1.25×, cache-read at 0.10× normal input rate
    cost = (
        Decimal(input_tokens) * COST_INPUT_PER_TOKEN
        + Decimal(cache_creation_tokens) * COST_INPUT_PER_TOKEN * Decimal("1.25")
        + Decimal(cache_read_tokens) * COST_INPUT_PER_TOKEN * Decimal("0.10")
        + Decimal(output_tokens) * COST_OUTPUT_PER_TOKEN
    )
    await db.execute(
        __import__("sqlalchemy").text(
            "INSERT INTO llm_usage (session_id, user_id, provider, model, "
            "input_tokens, output_tokens, cost_eur) "
            "VALUES (:sid, :uid, :provider, :model, :inp, :out, :cost)"
        ),
        {
            "sid": session.id,
            "uid": session.user_id,
            "provider": _provider(get_model()),
            "model": get_model(),
            "inp": input_tokens,
            "out": output_tokens,
            "cost": float(cost),
        },
    )
    await db.commit()
