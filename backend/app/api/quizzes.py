from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.quiz import (
    QuizGenerateModuleRequest,
    QuizGenerateQuickRequest,
    QuizSubmitRequest,
)
from app.schemas.common import success_response
from app.services.quiz_service import QuizService
from app.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/generate/module", status_code=status.HTTP_201_CREATED)
async def generate_module_quiz(
    data: QuizGenerateModuleRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizService()
    result = await service.generate_module_quiz(
        data.module_id, user.id, data.difficulty, data.question_count, db
    )
    return success_response(result.model_dump())


@router.post("/generate/quick", status_code=status.HTTP_201_CREATED)
async def generate_quick_quiz(
    data: QuizGenerateQuickRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizService()
    result = await service.generate_quick_quiz(
        data.subject_id, user.id, data.difficulty, data.question_count, db
    )
    return success_response(result.model_dump())


@router.post("/{quiz_id}/submit")
async def submit_quiz(
    quiz_id: str,
    data: QuizSubmitRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizService()
    result = await service.submit_quiz(quiz_id, user.id, data.answers, db)
    return success_response(result.model_dump())


@router.get("/history")
async def get_history(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    service = QuizService()
    result = await service.get_history(user.id, db)
    return success_response(result)
