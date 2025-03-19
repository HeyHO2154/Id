from flask import Flask, request, jsonify
from flask_cors import CORS
from preprocess_data import TitlePreprocessor
from analyze_data import KeywordAnalyzer
from llm import analyze_user_profile
import json

app = Flask(__name__)
CORS(app)  # 크롬 확장프로그램과의 CORS 이슈 해결

# 전처리기 인스턴스 생성
preprocessor = TitlePreprocessor()

@app.route('/analyze', methods=['POST'])
def analyze_history():
    try:
        # 크롬 확장프로그램에서 전송된 데이터 받기
        data = request.json
        history = data.get('history', [])

        # 1단계: 데이터 전처리
        processed_data = preprocessor.process_history_data(history)
        
        # 2단계: 데이터 분석 
        analyzer = KeywordAnalyzer()
        analysis_result = analyzer.analyze_keywords(processed_data)
        
        try:
            # 3단계: LLM을 사용한 사용자 프로필 분석
            user_profile = analyze_user_profile(analysis_result['keyword_groups'])
        except Exception as profile_error:
            print(f"프로필 분석 중 오류: {str(profile_error)}")
            user_profile = "프로필 분석 중 오류가 발생했습니다."
        
        # 4단계: 결과 조합
        final_result = {
            'keyword_analysis': analysis_result,
            'user_profile': user_profile
        }
        
        return jsonify(final_result)

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        import traceback
        print(traceback.format_exc())  # 상세한 에러 정보 출력
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000) 