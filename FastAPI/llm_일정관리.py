import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from datetime import datetime

def initialize_model():
    model_id = 'Bllossom/llama-3.2-Korean-Bllossom-3B'
    
    print("모델을 로딩중입니다. 잠시만 기다려주세요...")
    
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=torch.bfloat16,
        device_map="auto",
    )
    
    return model, tokenizer

def chat_with_model(model, tokenizer):
    print("\n=== Bllossom 한국어 챗봇과 대화를 시작합니다 ===")
    print("대화를 종료하려면 'quit' 또는 '종료'를 입력하세요.\n")
    
    chat_history = []
    
    while True:
        user_input = input("사용자: ")
        
        if user_input.lower() in ['quit', '종료']:
            print("\n대화를 종료합니다. 안녕히 가세요!")
            break
            
        #messages = [{"role": "user", "content": user_input}]

        # "2023년 5월 8일" 이 날짜를 timestamp 형식으로 작성해줘

        messages = [{"role": "user", "content": f"""
                        오늘 날짜는 {datetime.now().strftime('%Y-%m-%d')} 입니다.
                        다음 문장에서 일정 시간과 일정 내용을 추출해서 아래 형식으로 정확히 작성해주세요:

                        입력: {user_input}

                        시간: YYYY-MM-DD HH:mm
                        내용: [추출된 일정 내용]
                        """}]
        
        input_ids = tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            return_tensors="pt"
        ).to(model.device)

        terminators = [
            tokenizer.convert_tokens_to_ids("<|end_of_text|>"),
            tokenizer.convert_tokens_to_ids("<|eot_id|>")
        ]

        outputs = model.generate(
            input_ids,
            max_new_tokens=64,
            eos_token_id=terminators,
            do_sample=True,
            temperature=0.6,
            top_p=0.9
        )

        response = tokenizer.decode(outputs[0][input_ids.shape[-1]:], skip_special_tokens=True)
        print("\n챗봇:", response.strip(), "\n")

def main():
    try:
        model, tokenizer = initialize_model()
        chat_with_model(model, tokenizer)
    except Exception as e:
        print(f"오류가 발생했습니다: {str(e)}")

if __name__ == "__main__":
    main()
