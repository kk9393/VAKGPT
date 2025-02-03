# 🚀 VAKGPT Backend

A FastAPI backend using LangChain for AI-powered chat streaming.

## 📌 Prerequisites
- Python **3.9+ (<4.0)**
- [Poetry](https://python-poetry.org/docs/#installation)

## ▶️ Setup & Start

1. **Install dependencies**
   ```sh
   poetry install
    ```
2. **Set up environment variables**
    Create a .env file and add:
    ``` sh
    OPENAI_API_KEY=your_openai_api_key_here
    ```
3. **Run the server**
    ```sh
    poetry run uvicorn app.main:app --reload
    ```   