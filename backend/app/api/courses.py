from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.common import success_response
from app.services.course_service import CourseService
from app.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("/by-subject/{subject_id}")
async def get_course_by_subject(
    subject_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CourseService()
    result = await service.get_course_by_subject(subject_id, user.id, db)
    return success_response(result.__dict__ if result else None)


@router.get("/{course_id}/structure")
async def get_course_structure(
    course_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = CourseService()
    result = await service.get_course_structure(course_id, user.id, db)
    return success_response(result.model_dump())
