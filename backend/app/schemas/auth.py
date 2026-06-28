from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    full_name: str | None = None
    email: EmailStr
    password: str

    @field_validator("password")
    def password_min_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    onboarding_complete: bool


class AuthResponse(BaseModel):
    token: str
    user: UserOut
