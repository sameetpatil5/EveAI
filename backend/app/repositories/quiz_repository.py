from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.quiz import Quiz, QuizAttempt, QuizQuestion
from app.utils.helpers import generate_uuid


class QuizRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_quiz(self, data: dict) -> Quiz:
        quiz = Quiz(**data)
        self.db.add(quiz)
        await self.db.commit()
        await self.db.refresh(quiz)
        return quiz

    async def create_questions(self, quiz_id: str, questions: list[dict]) -> None:
        for q_data in questions:
            question = QuizQuestion(quiz_id=quiz_id, **q_data)
            self.db.add(question)
        await self.db.commit()

    async def get_quiz_with_questions(self, quiz_id: str) -> Quiz:
        result = await self.db.execute(
            select(Quiz).where(Quiz.id == quiz_id).options(selectinload(Quiz.questions))
        )
        return result.scalars().first()

    async def save_attempt(self, data: dict) -> QuizAttempt:
        attempt = QuizAttempt(**data)
        self.db.add(attempt)
        await self.db.commit()
        await self.db.refresh(attempt)
        return attempt

    async def get_history(self, user_id: str) -> list[QuizAttempt]:
        result = await self.db.execute(
            select(QuizAttempt)
            .where(QuizAttempt.user_id == user_id)
            .order_by(QuizAttempt.submitted_at.desc())
        )
        return result.scalars().all()

    async def save_quick_quiz_history(self, data: dict) -> None:
        from app.models.quiz import QuickQuizHistory

        hist = QuickQuizHistory(**data)
        self.db.add(hist)
        await self.db.commit()
