import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import config from "../../../config";
import Loading from "../../../components/Lodaing";

const KakaoCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get("code");
    const state = query.get("state");

    if (code) {
      axios
        .post(`${config.API_DEV}/api/auth/kakao/callback`, { code, state })
        .then((res) => {
          localStorage.setItem("user", JSON.stringify(res.data)); // 사용자 정보 저장
          navigate("/my-page"); // 로그인 완료 후 홈으로 이동
        })
        .catch((err) => {
          console.error(err);
          alert("카카오 로그인 실패!");
          navigate("/user/login");
        });
    }
  }, [location, navigate]);

  return (
    <Container>
      <Loading />
    </Container>
  );
};

export default KakaoCallback;

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