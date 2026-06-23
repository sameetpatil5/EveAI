from app.schemas.common import APIResponse, success_response, error_response
from app.schemas.auth import RegisterRequest, LoginRequest, UserOut, AuthResponse
from app.schemas.onboarding import (
    AcademicInfoRequest,
    SubjectInput,
    SubjectsRequest,
    HobbiesRequest,
    AvailabilitySlot,
    AvailabilityRequest,
    OnboardingCompleteResponse,
)
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse
from app.schemas.course import (
    LessonMetaResponse,
    ModuleResponse,
    CourseStructureResponse,
)
from app.schemas.lesson import LessonResponse
from app.schemas.quiz import (
    QuizGenerateModuleRequest,
    QuizGenerateQuickRequest,
    QuestionResponse,
    QuizResponse,
    SubmitAnswerItem,
    QuizSubmitRequest,
    QuizResultResponse,
)
from app.schemas.schedule import (
    ScheduleEntryResponse,
    ScheduleResponse,
    UpdateScheduleStatusRequest,
    RegenerateScheduleRequest,
)
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, NoteListItem
from app.schemas.chat import (
    TutorChatRequest,
    TutorChatResponse,
    QuickAskRequest,
    QuickAskResponse,
)
from app.schemas.insights import (
    DashboardInsightsResponse,
    AIInsightsResponse,
    SubjectProgressItem,
    WeeklyStudyItem,
)
