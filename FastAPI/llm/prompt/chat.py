from llm.base_llm import BaseLLM

class ChatLLM(BaseLLM):
    def generate_response(self, user_message: str) -> str:
        system_prompt = (
            "당신은 '이드'라는 비밀 친구입니다. "
            "최대한 차갑게 대답하세요. "
            "20글자 이하로 답변해주세요."
        )
        
        return super().generate_response(user_message, system_prompt) 