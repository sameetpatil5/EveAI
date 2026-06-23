from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.subject_repository import SubjectRepository
from app.core.exceptions import ForbiddenError, NotFoundError
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse


class SubjectService:
    def _build_subject_response(self, subject) -> SubjectResponse:
        progress_pct = 0.0
        if getattr(subject, "progress", None) is not None:
            progress_pct = getattr(subject.progress, "progress_percentage", 0.0) or 0.0

        course_id = None
        course_generation_status = None
        if getattr(subject, "courses", None):
            first_course = subject.courses[0]
            course_id = getattr(first_course, "id", None)
            course_generation_status = getattr(first_course, "generation_status", None)

        payload = {
            "id": subject.id,
            "name": subject.name,
            "priority": subject.priority,
            "level": subject.level,
            "weekly_hours": subject.weekly_hours,
            "target_weeks": subject.target_weeks,
            "goal": subject.goal,
            "status": subject.status,
            "progress_percentage": progress_pct,
            "course_id": course_id,
            "course_generation_status": course_generation_status,
        }
        return SubjectResponse.model_validate(payload)

    async def list_subjects(
        self, user_id: str, db: AsyncSession
    ) -> list[SubjectResponse]:
        repo = SubjectRepository(db)
        subjects = await repo.get_all_by_user(user_id)
        return [self._build_subject_response(s) for s in subjects]

    async def get_subject(
        self, subject_id: str, user_id: str, db: AsyncSession
    ) -> SubjectResponse:
        repo = SubjectRepository(db)
        subject = await repo.get_by_id(subject_id)
        if not subject:
            raise NotFoundError("Subject not found")
        if subject.user_id != user_id:
            raise ForbiddenError("Not allowed")
        return self._build_subject_response(subject)

    async def create_subject(
        self, user_id: str, data: SubjectCreate, db: AsyncSession
    ) -> SubjectResponse:
        repo = SubjectRepository(db)
        subj = await repo.create(user_id, data.model_dump())
        return self._build_subject_response(subj)

    async def update_subject(
        self, subject_id: str, user_id: str, data: SubjectUpdate, db: AsyncSession
    ) -> SubjectResponse:
        repo = SubjectRepository(db)
        subject = await repo.get_by_id(subject_id)
        if not subject:
            raise NotFoundError("Subject not found")
        if subject.user_id != user_id:
            raise ForbiddenError("Not allowed")
        updated = await repo.update(subject_id, data.model_dump(exclude_none=True))
        return self._build_subject_response(updated)

    async def delete_subject(
        self, subject_id: str, user_id: str, db: AsyncSession
    ) -> None:
        repo = SubjectRepository(db)
        subject = await repo.get_by_id(subject_id)
        if not subject:
            raise NotFoundError("Subject not found")
        if subject.user_id != user_id:
            raise ForbiddenError("Not allowed")
        await repo.delete(subject_id)
