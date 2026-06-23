from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.models.user import Hobby, User, UserHobby, UserProfile


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: str) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def create(self, email: str, password_hash: str) -> User:
        user = User(email=email, password_hash=password_hash)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def set_onboarding_complete(self, user_id: str) -> None:
        await self.db.execute(
            update(User).where(User.id == user_id).values(onboarding_complete=True)
        )
        await self.db.commit()

    async def get_profile(self, user_id: str) -> UserProfile | None:
        result = await self.db.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )
        return result.scalars().first()

    async def upsert_profile(self, user_id: str, data: dict) -> UserProfile:
        profile = await self.get_profile(user_id)
        if profile:
            for key, value in data.items():
                if hasattr(profile, key):
                    setattr(profile, key, value)
            await self.db.commit()
            await self.db.refresh(profile)
        else:
            profile = UserProfile(user_id=user_id, **data)
            self.db.add(profile)
            await self.db.commit()
            await self.db.refresh(profile)
        return profile

    async def get_hobbies(self, user_id: str) -> list[str]:
        result = await self.db.execute(
            select(Hobby.name).join(UserHobby).where(UserHobby.user_id == user_id)
        )
        return result.scalars().all()

    async def upsert_hobbies(self, user_id, hobby_names: list[str]) -> int:
        # Ensure hobbies exist (create if not)
        count = 0

        for name in hobby_names:
            result = await self.db.execute(
                select(Hobby).where(Hobby.name == name)
            )
            hobby = result.scalars().first()

            if not hobby:
                hobby = Hobby(name=name)
                self.db.add(hobby)
                await self.db.flush()  # ensures hobby.id exists

            link_result = await self.db.execute(
                select(UserHobby).where(
                    UserHobby.user_id == user_id,
                    UserHobby.hobby_id == hobby.id
                )
            )
            existing_link = link_result.scalars().first()

            if not existing_link:
                self.db.add(UserHobby(
                    user_id=user_id,
                    hobby_id=hobby.id
                ))
                count += 1

        await self.db.commit()
        return count
