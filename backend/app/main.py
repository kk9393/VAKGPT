from fastapi import FastAPI
from app.routes import hello

app = FastAPI()

app.include_router(hello.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
