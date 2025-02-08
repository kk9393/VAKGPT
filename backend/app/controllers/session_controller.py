from fastapi import HTTPException
from app.config.database import client  # Import the existing database connection

async def get_sessions(user: dict):
    """
    Fetches the list of unique chat sessions for a user.

    - If the user is authenticated, it retrieves sessions from the user's `userid` collection.
    - If the user is a guest, it retrieves sessions from their temporary ID.
    """
    print("userid is: ", user['userid'])
    userid = user["userid"]  # Extract user ID
    db = client.VAKGPTChatHistory
    collection = db[userid]  # Collection name = userid

    try:
        # Fetch all unique session IDs for this user
        sessions = await collection.distinct("session_id")

        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
