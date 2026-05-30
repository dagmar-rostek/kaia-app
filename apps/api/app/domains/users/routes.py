from fastapi import APIRouter

from app.core.deps import CurrentUser
from app.domains.users.schemas import UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
async def get_me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)
