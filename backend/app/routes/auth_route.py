from fastapi import APIRouter, Query
from app.controllers import auth_controller

router = APIRouter()

@router.get("/auth/login/{provider}")
async def login(provider: str):
    """Redirect user to OAuth provider"""
    return await auth_controller.login(provider)

@router.get("/auth/callback/{provider}")
async def callback(provider: str, code: str = Query(...)):
    """Handle OAuth callback and authenticate user"""
    return await auth_controller.callback(provider, code)
