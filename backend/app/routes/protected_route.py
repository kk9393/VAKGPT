from fastapi import APIRouter, Depends
from app.middleware.auth_middleware import verify_jwt

router = APIRouter()

@router.get("/protected")
async def protected_route(user: dict = Depends(verify_jwt)):
    return {
        "message": "Access granted",
        "user": user  # ✅ Now we have access to the logged-in user's details
    }
