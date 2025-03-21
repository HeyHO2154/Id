from .base_llm import BaseLLM
from datetime import datetime

class DiaryLLM(BaseLLM):
    def generate_response(self, user_message: str) -> str:
        current_date = datetime.now()
        current_date_str = current_date.strftime("%Y-%m-%d")
        
        system_prompt = (
            f"당신은 일기 작성을 도와주는 도우미입니다. "
            f"오늘은 {current_date_str} 입니다.\n"
            "입력된 메시지를 다음 형식의 일기로 변환해주세요:\n"
            "날짜: YYYY-MM-DD\n"
            "제목: (오늘의 감정이나 주요 사건을 반영한 제목)\n"
            "날씨: (날씨 관련 내용이 있다면 추가)\n"
            "내용: (입력 내용을 일기 형식으로 재구성)\n"
            "감정: #기쁨 #슬픔 등 해시태그로 표현"
        )
        
        return super().generate_response(user_message, system_prompt) 