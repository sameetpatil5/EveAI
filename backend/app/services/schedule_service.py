from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.schedule_repository import ScheduleRepository
from app.repositories.lesson_repository import LessonRepository
from app.repositories.subject_repository import SubjectRepository
from app.core.exceptions import NotFoundError
from app.schemas.schedule import ScheduleResponse


class ScheduleService:
    async def get_schedule(self, user_id: str, db: AsyncSession) -> ScheduleResponse:
        repo = ScheduleRepository(db)
        entries = await repo.get_by_user(user_id)
        return ScheduleResponse.model_validate(
            {"entries": [e.__dict__ for e in entries]}
        )

    async def update_status(
        self, entry_id: str, user_id: str, status: str, db: AsyncSession
    ) -> None:
        repo = ScheduleRepository(db)
        entry = await repo.get_entry(entry_id)
        if not entry:
            raise NotFoundError("Entry not found")
        if entry.user_id != user_id:
            raise NotFoundError("Entry not found")
        await repo.update_status(entry_id, status)

    async def regenerate_schedule(
        self, user_id: str, feedback: str, db: AsyncSession
    ) -> None:
        repo = ScheduleRepository(db)
        await repo.delete_pending_future_entries(user_id)

        # gather data
        subject_repo = SubjectRepository(db)
        lesson_repo = LessonRepository(db)
        subjects = await subject_repo.get_all_by_user(user_id)
        all_lessons = []
        for s in subjects:
            # placeholder: collect lessons for subject
            pass

        from app.ai.agents import get_schedule_agent

        agent = get_schedule_agent()
        schedule = await agent.generate(
            subjects_summary=[s.__dict__ for s in subjects],
            available_slots=[],
            all_lessons=all_lessons,
        )
        # expect schedule to be list of entries
        await repo.bulk_insert(
            [e.model_dump() if hasattr(e, "model_dump") else e for e in schedule]
        )
