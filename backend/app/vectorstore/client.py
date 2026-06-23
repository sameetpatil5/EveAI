from qdrant_client import QdrantClient
from app.core.config import settings

LESSON_EMBEDDINGS = settings.LESSON_EMBEDDINGS
USER_CONTEXT_EMBEDDINGS = settings.USER_CONTEXT_EMBEDDINGS

# Eager client per docs; keep simple and importable.
qdrant_client = QdrantClient(
    url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY or None
)
