from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.note import NoteCreate, NoteUpdate
from app.schemas.common import success_response
from app.services.note_service import NoteService
from app.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_note(
    data: NoteCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = NoteService()
    result = await service.create(user.id, data, db)
    return success_response(result.model_dump())


@router.get("")
async def list_notes(
    subject_id: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = NoteService()
    result = await service.list_notes(user.id, subject_id, db)
    return success_response([r.model_dump() for r in result])


@router.get("/{note_id}")
async def get_note(
    note_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = NoteService()
    result = await service.get_note(note_id, user.id, db)
    return success_response(result.model_dump())


@router.put("/{note_id}")
async def update_note(
    note_id: str,
    data: NoteUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = NoteService()
    await service.update_note(note_id, user.id, data, db)
    return success_response({"status": "updated"})


@router.delete("/{note_id}")
async def delete_note(
    note_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = NoteService()
    await service.delete_note(note_id, user.id, db)
    return success_response({"status": "deleted"})
