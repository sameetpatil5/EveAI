import importlib

__all__ = [
    "CourseAgent",
    "LessonAgent",
    "TutorAgent",
    "QuizAgent",
    "QuizEvaluationAgent",
    "ScheduleAgent",
    "InsightsAgent",
    "get_course_agent",
    "get_lesson_agent",
    "get_tutor_agent",
    "get_quiz_agent",
    "get_quiz_evaluation_agent",
    "get_schedule_agent",
    "get_insights_agent",
]

_AGENT_MODULES = {
    "CourseAgent": "course_agent",
    "LessonAgent": "lesson_agent",
    "TutorAgent": "tutor_agent",
    "QuizAgent": "quiz_agent",
    "QuizEvaluationAgent": "quiz_evaluation_agent",
    "ScheduleAgent": "schedule_agent",
    "InsightsAgent": "insights_agent",
}


def __getattr__(name: str):
    module_name = _AGENT_MODULES.get(name)
    if module_name is None:
        raise AttributeError(f"module {__name__} has no attribute {name}")
    module = importlib.import_module(f"app.ai.agents.{module_name}")
    return getattr(module, name)


def get_course_agent():
    from app.ai.agents.course_agent import CourseAgent

    return CourseAgent()


def get_lesson_agent():
    from app.ai.agents.lesson_agent import LessonAgent

    return LessonAgent()


def get_tutor_agent():
    from app.ai.agents.tutor_agent import TutorAgent

    return TutorAgent()


def get_quiz_agent():
    from app.ai.agents.quiz_agent import QuizAgent

    return QuizAgent()


def get_quiz_evaluation_agent():
    from app.ai.agents.quiz_evaluation_agent import QuizEvaluationAgent

    return QuizEvaluationAgent()


def get_schedule_agent():
    from app.ai.agents.schedule_agent import ScheduleAgent

    return ScheduleAgent()


def get_insights_agent():
    from app.ai.agents.insights_agent import InsightsAgent

    return InsightsAgent()
