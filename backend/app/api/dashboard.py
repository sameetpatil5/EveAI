from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.common import success_response
from app.services.insights_service import InsightsService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
async def get_dashboard_insights(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    service = InsightsService()
    result = await service.get_dashboard_insights(user.id, db)
    return success_response(result.model_dump())
