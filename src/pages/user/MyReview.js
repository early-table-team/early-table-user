import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../api/axios";
import Header from "../Header";
import Footer from "../Footer";
import "../css/MyReviews.css";
import { fetchStoreInfo } from "../store/storeService";
import axios from "../../api/axios";

const MyReview = () => {
  const [reviews, setReviews] = useState([]); // 리뷰 데이터를 저장
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await instance.get("/reviews", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const reviewsWithStoreName = await Promise.all(
          response.data.map(async (review) => {
            try {
              const storeData = await fetchStoreInfo(review.storeId);
              return { ...review, storeName: storeData.storeName };
            } catch {
              return { ...review, storeName: "가게 정보 없음" };
            }
          })
        );

        setReviews(reviewsWithStoreName);
      } catch (err) {
        console.error("리뷰를 불러오는 중 에러 발생:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []); // 컴포넌트 마운트 시 한 번 실행

  const handleButtonDeleteClick = async (reviewId) => {
    //navigate(`/users/logout`);
    try {
        await axios.delete(`/reviews/${reviewId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("리뷰 삭제 성공");
        setReviews((prevReviews) => prevReviews.filter((review) => review.reviewId !== reviewId));
        navigate("/review");
      } catch (error) {
        alert("리뷰 삭제 실패");
      }
};

  const handleButtonModifyClick = async (review) => {
    navigate(`/review/modify`, { 
      state: { storeName: review.storeName,
               reviewId: review.reviewId,
               rating: review.rating,
               reviewContent: review.reviewContents,
               reviewImageList: review.reviewImageList
     } })
  }

  if (loading) return <p>Loading...</p>; // 로딩 중일 때
  if (error) return <p>리뷰 데이터를 불러오는 중 문제가 발생했습니다.</p>; // 에러가 발생했을 때

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="home">
          <div className="sub-header-container">
            <div><Link to="/mypage">
              <button className="back-button">◀</button>
            </Link>
            </div>
            <div className="sub-header-text">내리뷰 관리</div>
            
          </div>
          <div className="mypage-div">
            <h2 className="section-title">내가 쓴 리뷰 총 {reviews.length}개</h2>
          </div>
          <div className="review-list-container">
            {reviews.length === 0 ? (
              <p>작성한 리뷰가 없습니다.</p>
            ) : (
              <div className="review-list-container">
                {reviews.map((review) => (
                  <li key={review.reviewId} className="review-list-item">
                    <p>가게 이름: {review.storeName}</p>
                    <p>평점: {review.rating} / 5</p>
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
                    <p>리뷰 내용: {review.reviewContents || "내용 없음"}</p>
                    <p>작성일: {new Date(review.createdAt).toLocaleDateString()}</p>
                    <div className="myreview-button-group">
                      <button
                      className="myreview-button"
                      onClick={() => handleButtonModifyClick(review)}>수정</button>
                      <button
                      className="myreview-button"
                      onClick={() => handleButtonDeleteClick(review.reviewId)}>삭제</button>
                    </div>
                  </li>
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

export default MyReview;
