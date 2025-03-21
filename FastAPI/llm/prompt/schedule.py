from datetime import datetime, timedelta
from llm.base_llm import BaseLLM

class ScheduleLLM(BaseLLM):
    def generate_response(self, user_message: str) -> str:
        current_date = datetime.now()
        current_date_str = current_date.strftime("%Y-%m-%d")
        current_year = current_date.year
        
        def get_year_for_date(month, day):
            if month > current_date.month or (month == current_date.month and day >= current_date.day):
                return current_year
            return current_year + 1

        # 동적 예시 생성
        examples = [
            # 다음 달의 아무 날
            (
                ((current_date.month % 12) + 1, 15),  # 다음 달 15일
                "여행가기"
            ),
            # 지난 달의 아무 날
            (
                (((current_date.month - 2) % 12) + 1, 10),  # 지난 달 10일
                "스키장가기"
            ),
            # 같은 달 미래 날짜
            (
                (current_date.month, min(current_date.day + 5, 32)),  # 5일 후 (28일 제한)
                "영화보기"
            ),
            # 같은 달 과거 날짜
            (
                (current_date.month, max(current_date.day - 5, 0)),  # 5일 전 (1일 제한)
                "병원가기"
            )
        ]

        # 예시 문장 생성
        example_texts = []
        for i, ((month, day), activity) in enumerate(examples, 1):
            year = get_year_for_date(month, day)
            example_texts.append(
                f"입력{i}: {month}/{day} {activity} -> "
                f"출력{i}: {year}-{month:02d}-{day:02d} 00:00:00, {activity}"
            )

        system_prompt = (
            f"당신은 일정을 timestamp와 일정 내용으로 변환하는 도우미입니다. "
            f"오늘은 {current_date_str} 입니다.\n"
            "입력된 메시지에서 날짜와 일정을 추출하여 아래 형식으로 정확히 출력해주세요:\n"
            "YYYY-MM-DD HH:mm:ss, 일정내용\n"
            "시간이 명시되지 않은 경우 00:00:00을 사용하세요.\n"
            "현재 날짜를 기준으로 년도를 자동으로 설정해주세요:\n"
            "- 입력된 월/일이 현재 월/일보다 큰 경우 -> 현재 년도 사용\n"
            "- 입력된 월/일이 현재 월/일보다 작거나 같은 경우 -> 다음 년도 사용\n"
            f"예시 (오늘 {current_date_str} 기준):\n" +
            "\n".join(example_texts)
        )
        
        print(system_prompt)
        return super().generate_response(user_message, system_prompt) 