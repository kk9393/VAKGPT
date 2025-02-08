from fastapi import APIRouter, Query, Depends
from app.controllers import chat_controller
from app.middleware.auth_middleware import verify_jwt

router = APIRouter()

@router.get("/chat")
async def chat(message: str = Query(...), session_id: str = Query(...), model: str = Query(...), user: dict = Depends(verify_jwt)):
    return await chat_controller.chat(message, session_id, model, user)
