from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.common import success_response
from app.schemas.profile import ProfileOut
from app.services.profile_service import ProfileService
from app.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("")
async def get_profile(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    service = ProfileService()
    result: ProfileOut = await service.get_profile(user.id, db)
    return success_response(result.model_dump())


@router.put("")
async def update_profile(
    data: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService()
    await service.update_profile(user.id, data, db)
    return success_response({"status": "updated"})
