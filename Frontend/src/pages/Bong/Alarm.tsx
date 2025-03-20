import React from "react";
import styled from "styled-components";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";

const Alarm: React.FC = () => {
  // 더미 데이터
  const notifications = [
    {
      id: 1,
      type: "like",
      message: "홍길동님이 회원님의 게시글을 좋아합니다.",
      time: "방금 전",
      isRead: false
    },
    {
      id: 2,
      type: "comment",
      message: "김철수님이 회원님의 게시글에 댓글을 남겼습니다.",
      time: "1시간 전",
      isRead: false
    },
    {
      id: 3,
      type: "follow",
      message: "이영희님이 회원님을 팔로우하기 시작했습니다.",
      time: "어제",
      isRead: true
    }
  ];

  return (
    <Container>
      <Title>
        <Bell size={24} />
        알림
      </Title>

      <Section>
        <SectionTitle>새로운 알림</SectionTitle>
        {notifications.filter(noti => !noti.isRead).length > 0 ? (
          notifications.filter(noti => !noti.isRead).map(notification => (
            <NotificationItem key={notification.id} isRead={notification.isRead}>
              <IconWrapper>
                {notification.type === "like" && <Heart size={20} />}
                {notification.type === "comment" && <MessageCircle size={20} />}
                {notification.type === "follow" && <UserPlus size={20} />}
              </IconWrapper>
              <Content>
                <Message>{notification.message}</Message>
                <Time>{notification.time}</Time>
              </Content>
            </NotificationItem>
          ))
        ) : (
          <EmptySection>
            <EmptyMessage>새로운 알림이 없습니다</EmptyMessage>
          </EmptySection>
        )}
      </Section>

      <Section>
        <SectionTitle>이전 알림</SectionTitle>
        {notifications.filter(noti => noti.isRead).length > 0 ? (
          notifications.filter(noti => noti.isRead).map(notification => (
            <NotificationItem key={notification.id} isRead={notification.isRead}>
              <IconWrapper>
                {notification.type === "like" && <Heart size={20} />}
                {notification.type === "comment" && <MessageCircle size={20} />}
                {notification.type === "follow" && <UserPlus size={20} />}
              </IconWrapper>
              <Content>
                <Message>{notification.message}</Message>
                <Time>{notification.time}</Time>
              </Content>
            </NotificationItem>
          ))
        ) : (
          <EmptySection>
            <EmptyMessage>이전 알림이 없습니다</EmptyMessage>
          </EmptySection>
        )}
      </Section>
    </Container>
  );
};

export default Alarm;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  height: calc(100vh - 120px); /* TopBar, NavBar 높이 제외 */
  padding: 20px;
  overflow-y: auto;
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  margin-bottom: 24px;
  color: #333;
  padding: 0 4px;
`;

const Section = styled.div`
  margin-bottom: 32px;
  width: 100%;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
  padding: 0 4px 8px;
  border-bottom: 1px solid #eee;
`;

const NotificationItem = styled.div<{ isRead: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background-color: ${props => props.isRead ? '#fff' : '#f0f8ff'};
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  cursor: pointer;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const IconWrapper = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: #e8f4fd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #3498db;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0; /* 텍스트 오버플로우 방지 */
`;

const Message = styled.p`
  font-size: 15px;
  color: #333;
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
`;

const Time = styled.span`
  font-size: 13px;
  color: #999;
  display: block;
  margin-top: 6px;
`;

// 알림이 없을 때 표시할 컴포넌트 추가
const EmptySection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #666;
  text-align: center;
`;

const EmptyMessage = styled.p`
  font-size: 15px;
  color: #999;
  margin: 12px 0;
`;
