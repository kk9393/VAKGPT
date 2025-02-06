import secrets
import string
from fastapi.responses import RedirectResponse, JSONResponse
from app.models.user_model import User
from app.services.auth_service import (
    get_oauth_provider_url,
    exchange_code_for_token,
    fetch_user_info,
    save_user
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
    if provider != "google":
        return JSONResponse(content={"error": "Only Google login is supported"}, status_code=400)

    token_data = await exchange_code_for_token(provider, code)
    access_token = token_data.get("access_token")

    if not access_token:
        return JSONResponse(content={"error": "Failed to get access token"}, status_code=400)

    user_info = await fetch_user_info(provider, access_token)

    if not user_info:
        return JSONResponse(content={"error": "Failed to fetch user data"}, status_code=400)
    
    print("this is the user data boss ########")
    print(user_info)

    # Ensure email is present
    email = user_info.get("email")
    if not email:
        return JSONResponse(content={"error": "Email not found."}, status_code=400)

    user_id = generate_userid()

    user = User(
        userid=user_id,
        name=user_info.get("name", "Unknown"),
        email=email,  # Now guaranteed to be present
        profile_picture=user_info.get("avatar_url"),
        provider=provider,
        access_token=access_token,
        refresh_token=token_data.get("refresh_token")
    )

    await save_user(user.dict())
    return JSONResponse(content={"message": "Login successful", "user": user.dict()})
