from typing import Optional
from pydantic import BaseModel


class LessonMetaResponse(BaseModel):
    id: str
    title: str
    lesson_order: int
    generation_status: str
    completed: bool


class ModuleResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    module_order: int
    is_locked: bool
    lessons: list[LessonMetaResponse]


class CourseStructureResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    total_modules: int
    generation_status: str
    modules: list[ModuleResponse]
