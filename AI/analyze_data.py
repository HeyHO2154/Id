from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import json
from datetime import datetime
from collections import OrderedDict

class KeywordAnalyzer:
    def __init__(self):
        # 다국어(한국어, 영어 등) 지원 모델
        self.model = SentenceTransformer('distiluse-base-multilingual-cased-v2')
    
    def analyze_keywords(self, processed_data):
        """방문 기록의 키워드 분석"""
        # 1. 모든 키워드 수집 및 빈도수 계산
        all_keywords = []
        keyword_frequencies = {}
        
        for item in processed_data['processed_items']:
            for keyword in item['keywords']:
                all_keywords.append(keyword)
                keyword_frequencies[keyword] = keyword_frequencies.get(keyword, 0) + 1
        
        # 데이터 처리 현황 출력
        print(f"총 처리된 아이템 수: {len(processed_data['processed_items'])}")
        print(f"총 수집된 키워드 수: {len(all_keywords)}")
        print(f"중복 제거된 키워드 수: {len(set(all_keywords))}")
        
        # 2. 중복 제거된 키워드 목록
        unique_keywords = list(set(all_keywords))
        
        # 3. 키워드 임베딩 생성
        embeddings = self.model.encode(unique_keywords)
        
        # 4. 키워드 간 유사도 계산 및 그룹화
        similarities = cosine_similarity(embeddings)
        keyword_groups = self._group_related_keywords(unique_keywords, similarities, keyword_frequencies)
        
        print(f"생성된 그룹 수: {len(keyword_groups)}")
        
        # 결과 저장
        analysis_result = {'keyword_groups': keyword_groups}
        self.save_analysis(analysis_result)
        
        return analysis_result
    
    def _group_related_keywords(self, keywords, similarities, keyword_frequencies, threshold=0.7):
        """유사한 키워드들을 그룹화"""
        groups_info = []
        used_indices = set()
        
        for i in range(len(keywords)):
            if i in used_indices:
                continue
            
            group = [keywords[i]]
            used_indices.add(i)
            group_similarities = []
            
            # 단순히 하나의 키워드를 기준으로 유사한 것들 그룹화
            for j in range(len(keywords)):
                if j not in used_indices:
                    similarity = similarities[i][j]
                    if similarity > threshold:
                        group.append(keywords[j])
                        group_similarities.append(similarity)
                        used_indices.add(j)
            
            if len(group) > 1:
                avg_similarity = sum(group_similarities) / len(group_similarities)
                total_freq = sum(keyword_frequencies.get(word, 0) for word in group)
                
                # 그룹 정보 생성
                group_info = {
                    'keywords': group,
                    'avg_similarity': avg_similarity,  # 그룹 내 평균 유사도
                    'frequencies': {word: keyword_frequencies.get(word, 0) for word in group},  # 각 키워드별 빈도수
                    'total_frequency': total_freq,  # 그룹 전체 빈도수
                    'representative_keyword': max(group, key=lambda x: keyword_frequencies.get(x, 0)),  # 최다 빈도 키워드
                    'group_label': self._generate_group_label(group),  # 의미적 중심 키워드
                    'score': (avg_similarity * total_freq) / len(group)  # 정규화된 점수
                }
                groups_info.append(group_info)
        
        # 정규화된 점수가 높은 순으로 정렬
        groups_info.sort(key=lambda x: x['score'], reverse=True)
        
        return groups_info
    
    def _generate_group_label(self, group):
        """그룹을 대표하는 레이블 생성 (의미적 중심 키워드)"""
        embeddings = self.model.encode(group)
        centroid = embeddings.mean(axis=0)
        similarities = cosine_similarity([centroid], embeddings)[0]
        return group[similarities.argmax()]
    
    def save_analysis(self, analysis_result):
        """분석 결과 저장"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filepath = f'C:\\Users\\PRO\\Downloads\\analyzed_data_{timestamp}.json'
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('{\n"keyword_groups": [\n')
            groups = analysis_result['keyword_groups']
            for i, group in enumerate(groups):
                line = json.dumps(OrderedDict([
                    ('important_score', round(group['score'], 3)),
                    ('group_label', group['group_label']),
                    ('keywords', group['keywords']),                  
                    ('average_similarity', round(group['avg_similarity'], 3)),
                    ('total_frequency', group['total_frequency']),
                    ('representative_keyword', group['representative_keyword']),
                    ('frequencies', group['frequencies'])
                ]), ensure_ascii=False)
                if i < len(groups) - 1:
                    f.write(line + ',\n')
                else:
                    f.write(line + '\n')
            f.write(']\n}') 