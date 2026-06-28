from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse
from app.schemas.common import success_response
from app.services.auth_service import AuthService
from app.dependencies import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService()
    result = await service.register(
        data.email, data.password, db, full_name=data.full_name
    )
    return success_response(result.model_dump())


@router.post("/login", response_model=dict)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService()
    result = await service.login(data.email, data.password, db)
    return success_response(result.model_dump())


@router.get("/me", response_model=dict)
async def get_current(user: User = Depends(get_current_user)):
    return success_response(
        {
            "id": user.id,
            "email": user.email,
            "onboarding_complete": user.onboarding_complete,
        }
    )
