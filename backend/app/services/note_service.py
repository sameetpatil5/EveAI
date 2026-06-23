from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.note_repository import NoteRepository
from app.core.exceptions import ForbiddenError, NotFoundError
from app.schemas.note import NoteCreate, NoteResponse


class NoteService:
    def _build_note_response(self, note) -> NoteResponse:
        payload = {
            "id": note.id,
            "title": note.title,
            "description": note.description,
            "content": note.content,
            "subject_id": note.subject_id,
            "subject_name": getattr(getattr(note, "subject", None), "name", None),
            "created_at": note.created_at,
        }
        return NoteResponse.model_validate(payload)

    async def create(
        self, user_id: str, data: NoteCreate, db: AsyncSession
    ) -> NoteResponse:
        repo = NoteRepository(db)
        note = await repo.create(user_id, data.model_dump())
        return self._build_note_response(note)

    async def list_notes(
        self, user_id: str, subject_id: str | None, db: AsyncSession
    ) -> list:
        repo = NoteRepository(db)
        notes = await repo.get_all_by_user(user_id, subject_id)
        return [self._build_note_response(n) for n in notes]

    async def get_note(
        self, note_id: str, user_id: str, db: AsyncSession
    ) -> NoteResponse:
        repo = NoteRepository(db)
        note = await repo.get_by_id(note_id)
        if not note:
            raise NotFoundError("Note not found")
        if note.user_id != user_id:
            raise ForbiddenError("Not allowed")
        return self._build_note_response(note)

    async def update_note(
        self, note_id: str, user_id: str, data, db: AsyncSession
    ) -> None:
        repo = NoteRepository(db)
        note = await repo.get_by_id(note_id)
        if not note:
            raise NotFoundError("Note not found")
        if note.user_id != user_id:
            raise ForbiddenError("Not allowed")
        await repo.update(note_id, data.model_dump(exclude_none=True))

    async def delete_note(self, note_id: str, user_id: str, db: AsyncSession) -> None:
        repo = NoteRepository(db)
        note = await repo.get_by_id(note_id)
        if not note:
            raise NotFoundError("Note not found")
        if note.user_id != user_id:
            raise ForbiddenError("Not allowed")
        await repo.delete(note_id)
