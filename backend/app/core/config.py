from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application
    DEBUG: bool
    LOG_LEVEL: str

    FRONTEND_URL: str

    # Security
    JWT_SECRET: str
    ALGORITHM: str = "HS256"
    JWT_EXPIRE_DAYS: int = 7

    PASSWORD_RESET_LINK: str | None = None

    # PostgreSQL
    DATABASE_URL: str
    SYNC_DATABASE_URL: str | None = None

    # Redis
    REDIS_URL: str

    # Qdrant
    QDRANT_URL: str
    QDRANT_API_KEY: str
    LESSON_EMBEDDINGS: str
    USER_CONTEXT_EMBEDDINGS: str

    # Gemini
    GOOGLE_API_KEY: str
    GOOGLE_API_KEYS: str = ""  # comma-separated backup keys

    GEMINI_CHAT_MODEL: str
    GEMINI_EMBEDDING_MODEL: str
    GEMINI_EMBEDDING_DIM: int

    # Email
    EMAIL_HOST: str = ""
    EMAIL_USERNAME: str = ""
    EMAIL_PASSWORD: str = ""
    EMAIL_PORT: int = 587

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
