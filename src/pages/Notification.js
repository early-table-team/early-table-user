import React, { useState, useEffect } from "react";
import { useSSE } from "../SSEProvider.js"; // SSE Context 사용
import Header from "../pages/HeaderV2";
import Footer from "../pages/Footer";
import "./css/Notification.css";

const Notification = () => {
  const { messages, clearMessages } = useSSE(); // 메시지 초기화 메서드 가져오기
  const [list, setList] = useState([]);

  useEffect(() => {
    if (messages.length > 0) {
      const filteredMessages = messages.filter(
        (msg) => msg.type !== "STORE_VIEW" && msg.type !== "INIT"
      );

      setList((prev) => [...prev, ...filteredMessages]);
      clearMessages(); // 메시지 초기화 호출
    }
  }, [messages, clearMessages]);

  return (
    <div className="app">
      <div className="list-page-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="notification">
          <p className="section-title">미확인 알림 내역</p>
          {list.length > 0 ? (
            list.map((item, index) => (
              <div key={index} className="notification-item">
                <div className="notification-content">
                  <p>{item.data}</p>
                </div>
              </div>
            ))
          ) : (
            <p>미확인 알림이 없습니다.</p>
          )}
        </div>
        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Notification;
