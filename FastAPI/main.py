from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import uvicorn

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

class ChatLLM:
    def __init__(self):
        self.model_id = 'Bllossom/llama-3.2-Korean-Bllossom-3B'
        print("모델을 로딩중입니다. 잠시만 기다려주세요...")
        
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_id)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_id,
            torch_dtype=torch.bfloat16,
            device_map="auto",
        )

    def generate_response(self, user_message: str) -> str:
        try:
            messages = [
                {"role": "system", "content": "당신은 '이드'라는 비밀 친구입니다. 최대한 차갑게 대답하세요. 20글자 이하로 답변해주세요."},
                {"role": "user", "content": user_message}
            ]
            
            input_ids = self.tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                return_tensors="pt"
            ).to(self.model.device)

            terminators = [
                self.tokenizer.convert_tokens_to_ids("<|end_of_text|>"),
                self.tokenizer.convert_tokens_to_ids("<|eot_id|>")
            ]

            outputs = self.model.generate(
                input_ids,
                max_new_tokens=64,
                eos_token_id=terminators,
                do_sample=True,
                temperature=0.6,
                top_p=0.9
            )

            response = self.tokenizer.decode(outputs[0][input_ids.shape[-1]:], skip_special_tokens=True)
            return response.strip()

        except Exception as e:
            print(f"생성 오류: {str(e)}")
            raise

# 전역 인스턴스 생성
chat_llm = ChatLLM()

@app.get("/")
async def root():
    return {"status": "ready", "model": chat_llm.model_id}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        response = chat_llm.generate_response(request.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 