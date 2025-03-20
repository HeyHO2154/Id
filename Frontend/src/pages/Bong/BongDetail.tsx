import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import config from "../../config";
import { FaCalendarAlt, FaClock, FaUsers, FaMapMarkerAlt } from "react-icons/fa";
import Loading from "../../components/Lodaing";


interface Bong {
  progrmRegistNo: string;
  progrmSj: string;
  progrmSttusSe: number;
  progrmBgnde: string;
  progrmEndde: string;
  actBeginTm: number;
  actEndTm: number;
  noticeBgnde: string;
  noticeEndde: string;
  rcritNmpr: number;
  actWkdy: string;
  srvcClCode: string;
  adultPosblAt: string;
  yngbgsPosblAt: string;
  grpPosblAt: string;
  mnnstNm: string;
  nanmmbyNm: string;
  actPlace: string;
  nanmmbyNmAdmn: string;
  telno: string;
  fxnum: string;
  postAdres: string;
  email: string;
  progrmCn: string;
  sidoCd: string;
  gugunCd: string;
  imageUrls: string[]; // 이미지 배열 추가
}

const DetailBong: React.FC = () => {
  const { progrmRegistNo } = useParams<{ progrmRegistNo: string }>();
  const [bongData, setBongData] = useState<Bong | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 현재 보이는 이미지 인덱스

  const handleImageSlide = (direction: "left" | "right") => {
    if (direction === "left") {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? 2 : prevIndex - 1
      );
    } else {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 2 ? 0 : prevIndex + 1
      );
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 없음";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  
  useEffect(() => {
    const fetchBongData = async () => {
      try {
        const response = await axios.get<Bong>(
          `${config.API_DEV}/api/bong/info`,
          {
            params: { progrmRegistNo },
          }
        );
        setBongData({
          ...response.data,
          imageUrls: [
            `${config.API_DEV}/api/bong/image/${response.data.progrmRegistNo}/1`,
            `${config.API_DEV}/api/bong/image/${response.data.progrmRegistNo}/2`,
            `${config.API_DEV}/api/bong/image/${response.data.progrmRegistNo}/3`,
          ],
        });
      } catch (err) {
        setError("데이터를 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (progrmRegistNo) fetchBongData();
  }, [progrmRegistNo]);



  // 신청하기 버튼 클릭 핸들러 추가
  const handleApplyClick = () => {
    const source = bongData?.progrmRegistNo.substring(0, 3);
    const registNo = bongData?.progrmRegistNo.slice(3); // 앞의 3글자(SYO/VMS)를 제외한 번호
    let url = '';
    
    if (source === 'SYO') {
      // 1365 자원봉사 포털
      url = `https://www.1365.go.kr/vols/P9210/partcptn/timeCptn.do?type=show&progrmRegistNo=${registNo}`;
    } else if (source === 'VMS') {
      // VMS 사회복지 자원봉사
      url = `https://www.vms.or.kr/partspace/recruitView.do?seq=${registNo}`;
    }
    
    if (url) {
      window.open(url, '_blank');
    }
  };

  // 로딩 중일 때도 Container 안에 Loading 컴포넌트 표시
  if (loading) {
    return (
      <Container>
        <Loading />
      </Container>
    );
  }

  if (!bongData) {
    return (
      <Container>
        <NoResultsWrapper>
          <NoResultsMessage>
            <span>봉사 정보를 찾을 수 없습니다 😢</span>
            <span>다른 봉사를 찾아보시는 건 어떨까요?</span>
          </NoResultsMessage>
        </NoResultsWrapper>
      </Container>
    );
  }

  return (
    <Container>
      {/* 이미지 슬라이드 */}
      <ImageContainer>
          <SlideButtonLeft onClick={() => handleImageSlide("left")}>{"<"}</SlideButtonLeft>
            <Image style={{ backgroundImage: `url(${bongData.imageUrls[currentImageIndex]})` }}/>
          <SlideButtonRight onClick={() => handleImageSlide("right")}>{">"}</SlideButtonRight>
      </ImageContainer>

      {/* 📌 봉사 상세 정보 */}
      <InfoContainer>
        <Title>{bongData.progrmSj}</Title>

        <Details>
          <DetailItem><FaCalendarAlt /> 모집 기간: {formatDate(bongData.noticeBgnde)} ~ {formatDate(bongData.noticeEndde)}</DetailItem>
          <DetailItem><FaCalendarAlt /> 봉사 기간: {formatDate(bongData.progrmBgnde)} ~ {formatDate(bongData.progrmEndde)}</DetailItem>
          <DetailItem><FaClock /> 활동 시간: {bongData.actBeginTm}시 ~ {bongData.actEndTm}시</DetailItem>
          <DetailItem><FaUsers /> 모집 인원: {bongData.rcritNmpr}명</DetailItem>
          <DetailItem><FaMapMarkerAlt /> 장소: {bongData.actPlace} ({bongData.postAdres})</DetailItem>
        </Details>

        {/* 구분선 추가 */}
        <Divider />

        <Description>{bongData.progrmCn}</Description>

      </InfoContainer>

      <Footer>
      <ApplyButton onClick={handleApplyClick}>
        💌 신청하기
      </ApplyButton>

      </Footer>
    </Container>
  );
};

export default DetailBong;

// 스타일 정의
const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* ✅ 스크롤 가능하도록 추가 */
  position: relative;
  height: calc(100vh - 160px); /* TopBar + NavBar 높이 제외 */
`;

// Footer: 신청 버튼 고정
const Footer = styled.div`
  position: sticky;
  bottom: 0;
  width: 100%;
  background-color: white;
  padding: 15px 0;
  display: flex;
  justify-content: center;
  z-index: 100;
`;

// 구분선 추가
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #ddd;
  margin: 20px 0; /* 위아래 여백 추가 */
`;

const ApplyButton = styled.button`
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #ff6f61;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color:rgba(255, 110, 97, 0.77);
  }
`;

// 슬라이드 관련 스타일
const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 20px; /* 하단 패딩 추가 */
`;

const Image = styled.div`
  width: 100%;
  height: 300px; /* 원하는 높이 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const SlideButtonLeft = styled.button`
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 10;
`;

const SlideButtonRight = styled.button`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 10;
`;

const InfoContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
`;

const DetailItem = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #555;
`;

const Description = styled.p`
  margin-top: 15px;
  font-size: 16px;
  color: #444;
  line-height: 1.5;
`;

// 스타일 추가
const NoResultsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const NoResultsMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #666;
  text-align: center;

  span:first-child {
    font-size: 1.2rem;
    font-weight: bold;
  }

  span:last-child {
    font-size: 1rem;
    color: #888;
  }
`;