from pydantic import BaseModel


class LessonMetadataOutput(BaseModel):
    title: str
    lesson_order: int


class ModuleOutput(BaseModel):
    title: str
    description: str
    module_order: int
    lessons: list[LessonMetadataOutput]


class CourseStructureOutput(BaseModel):
    title: str
    description: str
    estimated_weeks: int
    modules: list[ModuleOutput]
