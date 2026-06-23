from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from app.core.config import settings
from app.utils.llm_provider import LLMProvider

# Lazy factory functions to avoid network calls at import time
_llm: Optional[ChatGoogleGenerativeAI] = None
_embeddings: Optional[GoogleGenerativeAIEmbeddings] = None
_provider: Optional[LLMProvider] = None


def get_provider() -> LLMProvider:
    global _provider
    if _provider is None:
        _provider = LLMProvider(settings)
    return _provider


def get_llm() -> ChatGoogleGenerativeAI:
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_CHAT_MODEL,
            google_api_key=get_provider().get_current_key(),
            temperature=0.7,
        )
    return _llm


def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = GoogleGenerativeAIEmbeddings(
            model=settings.GEMINI_EMBEDDING_MODEL,
            google_api_key=get_provider().get_current_key(),
        )
    return _embeddings


# Backwards-compatible names (still lazy)
def llm() -> ChatGoogleGenerativeAI:
    return get_llm()


def embeddings() -> GoogleGenerativeAIEmbeddings:
    return get_embeddings()
