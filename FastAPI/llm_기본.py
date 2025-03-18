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
       
        messages = [
            #{"role": "system", "content": "당신은 중세시대의 기사입니다. 예의 바르고 격식 있는 중세 기사다운 말투로 대화해주세요."},
            {"role": "user", "content": user_input}
        ]      
        
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
