import asyncio
import traceback
from sqlalchemy import text
from app.core.database import AsyncSessionLocal
from app.core.redis import redis_client
from app.services.chat_service import ChatService

async def main():
    async with AsyncSessionLocal() as db:
        user = await db.execute(text('SELECT id FROM users LIMIT 1'))
        user_row = user.first()
        lesson = await db.execute(text('SELECT id FROM lessons LIMIT 1'))
        lesson_row = lesson.first()
        print('user_row', user_row)
        print('lesson_row', lesson_row)
        if not user_row or not lesson_row:
            print('No user or lesson available')
            return
        user_id = user_row[0]
        lesson_id = lesson_row[0]
        print('testing with user_id', user_id, 'lesson_id', lesson_id)
        service = ChatService()
        try:
            result = await service.tutor_chat(user_id, 'Hello tutor', lesson_id, None, db, redis_client)
            print('result', result)
        except Exception as e:
            print('EXCEPTION', type(e), e)
            traceback.print_exc()

asyncio.run(main())
