class NotFoundError(Exception):
    pass


class ForbiddenError(Exception):
    pass


class AuthError(Exception):
    pass


class AIGenerationError(Exception):
    pass


class ConflictError(Exception):
    pass


class ValidationError(Exception):
    pass
