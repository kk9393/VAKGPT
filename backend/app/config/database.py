from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

client = AsyncIOMotorClient(settings.MONGODB_CONNECTION_STRING)
db = client.auth_db 
users_collection = db.users
