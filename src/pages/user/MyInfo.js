import { useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import React, { useEffect, useState } from 'react';
import { fetchUserInfo } from "./userService";
import "../css/MyInfo.css"; // CSS 파일 불러오기
import "../../assets/company-logo.png"




const MyInfo = () => {
  const navigate = useNavigate(); // useNavigate 훅 초기화

  const goToInfo = () => {
    navigate("/myinfo/info");
  };

  const goToPassword = () => {
    navigate("/myinfo/password");
  };

  const [user, setUser] = useState(null); // 유저 정보를 저장할 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userData = await fetchUserInfo(); // API 호출
        setUser(userData); // 유저 정보 저장
      } catch (err) {
        setError("Failed to load user info.");
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    getUserInfo();

  }, []); // 컴포넌트 마운트 시 한 번 실행

  if (loading) return <p>Loading...</p>; // 로딩 중일 때
  if (error) return <p>{error}</p>; // 에러가 발생했을 때

  const ProfileImage = ({ imageUrl }) => {
    return (
      <div>
        {imageUrl ? (
          <img
            src=""
            alt="프로필 이미지"
            className="profile-image"
          />
        ) : (
          <img
            src={require("../../assets/company-logo.png")}
            alt="기본 프로필 이미지"
            className="profile-image"
          />)}
      </div>
    );
  };

  return (
    <div className="app">
      <div className="myinfo-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="myinfo">
          {/* 내 정보 섹션 */}
          <div className="categories-container">
            <div className="img-container">
              <ProfileImage imageUrl={user.imgUrl}></ProfileImage>
            </div>
            <h2 className="info-title">닉네임</h2>
            <p className="info-contents">{user.nickname}</p>

            <h2 className="info-title">이메일</h2>
            <p className="info-contents">{user.email}</p>

            <h2 className="info-title">휴대폰 번호</h2>
            <p className="info-contents">{user.phoneNumber}</p>

          </div>
          {/* 버튼 섹션 */}
          <div className="buttons-container">
            <button
              className="buttons"
              onClick={goToInfo}
            >내 정보 수정
            </button>

            <button
              className="buttons"
              onClick={goToPassword}
            >비밀번호 변경
            </button>
          </div>
        </div>

        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MyInfo;
