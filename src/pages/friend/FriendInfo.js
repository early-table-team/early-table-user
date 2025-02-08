import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../HeaderV2";
import Footer from "../Footer";
import "../css/MyFriend.css";
import { fetchFriend } from "./friendService";

const FriendInfo = () => {
  const { userId } = useParams();

  const [friend, setFriend] = useState(null); // 유저 정보를 저장할 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  useEffect(() => {
    const fetchFriendInfo = async () => {
      try {
        const friendData = await fetchFriend(userId); // API 호출
        setFriend(friendData); // 유저 정보 저장
      } catch (err) {
        setError("Failed to load friend user info...");
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchFriendInfo();
  }, [userId]); // 컴포넌트 마운트 시 한 번 실행

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="content-container">
          <div className="friend-info-card">
            <div className="img-container">
              <img
                src={
                  friend?.imageUrl || require("../../assets/company-logo.png")
                }
                alt="프로필 이미지"
              />
            </div>
            <div className="friend-info">
              <h2>닉네임</h2>
              <p>{friend?.nickname || "정보 없음"}</p>
            </div>
            <div className="friend-info">
              <h2>이메일</h2>
              <p>{friend?.email || "정보 없음"}</p>
            </div>
            <div className="friend-info">
              <h2>휴대폰번호</h2>
              <p>{friend?.phoneNumber || "정보 없음"}</p>
            </div>
          </div>
        </div>
        <div className="footer-container">
          <Footer />
        </div>
      </div>

      {/* ✅ 로딩 중일 때만 오버레이 표시 */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>친구 정보를 불러오는 중...</p>
        </div>
      )}
    </div>
  );
};

export default FriendInfo;
