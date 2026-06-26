import asyncio
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.repositories.quiz_repository import QuizRepository
from app.services.quiz_service import QuizService
from app.schemas.quiz import SubmitAnswerItem


def inspect_schema():
    engine = create_engine(settings.SYNC_DATABASE_URL)
    with engine.connect() as conn:
        print("--- quiz_attempts columns ---")
        result = conn.execute(
            text(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='quiz_attempts' ORDER BY ordinal_position;"
            )
        )
        for row in result:
            print(row)
        print("\n--- sample quizzes ---")
        quiz_row = conn.execute(text("SELECT id FROM quizzes LIMIT 1")).first()
        print("quiz_row:", quiz_row)
        if quiz_row:
            quiz_id = quiz_row[0]
            q_rows = conn.execute(
                text(
                    "SELECT id, question_type, correct_answer FROM quiz_questions WHERE quiz_id = :qid"
                ),
                {"qid": quiz_id},
            ).fetchall()
            print("question rows:", q_rows)
        return quiz_row[0] if quiz_row else None


async def reproduce_submit(quiz_id: str):
    async_engine = create_async_engine(settings.DATABASE_URL)
    async_session = async_sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        repo = QuizRepository(session)
        quiz = await repo.get_quiz_with_questions(quiz_id)
        print("loaded quiz:", quiz.id, "questions", [q.id for q in quiz.questions])
        answers = [
            SubmitAnswerItem(question_id=q.id, answer=str(q.correct_answer or "True"))
            for q in quiz.questions
        ]
        service = QuizService()
        try:
            result = await service.submit_quiz(
                quiz_id, "test-user-id", answers, session
            )
            print("submit result:", result)
        except Exception as e:
            import traceback

            traceback.print_exc()


if __name__ == "__main__":
    quiz_id = inspect_schema()
    if quiz_id:
        asyncio.run(reproduce_submit(quiz_id))
    else:
        print("No quiz found to reproduce submit.")
