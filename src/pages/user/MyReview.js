import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import instance from "../../api/axios";
import Header from "../Header";
import Footer from "../Footer";
import "../css/MyPage.css";
import { fetchStoreInfo } from "../store/storeService";

const MyReview = () => {
  const [reviews, setReviews] = useState([]); // 리뷰 데이터를 저장
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

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

  if (loading) return <p>Loading...</p>; // 로딩 중일 때
  if (error) return <p>리뷰 데이터를 불러오는 중 문제가 발생했습니다.</p>; // 에러가 발생했을 때

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="home">
          <div>
            <Link to="/mypage">
              <button>뒤로가기</button>
            </Link>
            내리뷰 관리
          </div>
          <div className="mypage-div">
            <h2 className="section-title">내가 쓴 리뷰 총 {reviews.length}개</h2>
          </div>
          <br />
          <br />
          <div className="myreview-div">
            <h2>내가 쓴 리뷰</h2>
            {reviews.length === 0 ? (
              <p>작성한 리뷰가 없습니다.</p>
            ) : (
              <ul>
                {reviews.map((review) => (
                  <li key={review.reviewId} className="review-item">
                    <h3>가게 이름: {review.storeName}</h3>
                    <p>평점: {review.rating} / 5</p>
                    <p>리뷰 내용: {review.reviewContents || "내용 없음"}</p>
                    <p>작성일: {new Date(review.createdAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
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
