from fastapi import APIRouter, Depends
from app.core.redis import get_json
from app.core.exceptions import NotFoundError
from app.schemas.common import success_response
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/{job_id}")
async def get_job_status(job_id: str, user: User = Depends(get_current_user)):
    job_data = await get_json(f"job:{job_id}")
    if job_data is None:
        raise NotFoundError("Job not found")
    return success_response(job_data)
