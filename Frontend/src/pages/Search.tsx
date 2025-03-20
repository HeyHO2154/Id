import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // React Router 사용
import config from "../config";
import { sidoList, sigunguData } from "../components/locationData";
import Loading from "../components/Lodaing";


interface CardData {
  id: string;
  label: string;
  region: string;
  type: string;           // ✅ 출처 (1365자원봉사, VMS사회복지, 사용자 등록)
  date: string;
  imageUrl: string;
  from: string;
  postAdress: string;     // ✅ 주소 정보 추가
  progrmSttusSe: string;  // ✅ 모집 상태 추가
  adultPosblAt: boolean;  // ✅ 성인 가능 여부 추가
  yngbgsPosblAt: boolean; // ✅ 청소년 가능 여부 추가
  grpPosblAt: boolean;    // ✅ 단체 가능 여부 추가
  startDate: string;      // ✅ 봉사 시작일 추가
  endDate: string;        // ✅ 봉사 종료일 추가
  days: string; // ✅ 추가된 필드 (1010100 형태)
  remainingDays: number;
}

interface FilterState {
  type: string;           // 출처
  progrmSttusSe: string;  // 모집 상태
  startDate: string;      // 봉사 시작일
  endDate: string;        // 봉사 종료일
  postAdress: string;     // 주소 (사용자가 입력한 값 포함 검색)
  sidoCd: string;         // 시/도 (지역 필터 추가)
  gugunCd: string;        // 시/군/구 (지역 필터 추가)
  days: string[];         // ✅ 요일 필터 (월,화,수,목,금,토,일 선택)
}

