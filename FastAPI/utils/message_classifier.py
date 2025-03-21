class MessageClassifier:
    def classify(self, message: str) -> str:
        schedule_keywords = ['일정', '추가', '등록', '알림', '리마인드', '스케줄']
        memo_keywords = ['메모', '기록', '저장']
        diary_keywords = ['일기', '오늘', '감정', '기분']
        
        if any(keyword in message for keyword in schedule_keywords):
            return 'schedule'
        elif any(keyword in message for keyword in memo_keywords):
            return 'memo'
        elif any(keyword in message for keyword in diary_keywords):
            return 'diary'
        return 'chat' 