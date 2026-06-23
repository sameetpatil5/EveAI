from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.common import success_response
from app.services.lesson_service import LessonService
from app.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/{lesson_id}")
async def get_lesson(
    lesson_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = LessonService()
    result = await service.get_lesson(lesson_id, user.id, db)
    # Return 202 if generating, 200 otherwise
    status_code = 202 if result.generation_status == "generating" else 200
    return success_response(result.model_dump())


@router.post("/{lesson_id}/complete")
async def mark_complete(
    lesson_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = LessonService()
    await service.mark_complete(lesson_id, user.id, db)
    return success_response({"status": "completed"})


@router.get("/next")
async def get_next_lesson(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    # Note: need current_lesson_id; this is a placeholder
    # In practice, client sends current_lesson_id as query param
    service = LessonService()
    # Placeholder: would need current_lesson_id from request
    return success_response(None)
