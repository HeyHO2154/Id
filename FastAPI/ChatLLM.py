import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

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

    async def generate_response(self, user_message: str) -> str:
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

    def get_model_info(self) -> dict:
        return {
            "model_id": self.model_id,
            "device": str(self.model.device),
            "status": "ready"
        }

# 전역 인스턴스 생성
chat_llm = ChatLLM()
