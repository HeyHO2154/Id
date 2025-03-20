import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../../config";

const FeedAdd: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [category, setCategory] = useState(4); // 기본값은 자유게시판(4)

  const [user, setUser] = useState<{ nickname: string; email: string } | null>(null);

  // 카테고리 목록
  const categories = [
    { id: 1, label: '공지' },
    { id: 2, label: '건의' },
    { id: 3, label: '후기' },
    { id: 4, label: '자유' }
  ];

  useEffect(() => {
      const storedUser = localStorage.getItem("user");
  
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        navigate("/user/login");
      }
    }, [navigate]);
  
    if (!user) {
      return null;
    }

  // 관리자 여부 확인
  const isAdmin = user?.email === config.ADMIN_EMAIL;

  // 카테고리 목록 필터링 - 관리자가 아니면 공지 카테고리 제외
  const availableCategories = categories.filter(category => 
    isAdmin ? true : category.id !== 1
  );

  // 이미지 업로드 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3); // 최대 3장 제한
      setImages(files);
    }
  };

  // USR 고유번호 생성
  const generateFeedID = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `FEED${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 공지 카테고리 선택 시 관리자 체크
    if (category === 1 && user?.email !== config.ADMIN_EMAIL) {
      alert("공지사항은 관리자만 작성할 수 있습니다.");
      return;
    }

    const feedID = generateFeedID();

    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const jsonData = {
      feedID: feedID,
      title: title,
      author: user.nickname,
      createdAt: new Date().toISOString(),
      content: content,
      likes: 0,
      views: 0,
      category: category
    };

    try {
      // 1️⃣ JSON 데이터 먼저 전송
      await axios.post(`${config.API_DEV}/api/feed/add`, JSON.stringify(jsonData), {
        headers: { "Content-Type": "application/json" },
      });

        // 2. 이미지 업로드 처리
        if (images && images.length > 0) {
            const imageFormData = new FormData();
            images.forEach((image, index) => {
                index;  //노란경고 방지
                imageFormData.append("images", image);
            });
        
            await axios.post(`${config.API_DEV}/api/bong/upload/${feedID}`, imageFormData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }

      alert("후기가 성공적으로 등록되었습니다!");
      navigate("/feed"); // 피드 목록으로 이동
    } catch (error) {
      console.error("후기 등록 실패:", error);
      alert("후기 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <Container>
      <FormContainer onSubmit={handleSubmit}>
        <Title>글 작성</Title>
        <FormGroup>
          <Label>카테고리</Label>
          <CategorySelect
            value={category}
            onChange={(e) => setCategory(Number(e.target.value))}
          >
            {availableCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </CategorySelect>
        </FormGroup>
        <FormGroup>
          <Label>제목</Label>
          <Input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label>내용</Label>
          <Textarea
            placeholder="내용을 입력하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </FormGroup>
        <FileInputWrapper>
          <FileInputLabel htmlFor="file-upload">사진 업로드 (최대 3장)</FileInputLabel>
          <FileInput type="file" id="file-upload" multiple accept="image/*" onChange={handleFileChange} />
        </FileInputWrapper>
        {images.length > 0 && (
          <PreviewContainer>
            {images.map((file, index) => (
              <PreviewImage key={index} src={URL.createObjectURL(file)} alt="preview" />
            ))}
          </PreviewContainer>
        )}
        <SubmitButton type="submit">등록</SubmitButton>
      </FormContainer>
    </Container>
  );
};

export default FeedAdd;

// ✅ 스타일 정의 (업데이트됨)
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  padding: 40px 20px;
  overflow-y: auto;
  height: calc(100vh - 160px); /* TopBar 높이 제외 */
`;

const FormContainer = styled.form`
  width: 100%;
  max-width: 500px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const CategorySelect = styled.select`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;

  &:focus {
    border-color: #0066ff;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;

  &:focus {
    border-color: #0066ff;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 200px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  outline: none;

  &:focus {
    border-color: #0066ff;
  }
`;

const FileInputWrapper = styled(FormGroup)``;

const FileInputLabel = styled(Label)``;

const FileInput = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
`;

const PreviewImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  color: white;
  background-color: #0066ff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0052cc;
  }
`;
