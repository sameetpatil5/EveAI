from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.schedule import UpdateScheduleStatusRequest, RegenerateScheduleRequest
from app.schemas.common import success_response
from app.services.schedule_service import ScheduleService
from app.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("")
async def get_schedule(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    service = ScheduleService()
    result = await service.get_schedule(user.id, db)
    return success_response(result.model_dump())


@router.patch("/{entry_id}/status")
async def update_status(
    entry_id: str,
    data: UpdateScheduleStatusRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScheduleService()
    await service.update_status(entry_id, user.id, data.status, db)
    return success_response({"status": "updated"})


@router.post("/regenerate", status_code=status.HTTP_202_ACCEPTED)
async def regenerate_schedule(
    data: RegenerateScheduleRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScheduleService()
    await service.regenerate_schedule(user.id, data.feedback, db)
    return success_response({"status": "regenerating"})
