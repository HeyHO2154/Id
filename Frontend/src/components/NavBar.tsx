// src/components/NavBar.tsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faPenToSquare, faBook, faLock, faUser } from "@fortawesome/free-solid-svg-icons";

const NavBarContainer = styled.nav`
  position: sticky;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  z-index: 999;
`;

const NavButton = styled(NavLink).attrs<{ $isActive: boolean }>((props) => ({
  className: props.$isActive ? "active" : ""
}))`
  text-decoration: none;
  color: ${(props) => (props.$isActive ? "#007bff" : "#555")};
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  transition: color 0.2s;
`;

const NavBar: React.FC = () => {
  const [activeButton, setActiveButton] = useState<string>("");

  return (
    <NavBarContainer>
      <NavButton to="/" $isActive={activeButton === "/"} onClick={() => setActiveButton("/")}>
        <FontAwesomeIcon icon={faComments} size="2x" />
        이드 대화
      </NavButton>
      <NavButton to="/search" $isActive={activeButton === "/search"} onClick={() => setActiveButton("/search")}>
        <FontAwesomeIcon icon={faPenToSquare} size="2x" />
        일정 관리
      </NavButton>
      <NavButton to="/add-bong" $isActive={activeButton === "/add-bong"} onClick={() => setActiveButton("/add-bong")}>
        <FontAwesomeIcon icon={faBook} size="2x" />
        아카이브
      </NavButton>
      <NavButton to="/feed" $isActive={activeButton === "/feed"} onClick={() => setActiveButton("/feed")}>
        <FontAwesomeIcon icon={faLock} size="2x" />
        일기장
      </NavButton>
      <NavButton to="/my-page" $isActive={activeButton === "/my-page"} onClick={() => setActiveButton("/my-page")}>
        <FontAwesomeIcon icon={faUser} size="2x" />
        이드 정보
      </NavButton>
    </NavBarContainer>
  );
};

export default NavBar;
