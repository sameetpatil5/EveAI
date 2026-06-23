from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.auth import router as auth_router
from app.api.onboarding import router as onboarding_router
from app.api.jobs import router as jobs_router
from app.api.subjects import router as subjects_router
from app.api.courses import router as courses_router
from app.api.lessons import router as lessons_router
from app.api.quizzes import router as quiz_router
from app.api.schedule import router as schedule_router
from app.api.chat import router as chat_router
from app.api.notes import router as notes_router
from app.api.insights import router as insights_router
from app.api.dashboard import router as dashboard_router
from app.api.profile import router as profile_router
from app.api.state import router as state_router
from app.core.config import settings
from app.core.database import engine
from app.core.exceptions import (
    AuthError,
    AIGenerationError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
)
from app.core.redis import redis_client
from app.schemas.common import error_response


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))

    await redis_client.ping()

    yield


app = FastAPI(title="EveAI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(onboarding_router)
app.include_router(jobs_router)
app.include_router(subjects_router)
app.include_router(courses_router)
app.include_router(lessons_router)
app.include_router(quiz_router)
app.include_router(schedule_router)
app.include_router(chat_router)
app.include_router(notes_router)
app.include_router(insights_router)
app.include_router(dashboard_router)
app.include_router(profile_router)
app.include_router(state_router)


@app.exception_handler(NotFoundError)
async def handle_not_found(request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content=error_response(str(exc)))


@app.exception_handler(ForbiddenError)
async def handle_forbidden(request: Request, exc: ForbiddenError) -> JSONResponse:
    return JSONResponse(status_code=403, content=error_response(str(exc)))


@app.exception_handler(AuthError)
async def handle_auth(request: Request, exc: AuthError) -> JSONResponse:
    return JSONResponse(status_code=401, content=error_response(str(exc)))


@app.exception_handler(ConflictError)
async def handle_conflict(request: Request, exc: ConflictError) -> JSONResponse:
    return JSONResponse(status_code=409, content=error_response(str(exc)))


@app.exception_handler(AIGenerationError)
async def handle_ai_error(request: Request, exc: AIGenerationError) -> JSONResponse:
    return JSONResponse(status_code=500, content=error_response(str(exc)))


@app.exception_handler(ValidationError)
async def handle_validation(request: Request, exc: ValidationError) -> JSONResponse:
    return JSONResponse(status_code=400, content=error_response(str(exc)))


@app.exception_handler(Exception)
async def handle_unhandled_exception(request: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code, content=error_response(str(exc.detail))
        )
    return JSONResponse(status_code=500, content=error_response(str(exc)))


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
