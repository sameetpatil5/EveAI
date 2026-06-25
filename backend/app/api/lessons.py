from fastapi import APIRouter, Depends, status, Response, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.common import success_response
from app.services.lesson_service import LessonService
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.core.database import AsyncSessionLocal

router = APIRouter(prefix="/lessons", tags=["lessons"])


async def _background_generate_lesson(lesson_id: str, user_id: str = None) -> None:
    """Background task wrapper that creates its own database session."""
    async with AsyncSessionLocal() as session:
        service = LessonService()
        await service.generate_lesson_content(lesson_id, session, user_id)


@router.get("/{lesson_id}")
async def get_lesson(
    lesson_id: str,
    response: Response,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = LessonService()
    result, should_start_generation = await service.get_lesson(lesson_id, user.id, db)

    if should_start_generation:
        response.status_code = status.HTTP_202_ACCEPTED
        background_tasks.add_task(_background_generate_lesson, lesson_id, user.id)

    if result.generation_status == "generating":
        response.status_code = status.HTTP_202_ACCEPTED

    return success_response(result.model_dump())


@router.post("/{lesson_id}/retry")
async def retry_lesson_generation(
    lesson_id: str,
    response: Response,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = LessonService()
    lesson, _ = await service.get_lesson(lesson_id, user.id, db)

    if lesson.generation_status != "failed":
        return success_response({"status": lesson.generation_status})

    await service.reset_lesson_generation(lesson_id, db)
    response.status_code = status.HTTP_202_ACCEPTED
    background_tasks.add_task(_background_generate_lesson, lesson_id, user.id)

    return success_response({"status": "retrying"})


@router.post("/{lesson_id}/complete")
async def mark_complete(
    lesson_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = LessonService()
    await service.mark_complete(lesson_id, user.id, db)
    return success_response({"status": "completed"})


@router.get("/{lesson_id}/next")
async def get_next_lesson(
    lesson_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = LessonService()
    next_lesson = await service.get_next_lesson(user.id, lesson_id, db)
    return success_response(next_lesson.model_dump() if next_lesson else None)
