# 🚀 VAKGPT Backend

A FastAPI backend using LangChain for AI-powered chat streaming.

## 📌 Prerequisites
- Python **3.9+ (<4.0)**
- [Poetry](https://python-poetry.org/docs/#installation)

## ▶️ Setup & Start

1. **Install dependencies**
    ```sh
    poetry install --no-root
    ```
2. **Set up environment variables**
    Create a .env file and add:
    ``` sh
    # OpenAI API Key
    OPENAI_API_KEY="your_openai_api_key_here"

    # MongoDB Connection URI
    MONGO_URI="your_mongo_connection_uri"

    # Google OAuth Credentials
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
    REDIRECT_URI_GOOGLE="http://localhost:8000/api/auth/callback/google"

    # JWT Secret Key
    JWT_SECRET_KEY="your_secret_key_here"

    ```
3. **Run the server**
    ```sh
    poetry run uvicorn app.main:app --reload
    ```   