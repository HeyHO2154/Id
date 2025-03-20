import React, { useEffect, useState,  } from "react";
import styled from "styled-components";
import { LogoutOutlined, BarChartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ThumbsUp, Eye, MessageCircle } from "lucide-react";
import axios from "axios";
import config from "../config";
import Loading from "../components/Lodaing";

interface BongData {
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
}

interface FeedData {
  feedID: string;
  title: string;
  author: string;
  createdAt: string;
  content: string;
  likes: number;
  views: number;
  category: number;
  images: string[];
  comments: number;
}

// User 인터페이스 추가
interface User {
  id: string;
  nickname: string;
  email: string;
  profileImage?: string;
  token?: string;
  gender?: string;
  ageRange?: string;
  mobile?: string;
  name?: string;
  birthday?: string;
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("작성 봉사");
  const [data, setData] = useState<Array<BongData | FeedData>>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async (tab: string) => {
    if (!user) return;
    setLoading(true);
    try {
      let endpoint = '';
      switch(tab) {
        case "작성 봉사":
          endpoint = `/api/auth/my-bongs?userId=${user.id}`;
          break;
        case "관심 봉사":
          endpoint = `/api/auth/liked-bongs?userId=${user.id}`;
          break;
        case "작성 후기":
          endpoint = `/api/auth/my-feeds?userId=${user.id}`;
          break;
        case "관심 후기":
          endpoint = `/api/auth/liked-feeds?userId=${user.id}`;
          break;
      }

      const response = await axios.get(`${config.API_DEV}${endpoint}`);
      const newData = await Promise.all(response.data.map(async (item: any) => {
        if ('progrmRegistNo' in item) {
          const endDate = new Date(item.progrmEndde);
          const today = new Date();
          const timeDiff = endDate.getTime() - today.getTime();
          const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          return {
            ...item,
            remainingDays: remainingDays > 0 ? remainingDays : 0
          };
        } else {
          // 피드인 경우만 댓글 수와 조회수 가져오기
          const [commentsCount, viewCount] = await Promise.all([
            axios.get(`${config.API_DEV}/api/feed/comments`, {
              params: { feedId: item.feedID },
            }),
            axios.get(`${config.API_DEV}/api/feed/view/${item.feedID}/count`)
          ]);

          return {
            ...item,
            comments: commentsCount.data.length,
            views: viewCount.data
          };
        }
      }));

      setData(newData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 사용자 정보 로드
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } else {
      navigate("/user/login");
    }
  }, [navigate]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    loadData(activeTab);
  }, [activeTab, user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/user/login");
  };

  if (!user) {
    return null;
  }

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      );
    }

    if (data.length === 0) {
      let message = "";
      switch (activeTab) {
        case "작성 봉사":
          message = "아직 작성한 봉사 게시글이 없습니다.";
          break;
        case "관심 봉사":
          message = "아직 관심 표시한 봉사가 없습니다.";
          break;
        case "작성 후기":
          message = "아직 작성한 후기가 없습니다.";
          break;
        case "관심 후기":
          message = "아직 관심 표시한 후기가 없습니다.";
          break;
      }
      return (
        <NoDataMessage>
          <span>😢 {message}</span>
        </NoDataMessage>
      );
    }

    return (
      <CardGrid>
        {data.map((item: any, index) => (
          <Card 
            key={index} 
            onClick={() => {
              if ('progrmRegistNo' in item) {
                navigate(`/detail/${item.progrmRegistNo}`);
              } else if ('feedID' in item) {
                navigate(`/feed/${item.feedID}`);
              }
            }}
          >
            {'progrmRegistNo' in item ? (
              // 봉사 카드
              <>
                <CardImage style={{ backgroundImage: `url(${config.API_DEV}/api/bong/image/${item.progrmRegistNo}/1)` }} />
                <CardContent>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Badge>{item.nanmmbyNm}</Badge>
                    <DDay>{`D-${item.remainingDays}`}</DDay>
                  </div>
                  <CardTitle>{item.progrmSj}</CardTitle>
                  <CardDescription>{item.actPlace}</CardDescription>
                  <DateText>{`모집기간: ${new Date(item.noticeBgnde).toLocaleDateString()} ~ ${new Date(item.noticeEndde).toLocaleDateString()}`}</DateText>
                </CardContent>
              </>
            ) : (
              // 피드 카드
              <>
                <CardImage style={{ backgroundImage: `url(${config.API_DEV}/api/bong/image/${item.feedID}/1)` }} />
                <CardContent>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <AuthorInfo>
                      <UserName>{item.author}</UserName>
                      <PostDate>{timeAgo(item.createdAt)}</PostDate>
                    </AuthorInfo>
                    <CategoryBadge category={item.category}>
                      {getCategoryLabel(item.category)}
                    </CategoryBadge>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.content}</CardDescription>
                  <Stats>
                    <StatItem>
                      <ThumbsUp size={16} />
                      <span>{item.likes}</span>
                    </StatItem>
                    <StatItem>
                      <MessageCircle size={16} />
                      <span>{item.comments}</span>
                    </StatItem>
                    <StatItem>
                      <Eye size={16} />
                      <span>{item.views}</span>
                    </StatItem>
                  </Stats>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </CardGrid>
    );
  };

  return (
    <Container>
      <Header>
        <ProfileSection>
          <ProfileInfo>
            <ProfileImage 
              src={user.profileImage || "/assets/BongTMI.png"} 
              alt={user.nickname}
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.currentTarget;
                target.src = "/assets/BongTMI.png";
              }}
            />
            <UserDetails>
              <UserName>{user.nickname}</UserName>
              <UserEmail>{user.email}</UserEmail>
              <ActionButtons>
                <IconButton onClick={() => navigate("/user/report")}>
                  <BarChartOutlined />
                  <ButtonLabel>통계</ButtonLabel>
                </IconButton>
                <IconButton onClick={handleLogout}>
                  <LogoutOutlined />
                  <ButtonLabel>로그아웃</ButtonLabel> 
                </IconButton>
              </ActionButtons>
            </UserDetails>
          </ProfileInfo>
        </ProfileSection>

        <TabsContainer>
          <TabButton $active={activeTab === "작성 봉사"} onClick={() => setActiveTab("작성 봉사")}>
            작성 봉사
          </TabButton>
          <TabButton $active={activeTab === "관심 봉사"} onClick={() => setActiveTab("관심 봉사")}>
            관심 봉사
          </TabButton>
          <TabButton $active={activeTab === "작성 후기"} onClick={() => setActiveTab("작성 후기")}>
            작성 후기
          </TabButton>
          <TabButton $active={activeTab === "관심 후기"} onClick={() => setActiveTab("관심 후기")}>
            관심 후기
          </TabButton>
        </TabsContainer>
      </Header>

      <Content>
        {renderContent()}
      </Content>
    </Container>
  );
};

