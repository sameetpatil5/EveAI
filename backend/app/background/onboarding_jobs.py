import asyncio
from app.core.database import AsyncSessionLocal
from app.core.redis import set_json, get_json
from app.utils.logger import logger
from app.repositories.user_repository import UserRepository
from app.repositories.subject_repository import SubjectRepository
from app.repositories.course_repository import CourseRepository
from app.repositories.schedule_repository import ScheduleRepository
from app.vectorstore.user_context_store import user_context_store
from app.utils.helpers import generate_uuid, utcnow
from datetime import datetime, timedelta, time, timezone


async def run_post_onboarding_setup(user_id: str, job_id: str) -> None:
    """
    Background job: runs after onboarding completion.

    Steps:
    1. Open new DB session (cannot use request session)
    2. Set job status to "running" in Redis
    3. Fetch user profile, subjects, hobbies
    4. For each subject: call CourseAgent, save course + modules + lessons
    5. Call ScheduleAgent, save schedule entries
    6. Upsert user context to vectorstore
    7. Set job status to "complete" in Redis
    On exception: set status to "failed" in Redis and log
    """
    db = AsyncSessionLocal()
    try:
        logger.info(f"Starting post-onboarding setup for user {user_id}, job {job_id}")

        # Set job status to running
        await set_json(f"job:{job_id}", {"status": "running", "error": None}, ttl=86400)

        # Fetch user data
        user_repo = UserRepository(db)
        subject_repo = SubjectRepository(db)
        course_repo = CourseRepository(db)

        profile = await user_repo.get_profile(user_id)
        subjects = await subject_repo.get_all_by_user(user_id)
        hobbies = await user_repo.get_hobbies(user_id)

        if not profile or not subjects:
            raise ValueError("User profile or subjects missing")

        logger.info(f"Processing {len(subjects)} subjects for user {user_id}")

        from app.ai.agents import get_course_agent

        # Generate courses for each subject
        course_agent = get_course_agent()
        all_courses = []

        for subject in subjects:
            try:
                logger.info(f"Generating course for subject: {subject.name}")
                output = await course_agent.generate(
                    subject_name=subject.name,
                    academic_level=getattr(profile, "academic_level", "beginner"),
                    major=getattr(profile, "major", ""),
                    goal=getattr(subject, "goal", ""),
                    target_weeks=subject.target_weeks,
                    weekly_hours=subject.weekly_hours,
                    user_level=subject.level,
                )

                # Save course structure to DB
                course = await course_repo.create(
                    subject.id,
                    {
                        "title": getattr(output, "title", subject.name),
                        "description": getattr(output, "description", ""),
                        "total_modules": len(getattr(output, "modules", [])),
                        # Course structure metadata is available immediately after generation.
                        # Individual lessons still generate on demand.
                        "generation_status": "complete",
                    },
                )

                # Save modules and lessons
                for mod_idx, module_data in enumerate(getattr(output, "modules", [])):
                    module = await course_repo.create_module(
                        course.id,
                        {
                            "title": getattr(
                                module_data, "title", f"Module {mod_idx + 1}"
                            ),
                            "description": getattr(module_data, "description", ""),
                            "module_order": getattr(
                                module_data, "module_order", mod_idx + 1
                            ),
                            "is_locked": mod_idx > 0,
                        },
                    )

                    # Save lesson-style activities as lesson metadata
                    for act_idx, activity_data in enumerate(
                        getattr(module_data, "activities", []) or []
                    ):
                        activity_type = getattr(
                            activity_data, "activity_type", "lesson"
                        )
                        if activity_type == "lesson":
                            await course_repo.create_lesson_metadata(
                                module.id,
                                {
                                    "title": getattr(
                                        activity_data, "title", f"Lesson {act_idx + 1}"
                                    ),
                                    "lesson_order": getattr(
                                        activity_data, "activity_order", act_idx + 1
                                    ),
                                    "generation_status": "pending",
                                },
                            )
                        elif activity_type == "quiz":
                            from app.repositories.quiz_repository import QuizRepository

                            quiz_repo = QuizRepository(db)
                            await quiz_repo.create_quiz(
                                {
                                    "module_id": module.id,
                                    "title": getattr(
                                        activity_data,
                                        "title",
                                        f"Module {module.module_order} Assessment",
                                    ),
                                    "passing_score": 70,
                                }
                            )

                all_courses.append(course)
                logger.info(f"Course generated for subject {subject.name}")

            except Exception as e:
                logger.error(
                    f"Error generating course for subject {subject.name}: {e}",
                    exc_info=True,
                )
                continue

        # Generate schedule (if courses exist)
        if all_courses:
            try:
                logger.info("Generating schedule")

                from app.services.schedule_service import ScheduleService

                service = ScheduleService()
                schedule_entries = await service.build_weekly_schedule_entries(
                    user_id, db
                )

                if schedule_entries:
                    schedule_repo = ScheduleRepository(db)
                    await schedule_repo.bulk_insert(schedule_entries)
                    logger.info(f"Created {len(schedule_entries)} schedule entries")
            except Exception as e:
                logger.error(f"Error generating schedule: {e}", exc_info=True)

        # Upsert user context to vectorstore
        try:
            logger.info("Upserting user context to vectorstore")
            profile_summary = f"User: {getattr(profile, 'full_name', 'N/A')}, Level: {getattr(profile, 'academic_level', 'N/A')}, Major: {getattr(profile, 'major', 'N/A')}, Hobbies: {', '.join(hobbies)}"
            await user_context_store.upsert(user_id, profile_summary)
        except Exception as e:
            logger.error(f"Error upserting to vectorstore: {e}", exc_info=True)

        # Mark job complete
        await set_json(
            f"job:{job_id}", {"status": "complete", "error": None}, ttl=86400
        )
        logger.info(f"Post-onboarding setup completed for user {user_id}")

    except Exception as e:
        logger.error(
            f"Post-onboarding setup failed for user {user_id}: {e}", exc_info=True
        )
        await set_json(
            f"job:{job_id}", {"status": "failed", "error": str(e)}, ttl=86400
        )
    finally:
        await db.close()
