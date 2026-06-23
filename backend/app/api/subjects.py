from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.subject import SubjectCreate, SubjectUpdate
from app.schemas.common import success_response
from app.services.subject_service import SubjectService
from app.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("")
async def list_subjects(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    service = SubjectService()
    result = await service.list_subjects(user.id, db)
    return success_response([r.model_dump() for r in result])


@router.get("/{subject_id}")
async def get_subject(
    subject_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService()
    result = await service.get_subject(subject_id, user.id, db)
    return success_response(result.model_dump())


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_subject(
    data: SubjectCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService()
    result = await service.create_subject(user.id, data, db)
    return success_response(result.model_dump())


@router.put("/{subject_id}")
async def update_subject(
    subject_id: str,
    data: SubjectUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService()
    result = await service.update_subject(subject_id, user.id, data, db)
    return success_response(result.model_dump())


@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService()
    await service.delete_subject(subject_id, user.id, db)
    return success_response({"status": "deleted"})
