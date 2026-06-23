from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from sqlalchemy.orm import selectinload

from app.models.note import Note


class NoteRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: str, data: dict) -> Note:
        note = Note(user_id=user_id, **data)
        self.db.add(note)
        await self.db.commit()
        await self.db.refresh(note)
        if note.subject_id:
            await self.db.refresh(note, attribute_names=["subject"])
        return note

    async def get_all_by_user(
        self, user_id: str, subject_id: str | None = None
    ) -> list[Note]:
        query = (
            select(Note)
            .where(Note.user_id == user_id)
            .options(selectinload(Note.subject))
        )
        if subject_id:
            query = query.where(Note.subject_id == subject_id)
        result = await self.db.execute(query.order_by(Note.created_at.desc()))
        return result.scalars().all()

    async def get_by_id(self, note_id: str) -> Note | None:
        result = await self.db.execute(
            select(Note).where(Note.id == note_id).options(selectinload(Note.subject))
        )
        return result.scalars().first()

    async def update(self, note_id: str, data: dict) -> None:
        await self.db.execute(update(Note).where(Note.id == note_id).values(**data))
        await self.db.commit()

    async def delete(self, note_id: str) -> None:
        await self.db.execute(delete(Note).where(Note.id == note_id))
        await self.db.commit()
