from llm.base_llm import BaseLLM

class MemoLLM(BaseLLM):
    def generate_response(self, user_message: str) -> str:
        system_prompt = (
            "당신은 메모를 구조화하는 도우미입니다. "
            "입력된 메시지를 다음 형식으로 변환해주세요:\n"
            "제목: (메모 제목)\n"
            "내용: (메모 내용)\n"
            "태그: #태그1 #태그2"
        )
        
        return super().generate_response(user_message, system_prompt) 