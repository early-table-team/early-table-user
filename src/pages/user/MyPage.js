import React, { useState,useEffect  } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Header from "../Header";
import Footer from "../Footer";
import "../css/MyPage.css";
import { fetchUserInfo, fetchUserReservationCount } from "./userService";
//import "./css/Register.css"; /////수정//

const MyPage = ({ onEdit }) => {
    const navigate = useNavigate(); // useNavigate 훅 초기화

    const [user, setUser] = useState(null); // 유저 정보를 저장할 상태
    const [userReservationCount, setUserReservationCount] = useState(null);
        const [loading, setLoading] = useState(true); // 로딩 상태
        const [error, setError] = useState(null); // 에러 상태

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
        }, []); // 컴포넌트 마운트 시 한 번 실행
      
        if (loading) return <p>Loading...</p>; // 로딩 중일 때
        if (error) return <p>{error}</p>; // 에러가 발생했을 때

    const handleButtonDeleteUserClick = () => {
        navigate(`/users/delete-user`); // 
    };

    const token = localStorage.getItem("accessToken");
        
    const handleButtonLogoutClick = async () => {
        //navigate(`/users/logout`);
        try {
            await axios.post("/users/logout", {}, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
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
            <Header />
          </div>
        <div className="home">
          <div className="mypage-top-div">
            <h2 className="mypage-sub-header-container">
              <div className="little-profileimage">
                <img
                  src={user.imageUrl}
                  alt="프로필 이미지"
                />
              </div>
              <div>
              {user.nickname}님 </div>
              <button className="back-button"
                onClick={() => navigate("/myinfo")}
              >▶</button>
            </h2> 
        
            <div className="mypage-list-item">
              <h3>이용 예정 내역</h3>
              예약 | {userReservationCount.reservationCount} 건<br></br>
              웨이팅 | {userReservationCount.waitingCount} 건<br></br>
              <br />
              <Link to ="/home">
              <button className="mypage-button">매장 둘러보기</button>
              </Link>
            </div>
          </div>  
          <br></br>
          <br></br>
          <div className="mypage-div">
            <h2 className="section-title">이용 정보</h2>
            <Link to="/review">
            <div onClick={onEdit} style={{ marginTop: "10px" }}>
              내 리뷰 관리
            </div><br></br>
            </Link>
            <Link to="/friends">
            <div onClick={onEdit} style={{ marginTop: "10px" }}>
              친구 관리
            </div><br></br>
            </Link>
            <div onClick={onEdit} style={{ marginTop: "10px" }}>
              모임 관리
            </div>
            <br></br>
            <br></br>
          </div>
          <div className="mypage-div">
            <h2 className="section-title">서비스 안내</h2>
            <div onClick={onEdit} style={{ marginTop: "10px" }}>
              공지사항
            </div>
            <br></br>
            <br></br>
          </div>
          <div className="mypage-button-group">
            <Link to ="/delete-user">
            <button 
              className="mypage-button"
              onClick={() => handleButtonDeleteUserClick()} // 카드 클릭 이벤트 추가
              style={{ cursor: "pointer", marginTop: "10px" }} // 클릭 가능하게 스타일 추가
            >
              회원탈퇴
            </button>
            </Link>
            <button 
              className="mypage-button"
              onClick={() => handleButtonLogoutClick()} // 카드 클릭 이벤트 추가
              style={{ cursor: "pointer", marginTop: "10px" }} // 클릭 가능하게 스타일 추가
            >
              로그아웃
            </button>
          </div>
        </div>
        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );

}
export default MyPage;