import React, { createContext, useEffect, useState, useContext } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import instance from "./api/axios"; // Axios 인스턴스
import { useNavigate } from "react-router-dom";

// SSE Context 생성
const SSEContext = createContext();

export const SSEProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const connectSSE = () => {
      const eventSource = new EventSourcePolyfill(
        "http://localhost:8080/notifications/subscribe",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken"),
          },
          withCredentials: true,
          heartbeatTimeout: 600000,
        }
      );

      eventSource.onopen = () => console.log("SSE 연결 성공");

      const handleMessage = (event) => {
        setMessages((prev) => [...prev, event]); // 메시지 추가
      };

      // 이벤트 타입마다 핸들러 추가
      const eventTypes = [
        "STORE_VIEW",
        "INIT",
        "PARTY",
        "RESERVATION",
        "WAITING",
        "FRIEND",
        "REVIEW",
        "NOTICE",
        "MESSAGE",
      ];

      eventTypes.forEach((type) =>
        eventSource.addEventListener(type, handleMessage)
      );

      eventSource.onerror = async (error) => {
        if (error.status === 401) {
          try {
            const response = await instance.post(
              "users/refresh",
              {},
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization:
                    "Bearer " + localStorage.getItem("accessToken"),
                },
                withCredentials: true,
              }
            );

            const newAccessToken = response.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);

            eventSource.close();
            connectSSE(); // 토큰 갱신 후 재연결
          } catch (err) {
            eventSource.close();
            navigate("/login");
          }
        } else {
          eventSource.close();
        }
      };

      return eventSource;
    };

    const eventSource = connectSSE();

    return () => {
      eventSource.close(); // 언마운트 시 연결 해제
    };
  }, [navigate]);

  // 메시지 초기화 메서드
  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <SSEContext.Provider value={{ messages, clearMessages }}>
      {children}
    </SSEContext.Provider>
  );
};

export const useSSE = () => useContext(SSEContext);
