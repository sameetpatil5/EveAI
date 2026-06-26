from pydantic import BaseModel


class ActivityMetadataOutput(BaseModel):
    title: str
    activity_order: int
    activity_type: str
    estimated_minutes: int
    resources: list[str] | None = None


class ModuleOutput(BaseModel):
    title: str
    module_order: int
    activities: list[ActivityMetadataOutput] | None = None


class CourseStructureOutput(BaseModel):
    title: str
    description: str
    estimated_weeks: int
    modules: list[ModuleOutput]
