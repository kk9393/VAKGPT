from fastapi import APIRouter, Depends, Query
from app.controllers import session_controller
from app.middleware.auth_middleware import verify_jwt

router = APIRouter()

@router.get("/session/get_sessions")
async def get_sessions(user: dict = Depends(verify_jwt)):
    """Load all sessions for the authenticated or guest user"""
    return await session_controller.get_sessions(user)

@router.get("/session/get_session_chat")
async def get_session_chat(session_id: str = Query(...), page: int = Query(1, alias="page"), user: dict = Depends(verify_jwt)):
    """Load session chat history"""
    return await session_controller.get_session_chat(session_id, page, user)
