import React from "react";
import { Link } from "react-router-dom"; // React Router 사용
import "./css/Footer.css"; // CSS 파일 불러오기

const Footer = () => {
  return (
    <footer>
      <Link to="/home" className="login-link">
        <button>🏠</button>
      </Link>
      <Link to="/search" className="login-link">
        <button>🔍</button>
      </Link>
      <Link to="/orderlist" className="login-link">
        <button>📅</button>
      </Link>
      <Link to="/mypage" className="login-link">
        <button>🙍‍♂️</button>
      </Link>
    </footer>
  );
};

export default Footer;
