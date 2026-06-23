import redis.asyncio as aioredis
import json
from app.core.config import settings

redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)


async def set_json(key: str, data: dict, ttl: int) -> None:
    """Serializes data to JSON and stores in Redis with TTL in seconds."""
    await redis_client.set(key, json.dumps(data), ex=ttl)


async def get_json(key: str) -> dict | None:
    """Retrieves and deserializes JSON from Redis. Returns None if key missing."""
    raw = await redis_client.get(key)
    if raw is None:
        return None
    return json.loads(raw)


async def delete(key: str) -> None:
    """Deletes a key from Redis."""
    await redis_client.delete(key)
