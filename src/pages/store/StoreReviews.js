import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../../api/axios"; // axios 인스턴스
import Header from "../Header";
import Footer from "../Footer";
import "../css/StoreReviews.css";

const StoreReviews = () => {
  const [storeReviews, setStoreReviews] = useState(null); // 가게 리뷰 상태
  const [storeStats, setStoreStats] = useState(null); // 가게 통계 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const { storeId } = useParams(); // URL 파라미터로 storeId 받기
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login"); // 로그인 페이지로 리다이렉트
      return;
    }

    const fetchData = async () => {
      //리뷰 통계 가져오기
      try {
        const [reviewsResponse, statsResponse] = await Promise.all([
          instance.get(`/stores/${storeId}/reviews`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          instance.get(`/stores/${storeId}/reviews/total`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStoreReviews(reviewsResponse.data); // 리뷰 데이터 저장
        setStoreStats(statsResponse.data); // 통계 데이터 저장
      } catch (err) {
        setError("가게 정보를 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    fetchData();
  }, [storeId, navigate]);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!storeReviews || !storeStats) {
    return <div>가게 정보가 없습니다.</div>;
  }

  // 데이터 추출
  const {
    storeName,
    storePhone,
    storeDescription,
    reviewImageUrlMap = {},
  } = storeReviews;

  const {
    ratingStat1,
    ratingStat2,
    ratingStat3,
    ratingStat4,
    ratingStat5,
    countTotal,
    ratingAverage,
  } = storeStats;

  const imageUrls = Object.keys(reviewImageUrlMap).map(
    (key) => reviewImageUrlMap[key]
  );

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="home">
          <div className="sub-header-container">
            <button className="back-button">◀</button>
            <h2 className="sub-header-text">{storeName || "가게이름"}</h2>
          </div>

          {/* 가게 이미지들 표시 */}
          <div className="store-image-gallery">
            {imageUrls.length > 0 ? (
              imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`store-image-${index}`}
                  className="store-reviews-image"
                />
              ))
            ) : (
              <p>이미지가 없습니다.</p>
            )}
          </div>

          {/* 리뷰 통계 */}
          <div className="store-review-info">
            <div className="store-review-star">
              <h2>{countTotal}개 리뷰 별점 평균</h2>
              <h1>★</h1>
              <h2>{ratingAverage}</h2>
            </div>
            <div>
              5점 : {ratingStat5}개 <br></br>
              4점 : {ratingStat4}개 <br></br>
              3점 : {ratingStat3}개 <br></br>
              2점 : {ratingStat2}개 <br></br>
              1점 : {ratingStat1}개 <br></br>
            </div>
          </div>

          {/* 리뷰 전체 리스트 */}
          <div className="store-reviews-list">
            {storeReviews.length === 0 ? (
              <p>작성된 리뷰가 없습니다.</p>
            ) : (
              <div>
                {storeReviews.map((review) => (
                  <div key={review.reviewId} className="store-review-list-item">
                    <h3>{review.reviewerNickname}</h3>
                    <p>★ {review.rating}</p>
                    {review.reviewImageUrlMap && (
                      <div className="store-review-images">
                        {Object.values(review.reviewImageUrlMap).map(
                          (url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`리뷰 이미지 ${index + 1}`}
                              className="review-image"
                            />
                          )
                        )}
                      </div>
                    )}
                    <h4>{review.reviewContents}</h4>
                    <p>{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default StoreReviews;
