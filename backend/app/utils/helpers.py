import uuid
from datetime import datetime, timezone


def generate_uuid() -> str:
    """Returns a new UUID4 string."""
    return str(uuid.uuid4())


def generate_deterministic_uuid(*parts: str) -> str:
    """
    Generate a stable UUID5 from one or more string parts.

    Example:
        generate_deterministic_uuid(lesson_id, str(chunk_index))
    """
    value = ":".join(str(part) for part in parts)
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, value))


def utcnow() -> datetime:
    """Returns current UTC datetime."""
    return datetime.now(timezone.utc)


def chunk_text(text: str, size: int = 500) -> list[str]:
    """Splits text into chunks of approximately `size` characters, splitting on whitespace."""
    words = text.split()
    chunks, current = [], []
    length = 0
    for word in words:
        if length + len(word) > size and current:
            chunks.append(" ".join(current))
            current, length = [], 0
        current.append(word)
        length += len(word) + 1
    if current:
        chunks.append(" ".join(current))
    return chunks
