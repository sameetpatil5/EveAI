from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.onboarding import (
    AcademicInfoRequest,
    SubjectsRequest,
    HobbiesRequest,
    AvailabilityRequest,
    OnboardingCompleteResponse,
)
from app.schemas.common import success_response
from app.services.onboarding_service import OnboardingService
from app.dependencies import get_db, get_current_user
from app.background.onboarding_jobs import run_post_onboarding_setup
from app.models.user import User

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("/academic")
async def save_academic(
    data: AcademicInfoRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OnboardingService()
    await service.save_academic(user.id, data, db)
    return success_response({"status": "saved"})


@router.post("/subjects")
async def save_subjects(
    data: SubjectsRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OnboardingService()
    count = await service.save_subjects(user.id, data, db)
    return success_response({"count": count})


@router.post("/hobbies")
async def save_hobbies(
    data: HobbiesRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OnboardingService()
    count = await service.save_hobbies(user.id, data, db)
    return success_response({"count": count})


@router.post("/availability")
async def save_availability(
    data: AvailabilityRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = OnboardingService()
    await service.save_availability(user.id, data, db)
    return success_response({"status": "saved"})


@router.post("/complete", status_code=status.HTTP_202_ACCEPTED)
async def complete_onboarding(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = None,
):
    service = OnboardingService()
    job_id = await service.complete_onboarding(user.id, db, None)
    if background_tasks:
        background_tasks.add_task(run_post_onboarding_setup, user.id, job_id)
    return success_response(
        OnboardingCompleteResponse(
            job_id=job_id, message="Onboarding started"
        ).model_dump()
    )
