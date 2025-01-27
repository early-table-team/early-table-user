import React, { useState,useEffect  } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../Header";
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

        if (loading) return <p>Loading...</p>; // 로딩 중일 때
        if (error) return <p>{error}</p>; // 에러가 발생했을 때

    
  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
            <Header />
          </div>
        <div className="home">
            <div className="sub-header-container">
                <Link to="/friends">
                <button className="back-button">◀</button>
                </Link>
                <div className="sub-header-text">유저 정보</div>
            </div>
          <div className="friend-info-container">
            <div className="medium-profileimage">
                <img
                  src={friend.imageUrl}
                  alt="프로필 이미지"
                />
            </div>
            <div>
                <h2>닉네임</h2>
                {friend.nickname}
            </div>
            <div>
                <h2>이메일</h2>
                {friend.email}
            </div>
            <div>
                <h2>휴대폰번호</h2>
                {friend.phoneNumber}
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