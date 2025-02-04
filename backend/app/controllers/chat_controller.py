import json
import base64
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

# Load environment variables
load_dotenv()

async def chat(message: str):
    try:
        # Initialize the model
        model = ChatOpenAI(model="gpt-4o-mini", streaming=True)

        # Define the messages for the conversation
        messages = [
            SystemMessage(content="You are a helpful AI assistant."),
            HumanMessage(content=message),
        ]

        # Generator function for streaming
        async def generate():
            try:
                async for chunk in model.astream(messages):
                    if chunk.content:
                        encoded_content = base64.b64encode(chunk.content.encode()).decode()
                        json_data = json.dumps({"content": encoded_content})
                        yield f"data: {json_data}\n\n"
                yield "data: " + json.dumps({"is_stream_finished": True}) + "\n\n"  # Indicate end of stream
            except Exception as e:
                error_json = json.dumps({"error": str(e)})
                yield f"data: {error_json}\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    except ValueError as ve:
        print(f"ValueError: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except KeyError as ke:
        print(f"KeyError: {ke}")
        raise HTTPException(status_code=400, detail=f"Missing key in request: {str(ke)}")
    except Exception as e:
        print(f"Unexpected error during chat processing: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
