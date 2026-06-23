from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.core.security import create_token, hash_password, verify_password
from app.core.exceptions import ConflictError, ValidationError, AuthError
from app.schemas.auth import AuthResponse, UserOut


class AuthService:
    async def register(
        self, email: str, password: str, db: AsyncSession
    ) -> AuthResponse:
        user_repo = UserRepository(db)

        existing = await user_repo.get_by_email(email)
        if existing:
            raise ConflictError("Email already registered")

        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters")

        password_hash = hash_password(password)
        user = await user_repo.create(email=email, password_hash=password_hash)

        # create an empty profile row (repository handles create/upsert semantics)
        await user_repo.upsert_profile(user.id, {})

        token = create_token(user.id, user.email)
        user_out = UserOut(
            id=user.id,
            email=user.email,
            onboarding_complete=getattr(user, "onboarding_complete", False),
        )
        return AuthResponse(token=token, user=user_out)

    async def login(self, email: str, password: str, db: AsyncSession) -> AuthResponse:
        user_repo = UserRepository(db)
        user = await user_repo.get_by_email(email)
        if not user:
            raise AuthError("Invalid credentials")

        if not verify_password(password, user.password_hash):
            raise AuthError("Invalid credentials")

        token = create_token(user.id, user.email)
        user_out = UserOut(
            id=user.id,
            email=user.email,
            onboarding_complete=getattr(user, "onboarding_complete", False),
        )
        return AuthResponse(token=token, user=user_out)

    async def get_user_by_id(self, user_id: str, db: AsyncSession):
        user_repo = UserRepository(db)
        user = await user_repo.get_by_id(user_id)
        if not user:
            raise AuthError("User not found")
        return user
