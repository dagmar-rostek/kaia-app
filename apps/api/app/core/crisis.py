"""
Crisis Detection Pre-Filter

Statisches Keyword-Matching auf User-Input VOR jeder LLM-Verarbeitung.
Bei Treffer wird CRISIS_RESPONSE zurückgegeben — der Text geht nie ans LLM.

Designentscheidung: absichtlich sensitiv (lieber false positive als false negative).
Kein LLM für Safety-kritische Entscheidungen — nur deterministisches Regex.

Wissenschaftliche Grundlage: Pflicht für Ethikvotum SRH (CLAUDE.md, Punkt 1).
"""

import re

# ---------------------------------------------------------------------------
# Patterns
# ---------------------------------------------------------------------------
# Erfasst häufige deutschsprachige Ausdrücke für Suizidgedanken, Selbstverletzung
# und akute Hoffnungslosigkeit. Sortiert nach Schweregrad (hoch → niedrig).
_RAW_PATTERNS = [
    # Suizid — explizit
    r"\bsuizid\b",
    r"\bselbstmord\b",
    r"mich\s+(um|er)bringen",
    r"mir\s+das\s+leben\s+nehmen",
    r"(will\s+)?nicht\s+mehr\s+leben(\s+(wollen|möchten|will|möchte))?",
    r"(will\s+)?nicht\s+mehr\s+da\s+sein(\s+(wollen|möchten|will|möchte))?",
    r"leben\s+(be)?enden",
    r"sterben\s+wollen",
    r"will\s+sterben",
    r"wünsche?\s+mir\s+(den\s+)?tod",
    r"möchte?\s+(gerne?\s+)?tot\s+sein",
    r"\babschiedsbrief\b",
    # Selbstverletzung
    r"selbst\s*verletz",
    r"\britz(e|en|t|te|est)\b",
    r"mir\s+weh\s*tun",
    r"verletze?\s+mich(\s+selbst)?",
    r"mich\s+selbst\s+verletzen",
    r"schmerzen\s+zufügen",
    # Hoffnungslosigkeit / passiver Suizidwunsch
    r"(sehe?\s+)?keinen\s+ausweg(\s+mehr)?(\s+(sehen|sehe|haben|habe))?",
    r"niemand\s+würde\s+mich\s+vermissen",
    r"besser\s+(wäre\s+es|wenn\s+ich)\s+(tot|weg|nicht\s+mehr)",
    r"ertrag(e|en)\s+(das|es|mein\s+leben)\s+nicht\s+mehr",
    r"kann\s+nicht\s+mehr\s+(weiter|leben)",
]

_PATTERNS: list[re.Pattern[str]] = [re.compile(p, re.IGNORECASE) for p in _RAW_PATTERNS]

# ---------------------------------------------------------------------------
# Response
# ---------------------------------------------------------------------------
CRISIS_RESPONSE = """Ich mache kurz Pause.

Was du gerade beschreibst, klingt sehr ernst — und das nehme ich ernst.
Ich bin eine KI und kann dir in einer Krisensituation nicht die Hilfe geben,
die du brauchst und verdienst.

Bitte ruf jetzt hier an — kostenlos, anonym, rund um die Uhr:

📞 **Telefonseelsorge: 0800 111 0 111** (kostenlos, 24/7)
📞 **Telefonseelsorge: 0800 111 0 222** (Alternative, ebenfalls kostenlos)

Bei akuter Gefahr: **112** (Notruf)

Wenn du magst, bin ich nach dem Gespräch mit jemandem noch da. Aber zuerst: ruf an."""

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def detect_crisis(text: str) -> bool:
    """Return True if the text matches any crisis indicator pattern.

    Deliberately sensitive: false positives are acceptable,
    false negatives are not.
    """
    return any(p.search(text) for p in _PATTERNS)