const Search: React.FC = () => {
  const [allCards, setAllCards] = useState<CardData[]>([]); // 전체 데이터를 저장
  const [visibleCards, setVisibleCards] = useState<CardData[]>([]); // 화면에 보여질 카드
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10; // 한 번에 로드할 개수
  const [searchTerm, setSearchTerm] = useState(""); // ✅ 검색어 상태 추가
  const [selectedSido, setSelectedSido] = useState("");
  const [selectedSigungu, setSelectedSigungu] = useState("");
  const [isSearching, setIsSearching] = useState(false); // 검색 중 상태
  const [noResults, setNoResults] = useState(false);


  const [filters, setFilters] = useState<FilterState>({
    type: "",
    progrmSttusSe: "",
    startDate: "",
    endDate: "",
    postAdress: "",
    sidoCd: "",
    gugunCd: "",
    days: [],  // ✅ 요일 필터 추가
  });  

  const wrapperRef = useRef<HTMLDivElement>(null);

  // 전체 Bong 리스트를 가져오는 함수
  const fetchAllCards = async () => {
    setIsSearching(true); // 초기 로딩 시작
    setIsLoading(true);
    try {
      const response = await axios.get(`${config.API_DEV}/api/bong/all`);
      const formattedCards = response.data.map((bong: any) => {
        
        const source = bong.progrmRegistNo.substring(0, 3); // 출처 구분 (앞 3글자)
        let fromValue = bong.nanmmbyNmAdmn || "미등록 사용자"; // 기본값 설정
        let typeValue = "USER"; // 기본값
        if (source === "SYO") {
          fromValue = "1365자원봉사";
          typeValue = "1365자원봉사";
        } else if (source === "VMS") {
          fromValue = "VMS사회복지";
          typeValue = "VMS사회복지";
        }

        const endDate = new Date(bong.progrmEndde);
        const today = new Date();
        const timeDiff = endDate.getTime() - today.getTime();
        const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // 일수 계산
  
        return {
          id: bong.progrmRegistNo,
          label: bong.progrmSj || "제목 없음",
          region: bong.postAdres || "지역 없음",
          type: typeValue,  // ✅ 프로그램 등록번호로 type 결정
          date: `모집마감일: ${new Date(bong.progrmEndde).toLocaleDateString()}`,
          imageUrl: `${config.API_DEV}/api/bong/image/${bong.progrmRegistNo}/1`,
          from: fromValue || "미등록 사용자",
          postAdress: bong.postAdres || "",
          progrmSttusSe: bong.progrmSttusSe,
          adultPosblAt: bong.adultPosblAt === "Y",
          yngbgsPosblAt: bong.yngbgsPosblAt === "Y",
          grpPosblAt: bong.grpPosblAt === "Y",
          startDate: bong.progrmBgnde,
          endDate: bong.progrmEndde,
          days: bong.actWkdy || "0000000",
          remainingDays: remainingDays > 0 ? remainingDays : 0, // 마감일이 지났다면 0
        };
      });

      setAllCards(formattedCards);
      setVisibleCards(formattedCards.slice(0, limit)); // 첫 페이지 로드
      setOffset(limit);
      setNoResults(false); // 초기 데이터가 있으므로 noResults는 false
    } catch (error) {
      console.error("Failed to fetch all Bong data:", error);
      setNoResults(true);
    } finally {
      setIsLoading(false);
      setIsSearching(false); // 초기 로딩 완료
    }
  };

  const convertDaysToArray = (daysString: string): string[] => {
    if (!daysString || daysString.length !== 7) return []; // ✅ 혹시 빈 값이면 체크
    const daysMapping = ["일", "월", "화", "수", "목", "금", "토"];
    const result = daysString
      .split("")
      .map((bit, index) => (bit === "1" ? daysMapping[index] : null))
      .filter((day) => day !== null) as string[];
    return result;
  };
  
  
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, [key]: value };
      return newFilters;
    });
    handleSearch(); // ✅ 필터 변경 시 자동 검색 실행
  };
  

  // 스크롤 시 추가 로딩 함수
  const loadMoreCards = () => {
    if (isLoading) return;
  
    const filteredCards = allCards.filter((card) => {
      const cardDaysArray = convertDaysToArray(card.days);
      const selectedDaysArray = filters.days;
  
      const matchesDay =
        selectedDaysArray.length === 0 || selectedDaysArray.some((day) => cardDaysArray.includes(day));
  
      return (
        (card.label.includes(searchTerm) || card.postAdress.includes(searchTerm)) &&
        (filters.type ? card.type === filters.type : true) &&
        (filters.progrmSttusSe ? String(card.progrmSttusSe) === String(filters.progrmSttusSe) : true) &&
        matchesDay &&
        (filters.startDate ? card.startDate >= filters.startDate : true) &&
        (filters.endDate ? card.endDate <= filters.endDate : true) &&
        (filters.sidoCd ? card.postAdress.includes(filters.sidoCd) : true) &&
        (filters.gugunCd ? card.postAdress.includes(filters.gugunCd) : true)
      );
    });
  
    if (offset >= filteredCards.length) return;
  
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCards((prevCards) => [...prevCards, ...filteredCards.slice(offset, offset + limit)]);
      setOffset((prevOffset) => prevOffset + limit);
      setIsLoading(false);
    }, 500);
  };
  

  // 스크롤 감지 이벤트
  const handleScroll = () => {
    const wrapper = wrapperRef.current;
    if (wrapper) {
      const { scrollTop, scrollHeight, clientHeight } = wrapper;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMoreCards();
      }
    }
  };

  const handleSearch = () => {
    setIsSearching(true); // 검색 시작
    setNoResults(false);

    let filtered = allCards.filter((card) => {
      const cardDaysArray = convertDaysToArray(card.days);
      const selectedDaysArray = filters.days;
  
      const matchesDay =
        selectedDaysArray.length === 0 || 
        selectedDaysArray.some((day) => cardDaysArray.includes(day));
  
      return (
        (card.label.includes(searchTerm) || card.postAdress.includes(searchTerm)) &&
        (filters.type ? card.type === filters.type : true) &&
        (filters.progrmSttusSe ? String(card.progrmSttusSe) === String(filters.progrmSttusSe) : true) &&
        matchesDay &&
        (filters.startDate ? card.startDate >= filters.startDate : true) &&
        (filters.endDate ? card.endDate <= filters.endDate : true) &&
        (filters.sidoCd ? card.postAdress.includes(filters.sidoCd) : true) &&
        (filters.gugunCd ? card.postAdress.includes(filters.gugunCd) : true)
      );
    });

    // 검색 결과가 있을 때만 noResults를 설정
    if (filtered.length === 0 && (searchTerm || Object.values(filters).some(val => 
      Array.isArray(val) ? val.length > 0 : val !== ""
    ))) {
      setNoResults(true);
    } else {
      setNoResults(false);
    }

    setVisibleCards(filtered);
    setIsSearching(false); // 검색 완료
  };
  
  const handleLocationChange = (type: "sido" | "sigungu", value: string) => {
    if (type === "sido") {
      setSelectedSido(value);
      setSelectedSigungu(""); // 시/도 변경 시 시/군/구 초기화
      setFilters(prev => ({ ...prev, sidoCd: value, gugunCd: "" }));
    } else {
      setSelectedSigungu(value);
      setFilters(prev => ({ ...prev, gugunCd: value }));
    }
  };  

  const navigate = useNavigate(); // navigate 함수 생성
  const handleCardClick = (progrmRegistNo: string) => {
    //navigate(`/?progrmRegistNo=${progrmRegistNo}`); // 쿼리 파라미터로 전달
    navigate(`/detail/${progrmRegistNo}`);
  };  

  useEffect(() => {
    fetchAllCards();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, filters]);  // ✅ 검색어 & 필터 변경 시 자동 실행

  return (
    <Wrapper ref={wrapperRef} onScroll={handleScroll}>
      {/* 상단 검색창 */}
      <StickyBox>
      <SearchBarWrapper>
        <SearchBar
          placeholder="검색어 입력"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FontAwesomeIcon icon={faSearch} size="lg" onClick={handleSearch} />
      </SearchBarWrapper>
        <FilterToggle onClick={() => setIsFilterVisible(!isFilterVisible)}>
          <FontAwesomeIcon icon={isFilterVisible ? faChevronUp : faChevronDown} size="sm" />
          <ToggleText>상세검색</ToggleText>
        </FilterToggle>
        {isFilterVisible && (
          <FilterWrapper>
            <FilterLabel>신청 기관</FilterLabel>
            <FilterSelect onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">전체</option>
              <option value="1365자원봉사">1365자원봉사</option>
              <option value="VMS사회복지">VMS사회복지</option>
              <option value="USER">봉틈이</option>
            </FilterSelect>

            <FilterLabel>모집 상태</FilterLabel>
            <FilterSelect onChange={(e) => setFilters({ ...filters, progrmSttusSe: e.target.value })}>
              <option value="">전체</option>
              <option value="1">모집대기</option>
              <option value="2">모집중</option>
              <option value="3">모집완료</option>
            </FilterSelect>

            <FilterLabel>요일 선택</FilterLabel>
            <CheckboxWrapper>
              {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                <CheckboxLabel key={day}>
                  <input
                    type="checkbox"
                    checked={filters.days.includes(day)}
                    onChange={() => {
                      let updatedDays = filters.days.includes(day)
                        ? filters.days.filter((d) => d !== day) // 선택 해제
                        : [...filters.days, day]; // 선택 추가

                      handleFilterChange("days", updatedDays); // ✅ 요일 변경 시 자동 필터링 실행
                    }}
                  />
                  {day}
                </CheckboxLabel>
              ))}
            </CheckboxWrapper>


            <FilterLabel>지역</FilterLabel>
              <select
                value={selectedSido}
                onChange={(e) => handleLocationChange("sido", e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">시/도 선택</option>
                {sidoList.map((sido) => (
                  <option key={sido} value={sido}>{sido}</option>
                ))}
              </select>

              {selectedSido && (
                <select
                  value={selectedSigungu}
                  onChange={(e) => handleLocationChange("sigungu", e.target.value)}
                  className="p-2 border rounded"
                >
                  <option value="">시/군/구 선택</option>
                  {sigunguData[selectedSido]?.map((sigungu) => (
                    <option key={sigungu} value={sigungu}>{sigungu}</option>
                  ))}
                </select>
              )}



            <FilterLabel>봉사 기간</FilterLabel>
            <DateWrapper>
              <DateInput type="date" onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
              <DateSeparator>~</DateSeparator>
              <DateInput type="date" onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
            </DateWrapper>
          </FilterWrapper>
        )}

      </StickyBox>

      {/* 카드 리스트 */}
      <CardList>
        {visibleCards.length > 0 ? (
          visibleCards.map((card: CardData) => (
            <Card key={card.id} onClick={() => handleCardClick(card.id)}>
              <CardImage style={{ backgroundImage: `url(${card.imageUrl})` }} />
              <CardText>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <Badge from={card.from}>{card.from}</Badge> {/* ✅ 기존 뱃지 */}
                  <div
                    style={{
                      backgroundColor: "rgb(204, 16, 16)", // 빨간색 배경
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    {`D-${card.remainingDays}`}
                  </div>
                </div>
                <Label>{card.label}</Label>
                <Context>
                  {card.region.split(' ').slice(0, 2).join(' ')} {/* 주소를 처음 두 부분만 표시 */}
                </Context>
                <DateCss>{card.date}</DateCss>
              </CardText>
            </Card>
          ))
        ) : (
          <NoResultsWrapper>
            {isSearching ? (
              <Loading />
            ) : noResults ? (
              <NoResultsMessage>
                <span>검색 결과가 없습니다 😢</span>
                <span>다른 검색어나 필터를 시도해보세요!</span>
              </NoResultsMessage>
            ) : (
              <Loading />
            )}
          </NoResultsWrapper>
        )}
      </CardList>
    </Wrapper>
  );
};

export default Search;

// --------------------
// 스타일 정의
// --------------------

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* ✅ 스크롤 가능하도록 추가 */
  position: relative;
  height: calc(100vh - 160px); /* TopBar + NavBar 높이 제외 */
`;

const StickyBox = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;  // 로딩 오버레이(z-index: 900)보다 높게 설정
  background-color: #fff;
  padding: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SearchBar = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
`;


const SearchBarWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between; /* 양 끝으로 정렬 */
  gap: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
  background-color: #fff;
`;


const FilterToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #555;
  font-size: 1rem;

  &:hover {
    color: #007bff;
  }
`;

const ToggleText = styled.span`
  font-size: 0.9rem;
  font-weight: bold;
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  font-weight: bold;
  padding-top: 7px; /* 위쪽 패딩 추가 */
`;

const FilterSelect = styled.select`
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: #f9f9f9;
`;



const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DateWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateInput = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
`;

const DateSeparator = styled.span`
  font-size: 1rem;
  color: #666;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  position: relative; /* ✅ 추가 */
  display: flex;
  flex-direction: row;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  height: 170px; /* 고정된 높이 설정 */

  &:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
`;


const CardImage = styled.div`
  flex: 0 0 25%;
  height: auto;
  background-size: cover;
  background-position: center;
`;

const CardText = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column; /* ✅ 세로로 정렬 */
  justify-content: flex-start; /* ✅ 위쪽부터 순서대로 배치 */
  gap: 4px; /* ✅ 각 줄 간격 */
  padding: 12px;
`;


const Label = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  margin-bottom: 4px;  // 8px에서 4px로 줄임
  min-height: 2.8em;
`;

const Context = styled.div`
  font-size: 1rem;
  color: #666;
  margin-top: 4px;  // 상단 여백 줄임
`;

const DateCss = styled.div`
  font-size: 0.9rem;
  color: #999;
  margin-top: auto;  // 남은 공간을 위쪽으로 밀어줌
`;

const Badge = styled.div<{ from: string }>`
  display: inline-block;  /* ✅ 글자 길이에 맞게 조정 */
  width: fit-content;  /* ✅ 글자 길이에 맞게 너비 설정 */
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  color: ${({ from }) => (from === "1365자원봉사" ? "black" : "white")};
  background-color: ${({ from }) =>
    from === "1365자원봉사"
      ? "rgba(255, 215, 0, 1)" // 노란색 (1365)
      : from === "VMS사회복지"
      ? "rgba(138, 43, 226, 1)" // 보라색 (VMS)
      : from === "미등록 사용자"
      ? "rgb(218, 40, 40)" // 적색 (비 로그인)
      : "rgb(36, 177, 36)"}; // 녹색 (사용자 정의)
`;

const CheckboxWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const NoResultsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
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
