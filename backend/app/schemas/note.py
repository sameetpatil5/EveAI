from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class NoteCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content: str
    subject_id: Optional[str] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    subject_id: Optional[str] = None


class NoteResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    content: str
    subject_id: Optional[str]
    subject_name: Optional[str]
    created_at: datetime


class NoteListItem(BaseModel):
    id: str
    title: str
    description: Optional[str]
    subject_id: Optional[str]
    subject_name: Optional[str]
    created_at: datetime
