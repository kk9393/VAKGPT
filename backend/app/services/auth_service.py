import requests
from app.config.database import users_collection
from app.config.settings import settings

async def get_oauth_provider_url(provider: str):
    """Returns OAuth URL for Google only"""
    if provider == "google":
        return (
            f"https://accounts.google.com/o/oauth2/auth"
            f"?client_id={settings.GOOGLE_CLIENT_ID}"
            f"&redirect_uri={settings.REDIRECT_URI_GOOGLE}"
            f"&response_type=code"
            f"&scope=openid%20email%20profile"
            f"&access_type=offline"
            f"&prompt=consent"
        )
    return None

async def exchange_code_for_token(provider: str, code: str):
    """Exchanges authorization code for an access token"""
    if provider != "google":
        return {"error": "Invalid provider"}

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.REDIRECT_URI_GOOGLE,
        "grant_type": "authorization_code",
    }

    headers = {"Accept": "application/json"}
    response = requests.post(token_url, data=data, headers=headers)
    return response.json()

async def fetch_user_info(provider: str, access_token: str):
    """Fetches user information from Google OAuth"""
    if provider != "google":
        return {"error": "Invalid provider"}

    url = "https://www.googleapis.com/oauth2/v1/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(url, headers=headers)
    user_info = response.json()

    print("🟢 User data from Google OAuth:", user_info)

    return user_info

async def save_user(user_data: dict):
    """Saves user data to MongoDB"""
    existing_user = await users_collection.find_one({"email": user_data["email"]})
    if not existing_user:
        await users_collection.insert_one(user_data)

