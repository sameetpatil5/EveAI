from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.quiz_repository import QuizRepository
from app.core.exceptions import NotFoundError
from app.schemas.quiz import QuizResponse, QuizResultResponse
from app.utils.helpers import generate_uuid
from app.utils.logger import logger
from app.utils.logger import logger


class QuizService:
    async def generate_module_quiz(
        self,
        module_id: str,
        user_id: str,
        difficulty: str,
        question_count: int,
        db: AsyncSession,
    ) -> QuizResponse:
        from app.ai.agents import get_quiz_agent

        quiz_agent = get_quiz_agent()
        quiz_data = await quiz_agent.generate(
            content=module_id, difficulty=difficulty, question_count=question_count
        )
        repo = QuizRepository(db)
        quiz = await repo.create_quiz(
            {
                "title": getattr(quiz_data, "title", "Module Quiz"),
                "module_id": module_id,
            }
        )
        questions_data = []
        for q in quiz_data.questions:
            q_data = q.model_dump()
            if not q_data.get("id"):
                q_data["id"] = generate_uuid()
            questions_data.append(q_data)
        await repo.create_questions(quiz.id, questions_data)
        return QuizResponse.model_validate(
            {
                "id": quiz.id,
                "title": getattr(quiz, "title", "Module Quiz"),
                "questions": questions_data,
            }
        )

    async def generate_quick_quiz(
        self,
        subject_id: str,
        user_id: str,
        difficulty: str,
        question_count: int,
        db: AsyncSession,
    ) -> QuizResponse:
        from app.ai.agents import get_quiz_agent

        quiz_agent = get_quiz_agent()
        quiz_data = await quiz_agent.generate(
            content=subject_id, difficulty=difficulty, question_count=question_count
        )
        repo = QuizRepository(db)
        quiz = await repo.create_quiz(
            {"title": getattr(quiz_data, "title", "Quick Quiz")}
        )
        questions_data = []
        for q in quiz_data.questions:
            q_data = q.model_dump()
            if not q_data.get("id"):
                q_data["id"] = generate_uuid()
            questions_data.append(q_data)
        await repo.create_questions(quiz.id, questions_data)
        return QuizResponse.model_validate(
            {
                "id": quiz.id,
                "title": getattr(quiz, "title", "Quick Quiz"),
                "questions": questions_data,
            }
        )

    async def submit_quiz(
        self, quiz_id: str, user_id: str, answers: list, db: AsyncSession
    ) -> QuizResultResponse:
        repo = QuizRepository(db)
        quiz = await repo.get_quiz_with_questions(quiz_id)
        if not quiz:
            raise NotFoundError("Quiz not found")

        questions = getattr(quiz, "questions", [])
        total = len(questions)
        correct = 0
        feedbacks = []
        from app.ai.agents import get_quiz_evaluation_agent

        evaluation_agent = get_quiz_evaluation_agent()

        for ans in answers:
            q = next((x for x in questions if x.id == ans.question_id), None)
            if not q:
                feedbacks.append(
                    {
                        "question_id": ans.question_id,
                        "correct": False,
                        "reason": "question missing",
                    }
                )
                continue
            if getattr(q, "question_type", "") in ("mcq", "true_false", "truefalse"):
                if (
                    ans.answer.strip().lower()
                    == getattr(q, "correct_answer", "").strip().lower()
                ):
                    correct += 1
                    feedbacks.append({"question_id": ans.question_id, "correct": True})
                else:
                    feedbacks.append({"question_id": ans.question_id, "correct": False})
            else:
                # subjective
                try:
                    eval_out = await evaluation_agent.evaluate(
                        q.question_text, getattr(q, "correct_answer", ""), ans.answer
                    )
                    is_correct = getattr(eval_out, "is_correct", False)
                    detail = getattr(eval_out, "explanation", None)
                except Exception as e:
                    logger.error(
                        f"Quiz subjective evaluation failed for quiz={quiz_id} question={q.id}: {e}",
                        exc_info=True,
                    )
                    is_correct = False
                    detail = (
                        "Unable to evaluate this subjective answer at this time. "
                        "Please try again later."
                    )

                if is_correct:
                    correct += 1
                feedbacks.append(
                    {
                        "question_id": ans.question_id,
                        "correct": is_correct,
                        "detail": detail,
                    }
                )

        score = (correct / total) * 100 if total else 0.0
        passed = score >= 50.0
        attempt = await repo.save_attempt(
            {
                "quiz_id": quiz_id,
                "user_id": user_id,
                "score": score,
                "passed": passed,
                "answers": [a.model_dump() for a in answers],
            }
        )
        return QuizResultResponse.model_validate(
            {
                "quiz_id": quiz_id,
                "score": score,
                "passed": passed,
                "feedback": None,
                "question_results": feedbacks,
            }
        )

    async def get_history(self, user_id: str, db: AsyncSession) -> list[dict]:
        repo = QuizRepository(db)
        history = await repo.get_history(user_id)
        return history
