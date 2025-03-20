// src/pages/FeedDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { ThumbsUp, MessageCircle, Eye } from "lucide-react";
import config from "../../config";
import Loading from "../../components/Lodaing";

// ✅ 날짜 변환 함수 (몇 분 전, 몇 시간 전)
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

interface FeedDetailData {
  feedID: string;
  title: string;
  author: string;
  createdAt: string;
  content: string;
  likes: number;
  comments: number;
  imageUrls: string[];
  isLiked: boolean;
  views: number;
}

interface CommentData {
  commentId: number;
  userId: string;
  nickname: string; // ✅ 닉네임 추가
  content: string;
  createdAt: string;
}


const FeedDetail: React.FC = () => {
  const { feedID } = useParams<{ feedID: string }>();
  const [feed, setFeed] = useState<FeedDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<CommentData[]>([]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${config.API_DEV}/api/feed/comments`, {
        params: { feedId: feedID },
      });
      setComments(response.data);
    } catch (error) {
      console.error("댓글 로드 실패:", error);
    }
  };
  

  const [newComment, setNewComment] = useState("");

  const handleCommentSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
  
    if (!newComment.trim()) {
      alert("댓글을 입력하세요.");
      return;
    }
  
    try {
      await axios.post(`${config.API_DEV}/api/feed/comment`, {
        feedId: feedID,
        userId: user.id,
        nickname: user.nickname, // ✅ 닉네임 추가
        content: newComment,
      });

      // ✅ 프론트에서만 개수 +1
      setComments(prevComments => [
        ...prevComments,
        {
          commentId: Math.random(), // ✅ 임시 ID (고유 ID는 서버에서 설정됨)
          userId: user.id,
          nickname: user.nickname,
          content: newComment,
          createdAt: new Date().toISOString(),
        }
      ]);
  
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };
  



  const getUserId = (): string | null => {
    const userData = localStorage.getItem("user");
    if (!userData) return null; // ✅ 저장된 사용자 정보가 없으면 null 반환
  
    try {
      const user = JSON.parse(userData);
      return user?.id || null; // ✅ user 객체에서 ID 값 가져오기 (없으면 null)
    } catch (error) {
      console.error("사용자 정보 파싱 실패:", error);
      return null;
    }
  };  

  useEffect(() => {
    const fetchFeedDetail = async () => {
      try {
        const userId = getUserId();
        
        // 로그인한 사용자인 경우 조회수 증가
        if (userId) {
          await axios.post(`${config.API_DEV}/api/feed/view/${feedID}`, null, {
            params: { userId }
          });
        }

        const [feedResponse, viewResponse] = await Promise.all([
          axios.get<FeedDetailData>(`${config.API_DEV}/api/feed/info?feedID=${feedID}`),
          axios.get(`${config.API_DEV}/api/feed/view/${feedID}/count`)
        ]);
  
        let isLiked = false;
        if (userId) {
          // ✅ 로그인된 경우에만 좋아요 상태 요청
          const likeStatusRes = await axios.get(`${config.API_DEV}/api/feed/like-status`, {
            params: { userId, feedId: feedID },
          });
          isLiked = likeStatusRes.data.isLiked;
        }
  
        setFeed({
          ...feedResponse.data,
          views: viewResponse.data,
          imageUrls: [`${config.API_DEV}/api/bong/image/${feedResponse.data.feedID}/1`],
          isLiked: isLiked, // ✅ 로그인한 사용자만 좋아요 정보 반영
        });
  
      } catch (error) {
        console.error("피드 로드 실패:", error);
        setError("게시글을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
  
    if (feedID) {
      fetchFeedDetail();
      fetchComments(); // ✅ 댓글도 같이 불러오기
    }
  }, [feedID]);
  

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); 
  
    if (!feed) return;
  
    try {
      const userId = getUserId(); // ✅ 사용자 ID 가져오기
      if (!userId) {
        console.error("로그인이 필요합니다.");
        return;
      }
  
      const newLikeStatus = !feed.isLiked; 
      const action = newLikeStatus ? 1 : 0; 
  
      // ✅ 백엔드 API 요청
      await axios.post(`${config.API_DEV}/api/feed/like`, null, {
        params: { userId, feedId: feed.feedID, action },
      });
  
      // ✅ 상태 업데이트 (isLiked + 좋아요 개수 직접 증가/감소)
      setFeed(prevFeed => {
        if (!prevFeed) return prevFeed;
  
        return {
          ...prevFeed,
          isLiked: newLikeStatus, 
          likes: prevFeed.likes + (newLikeStatus ? 1 : -1) // ✅ 좋아요 개수 직접 증가/감소
        };
      });
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };
  
  

  if (isLoading) return <LoadingText><Loading/></LoadingText>;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!feed) return <ErrorText>feedID: {feedID}, 데이터가 없습니다.</ErrorText>;

  return (
    <Wrapper>
      {/* 피드 이미지 (전체 화면) */}
      {feed.imageUrls[0] && <FeedImage src={feed.imageUrls[0]} alt="게시물 이미지" />}

      <FeedContent>
        {/* 작성자 및 날짜 */}
        <FeedHeader>
          {/* <ProfileImage src="/assets/DC.png" alt="프로필 이미지" /> */}
          <ProfileInfo>
            <Author>{feed.author}</Author>
            <TimeAgoText>{timeAgo(feed.createdAt)}</TimeAgoText>
          </ProfileInfo>
        </FeedHeader>

        {/* 제목 및 내용 */}
        <Title>{feed.title}</Title>
        <Content>{feed.content}</Content>

        {/* 좋아요 & 댓글 버튼 */}
        <Actions>
          <ActionButton onClick={(e) => getUserId() ? handleLike(e) : null} disabled={!getUserId()}>
            {getUserId() && feed?.isLiked ? <ThumbsUp fill="blue" /> : <ThumbsUp />}
            <span>{feed?.likes}</span>
          </ActionButton>

          <ActionButton>
            <MessageCircle />
            <span>{comments.length}</span> {/* ✅ 댓글 개수 표시 */}
          </ActionButton>

          <ActionButton>
            <Eye />
            <span>{feed?.views}</span>
          </ActionButton>
        </Actions>

        {/* 댓글 UI */}
        <CommentSection>
          <CommentTitle>댓글</CommentTitle>
            <CommentInputContainer>
              <CommentInput
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                disabled={!getUserId()} // ✅ 비회원이면 입력 불가
              />
              <SubmitButton onClick={handleCommentSubmit} disabled={!getUserId()}>
                등록
              </SubmitButton>
            </CommentInputContainer>

            <CommentList>
              {comments.length === 0 ? (
                <NoCommentText>아직 댓글이 없습니다.</NoCommentText>
              ) : (
                comments.map((comment) => (
                  <CommentItem key={comment.commentId}>
                    <CommentHeader>
                      <CommentAuthor>{comment.nickname}</CommentAuthor>
                      <CommentDate>
                        {new Date(comment.createdAt).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CommentDate>
                    </CommentHeader>
                    <CommentContent>{comment.content}</CommentContent>
                  </CommentItem>
                ))
              )}
            </CommentList>

        </CommentSection>
      </FeedContent>
    </Wrapper>
  );
};

export default FeedDetail;

// --------------------
// 스타일 정의
// --------------------

/* ✅ 전체 화면 적용 */
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
`;

/* ✅ 전체 화면을 차지하는 피드 이미지 */
const FeedImage = styled.img`
  width: 100%;
  max-height: 50vh;
  object-fit: cover;
`;

/* ✅ 본문 컨텐츠 */
const FeedContent = styled.div`
  padding: 16px;
  flex: 1;
`;

/* ✅ 피드 작성자 정보 */
const FeedHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

// const ProfileImage = styled.img`
//   width: 40px;
//   height: 40px;
//   border-radius: 50%;
//   margin-right: 10px;
// `;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Author = styled.span`
  font-weight: bold;
  font-size: 16px;
`;

const TimeAgoText = styled.span`
  font-size: 12px;
  color: gray;
`;

/* ✅ 제목 */
const Title = styled.h1`
  font-size: 26px;
  font-weight: bold;
  margin-top: 12px;
`;

/* ✅ 본문 내용 */
const Content = styled.p`
  font-size: 18px;
  margin-top: 16px;
  line-height: 1.6;
`;

/* ✅ 좋아요 & 댓글 버튼 */
const Actions = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 12px;
`;

const ActionButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)}; /* ✅ 비활성화 시 투명도 낮춤 */
  font-size: 16px;
