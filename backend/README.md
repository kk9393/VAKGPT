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
    # DeepInfra API Key
    DEEPINFRA_API_TOKEN="your_deepinfra_api_key_here"
    # Deepseek API Key
    DEEPSEEK_API_KEY="your_deepseek_api_key_here"
 
    # MongoDB Connection URI & Config
    MONGODB_CONNECTION_STRING="your_mongo_connection_uri"
    CHAT_HISTORY_DATABASE_NAME="MyChatHistory"

    # Google OAuth Credentials
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
    REDIRECT_URI_GOOGLE="http://localhost:8000/api/auth/callback/google"

    # JWT Secret Key
    JWT_SECRET_KEY="your_secret_key_here"

    CORS_ORIGIN="http://localhost:3000" or "https://yourdomain.com"

    ```
3. **Run the server**
    ```sh
    poetry run uvicorn app.main:app --reload
    ```   