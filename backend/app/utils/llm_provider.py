import asyncio
from typing import Optional
from app.utils.logger import logger


class LLMProvider:
    """
    Manages multiple Google API keys with automatic rotation and fallback.
    If one key hits quota (429), rotates to the next available key.
    """

    def __init__(self, settings):
        self.settings = settings
        self.keys: list[str] = []
        self.current_index = 0
        self._load_keys()

    def _load_keys(self):
        """Load API keys from settings (GOOGLE_API_KEYS + GOOGLE_API_KEY fallback)."""
        keys = []

        # Load from GOOGLE_API_KEYS (comma-separated list)
        if self.settings.GOOGLE_API_KEYS:
            backup_keys = [
                k.strip() for k in self.settings.GOOGLE_API_KEYS.split(",") if k.strip()
            ]
            keys.extend(backup_keys)

        # Add primary key as fallback
        if self.settings.GOOGLE_API_KEY and self.settings.GOOGLE_API_KEY not in keys:
            keys.append(self.settings.GOOGLE_API_KEY)

        self.keys = keys
        if not self.keys:
            raise ValueError(
                "No Google API keys configured. Set GOOGLE_API_KEY or GOOGLE_API_KEYS."
            )

        logger.info(f"LLMProvider initialized with {len(self.keys)} key(s)")

    def get_current_key(self) -> str:
        """Get the currently active API key."""
        if not self.keys:
            raise RuntimeError("No API keys available")
        return self.keys[self.current_index]

    def rotate_key(self) -> Optional[str]:
        """
        Rotate to the next available API key.
        Returns the new key if rotation successful, None if all keys exhausted.
        """
        if len(self.keys) <= 1:
            logger.warning("Only one API key available; cannot rotate")
            return None

        old_index = self.current_index
        self.current_index = (self.current_index + 1) % len(self.keys)
        new_key = self.keys[self.current_index]

        logger.warning(
            f"Rotating API key from index {old_index} to {self.current_index}. "
            f"Reason: likely quota exhaustion or temporary error."
        )
        return new_key

    def is_quota_error(self, error: str) -> bool:
        """Check if error message indicates a quota issue."""
        quota_indicators = [
            "429",
            "RESOURCE_EXHAUSTED",
            "quota",
            "rate_limit",
            "too many requests",
        ]
        error_lower = str(error).lower()
        return any(indicator.lower() in error_lower for indicator in quota_indicators)
