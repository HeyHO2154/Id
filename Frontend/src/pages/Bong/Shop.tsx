import React from "react";
import styled from "styled-components";
import { ShoppingBag, Heart, Star, Truck, Package, Timer } from "lucide-react";

interface ProductData {
  id: string;
  name: string;
  price: number;
  originalPrice: number; // 할인 전 가격
  imageUrl: string;
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestSeller: boolean;
  stock: number;
}

const Shop: React.FC = () => {
  // 임시 상품 데이터
  const products: ProductData[] = [
    {
      id: "1",
      name: "봉틈이 기본 티셔츠",
      price: 19800,
      originalPrice: 29800,
      imageUrl: "/assets/product1.jpg",
      description: "편안한 착용감의 봉사활동용 티셔츠",
      category: "의류",
      rating: 4.8,
      reviewCount: 128,
      isNew: true,
      isBestSeller: true,
      stock: 10
    },
    {
      id: "2",
      name: "봉틈이 스페셜 모자",
      price: 12800,
      originalPrice: 18000,
      imageUrl: "/assets/product2.jpg",
      description: "자외선 차단 봉사활동용 모자",
      category: "액세서리",
      rating: 4.5,
      reviewCount: 56,
      isNew: false,
      isBestSeller: true,
      stock: 5
    },
    // ... 더 많은 상품 데이터
  ];

  return (
    <ShopWrapper>
      <Header>
        <Title>봉틈이 스토어</Title>
        <SubTitle>봉사활동에 필요한 모든 것</SubTitle>
      </Header>

      {/* 배너 섹션 */}
      <BannerSection>
        <BenefitCard>
          <Truck size={24} />
          <BenefitText>
            <strong>무료 배송</strong>
            <span>5만원 이상 구매 시</span>
          </BenefitText>
        </BenefitCard>
        <BenefitCard>
          <Package size={24} />
          <BenefitText>
            <strong>안전 포장</strong>
            <span>꼼꼼한 포장 배송</span>
          </BenefitText>
        </BenefitCard>
        <BenefitCard>
          <Timer size={24} />
          <BenefitText>
            <strong>당일 발송</strong>
            <span>오후 2시 이전 주문 시</span>
          </BenefitText>
        </BenefitCard>
      </BannerSection>

      <CategoryList>
        <CategoryItem selected>전체</CategoryItem>
        <CategoryItem>의류</CategoryItem>
        <CategoryItem>액세서리</CategoryItem>
        <CategoryItem>도구</CategoryItem>
      </CategoryList>

      <ProductGrid>
        {products.map((product) => (
          <ProductCard key={product.id}>
            <ProductImageWrapper>
              <ProductImage src={product.imageUrl} alt={product.name} />
              {product.isNew && <NewBadge>NEW</NewBadge>}
              {product.isBestSeller && <BestBadge>BEST</BestBadge>}
              <WishButton>
                <Heart size={20} />
              </WishButton>
            </ProductImageWrapper>
            <ProductInfo>
              <ProductCategory>{product.category}</ProductCategory>
              <ProductName>{product.name}</ProductName>
              <ProductDescription>{product.description}</ProductDescription>
              <RatingRow>
                <Stars>
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.floor(product.rating) ? "#ffd700" : "none"}
                      color={i < Math.floor(product.rating) ? "#ffd700" : "#ddd"}
                    />
                  ))}
                </Stars>
                <ReviewCount>리뷰 {product.reviewCount}개</ReviewCount>
              </RatingRow>
              <PriceRow>
                <PriceInfo>
                  <DiscountRate>
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </DiscountRate>
                  <OriginalPrice>{product.originalPrice.toLocaleString()}원</OriginalPrice>
                  <CurrentPrice>{product.price.toLocaleString()}원</CurrentPrice>
                </PriceInfo>
                <BuyButton>
                  <ShoppingBag size={20} />
                  장바구니
                </BuyButton>
              </PriceRow>
              {product.stock <= 5 && (
                <StockWarning>
                  ⚡️ 재고 {product.stock}개 남음
                </StockWarning>
              )}
            </ProductInfo>
          </ProductCard>
        ))}
      </ProductGrid>
    </ShopWrapper>
  );
};

export default Shop;

const ShopWrapper = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 8px;
`;

const SubTitle = styled.p`
  font-size: 1.2rem;
  color: #666;
`;

const BannerSection = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 40px;
`;

const BenefitCard = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const BenefitText = styled.div`
  display: flex;
  flex-direction: column;

  strong {
    font-size: 1.1rem;
    color: #333;
  }

  span {
    font-size: 0.9rem;
    color: #666;
  }
`;

const CategoryList = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
`;

const CategoryItem = styled.button<{ selected?: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background-color: ${props => props.selected ? 'rgb(231, 174, 100)' : '#f0f0f0'};
  color: ${props => props.selected ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.selected ? 'rgb(231, 174, 100)' : '#e0e0e0'};
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const ProductImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const NewBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ff6b6b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
`;

const BestBadge = styled(NewBadge)`
  left: auto;
  right: 10px;
  background: #ffd700;
  color: #333;
`;

const WishButton = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    color: #ff6b6b;
    transform: scale(1.1);
  }
`;

const ProductInfo = styled.div`
  padding: 16px;
`;

const ProductCategory = styled.span`
  font-size: 12px;
  color: #666;
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
`;

const ProductName = styled.h3`
  font-size: 18px;
  margin: 8px 0;
  color: #333;
`;

const ProductDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
`;

const ReviewCount = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DiscountRate = styled.span`
  color: #ff6b6b;
  font-weight: bold;
  font-size: 1.2rem;
`;

const OriginalPrice = styled.span`
  color: #999;
  text-decoration: line-through;
  font-size: 0.9rem;
`;

const CurrentPrice = styled.span`
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
`;

const BuyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: rgb(231, 174, 100);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgb(211, 154, 80);
    transform: translateY(-2px);
  }
`;

const StockWarning = styled.div`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 8px;
  font-weight: bold;
`;
