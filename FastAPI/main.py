from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llm.prompt.schedule import ScheduleLLM
from llm.prompt.memo import MemoLLM
from llm.prompt.diary import DiaryLLM
from llm.prompt.chat import ChatLLM
from utils.message_classifier import MessageClassifier
import uvicorn
from datetime import datetime

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 운영 환경에서는 구체적인 origin을 지정하세요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

# LLM 인스턴스들
llm_handlers = {
    'schedule': ScheduleLLM(),
    'memo': MemoLLM(),
    'diary': DiaryLLM(),
    'chat': ChatLLM()
}

classifier = MessageClassifier()

@app.get("/")
async def root():
    return {"status": "ready", "model": llm_handlers['chat'].model_id}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # 메시지 유형 분류
        msg_type = classifier.classify(request.message)
        
        # 해당 유형의 LLM으로 응답 생성
        response = llm_handlers[msg_type].generate_response(request.message)
        return {"response": response, "type": msg_type}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 