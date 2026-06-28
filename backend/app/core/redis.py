import redis.asyncio as aioredis
import json
from app.core.config import settings

redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)


async def set_json(key: str, data: dict, ttl: int, redis=None) -> None:
    """Serializes data to JSON and stores in Redis with TTL in seconds."""
    redis = redis or redis_client
    await redis.set(key, json.dumps(data), ex=ttl)


async def get_json(key: str, redis=None) -> dict | None:
    """Retrieves and deserializes JSON from Redis. Returns None if key missing."""
    redis = redis or redis_client
    raw = await redis.get(key)
    if raw is None:
        return None
    return json.loads(raw)


async def delete(key: str, redis=None) -> None:
    """Deletes a key from Redis."""
    redis = redis or redis_client
    await redis.delete(key)
