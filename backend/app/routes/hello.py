from fastapi import APIRouter
from app.controllers.hello_controller import hello

router = APIRouter()

@router.get("/hello")
async def hello_world():
    return hello()
