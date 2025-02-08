from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import hello_route, auth_route, chat_route, protected_route, session_route

app = FastAPI()

# Allow CORS for frontend (Adjust for production use)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hello_route.router, prefix="/api")
app.include_router(protected_route.router, prefix="/api")
app.include_router(auth_route.router, prefix="/api")
app.include_router(chat_route.router, prefix="/api")
app.include_router(session_route.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
