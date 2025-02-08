import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import instance from "../../api/axios"; // Axios 인스턴스
import Header from "../HeaderV2";
import Footer from "../Footer";
import "../css/StoreReviews.css"; // 일반 CSS 파일 적용

const StoreReviews = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { storeName } = location.state;
  const [storeReviews, setStoreReviews] = useState([]);
  const [storeStats, setStoreStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { storeId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [reviewsResponse, statsResponse] = await Promise.all([
          instance.get(`/stores/${storeId}/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          instance.get(`/stores/${storeId}/reviews/total`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStoreReviews(reviewsResponse.data);
        setStoreStats(statsResponse.data);
      } catch (err) {
        setError("가게 정보를 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId, navigate]);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!storeStats) return <div className="no-data">가게 정보가 없습니다.</div>;

  return (
    <div className="app">
      <div>
        <Header />
        <div className="container">
          <h2 className="store-name">{storeName || "가게이름"}</h2>

          <div className="review-summary">
            <ReviewAverage rating={storeStats.ratingAverage} />
            <ReviewBreakdown stats={storeStats} />
          </div>

          <h3 className="recent-reviews-title">
            📢 최근 리뷰 {storeStats.countTotal}개
          </h3>
          <ReviewList reviews={storeReviews} />
        </div>
        <Footer />
      </div>
    </div>
  );
};

// ⭐ 평균 별점 컴포넌트
const ReviewAverage = ({ rating }) => {
  const fullStars = Math.floor(rating); // 완전히 채워진 별 개수
  const decimalPart = rating - fullStars; // 소수점 부분 (0 ~ 1)

  return (
    <div className="review-average">
      <div className="rating-title">{rating.toFixed(1)}</div>
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="star">
            {i < fullStars ? (
              // 완전히 채워진 별
              <FullStar />
            ) : i === fullStars && decimalPart > 0 ? (
              // 부분적으로 채워진 별 (소수점이 있을 때)
              <PartialStar fillPercentage={decimalPart} />
            ) : (
              // 비어있는 별
              <EmptyStar />
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

// ⭐ 완전히 채워진 별
const FullStar = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="gold"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 17.3l-6.18 3.6 1.64-7.19-5.46-4.71 7.24-.63L12 2l2.76 6.37 7.24.63-5.46 4.71 1.64 7.19z" />
  </svg>
);

// ⭐ 부분적으로 채워진 별 (fillPercentage 만큼 색칠)
const PartialStar = ({ fillPercentage }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="halfStarGradient">
        <stop offset={`${fillPercentage * 100}%`} stopColor="gold" />
        <stop offset={`${fillPercentage * 100}%`} stopColor="lightgray" />
      </linearGradient>
    </defs>
    <path
      fill="url(#halfStarGradient)"
      d="M12 17.3l-6.18 3.6 1.64-7.19-5.46-4.71 7.24-.63L12 2l2.76 6.37 7.24.63-5.46 4.71 1.64 7.19z"
    />
  </svg>
);

// ⭐ 비어있는 별
const EmptyStar = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="lightgray"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 17.3l-6.18 3.6 1.64-7.19-5.46-4.71 7.24-.63L12 2l2.76 6.37 7.24.63-5.46 4.71 1.64 7.19z" />
  </svg>
);

// 📊 별점별 개수 컴포넌트
const ReviewBreakdown = ({ stats }) => {
  const ratings = [5, 4, 3, 2, 1];
  const maxCount = Math.max(
    ...ratings.map((r) => stats[`ratingStat${r}`] || 0)
  );

  return (
    <div className="review-breakdown">
      {ratings.map((rating) => {
        const count = stats[`ratingStat${rating}`] || 0;
        const barWidth = maxCount ? (count / maxCount) * 100 : 0;
        return (
          <div key={rating} className="rating-bar">
            <span>{rating}점</span>
            <div className="bar-container">
              <div
                className="bar"
                style={{
                  width: `${barWidth}%`,
                  opacity: 0.3 + (barWidth / 100) * 0.7,
                }}
              ></div>
            </div>
            <span>{count}개</span>
          </div>
        );
      })}
    </div>
  );
};

// 📝 리뷰 리스트 컴포넌트
const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <p className="no-reviews">작성된 리뷰가 없습니다.</p>;
  }

  return (
    <div className="review-list">
      {reviews.map((review) => (
        <div key={review.reviewId} className="review-item-store">
          {/* 닉네임과 별점 배치 */}
          <div className="review-header">
            <h3 className="reviewer-name">{review.reviewerNickname}</h3>
            <p className="review-rating">⭐ {review.rating}</p>
          </div>

          {/* 리뷰 내용 */}
          <p className="review-content">{review.reviewContents}</p>

          {/* 리뷰 이미지 (가로 스크롤 적용) */}
          {review.reviewImageUrlMap && (
            <div className="review-images">
              {Object.values(review.reviewImageUrlMap).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`리뷰 이미지 ${index + 1}`}
                  className="review-image"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StoreReviews;
