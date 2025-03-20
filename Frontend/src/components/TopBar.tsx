import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Zap, Bell } from "lucide-react";

const TopBar: React.FC = () => {
  const navigate = useNavigate();

  const toHome = () => navigate("/"); // 홈으로 이동
  const toNotifications = () => navigate("/bong/alarm"); // 알람 페이지로 이동
  const toShop = () => navigate("/bong/shop"); // 채팅 -> 상점으로 변경

  return (
    <BarWrapper>
      <IconWrapper onClick={toShop}>
        <Zap size={30} />     
      </IconWrapper>

      <Logo src="/assets/BongTMI2.png" alt="이드" onClick={toHome} />

      <IconWrapper onClick={toNotifications}>
        <Bell size={30} />
      </IconWrapper>
    </BarWrapper>
  );
};

export default TopBar;

// --------------------
// 스타일 정의
// --------------------

const BarWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  min-height: 65px;  /* 최소 높이 고정 */
  max-height: 65px;  /* 최대 높이 고정 */
  height: 65px;  /* 높이 고정 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* 내부 요소가 넘치더라도 높이 유지 */
`;


const Logo = styled.img`
  height: 46px;
  width: auto;
  cursor: pointer;
`;

const IconWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;
