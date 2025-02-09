import json
import base64
import os
import shutil

from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.services.PromptManager import PromptManager
from app.services.LLMManager import LLMManager
from app.services.MongoDBChainOrchestrator import MongoDBChainOrchestrator

load_dotenv()

TEMP_UPLOAD_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

async def chat_prepare(
        uid: str, 
        history_size: int,
        model: str
):
    runnables_array = []
    runnables_array.append(PromptManager([{"system": "You are an AI assistant."}]).get())
    runnables_array.append(LLMManager(model=model).get())

    chat_flow = MongoDBChainOrchestrator(
        runnables_array,
        connection_string=os.getenv('MONGODB_CONNECTION_STRING'),
        database_name=os.getenv('CHAT_HISTORY_DATABASE_NAME'),
        collection_id=uid,
        history_size=history_size
    )

    return chat_flow

async def chat(message: str, session_id: str, model: str, user: dict, file: UploadFile = None):
    try:
        userid = user["userid"]

        file_path = None
        if file:
            user_folder = os.path.join(TEMP_UPLOAD_DIR, str(userid))
            os.makedirs(user_folder, exist_ok=True)

            file_path = os.path.join(user_folder, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            print(f"File uploaded: {file_path}")
            return {"file_path": file_path}

        chat_flow = await chat_prepare(uid=userid, history_size=10, model=model)
        orchestretor_json = {
            "session_id": session_id,
            "context_json": {
                "message": message
            }
        }

        async def generate():
            try:
                async for chunk in chat_flow.astream(**{**orchestretor_json}):
                    encoded_chunk = base64.b64encode(chunk.encode('utf-8')).decode('utf-8')
                    json_data = json.dumps({"content": encoded_chunk})
                    yield f"data: {json_data}\n\n"
                yield "data: " + json.dumps({"is_stream_finished": True}) + "\n\n"
            except Exception as e:
                error_json = json.dumps({"error": str(e)})
                yield f"data: {error_json}\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    except ValueError as ve:
        print(f"ValueError: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except KeyError as ke:
        print(f"KeyError: {ke}")
        raise HTTPException(status_code=400, detail=f"Missing key in request: {str(ke)}")
    except Exception as e:
        print(f"Unexpected error during chat processing: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
