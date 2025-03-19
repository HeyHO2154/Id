import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from datetime import datetime
import json

class UserAnalyzer:
    def __init__(self):
        self.model_id = 'Bllossom/llama-3.2-Korean-Bllossom-3B'
        print("모델을 로딩중입니다. 잠시만 기다려주세요...")
        
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_id)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_id,
            torch_dtype=torch.bfloat16,
            device_map="auto",
        )

    def analyze_user_profile(self, keyword_groups):
        """키워드 그룹을 기반으로 사용자 프로필 생성"""
        prompt = "다음은 사용자의 웹 브라우징 기록에서 추출한 주요 키워드들입니다:\n\n"
        
        # 상위 50개 그룹의 라벨만 추출 (중요도 점수 기준)
        top_labels = []
        for group in sorted(keyword_groups, key=lambda x: float(x.get('important_score', 0)), reverse=True)[:50]:
            label = group.get('group_label', '')
            if label:
                top_labels.append(f"{label}")
        
        # 프롬프트에 키워드 추가
        prompt += "- " + "\n- ".join(top_labels)
        
        prompt += "\n\n이 키워드들을 바탕으로 사용자의 니즈를 분석해주세요"
        
        #디버깅용 프롬포팅 확인
        print(prompt)
        return self._generate_analysis(prompt)

    def _generate_analysis(self, prompt):
        """LLM을 사용하여 분석 결과 생성"""
        messages = [{"role": "user", "content": prompt}]
        
        input_ids = self.tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            return_tensors="pt"
        ).to(self.model.device)

        outputs = self.model.generate(
            input_ids,
            max_new_tokens=256,
            do_sample=True,
            temperature=0.7,
            top_p=0.9
        )

        response = self.tokenizer.decode(outputs[0][input_ids.shape[-1]:], skip_special_tokens=True)
        return response.strip()

# 전역 인스턴스 생성 (모델 로딩 시간 절약)
analyzer = UserAnalyzer()

def analyze_user_profile(keyword_groups):
    """app.py에서 호출할 함수"""
    return analyzer.analyze_user_profile(keyword_groups)

if __name__ == "__main__":
    pass
