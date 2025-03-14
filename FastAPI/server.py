from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ChatLLM import chat_llm
from pydantic import BaseModel

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(chat_message: ChatMessage):
    try:
        response = await chat_llm.generate_response(chat_message.message)
        return {"response": response}
    except Exception as e:
        print(f"채팅 에러: {str(e)}")
        return {"error": "메시지 처리 중 오류가 발생했습니다."}

@app.get("/model-info")
async def get_model_info():
    """모델 상태 확인 엔드포인트"""
    return chat_llm.get_model_info()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 