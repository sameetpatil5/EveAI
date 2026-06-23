from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.chat import TutorChatRequest, QuickAskRequest
from app.schemas.common import success_response
from app.services.chat_service import ChatService
from app.dependencies import get_db, get_current_user, get_redis
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/tutor/chat")
async def tutor_chat(
    data: TutorChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
):
    service = ChatService()
    result = await service.tutor_chat(
        user.id, data.message, data.lesson_id, data.session_id, db, redis
    )
    return success_response(result.model_dump())


@router.post("/quick-ask")
async def quick_ask(
    data: QuickAskRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ChatService()
    result = await service.quick_ask(user.id, data.message, data.subject_id, db)
    return success_response(result.model_dump())
