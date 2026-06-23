# EveAI Backend

A personalized AI teaching assistant backend built with FastAPI and PostgreSQL.

## Features

- JWT Authentication
- User profiles with subjects, hobbies, and preferences
- Dynamic schedule generation
- AI tutoring integration (stub)
- Progress tracking
- Notes management
- Quiz generation
- Background tasks with APScheduler

## Setup

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Configure environment variables in `.env`:

   ```bash
   DATABASE_URL=postgresql+asyncpg://user:password@localhost/eveai
   SYNC_DATABASE_URL=postgresql://user:password@localhost/eveai
   SECRET_KEY=your-secret-key-here
   ```

3. Run database migrations:

   ```bash
   alembic init alembic  # Only first time
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

4. Run the application:

   ```bash
   python main.py
   ```

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## Project Structure

- `/app/api` - API route handlers
- `/app/core` - Core utilities (config, database, security)
- `/app/models` - SQLAlchemy database models
- `/app/schemas` - Pydantic validation schemas
- `/app/services` - Business logic services

## Key Endpoints

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login and get JWT token
- `POST /user/onboard` - Save user profile
- `POST /schedule/generate` - Generate study schedule
- `GET /schedule/today` - Get today's schedule
- `POST /ai/chat` - AI tutoring chat (stub)
- `POST /progress/log` - Log learning progress
- `GET /progress/summary` - Get progress statistics
- `POST /notes/add` - Add a note
- `GET /notes/list` - List all notes

## Development

The AI integration is currently stubbed. Replace the functions in `/app/services/ai_service.py` with actual AI service calls (OpenAI, Anthropic, etc.).

## License

MIT
