from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import time

class MessageClassifier:
    def __init__(self):
        self.model = SentenceTransformer('distiluse-base-multilingual-cased-v2')
        
        # 각 타입의 대표적인 예시 문장들
        self.type_examples = {
            'schedule': [
                "내일 3시에 회의가 있어",
                "다음 주 금요일 약속 잡아줘",
                "3월 15일에 병원 가기로 했어",
                "이번 주말에 여행 일정이 있어",
                "3/4 오전 10시에 미팅이 있어요"
            ],
            'memo': [
                "이거 메모해줘",
                "나중에 볼 수 있게 저장해줘",
                "이 내용 잊지 않게 적어둬",
                "중요한 정보라서 기록해야해",
                "오늘 할 일 적어두기"
            ],
            'diary': [
                "오늘 너무 힘들었어",
                "정말 좋은 하루였어",
                "기분이 너무 좋았던 하루야",
                "오늘 있었던 일을 기록하고 싶어",
                "고민 들어줘"
            ]
        }
        
        # 각 타입별 예시 문장들의 임베딩을 미리 계산
        self.type_embeddings = {
            type_: self.model.encode(examples)
            for type_, examples in self.type_examples.items()
        }

    def classify(self, message: str) -> str:
        start_time = time.time()  # 시작 시간 측정
        
        # 입력 메시지를 임베딩 벡터로 변환
        message_embedding = self.model.encode([message])[0]
        
        # 각 타입별로 유사도 계산
        similarities = {}
        for type_, embeddings in self.type_embeddings.items():
            similarity = max(cosine_similarity([message_embedding], embeddings)[0])
            similarities[type_] = similarity
        
        # 가장 높은 유사도를 가진 타입 선택
        max_type = max(similarities.items(), key=lambda x: x[1])
        result = max_type[0] if max_type[1] > 0.5 else 'chat'
        
        # 처리 시간 계산
        elapsed_time = (time.time() - start_time) * 1000  # 밀리초 단위

        # 디버깅 정보 출력
        print("\n=== Message Classification Debug ===")
        print(f"Input message: {message}")
        print(f"Classification result: {result}")
        print(f"Similarity scores:")
        for type_, score in similarities.items():
            print(f"  - {type_}: {score:.4f}")
        print(f"Processing time: {elapsed_time:.2f}ms")
        print("================================\n")

        return result