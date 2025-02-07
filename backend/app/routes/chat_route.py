from fastapi import APIRouter, Query
from app.controllers import chat_controller

router = APIRouter()

@router.get("/chat")
async def chat(message: str = Query(...), session_id: str = Query(...), uid: str = Query(...), model: str = Query(...)):
    return await chat_controller.chat(message, session_id, uid, model)
