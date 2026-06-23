import asyncio
from app.vectorstore.client import qdrant_client, USER_CONTEXT_EMBEDDINGS
from app.ai.base import get_embeddings


class UserContextStore:
    async def upsert(self, user_id: str, profile_summary: str) -> None:
        """Embed profile_summary and upsert into Qdrant under point id = user_id."""
        embeddings = get_embeddings()
        vector = await asyncio.to_thread(embeddings.embed_documents, [profile_summary])
        if isinstance(vector, list):
            vector = vector[0]

        point = {
            "id": user_id,
            "vector": vector,
            "payload": {"user_id": user_id, "summary": profile_summary},
        }

        if hasattr(qdrant_client, "upsert"):
            qdrant_client.upsert(
                collection_name=USER_CONTEXT_EMBEDDINGS, points=[point]
            )
            return
        if hasattr(qdrant_client, "points_api") and hasattr(
            qdrant_client.points_api, "upsert"
        ):
            qdrant_client.points_api.upsert(
                collection_name=USER_CONTEXT_EMBEDDINGS, points=[point]
            )
            return
        raise NotImplementedError(
            "Installed Qdrant client does not expose a supported upsert API"
        )


user_context_store = UserContextStore()
