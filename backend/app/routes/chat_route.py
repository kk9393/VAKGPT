from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.controllers import chat_controller
from app.middleware.auth_middleware import verify_jwt

router = APIRouter()

@router.post("/chat")
async def chat(
    message: str = Form(...),
    session_id: str = Form(...),
    model: str = Form(...),
    user: dict = Depends(verify_jwt),
    temp_user: str = Form(...),
    file: UploadFile = File(None)
):
    return await chat_controller.chat(message, session_id, model, user, temp_user, file)
