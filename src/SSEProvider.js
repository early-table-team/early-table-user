import React, { createContext, useEffect, useState, useContext } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import instance from "./api/axios"; // Axios 인스턴스
import { useNavigate } from "react-router-dom";

const SSEContext = createContext();

export const SSEProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false); // 🔹 토큰 갱신 여부
  const [retryCount, setRetryCount] = useState(0); // 🔹 재연결 횟수 카운트
  const navigate = useNavigate();

  useEffect(() => {
    let eventSource = null;

    // 🔹 1️⃣ 토큰 갱신 함수
    const getRefreshToken = async () => {
      if (isRefreshing) return false; // 중복 요청 방지
      setIsRefreshing(true);

      try {
        console.log("🔄 토큰 갱신 시도...");

        const response = await instance.post(
          "/users/refresh",
          {}, // body 없음
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true, // HttpOnly 쿠키 자동 전송
          }
        );

        const newAccessToken = response.data.accessToken;
        if (!newAccessToken) throw new Error("새로운 토큰 없음");

        localStorage.setItem("accessToken", newAccessToken);
        console.log("✅ 토큰 갱신 성공");
        return true;
      } catch (err) {
        console.log("❌ 토큰 갱신 실패, 로그인 페이지로 이동");
        navigate("/login");
        return false;
      } finally {
        setIsRefreshing(false);
      }
    };

    // 🔹 2️⃣ SSE 연결 함수
    const connectSSE = () => {
      eventSource = new EventSourcePolyfill(
        "http://localhost:8080/notifications/subscribe",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          withCredentials: true,
          heartbeatTimeout: 600000, // 10분
        }
      );

      eventSource.onopen = () => {
        console.log("✅ SSE 연결 성공");
        setRetryCount(0); // 🔹 재연결 횟수 초기화
      };

      const handleMessage = (event) => {
        setMessages((prev) => [...prev, event]);
      };

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

      // 🔹 3️⃣ SSE 에러 핸들러
      eventSource.onerror = async (error) => {
        console.log("❌ SSE 에러 발생:", error);

        eventSource.close(); // 기존 SSE 닫기

        // 🔹 401 에러 발생 시 토큰 갱신 후 재연결
        if (error.status === 401 || retryCount >= 3) {
          const success = await getRefreshToken();
          if (success) {
            console.log("🔄 SSE 재연결 시도...");
            connectSSE();
          }
        } else {
          // 🔹 기타 에러 발생 시 3초 후 재연결
          setTimeout(() => {
            setRetryCount(retryCount + 1);
            console.log(`🔄 SSE 재연결 (${retryCount + 1}번째 시도)`);
            connectSSE();
          }, 3000);
        }
      };

      // 🔹 4️⃣ 10분 후 자동 재연결
      setTimeout(() => {
        console.log("⏳ SSE 연결 시간 초과, 재연결 시도...");
        eventSource.close();
        connectSSE();
      }, 600000);
    };

    // 🔹 5️⃣ 초기 SSE 연결
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || accessToken === "undefined") {
      console.log("⚠️ 액세스 토큰 없음, 토큰 갱신 시도");
      getRefreshToken().then((success) => {
        if (success) connectSSE();
      });
    } else {
      connectSSE();
    }

    return () => {
      eventSource?.close(); // 언마운트 시 SSE 해제
    };
  }, [isRefreshing, retryCount, navigate]);

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <SSEContext.Provider
      value={{ messages, clearMessages: () => setMessages([]) }}
    >
      {children}
    </SSEContext.Provider>
  );
};

export const useSSE = () => useContext(SSEContext);
