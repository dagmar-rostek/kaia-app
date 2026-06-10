from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.prompts.models import CharacterMode, PromptTemplate
from app.domains.prompts.templates import KAIA_PROMPT_V2_WARM, SEED_TEMPLATES


async def get_active_template(db: AsyncSession, character: CharacterMode) -> str:
    """Return the active Jinja2 template for a character.

    Falls back to the compiled-in SEED_TEMPLATES when the DB has no seeded data.
    This allows the system to work before the first DB seed run.
    """
    result = await db.execute(
        select(PromptTemplate.template)
        .where(
            PromptTemplate.character == character,
            PromptTemplate.is_active.is_(True),
        )
        .limit(1)
    )
    row = result.scalar_one_or_none()
    if row:
        return row

    # Fallback: compiled-in seed templates
    fallback = {t["character"]: t["template"] for t in SEED_TEMPLATES if t["is_active"]}
    if character in fallback:
        return str(fallback[character])

    # Last resort: always return warm
    return KAIA_PROMPT_V2_WARM
