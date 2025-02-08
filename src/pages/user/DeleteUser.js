import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "../../api/axios";
import Header from "../Header";
import Footer from "../Footer";
//import { fetchUserInfo } from "../../services/userService";

const DeleteUser = ({ onEdit }) => {
  const navigate = useNavigate(); // useNavigate 훅 초기화

  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      alert("비밀번호를 입력하세요.");
      return;
    }
    try {
      // 유저 삭제 API 호출
      const response = await instance
        .delete("/users", {
          data: { password },
        })
        .catch((error) => {
          console.log(error);
        });

      if (response.status === 200) {
        alert("탈퇴 성공");
        localStorage.removeItem("accessToken");
        navigate("/home"); // 홈 페이지로 이동
      } else {
        throw new Error("탈퇴 실패.");
      }
    } catch (error) {
      console.log(error);
      alert("탈퇴 실패!");
      navigate("/delete-user");
    }
  };

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="home">
          <div className="sub-header-container">
            <div>
              <Link to="/mypage">
                <button className="back-button">◀</button>
              </Link>
            </div>
            <div className="sub-header-text">회원 탈퇴</div>
          </div>
          <div className="deleteuser-container">
            <form onSubmit={handleSubmit} className="delete-user-form">
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="delete-user-input"
              />
              <div className="delete-user-button-group">
                <button type="submit" className="mypage-button">
                  회원탈퇴
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );
};
export default DeleteUser;
