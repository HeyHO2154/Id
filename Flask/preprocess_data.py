from konlpy.tag import Mecab
import re
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import json
from datetime import datetime
import os

class TitlePreprocessor:
    def __init__(self):
        pass  # Mecab 관련 코드 제거

    def clean_title(self, title):
        """기본적인 텍스트 클리닝"""
        # 특수문자 제거 및 기본 전처리
        title = re.sub(r'\[[^\]]*\]', '', title)  # [재업로드] 같은 태그 제거
        title = re.sub(r'\([^\)]*\)', '', title)  # (자막) 같은 태그 제거
        title = re.sub(r'[-=+,#/\?:^$.@*\"※~&%ㆍ!』\\|\(\)\[\]\<\>`\'…》]', ' ', title)  # 특수문자 제거
        # 사이트 이름 제거 (예: "- YouTube" 제거)
        title = re.sub(r'\s*-\s*(?:YouTube|네이버|Google|방문기록).*$', '', title)
        return title.strip()

    def extract_keywords(self, title):
        """제목에서 의미있는 키워드 추출"""
        # 1단계: 특수문자 제거 및 기본 정제
        cleaned_title = self.clean_title(title)
        words = cleaned_title.split()
        
        # 2단계: 각 단어에서 조사/어미 제거
        base_keywords = []
        for word in words:
            # 영어 단어는 그대로 유지 (Q-net 같은 특수 패턴 처리)
            if word.isascii():
                if '-' in word:
                    parts = word.split('-')
                    if all(len(p) >= 2 for p in parts):
                        base_keywords.append(word)
                elif len(word) >= 2:
                    base_keywords.append(word)
                continue
            
            # 한글 단어는 형태소 분석으로 조사/어미 제거
            pos_info = self.mecab.pos(word)
            if not pos_info:
                continue
            
            # 실질 형태소만 추출 (조사/어미/접미사 제외)
            meaningful_parts = []
            for morph, tag in pos_info:
                # 조사/어미/접미사 제외
                if not tag.startswith(('JK', 'JX', 'EC', 'ET', 'EP', 'EF', 'XS')):
                    meaningful_parts.append(morph)
            
            if meaningful_parts:
                base_word = ''.join(meaningful_parts)
                if len(base_word) >= 2:
                    base_keywords.append(base_word)
        
        # 3단계: 의미가 적은 단어 필터링
        meaningful_keywords = []
        for word in base_keywords:
            # 숫자만으로 된 경우 제외
            if word.isdigit():
                continue
            
            # 형태소 분석으로 품사 확인
            pos_info = self.mecab.pos(word)
            if not pos_info:
                continue
            
            # 주요 품사(명사/동사/형용사/영어)를 포함하는 단어만 선택
            if any(tag.startswith(('NN', 'VV', 'VA', 'SL')) for _, tag in pos_info):
                meaningful_keywords.append(word)
        
        return list(set(meaningful_keywords))

    def process_history_data(self, history_data):
        """전체 방문 기록 데이터 처리"""
        processed_data = []
        
        for item in history_data:
            title = item.get('title', '')
            if not title:
                continue
                
            cleaned_title = self.clean_title(title)
            # 단순히 공백으로 단어 분리
            keywords = cleaned_title.split()
            
            processed_item = {
                'title': cleaned_title,
                'keywords': keywords,  # 여기서 keywords를 추가
                'url': item.get('url', ''),
                'visitCount': item.get('visitCount', 0),
                'lastVisitTime': item.get('lastVisitTime', 0),
                'typedCount': item.get('typedCount', 0)
            }
            
            processed_data.append(processed_item)

        result = {
            'processed_items': processed_data
        }

        # 전처리 결과 저장
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filepath = f'C:\\Users\\PRO\\Downloads\\processed_data_{timestamp}.json'
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        return result 