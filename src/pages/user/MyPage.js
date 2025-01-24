import React, { useState,useEffect  } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Header from "../Header";
import Footer from "../Footer";
import "../css/MyPage.css";
import { fetchUserInfo } from "./userService";
//import "./css/Register.css"; /////수정//

const MyPage = ({ onEdit }) => {
    const navigate = useNavigate(); // useNavigate 훅 초기화

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
          <div className="mypage-div">
            <h2 className="section-title">
              {user.nickname}님 <button>화살표버튼</button>
            </h2> 
        
            <div>이용 예정인 내역이 없어요..</div>
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
            <Link to="/party">
            <div onClick={onEdit} style={{ marginTop: "10px" }}>
              모임 관리
            </div>
            </Link>
            <br></br>
            <br></br>
          </div>
          <div className="mypage-div">
            <h2 className="section-title">서비스 안내</h2>
            <Link to="/notice">
            <div onClick={onEdit} style={{ marginTop: "10px" }}>
              공지사항
            </div>
            </Link>
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