export default MyPage;

// --------------------
// 스타일 정의
// --------------------

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  background: #f8f9fa;
  overflow: hidden;
`;

const Header = styled.div`
  background: white;
  padding: 20px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const ProfileSection = styled.div`
  margin-bottom: 20px;
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 12px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #495057;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f3f5;
  }
`;

const ButtonLabel = styled.span`
  font-size: 1.1rem;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: ${props => props.$active ? '#ff6b6b' : '#f1f3f5'};
  color: ${props => props.$active ? 'white' : '#495057'};
  font-size: 1.0rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#ff6b6b' : '#e9ecef'};
    transform: translateY(-1px);
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  background: #f8f9fa;
  min-height: calc(100vh - 300px);
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
`;

const CardImage = styled.div`
  width: 100%;
  height: 180px;
  background-image: url(${props => props.style?.backgroundImage});
  background-size: cover;
  background-position: center;
`;

const CardContent = styled.div`
  padding: 16px;
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #343a40;
  margin: 0 0 8px 0;
`;

const CardDescription = styled.p`
  font-size: 1.1rem;
  color: #868e96;
  margin: 0;
  line-height: 1.5;
`;

const Badge = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  background-color: #4CAF50;
  color: white;
`;

// 피드 카테고리 라벨 함수
const getCategoryLabel = (categoryId: number) => {
  switch (categoryId) {
    case 0: return '미분류';
    case 1: return '공지';
    case 2: return '건의';
    case 3: return '후기';
    case 4: return '자유';
    default: return '기타';
  }
};

// 피드 스타일 컴포넌트 추가
const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const PostDate = styled.div`
  font-size: 1rem;
  color: #666;
`;

const CategoryBadge = styled.span<{ category: number }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  ${props => {
    switch (props.category) {
      case 1: return 'background-color: #ff4444; color: white;';
      case 2: return 'background-color: #ffbb33; color: white;';
      case 3: return 'background-color: #00C851; color: white;';
      case 4: return 'background-color: #33b5e5; color: white;';
      default: return 'background-color: #999; color: white;';
    }
  }}
`;

const DateText = styled.div`
  font-size: 1.1rem;
  color: #666;
  margin-top: 8px;
`;

// timeAgo 함수 추가
const timeAgo = (dateString: string) => {
  const postDate = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - postDate.getTime();

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) return `${years}년 전`;
  if (months > 0) return `${months}개월 전`;
  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return "방금 전";
};

// DDay 스타일 컴포넌트 추가
const DDay = styled.div`
  background-color: rgb(204, 16, 16);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: bold;
`;

// Stats 스타일 컴포넌트 추가
const Stats = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 12px;
`;

// StatItem 스타일 컴포넌트 추가
const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 1.1rem;
`;

// 스타일 추가
const NoDataMessage = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-size: 1.2rem;
  color: #868e96;
  text-align: center;
  background: white;
  border-radius: 16px;
  margin: 20px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
`;

// 스타일 추가
const LoadingWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background: #f8f9fa;
  margin: 20px 0;
`;

// 누락된 스타일 컴포넌트 추가
const ProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserName = styled.div`
  font-weight: bold;
  font-size: 1.3rem;
  color: #333;
`;

const UserEmail = styled.p`
  font-size: 1.1rem;
  color: #868e96;
  margin: 0;
`;
