import jwt
import secrets
import string
from fastapi import Header, HTTPException
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from app.config.settings import settings

async def verify_jwt(authorization: str = Header(None)):
    """Middleware to verify JWT. Generates a temporary user ID if no token is present."""
    if not authorization or not authorization.startswith("Bearer "):
        temp_user = {
            "userid": "TEMP",
            "name": "Guest",
            "email": None
        }
        return temp_user

    token = authorization.split("Bearer ")[1]

    try:
        decoded_token = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        return decoded_token
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
