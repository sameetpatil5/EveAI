from pydantic import BaseModel


class LessonContentOutput(BaseModel):
    title: str
    content: str  # main theory in markdown
    summary: str
    hobby_explanation: str
    references: list[str]
    youtube_links: list[str]
