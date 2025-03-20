import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";

const FindAccount: React.FC = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSendVerification = async () => {
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setMessage("올바른 이메일 형식이 아닙니다.");
        return;
      }

      const response = await axios.post(`${config.API_DEV}/api/auth/request-verification`, { email });
      setMessage(response.data);
      setIsCodeSent(true);
      setIsSuccess(true);
    } catch (error: any) {
      setMessage(error.response?.data || "인증번호 전송에 실패했습니다.");
      setIsSuccess(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setMessage("인증번호를 입력해주세요.");
      return;
    }

    try {
      await axios.post(`${config.API_DEV}/api/auth/verify-code`, {
        email,
        code: verificationCode
      });
      setMessage("인증이 완료되었습니다. 새로운 비밀번호를 설정해주세요.");
      setIsVerified(true);
      setIsSuccess(true);
    } catch (error: any) {
      setMessage(error.response?.data || "인증번호 확인에 실패했습니다.");
      setIsSuccess(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("새 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    try {
      const response = await axios.post(`${config.API_DEV}/api/auth/verify-and-reset`, {
        email,
        code: verificationCode,
        newPassword
      });
      
      // 로그인 처리
      localStorage.setItem("user", JSON.stringify(response.data));
      setMessage("비밀번호가 변경되었습니다. 마이페이지로 이동합니다.");
      setIsSuccess(true);
      setTimeout(() => navigate("/my-page"), 1500);
    } catch (error: any) {
      setMessage(error.response?.data || "비밀번호 재설정에 실패했습니다.");
      setIsSuccess(false);
    }
  };

  return (
    <Container>
      <FormWrapper>
        <Title>비밀번호 재설정</Title>
        <Subtitle>
          {!isCodeSent 
            ? "가입 시 등록한 이메일을 입력해주세요" 
            : !isVerified 
              ? "이메일로 전송된 인증번호를 입력해주세요"
              : "새로운 비밀번호를 설정해주세요"}
        </Subtitle>

        <InputGroup>
          <Label>이메일</Label>
          <InputWithButton>
            <StyledInput
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isCodeSent}
            />
            {!isCodeSent && (
              <VerifyButton onClick={handleSendVerification}>
                인증번호 받기
              </VerifyButton>
            )}
          </InputWithButton>
        </InputGroup>

        {isCodeSent && !isVerified && (
          <InputGroup>
            <Label>인증번호</Label>
            <InputWithButton>
              <StyledInput
                type="text"
                placeholder="6자리 인증번호 입력"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
              <VerifyButton onClick={handleVerifyCode}>
                인증확인
              </VerifyButton>
            </InputWithButton>
          </InputGroup>
        )}

        {isVerified && (
          <>
            <InputGroup>
              <Label>새 비밀번호</Label>
              <StyledInput
                type="password"
                placeholder="새로운 비밀번호 입력 (8자 이상)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <Label>비밀번호 확인</Label>
              <StyledInput
                type="password"
                placeholder="새로운 비밀번호 재입력"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </InputGroup>
          </>
        )}

        {message && <Message isError={!isSuccess}>{message}</Message>}

        <ButtonGroup>
          {isVerified ? (
            <FindButton onClick={handleResetPassword}>
              비밀번호 변경하기
            </FindButton>
          ) : (
            <BackButton onClick={() => navigate("/user/login")}>
              로그인으로 돌아가기
            </BackButton>
          )}
        </ButtonGroup>
      </FormWrapper>
    </Container>
  );
};

export default FindAccount;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px);
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  padding: 20px;
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 32px;
`;

const InputGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 8px;
`;

const StyledInput = styled.input`
  width: 100%;
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

const Message = styled.p<{ isError: boolean }>`
  text-align: center;
  font-size: 14px;
  color: ${props => props.isError ? '#e74c3c' : '#27ae60'};
  margin: 16px 0;
  padding: 12px;
  border-radius: 12px;
  background-color: ${props => props.isError ? '#ffebee' : '#e8f5e9'};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`;

const FindButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const BackButton = styled.button`
  width: 100%;
  padding: 14px;
  background: transparent;
  color: #7f8c8d;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #bdc3c7;
  }
`;

const InputWithButton = styled.div`
  display: flex;
  gap: 8px;
`;

const VerifyButton = styled.button`
  padding: 0 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2980b9;
  }
`;
