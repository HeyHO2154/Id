from flask import Flask, request, jsonify
from flask_cors import CORS
from preprocess_data import TitlePreprocessor
from analyze_data import KeywordAnalyzer
import json

app = Flask(__name__)
CORS(app)

# 전처리기 인스턴스 생성
preprocessor = TitlePreprocessor()

@app.route('/analyze', methods=['POST'])
def analyze_history():
    try:
        data = request.json
        history = data.get('history', [])

        # 1단계: 데이터 전처리
        processed_data = preprocessor.process_history_data(history)
        
        # 2단계: 데이터 분석 
        analyzer = KeywordAnalyzer()
        analysis_result = analyzer.analyze_keywords(processed_data)
        
        # 3단계: 제외할 키워드 필터링
        exclude_keywords = ["검색", "Google", "YouTube"]
        filtered_groups = [
            group for group in analysis_result['keyword_groups']
            if group['group_label'] not in exclude_keywords
        ]
        
        # 4단계: 필터링된 결과 반환
        return jsonify({
            'keyword_groups': filtered_groups
        })

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000) 