import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // React Router 사용
import { useSSE } from "../SSEProvider.js"; // SSE Context 사용
import "./css/Header.css"; // CSS 파일 불러오기
import back from "../assets/preview.jpg"; // 로고 이미지 경로 설정

const HeaderV2 = () => {
  const navigate = useNavigate();
  const { messages } = useSSE(); // 전역 메시지 가져오기
  const [count, setCount] = useState(0);

  useEffect(() => {
    messages.forEach((message) => {
      if (message.type !== "STORE_VIEW" && message.type !== "INIT") {
        setCount((prevCount) => prevCount + 1); // 이전 카운트 기반으로 업데이트
      }
    });
  }, [messages]);

  return (
    <header>
      <div className="logo" onClick={() => navigate(-1)}>
        <img src={back} alt="Logo" style={{ height: "28px" }} />
      </div>
      <div className="nav">
        <Link to="/interest" className="login-link">
          <button>⭐</button>
        </Link>
        <Link to="/notification" className="login-link notification-icon">
          <button>🔔</button>
          {count > 0 && (
            <span className="notification-badge">{count}</span> // 카운트 표시
          )}
        </Link>
      </div>
    </header>
  );
};

export default HeaderV2;
