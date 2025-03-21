from datetime import datetime
from llm.base_llm import BaseLLM

class ScheduleLLM(BaseLLM):
    def generate_response(self, user_message: str) -> str:
        current_date = datetime.now()
        current_date_str = current_date.strftime("%Y-%m-%d")
        current_year = current_date.year
        
        # 예시용 날짜 계산
        def get_year_for_example(month, day):
            if (month > current_date.month) or (month == current_date.month and day > current_date.day):
                return current_year
            return current_year + 1

        example_date1 = (4, 20)  # 4월 20일
        example_date2 = (3, 15)  # 3월 15일
        example_date3 = (3, 20)  # 3월 20일

        year1 = get_year_for_example(*example_date1)
        year2 = get_year_for_example(*example_date2)
        year3 = get_year_for_example(*example_date3)

        system_prompt = (
            f"당신은 일정을 timestamp와 일정 내용으로 변환하는 도우미입니다. "
            f"오늘은 {current_date_str} 입니다.\n"
            "입력된 메시지에서 날짜와 일정을 추출하여 아래 형식으로 정확히 출력해주세요:\n"
            "YYYY-MM-DD HH:mm:ss, 일정내용\n"
            "시간이 명시되지 않은 경우 00:00:00을 사용하세요.\n"
            "현재 날짜를 기준으로 년도를 자동으로 설정해주세요:\n"
            "- 입력된 월/일이 현재 월/일보다 큰 경우 -> 현재 년도 사용\n"
            "- 입력된 월/일이 현재 월/일보다 작거나 같은 경우 -> 다음 년도 사용\n"
            f"예시 (오늘 {current_date_str} 기준):\n"
            f"입력1: 4/20 여행가기 -> 출력1: {year1}-04-20 00:00:00, 여행가기\n"
            f"입력2: 3/15 스키장가기 -> 출력2: {year2}-03-15 00:00:00, 스키장가기\n"
            f"입력3: 3/20 영화보기 -> 출력3: {year3}-03-20 00:00:00, 영화보기"
        )
        
        return super().generate_response(user_message, system_prompt) 