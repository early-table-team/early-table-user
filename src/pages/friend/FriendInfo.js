import React, { useState,useEffect  } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Header from "../Header";
import Footer from "../Footer";
import "../css/MyFriend.css";
import { fetchUserInfo } from "../user/userService";

const FriendInfo = () => {

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

    
  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
            <Header />
          </div>
        <div className="home">
            <div>
                <Link to="/friends">
                <button>뒤로가기</button>
                </Link>
                유저 정보
            </div>
          <div className="friend-info-container">
            <div>
                <h2>닉네임</h2>
                {user.nickname}
            </div>
            <div>
                <h2>이메일</h2>
                {user.email}
            </div>
            <div>
                <h2>휴대폰번호</h2>
                {user.phone}
            </div>
          </div>  
          
        </div>
        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );

}
export default FriendInfo;