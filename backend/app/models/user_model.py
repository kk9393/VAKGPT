from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    userid: str
    name: Optional[str] = "Unknown"
    email: str
    profile_picture: Optional[str] = None
    provider: str
    access_token: str
    refresh_token: Optional[str] = None