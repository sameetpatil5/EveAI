from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from app.core.config import settings

# Lazy factory functions to avoid network calls at import time
_llm: Optional[ChatGoogleGenerativeAI] = None
_embeddings: Optional[GoogleGenerativeAIEmbeddings] = None


def get_llm() -> ChatGoogleGenerativeAI:
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_CHAT_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.7,
        )
    return _llm


def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = GoogleGenerativeAIEmbeddings(
            model=settings.GEMINI_EMBEDDING_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
        )
    return _embeddings


# Backwards-compatible names (still lazy)
def llm() -> ChatGoogleGenerativeAI:
    return get_llm()


def embeddings() -> GoogleGenerativeAIEmbeddings:
    return get_embeddings()
