from fastapi import HTTPException
from app.config.database import client
import json

async def get_sessions(user: dict):
    """
    Fetches the list of unique chat sessions for a user, sorted by the latest timestamp.
    """
    # Check if 'userid' exists in the user dictionary
    if "userid" not in user:
        return {"sessions": []}

    userid = user["userid"]

    try:
        db = client.VAKGPTChatHistory
        collection = db[userid]
        pipeline = [
            {"$group": {"_id": "$session_id", "latest_timestamp": {"$max": "$timestamp"}}},
            {"$sort": {"latest_timestamp": -1}}
        ]

        result = await collection.aggregate(pipeline).to_list(None)

        sessions = [doc["_id"] for doc in result]

        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_session_chat(session_id: str, page: int, user: dict):
    """Fetch session chat history for the given session ID with pagination"""
    
    userid = user["userid"] 
    db = client.VAKGPTChatHistory
    chat_collection = db[userid] 

    messages_per_page = 10
    skip_count = (page - 1) * messages_per_page 

    chat_history = await chat_collection.find(
        {"session_id": session_id}
    ).sort("timestamp", -1).skip(skip_count).limit(messages_per_page).to_list(None)

    if not chat_history:
        chat_history = []

    formatted_messages = [
        {
            "id": str(msg["_id"]),
            "message": str(json.loads(msg["history"])["data"]["content"]),
            "sender": json.loads(msg["history"])["type"],
            "timestamp": msg["timestamp"],
        }
        for msg in chat_history
    ]

    total_messages = await chat_collection.count_documents({"session_id": session_id})
    
    has_next_page = skip_count + messages_per_page < total_messages

    return {
        "messages": formatted_messages,
        "pagination": {
            "current_page": page,
            "has_next_page": has_next_page,
            "next_page": page + 1 if has_next_page else None,
            "total_messages": total_messages,
        }
    }
