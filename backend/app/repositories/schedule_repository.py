from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from datetime import datetime

from app.models.schedule import Schedule


class ScheduleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user(self, user_id: str) -> list[Schedule]:
        result = await self.db.execute(
            select(Schedule)
            .where(Schedule.user_id == user_id)
            .order_by(Schedule.start_time)
        )
        return result.scalars().all()

    async def get_entry(self, entry_id: str) -> Schedule | None:
        result = await self.db.execute(select(Schedule).where(Schedule.id == entry_id))
        return result.scalars().first()

    async def update_status(self, entry_id: str, status: str) -> None:
        await self.db.execute(
            update(Schedule).where(Schedule.id == entry_id).values(status=status)
        )
        await self.db.commit()

    async def delete_pending_future_entries(self, user_id: str) -> None:
        await self.db.execute(
            delete(Schedule).where(
                Schedule.user_id == user_id,
                Schedule.status == "pending",
                Schedule.start_time > datetime.utcnow(),
            )
        )
        await self.db.commit()

    async def bulk_insert(self, entries: list[dict]) -> None:
        for entry_data in entries:
            entry = Schedule(**entry_data)
            self.db.add(entry)
        await self.db.commit()
