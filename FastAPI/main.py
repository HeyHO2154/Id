from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
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

    def generate_response(self, user_message: str, is_schedule: bool = False) -> str:
        try:
            current_date = datetime.now()
            current_date_str = current_date.strftime("%Y-%m-%d")
            current_year = current_date.year
            
            # 예시용 날짜 계산
            def get_year_for_example(month, day):
                if (month > current_date.month) or (month == current_date.month and day > current_date.day):
                    return current_year
                return current_year + 1

            example_date1 = (4, 20)  # 4월 20일
            example_date2 = (3, 15)  # 3월 15일
            example_date3 = (3, 20)  # 3월 20일

            year1 = get_year_for_example(*example_date1)
            year2 = get_year_for_example(*example_date2)
            year3 = get_year_for_example(*example_date3)

            system_prompt = (
                f"당신은 일정을 timestamp와 일정 내용으로 변환하는 도우미입니다. "
                f"오늘은 {current_date_str} 입니다.\n"
                "입력된 메시지에서 날짜와 일정을 추출하여 아래 형식으로 정확히 출력해주세요:\n"
                "YYYY-MM-DD HH:mm:ss, 일정내용\n"
                "시간이 명시되지 않은 경우 00:00:00을 사용하세요.\n"
                "현재 날짜를 기준으로 년도를 자동으로 설정해주세요:\n"
                "- 입력된 월/일이 현재 월/일보다 큰 경우 -> 현재 년도 사용\n"
                "- 입력된 월/일이 현재 월/일보다 작거나 같은 경우 -> 다음 년도 사용\n"
                f"예시 (오늘 {current_date_str} 기준):\n"
                f"입력1: 4/20 여행가기 -> 출력1: {year1}-04-20 00:00:00, 여행가기\n"
                f"입력2: 3/15 스키장가기 -> 출력2: {year2}-03-15 00:00:00, 스키장가기\n"
                f"입력3: 3/20 영화보기 -> 출력3: {year3}-03-20 00:00:00, 영화보기"
                if is_schedule
                else "당신은 '이드'라는 비밀 친구입니다. 최대한 차갑게 대답하세요. 20글자 이하로 답변해주세요."
            )
            
            messages = [
                {"role": "system", "content": system_prompt},
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

# 일정 관련 키워드 체크 함수
def is_schedule_message(message: str) -> bool:
    schedule_keywords = ['일정', '추가', '등록', '알림', '리마인드', '스케줄']
    return any(keyword in message for keyword in schedule_keywords)

@app.get("/")
async def root():
    return {"status": "ready", "model": chat_llm.model_id}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        is_schedule = is_schedule_message(request.message)
        response = chat_llm.generate_response(request.message, is_schedule)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 