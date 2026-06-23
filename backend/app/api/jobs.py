from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import get_json, set_json
from app.core.exceptions import NotFoundError
from app.schemas.common import success_response
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.background.onboarding_jobs import run_post_onboarding_setup

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/{job_id}")
async def get_job_status(job_id: str, user: User = Depends(get_current_user)):
    job_data = await get_json(f"job:{job_id}")
    if job_data is None:
        raise NotFoundError("Job not found")
    return success_response(job_data)


@router.post("/{job_id}/retry")
async def retry_onboarding_job(
    job_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = None,
):
    """Retry a failed onboarding job for the current user."""
    job_data = await get_json(f"job:{job_id}")
    if job_data is None:
        raise NotFoundError("Job not found")

    if job_data.get("status") != "failed":
        return success_response(
            {"status": job_data.get("status"), "message": "Job is not in failed state"}
        )

    # Reset job status to pending and trigger retry
    await set_json(f"job:{job_id}", {"status": "pending", "error": None}, ttl=86400)

    if background_tasks:
        background_tasks.add_task(run_post_onboarding_setup, user.id, job_id)

    return success_response({"status": "retrying", "job_id": job_id})
