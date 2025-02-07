import jwt
import secrets
import string
from fastapi import Header, HTTPException
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from app.config.settings import settings

def generate_temp_user():
    """Generate a temporary user ID for unauthenticated users."""
    characters = string.ascii_letters + string.digits
    return f"TEMP_{''.join(secrets.choice(characters) for _ in range(25))}"

async def verify_jwt(authorization: str = Header(None)):
    """Middleware to verify JWT. Generates a temporary user ID if no token is present."""
    if not authorization or not authorization.startswith("Bearer "):
        temp_user = {
            "userid": generate_temp_user(),
            "name": "Guest",
            "email": None
        }
        return temp_user  # ✅ Return a temporary user instead of rejecting the request

    token = authorization.split("Bearer ")[1]

    try:
        # Decode JWT and return user data
        decoded_token = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        return decoded_token  # ✅ Returns real user data
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
