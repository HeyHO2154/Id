from llm.base_llm import BaseLLM

class MemoLLM(BaseLLM):
    def generate_response(self, user_message: str) -> str:
        system_prompt = (
            "당신은 메모를 구조화하는 도우미입니다. "
            "입력된 메시지를 아래 양식으로 작성해주세요:\n"
            "<메모에 추가됨>\n"
            "내용: (메모 내용)\n"
        )
        
        return super().generate_response(user_message, system_prompt) 