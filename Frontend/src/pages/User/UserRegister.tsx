import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../../config";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    nickname: "",
    profile_image: "",
    age_range: "",
    gender: "",
    email: "",
    mobile: "",
    mobile_e164: "",
    name: "",
    birthday: "",
    birthyear: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  // 새로운 state 추가
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 이메일 인증번호 전송
  const handleSendVerification = async () => {
    if (!formData.email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setMessage("올바른 이메일 형식이 아닙니다.");
        return;
      }

      // 회원가입용 이메일 인증 엔드포인트 사용
      const response = await axios.post(`${config.API_DEV}/api/auth/request-verification/register`, { 
        email: formData.email 
      });
      setMessage(response.data);
      setIsCodeSent(true);
      setIsSuccess(true);
    } catch (error: any) {
      setMessage(error.response?.data || "인증번호 전송에 실패했습니다.");
      setIsSuccess(false);
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setMessage("인증번호를 입력해주세요.");
      return;
    }

    try {
      await axios.post(`${config.API_DEV}/api/auth/verify-code`, {
        email: formData.email,
        code: verificationCode
      });
      setMessage("이메일 인증이 완료되었습니다.");
      setIsVerified(true);
      setIsSuccess(true);
    } catch (error: any) {
      setMessage(error.response?.data || "인증번호 확인에 실패했습니다.");
      setIsSuccess(false);
    }
  };

  // 회원가입 요청
  const handleRegister = async () => {
    if (!isVerified) {
      setMessage("이메일 인증을 완료해주세요.");
      return;
    }
    if (!formData.email || !formData.password || !formData.name || !formData.nickname) {
      setMessage("필수 정보를 입력해주세요.");
      return;
    }

    try {
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setMessage("올바른 이메일 형식이 아닙니다.");
        return;
      }

      // 비밀번호 유효성 검사 (최소 8자, 문자/숫자 포함)
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setMessage("비밀번호는 최소 8자 이상, 문자와 숫자를 포함해야 합니다.");
        return;
      }

      // 회원가입 요청
      const registerResponse = await axios.post(`${config.API_DEV}/api/auth/register`, formData);
      
      if (registerResponse.status === 201) {
        // 회원가입 성공 시 바로 로그인 처리
        const loginResponse = await axios.post(`${config.API_DEV}/api/auth/login`, {
          email: formData.email,
          password: formData.password
        });

        if (loginResponse.status === 200) {
          // 사용자 정보 저장
          localStorage.setItem("user", JSON.stringify(loginResponse.data));
          setMessage("회원가입이 완료되었습니다! 마이페이지로 이동합니다.");
          setTimeout(() => navigate("/my-page"), 1500); // 마이페이지로 이동
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error.response || error); // 디버깅용
      if (error.response?.data) {
        setMessage(error.response.data);
      } else {
        setMessage("회원가입에 실패했습니다.");
      }
    }
  };

  return (
    <Container>
      <FormWrapper>
        <Title>함께하는 첫걸음</Title>
        <Subtitle>봉사와 나눔의 여정을 시작해보세요</Subtitle>
        
        <Form>
          <InputGroup>
            <Label>이름 *</Label>
            <StyledInput 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="실명을 입력해주세요"
              required 
            />
          </InputGroup>

          <InputGroup>
            <Label>닉네임 *</Label>
            <StyledInput 
              type="text" 
              name="nickname" 
              value={formData.nickname} 
              onChange={handleChange} 
              placeholder="다른 사람에게 보여질 이름"
              required 
            />
          </InputGroup>

          <InputGroup>
            <Label>이메일 *</Label>
            <InputWithButton>
              <StyledInput 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="example@email.com"
                disabled={isCodeSent}
                required 
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
              {isCodeSent && <Message isError={false}>인증번호가 이메일로 전송되었습니다.</Message>}
            </InputGroup>
          )}

          <InputGroup>
            <Label>비밀번호 *</Label>
            <StyledInput 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="안전한 비밀번호를 입력해주세요"
              required 
            />
          </InputGroup>

          <InputGroup>
            <Label>생년월일</Label>
            <DateInputContainer>
              <StyledInput 
                type="text" 
                name="birthyear" 
                placeholder="YYYY" 
                value={formData.birthyear} 
                onChange={handleChange}
                style={{ flex: 1 }}
              />
              <Separator>-</Separator>
              <StyledInput 
                type="text" 
                name="birthday" 
                placeholder="MM-DD" 
                value={formData.birthday} 
                onChange={handleChange}
                style={{ flex: 1.2 }}
              />
            </DateInputContainer>
          </InputGroup>

          <InputGroup>
            <Label>성별</Label>
            <StyledSelect name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">선택해주세요</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
              <option value="U">기타</option>
            </StyledSelect>
          </InputGroup>

          <InputGroup>
            <Label>휴대폰 번호</Label>
            <StyledInput 
              type="text" 
              name="mobile" 
              placeholder="010-1234-5678" 
              value={formData.mobile} 
              onChange={handleChange} 
            />
          </InputGroup>

          {message && !message.includes("인증") && (
            <Message isError={!isSuccess}>{message}</Message>
          )}

          <RegisterButton onClick={handleRegister}>
            회원가입 완료
          </RegisterButton>
        </Form>
      </FormWrapper>
    </Container>
  );
};

export default Register;

// --------------------
// 스타일 정의
// --------------------

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  padding: 40px 20px;
  overflow-y: auto;
  height: calc(100vh - 160px); /* TopBar 높이 제외 */
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  margin: 20px 0;
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
  margin-bottom: 40px;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #34495e;
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

const StyledSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const DateInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Separator = styled.span`
  color: #7f8c8d;
  font-weight: 600;
`;

const RegisterButton = styled.button`
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
  margin-top: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Message = styled.p<{ isError: boolean }>`
  text-align: center;
  font-size: 14px;
  color: ${props => props.isError ? '#e74c3c' : '#27ae60'};
  margin: 0;
  padding: 8px;
  border-radius: 8px;
  background-color: ${props => props.isError ? '#ffebee' : '#e8f5e9'};
`;

// 새로운 스타일 컴포넌트 추가
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
