import React from "react";
import { Link, useNavigate } from "react-router-dom"; // React Router 사용
import "./css/Header.css"; // CSS 파일 불러오기
import logoImage from "../assets/company-logo.png"; // 로고 이미지 경로 설정

const Header = () => {
  const navigate = useNavigate();

  return (
    <header>
      <div className="logo" onClick={() => navigate("/home")}>
        <img src={logoImage} alt="Logo" style={{ height: "40px" }} />
      </div>
      <div className="nav">
        <Link to="/interest" className="login-link">
          <button>⭐</button>
        </Link>
        <Link to="/notification" className="login-link">
          <button>🔔</button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
