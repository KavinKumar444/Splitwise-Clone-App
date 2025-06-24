from fastapi import APIRouter
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv
load_dotenv()


router = APIRouter()

openai.api_key = os.getenv("OPENAI_API_KEY")

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat_with_bot(request: ChatRequest):
    prompt = f"You are a friendly expense assistant. {request.message}"
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # or gpt-4 if available
            messages=[
                {"role": "system", "content": "You are a helpful assistant for expense tracking."},
                {"role": "user", "content": prompt}
            ]
        )
        return {"response": response.choices[0].message["content"]}
    except Exception as e:
        return {"error": str(e)}


