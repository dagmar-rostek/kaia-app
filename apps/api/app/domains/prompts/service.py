from dataclasses import dataclass, field

from jinja2 import BaseLoader, Environment, TemplateError, Undefined


class _SilentUndefined(Undefined):
    """Replace undefined Jinja2 variables with empty string instead of raising."""

    def __str__(self) -> str:
        return ""

    def __repr__(self) -> str:
        return ""

    def __bool__(self) -> bool:
        return False


# autoescape=False is safe here — prompts are plain text, never rendered as HTML  # noqa: S701
_env = Environment(loader=BaseLoader(), autoescape=False, undefined=_SilentUndefined)  # noqa: S701


@dataclass
class PromptContext:
    # Basic user context
    user_name: str = ""
    learning_topic: str = ""

    # Session position
    is_first_session: bool = True
    is_final_session: bool = False  # session_number == 10
    session_number: int = 1
    session_phase: str = "early"  # "early" (1-3) | "mid" (4-7) | "late" (8-10)
    user_turns: int = 0  # user messages sent in current session so far

    # Cross-session context — previous session
    last_first_step: str = ""
    last_session_observation: str = ""
    insight_for_next_session: str = ""

    # Cumulative history — compact summary of all previous sessions
    session_history_summary: str = ""

    # Persistent learner profile (from pre-survey, rule-based translation)
    learner_profile: str = ""  # LLM-generated interpretation, stored in DB
    gse_baseline: float | None = None

    # Session-specific planning
    outcome: str = ""
    daily_plan: str = ""

    # Historical quotes for contradiction work (Sessions 6-8)
    # List of (session_number, strongest_quote) pairs
    historical_quotes: list[tuple[int, str]] = field(default_factory=list)

    # Didactic mission for this specific session (computed from lookup table)
    session_mission: str = ""
    dominant_question_type: str = ""
    forbidden_question_types: str = ""
    session_few_shots: str = ""


def _session_phase(session_number: int) -> str:
    if session_number <= 3:
        return "early"
    if session_number <= 7:
        return "mid"
    return "late"


def render_prompt(template_str: str, ctx: PromptContext) -> str:  # noqa: PLR0913
    """Render a Jinja2 system prompt template with session context.

    Unknown variables are silently replaced with empty string — keeps the system
    working even when optional context is missing.
    """
    try:
        tmpl = _env.from_string(template_str)
        return tmpl.render(
            user_name=ctx.user_name,
            learning_topic=ctx.learning_topic,
            is_first_session=ctx.is_first_session,
            is_final_session=ctx.is_final_session,
            session_number=ctx.session_number,
            session_phase=ctx.session_phase,
            user_turns=ctx.user_turns,
            last_first_step=ctx.last_first_step,
            last_session_observation=ctx.last_session_observation,
            insight_for_next_session=ctx.insight_for_next_session,
            session_history_summary=ctx.session_history_summary,
            learner_profile=ctx.learner_profile,
            gse_baseline=ctx.gse_baseline,
            outcome=ctx.outcome,
            daily_plan=ctx.daily_plan,
            historical_quotes=ctx.historical_quotes,
            session_mission=ctx.session_mission,
            dominant_question_type=ctx.dominant_question_type,
            forbidden_question_types=ctx.forbidden_question_types,
            session_few_shots=ctx.session_few_shots,
        )
    except TemplateError:
        # If Jinja2 rendering fails, return the raw template — better than crashing
        return template_str
