from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None


def success_response(data) -> dict:
    return {"success": True, "data": data, "error": None}


def error_response(message: str) -> dict:
    return {"success": False, "data": None, "error": message}
