from app.core.exceptions import AIGenerationError
from langchain_core.output_parsers import PydanticOutputParser
from app.ai.schemas.lesson_output import LessonContentOutput
from app.ai.prompts.lesson_prompts import LESSON_GENERATION_PROMPT
from app.utils.llm_provider import LLMProvider
from app.core.config import settings
from app.utils.logger import logger
from langchain_google_genai import ChatGoogleGenerativeAI
from app.utils.llm_parsing import extract_json_from_text, sanitize_json_text
import json


class LessonAgent:
    def __init__(self, llm=None):
        from app.ai.base import get_llm

        self.llm = llm or get_llm()
        self.prompt = LESSON_GENERATION_PROMPT
        self.parser = PydanticOutputParser(pydantic_object=LessonContentOutput)
        # Build chain without parser so we can attempt repairs on raw output
        self.chain = self.prompt | self.llm
        self.chain_with_parser = self.prompt | self.llm | self.parser
        self.provider = LLMProvider(settings)

    async def generate(
        self,
        lesson_title: str,
        module_context: str,
        subject: str,
        academic_level: str,
        hobbies: list[str],
    ) -> LessonContentOutput:
        logger.info(
            f"[AGENT] Starting generate() with lesson_title={lesson_title}, "
            f"subject={subject}, academic_level={academic_level}"
        )
        try:
            logger.debug("[AGENT] Invoking LLM chain (raw output)...")
            inputs = {
                "lesson_title": lesson_title,
                "module_context": module_context,
                "subject": subject,
                "academic_level": academic_level,
                "hobbies": ", ".join(hobbies) if hobbies else "",
            }

            raw = await self.chain.ainvoke(inputs)

            # normalize raw text
            raw_text = getattr(raw, "content", None) or str(raw)
            logger.debug(f"[AGENT] Raw LLM output length: {len(raw_text or '')}")

            # Try direct pydantic JSON validation first
            try:
                # model_validate_json expects a JSON string
                parsed = LessonContentOutput.model_validate_json(raw_text)
                logger.info(
                    f"[AGENT] Parsed output successfully. content_len={len(getattr(parsed, 'content',''))}"
                )
                return parsed
            except Exception as parse_err:
                logger.warning(f"[AGENT] Direct parse failed: {parse_err}")

            # Attempt to extract JSON block and sanitize it
            candidate = extract_json_from_text(raw_text)
            if candidate:
                fixed = sanitize_json_text(candidate)
                try:
                    parsed = LessonContentOutput.model_validate_json(fixed)
                    logger.info(
                        f"[AGENT] Parsed after sanitization. content_len={len(getattr(parsed,'content',''))}"
                    )
                    return parsed
                except Exception as repair_err:
                    logger.warning(f"[AGENT] Repair parse failed: {repair_err}")

            # As a last resort try the chain with parser (some parsers accept structured messages)
            try:
                logger.debug("[AGENT] Falling back to chain with parser...")
                result = await self.chain_with_parser.ainvoke(inputs)
                logger.info(
                    f"[AGENT] Fallback parser succeeded. Output type={type(result).__name__}"
                )
                return result
            except Exception as final_err:
                logger.error(f"[AGENT] Final parse attempt failed: {final_err}")
                raise AIGenerationError(
                    f"Invalid json output: {final_err}\nRaw output:\n{raw_text}"
                ) from final_err
        except Exception as e:
            logger.error(f"[AGENT] First attempt failed: {e}", exc_info=True)
            error_str = str(e)
            if self.provider.is_quota_error(error_str):
                new_key = self.provider.rotate_key()
                if new_key:
                    logger.info(
                        f"[AGENT] Quota error detected; rotating to backup API key"
                    )
                    try:
                        self.llm = ChatGoogleGenerativeAI(
                            model=settings.GEMINI_CHAT_MODEL,
                            google_api_key=new_key,
                            temperature=0.7,
                        )
                        self.chain = self.prompt | self.llm
                        self.chain_with_parser = self.prompt | self.llm | self.parser
                        logger.info("[AGENT] Retrying with rotated API key...")
                        # Retry flow mirrors the robust parsing above
                        inputs = {
                            "lesson_title": lesson_title,
                            "module_context": module_context,
                            "subject": subject,
                            "academic_level": academic_level,
                            "hobbies": ", ".join(hobbies) if hobbies else "",
                        }

                        raw = await self.chain.ainvoke(inputs)
                        raw_text = getattr(raw, "content", None) or str(raw)
                        try:
                            parsed = LessonContentOutput.model_validate_json(raw_text)
                            logger.info(
                                f"[AGENT] Retry parsed successfully. content_len={len(getattr(parsed,'content',''))}"
                            )
                            return parsed
                        except Exception:
                            candidate = extract_json_from_text(raw_text)
                            if candidate:
                                fixed = sanitize_json_text(candidate)
                                try:
                                    parsed = LessonContentOutput.model_validate_json(
                                        fixed
                                    )
                                    logger.info(
                                        f"[AGENT] Retry parsed after sanitize. content_len={len(getattr(parsed,'content',''))}"
                                    )
                                    return parsed
                                except Exception:
                                    pass
                        # fallback to parser chain once more
                        result = await self.chain_with_parser.ainvoke(inputs)
                        logger.info(
                            f"[AGENT] Retry fallback parser succeeded. content_len={len(getattr(result,'content',''))}"
                        )
                        return result
                    except Exception as retry_error:
                        logger.error(
                            f"[AGENT] Retry failed: {retry_error}", exc_info=True
                        )
                        raise AIGenerationError(
                            f"Lesson generation failed after key rotation: {retry_error}"
                        ) from retry_error
            logger.error(f"[AGENT] Generation failed with error: {e}")
            raise AIGenerationError(f"Lesson generation failed: {e}") from e


def get_lesson_agent():
    return LessonAgent()