`;


/* ✅ 댓글 섹션 */
const CommentSection = styled.div`
  margin-top: 20px;
`;

const CommentTitle = styled.h2`
  font-size: 22px;
  margin-bottom: 12px;
  font-weight: bold;
`;




const LoadingText = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const ErrorText = styled.div`
  text-align: center;
  color: red;
  margin-top: 20px;
`;

const CommentInputContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const SubmitButton = styled.button`
  background-color: rgb(231, 174, 100);
  border: none;
  padding: 8px 12px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  color: white;
  border-radius: 4px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const CommentList = styled.div`
  margin-top: 12px;
`;

const CommentItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid #eee;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
`;

const CommentAuthor = styled.span`
  font-weight: bold;
  font-size: 16px;
`;

const CommentDate = styled.span`
  font-size: 14px;
  color: #666;
`;

const CommentContent = styled.p`
  font-size: 16px;
  color: #333;
  margin: 0;
  padding-left: 12px;
  position: relative;
  line-height: 1.5;

  &::before {
    content: 'ㄴ';
    position: absolute;
    left: -8px;
    color: #999;
    font-size: 14px;
  }
`;

const NoCommentText = styled.p`
  text-align: center;
  color: gray;
  font-size: 16px;
  margin: 20px 0;
`;
