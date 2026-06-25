import asyncio
import inspect
from typing import List

from app.vectorstore.client import qdrant_client, LESSON_EMBEDDINGS
from app.ai.base import get_embeddings
from app.utils.helpers import chunk_text, generate_deterministic_uuid


class LessonVectorStore:
    async def upsert(self, lesson_id: str, content_text: str, metadata: dict) -> None:
        """Chunk, embed, and upsert lesson content into Qdrant.

        This implementation prepares points and attempts to call the Qdrant client.
        The Qdrant Python client has multiple APIs across versions; this code
        detects common methods and will raise NotImplementedError if the
        installed client does not expose an upsert entrypoint.
        """
        chunks = chunk_text(content_text)
        if not chunks:
            return

        embeddings = get_embeddings()
        # Run potentially blocking embedding call in a thread
        vectors = await asyncio.to_thread(embeddings.embed_documents, chunks)

        points = []
        for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
            payload = {
                **(metadata or {}),
                "lesson_id": lesson_id,
                "content_chunk": chunk,
            }

            points.append(
                {
                    # NOTE: could improve later
                    # "id": generate_deterministic_uuid(lesson_id, chunk)
                    "id": generate_deterministic_uuid(lesson_id, str(i)),
                    "vector": vector,
                    "payload": payload,
                }
            )

        # Try a few common Qdrant client call patterns. Prefer awaiting if the
        # client exposes async coroutines; otherwise run sync calls in a thread.
        if hasattr(qdrant_client, "upsert"):
            fn = qdrant_client.upsert
            if inspect.iscoroutinefunction(fn):
                await fn(collection_name=LESSON_EMBEDDINGS, points=points)
            else:
                await asyncio.to_thread(
                    fn, collection_name=LESSON_EMBEDDINGS, points=points
                )
            return

        if hasattr(qdrant_client, "points_api") and hasattr(
            qdrant_client.points_api, "upsert"
        ):
            fn = qdrant_client.points_api.upsert
            if inspect.iscoroutinefunction(fn):
                await fn(collection_name=LESSON_EMBEDDINGS, points=points)
            else:
                await asyncio.to_thread(
                    fn, collection_name=LESSON_EMBEDDINGS, points=points
                )
            return

        # Fallback: try upload_collection (older/newer APIs)
        if hasattr(qdrant_client, "upload_collection"):
            fn = qdrant_client.upload_collection
            if inspect.iscoroutinefunction(fn):
                await fn(
                    collection_name=LESSON_EMBEDDINGS, vectors=vectors, payload=points
                )
            else:
                await asyncio.to_thread(
                    fn,
                    collection_name=LESSON_EMBEDDINGS,
                    vectors=vectors,
                    payload=points,
                )
            return

        raise NotImplementedError(
            "Installed Qdrant client does not expose a supported upsert API"
        )

    async def search(
        self, query_text: str, subject_id: str, top_k: int = 5
    ) -> List[str]:
        """Embed query_text, search Qdrant for similar lesson chunks filtered by subject_id.

        Returns a list of matching `content_chunk` strings (may be empty).
        """
        embeddings = get_embeddings()
        q = await asyncio.to_thread(
            getattr(embeddings, "embed_query", embeddings.embed_documents), [query_text]
        )
        # normalize vector
        if isinstance(q, list) and len(q) == 1:
            query_vector = q[0]
        else:
            # embeddings.embed_documents may return list of vectors even for one input
            query_vector = q if isinstance(q[0], list) else q

        # Prepare a filter payload if Qdrant supports it
        qdrant_filter = (
            {"must": [{"key": "subject_id", "match": {"value": subject_id}}]}
            if subject_id
            else None
        )

        # Try common search APIs
        if hasattr(qdrant_client, "search"):
            results = qdrant_client.search(
                collection_name=LESSON_EMBEDDINGS,
                query_vector=query_vector,
                filter=qdrant_filter,
                limit=top_k,
            )
        elif hasattr(qdrant_client, "search_points"):
            results = qdrant_client.search_points(
                collection_name=LESSON_EMBEDDINGS,
                query_vector=query_vector,
                limit=top_k,
                filter=qdrant_filter,
            )
        else:
            raise NotImplementedError(
                "Installed Qdrant client does not expose a supported search API"
            )

        # Extract content_chunk from payloads
        chunks: List[str] = []
        for item in results or []:
            payload = getattr(item, "payload", None) or item.get("payload", {})
            chunk = payload.get("content_chunk") if payload else None
            if chunk:
                chunks.append(chunk)
        return chunks


lesson_store = LessonVectorStore()
