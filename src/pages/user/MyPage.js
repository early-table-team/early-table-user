import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Header from "../HeaderV2";
import Footer from "../Footer";
import "../css/MyPage.css";
import { fetchUserInfo, fetchUserReservationCount } from "./userService";

const MyPage = ({ onEdit }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userReservationCount, setUserReservationCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await fetchUserInfo();
        setUser(userData);

        const countData = await fetchUserReservationCount();
        setUserReservationCount(countData);
      } catch (err) {
        setError("Failed to load user info.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleButtonDeleteUserClick = () => {
    navigate(`/users/delete-user`);
  };

  const token = localStorage.getItem("accessToken");

  const handleButtonLogoutClick = async () => {
    try {
      await axios.post(
        "/users/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem("accessToken");
      alert("로그아웃 성공");
      navigate("/");
    } catch (error) {
      alert("로그아웃 실패");
    }
  };

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header navText="마이 페이지" navLink="/home" />
        </div>
        <div className="home">
          <div className="mypage-top-div">
            <h2
              className="mypage-sub-header-container"
              onClick={() => navigate("/myinfo")}
            >
              <img
                className="profile-img"
                src={user?.imageUrl || require("../../assets/company-logo.png")}
                alt="프로필 이미지"
              />
              <div className="nickname">{user?.nickname || "사용자"} 님</div>
            </h2>

            <div className="mypage-list-item">
              <h3>이용 예정 내역</h3>
              예약 | {userReservationCount?.reservationCount ?? 0} 건<br></br>
              웨이팅 | {userReservationCount?.waitingCount ?? 0} 건<br></br>
            </div>
          </div>

          <div className="mypage-div">
            <h2 className="section-title">이용 정보</h2>
            <Link to="/review" className="link-container">
              <img
                src={require("../../assets/icon-review.png")}
                alt="내 리뷰"
              />
              <div onClick={onEdit}>내 리뷰</div>
            </Link>
            <Link to="/friends" className="link-container">
              <img
                src={require("../../assets/icon-person.png")}
                alt="친구 관리"
              />
              <div onClick={onEdit}>친구 관리</div>
            </Link>
            <Link to="/invitation" className="link-container">
              <img
                src={require("../../assets/icon-person.png")}
                alt="일행 관리"
              />
              <div onClick={onEdit}>일행 관리</div>
            </Link>
          </div>

          <div className="mypage-div">
            <h2 className="section-title">서비스 안내</h2>
            <Link to="/notice" className="link-container">
              <img
                src={require("../../assets/icon-announce.png")}
                alt="공지사항"
              />
              <div onClick={onEdit}>공지사항</div>
            </Link>
          </div>

          <div className="mypage-button-group">
            <Link to="/delete-user">
              <button
                className="mypage-button"
                onClick={handleButtonDeleteUserClick}
              >
                회원탈퇴
              </button>
            </Link>
            <button className="mypage-button" onClick={handleButtonLogoutClick}>
              로그아웃
            </button>
          </div>
        </div>

        <div className="footer-container">
          <Footer />
        </div>
      </div>

      {/* ✅ 로딩 오버레이 (로딩 중일 때만 표시) */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>마이페이지 정보를 불러오는 중...</p>
        </div>
      )}
    </div>
  );
};

export default MyPage;
