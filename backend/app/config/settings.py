import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
    REDIRECT_URI_GOOGLE = os.getenv("REDIRECT_URI_GOOGLE")
    REDIRECT_URI_GITHUB = os.getenv("REDIRECT_URI_GITHUB")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

settings = Settings()
