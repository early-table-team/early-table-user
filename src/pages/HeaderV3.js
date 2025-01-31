import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // React Router 사용
import { useSSE } from "../SSEProvider.js"; // SSE Context 사용
import "./css/HeaderV3.css"; // CSS 파일 불러오기
import back from "../assets/preview.jpg"; // 로고 이미지 경로 설정

const HeaderV3 = ({ navText , navLink }) => {
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
      <div className="logo" onClick={() => navigate(navLink)}>
        <img src={back} alt="Logo" style={{ height: "28px" }} />
      </div>
      <div className="nav">{navText}
      </div>
    </header>
  );
};

export default HeaderV3;
