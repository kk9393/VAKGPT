from fastapi import FastAPI
from app.routes import hello
from app.routes import chat

app = FastAPI()

app.include_router(hello.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
