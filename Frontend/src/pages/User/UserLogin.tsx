import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 훅
import styled from "styled-components";
import axios from "axios";
import config from "../../config";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  const handleKakaoLogin = () => {
    window.location.href = `${config.API_DEV}/oauth/kakao`;
  };
  
  const handleNaverLogin = () => {
    window.location.href = `${config.API_DEV}/oauth/naver`;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setMessage("올바른 이메일 형식이 아닙니다.");
        return;
      }

      const response = await axios.post(`${config.API_DEV}/api/auth/login`, {
        email,
        password
      });

      console.log('Login response:', response); // 디버깅용

      if (response.status === 200) {
        // 로그인 성공 시 사용자 정보 저장
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/"); // 메인 페이지로 이동
      }
    } catch (error: any) {
      console.error('Login error:', error.response || error); // 디버깅용
      if (error.response?.data) {
        setMessage(error.response.data);
      } else {
        setMessage("로그인에 실패했습니다.");
      }
    }
  };

  return (
    <Container>
      <Logo src="/assets/BongTMI1.png" alt="봉틈이" />

      <InputGroup>
        <StyledInput
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </InputGroup>

      <InputGroup>
        <StyledInput
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </InputGroup>

      {message && <Message isError={true}>{message}</Message>}

      <LoginButton onClick={handleLogin}>로그인</LoginButton>

      <LinkContainer>
        <StyledLink onClick={() => navigate("/user/find-account")}>계정찾기</StyledLink>
        |
        <StyledLink onClick={() => navigate("/user/register")}>회원가입</StyledLink>
      </LinkContainer>

      <Divider>또는</Divider>

      <ButtonContainer>
        <NaverButton
          src="/assets/Login_Naver.png"
          onClick={handleNaverLogin}
        />
        <KakaoButton
          src="/assets/Login_Kakao.png"
          onClick={handleKakaoLogin}
        />
      </ButtonContainer>
    </Container>
  );
};

export default Login;


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 160px); /* TopBar 높이 제외 */
  text-align: center;
  overflow-y: auto;
`;

const Logo = styled.img`
  height: 200px; /* 로고 높이 */
  width: auto; /* 비율 유지 */
  padding-bottom: 15px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 280px;
  margin-bottom: 16px;
`;

const StyledInput = styled.input`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }

  &::placeholder {
    color: #bdc3c7;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 0px;
`;

const LoginButton = styled.button`
  width: 280px;
  padding: 12.5px 21.5px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 14px;
  &:hover {
    background-color: #0056b3;
  }
`;

const KakaoButton = styled.img`
  cursor: pointer;
  max-width: 200px;
`;
const NaverButton = styled.img`
  cursor: pointer;
  max-width: 91.6px;
  border-radius: 7px;
`;

const LinkContainer = styled.div`
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
`;

const StyledLink = styled.span`
  cursor: pointer;
  text-decoration: underline;
  color: #007bff;
`;

const Message = styled.p<{ isError: boolean }>`
  text-align: center;
  font-size: 14px;
  color: #e74c3c;
  margin: 8px 0;
  padding: 8px;
  border-radius: 8px;
  background-color: #ffebee;
  width: 280px;
`;

const Divider = styled.div`
  width: 280px;
  text-align: center;
  margin: 20px 0;
  position: relative;
  color: #7f8c8d;
  
  &::before, &::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background-color: #e0e0e0;
  }
  
  &::before { left: 0; }
  &::after { right: 0; }
`;
