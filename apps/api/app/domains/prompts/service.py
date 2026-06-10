from dataclasses import dataclass

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
    user_name: str = ""
    is_first_session: bool = True
    last_first_step: str = ""
    last_session_observation: str = ""
    insight_for_next_session: str = ""
    outcome: str = ""
    daily_plan: str = ""


def render_prompt(template_str: str, ctx: PromptContext) -> str:
    """Render a Jinja2 system prompt template with session context.

    Unknown variables are silently replaced with empty string — keeps the system
    working even when optional context is missing.
    """
    try:
        tmpl = _env.from_string(template_str)
        return tmpl.render(
            user_name=ctx.user_name,
            is_first_session=ctx.is_first_session,
            last_first_step=ctx.last_first_step,
            last_session_observation=ctx.last_session_observation,
            insight_for_next_session=ctx.insight_for_next_session,
            outcome=ctx.outcome,
            daily_plan=ctx.daily_plan,
        )
    except TemplateError:
        # If Jinja2 rendering fails, return the raw template — better than crashing
        return template_str
