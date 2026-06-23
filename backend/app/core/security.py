from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings
from app.core.exceptions import AuthError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_token(user_id: str, email: str) -> str:
    """Creates a JWT with payload {user_id, email, exp}."""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRE_DAYS)
    payload = {"user_id": user_id, "email": email, "exp": int(expire.timestamp())}
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
    return token


def decode_token(token: str) -> dict:
    """Decodes and validates JWT. Returns payload dict. Raises AuthError if invalid or expired."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except JWTError as e:
        raise AuthError("Invalid or expired token") from e


def hash_password(plain: str) -> str:
    """Hashes a plain password using bcrypt."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Returns True if plain matches hashed."""
    return pwd_context.verify(plain, hashed)
