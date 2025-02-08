import jwt as pyjwt
import datetime
import secrets
import string
from fastapi.responses import RedirectResponse, JSONResponse
from app.models.user_model import User
from app.config.settings import settings
from app.config.database import users_collection
from app.services.auth_service import (
    get_oauth_provider_url,
    exchange_code_for_token,
    fetch_user_info,
)

def generate_userid():
    """Generate a random 28-character user ID"""
    characters = string.ascii_letters + string.digits  # A-Z, a-z, 0-9
    return ''.join(secrets.choice(characters) for _ in range(28))  # 28 characters

async def login(provider: str):
    """Redirect user to OAuth provider"""
    if provider != "google":
        return JSONResponse(content={"error": "Only Google login is supported"}, status_code=400)

    url = await get_oauth_provider_url(provider)
    if url:
        return RedirectResponse(url=url)
    
    return JSONResponse(content={"error": "Invalid provider"}, status_code=400)

async def callback(provider: str, code: str):
    """Handle OAuth callback and authenticate user"""
    token_data = await exchange_code_for_token(provider, code)
    access_token = token_data.get("access_token")

    if not access_token:
        return JSONResponse(content={"error": "Failed to get access token"}, status_code=400)

    user_info = await fetch_user_info(provider, access_token)

    if not user_info:
        return JSONResponse(content={"error": "Failed to fetch user data"}, status_code=400)

    email = user_info.get("email")
    name = user_info.get("name", "Unknown")

    # Check if user already exists in DB
    existing_user = await users_collection.find_one({"email": email})

    if existing_user:
        user_id = existing_user["userid"]
    else:
        user_id = generate_userid()
        new_user = {
            "userid": user_id,
            "name": name,
            "email": email,
            "profile_picture": user_info.get("avatar_url"),
            "provider": provider,
        }
        await users_collection.insert_one(new_user)

    # Generate JWT token
    payload = {
        "userid": user_id,
        "name": name,
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)  # Expires in 7 days
    }
    jwt_token = pyjwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")

    redirect_url = f"http://localhost:3000/chat?token={jwt_token}"
    print(f"🔄 Redirecting to: {redirect_url}")

    return RedirectResponse(url=redirect_url, status_code=303)
