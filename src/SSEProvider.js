import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import instance from "./api/axios";
import { useNavigate } from "react-router-dom";

const SSEContext = createContext();

export const SSEProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const eventSourceRef = useRef(null); // SSE 연결을 저장하여 유지

  // ✅ 토큰 갱신 함수
  const getRefreshToken = async () => {
    if (isRefreshing) return false; // 중복 실행 방지
    setIsRefreshing(true);

    try {
      console.log("🔄 토큰 갱신 시도...");
      const response = await instance.post(
        "/users/refresh",
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
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

  // ✅ SSE 연결 함수
  const connectSSE = () => {
    if (eventSourceRef.current) {
      console.log("⚠️ 기존 SSE 연결이 존재하여 중복 연결 방지");
      return; // 이미 연결된 경우 새로 연결하지 않음
    }

    console.log("🔗 SSE 연결 시작...");
    eventSourceRef.current = new EventSourcePolyfill(
      "http://localhost:8080/notifications/subscribe",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        withCredentials: true,
        heartbeatTimeout: 600000, // 10분
      }
    );

    eventSourceRef.current.onopen = () => {
      console.log("✅ SSE 연결 성공");
      setRetryCount(0);
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
      eventSourceRef.current.addEventListener(type, handleMessage)
    );

    eventSourceRef.current.onerror = async (error) => {
      console.log("❌ SSE 에러 발생:", error);

      eventSourceRef.current?.close();
      eventSourceRef.current = null;

      if (error.status === 401 || retryCount >= 3) {
        const success = await getRefreshToken();
        if (success) {
          console.log("🔄 SSE 재연결 시도...");
          connectSSE();
        }
      } else {
        setTimeout(() => {
          setRetryCount(retryCount + 1);
          console.log(`🔄 SSE 재연결 (${retryCount + 1}번째 시도)`);
          connectSSE();
        }, 3000);
      }
    };

    setTimeout(() => {
      console.log("⏳ SSE 연결 시간 초과, 재연결 시도...");
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      connectSSE();
    }, 600000);
  };

  useEffect(() => {
    // ✅ 중복 실행 방지: SSE가 이미 연결되어 있으면 실행하지 않음
    if (!eventSourceRef.current) {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken || accessToken === "undefined") {
        console.log("⚠️ 액세스 토큰 없음, 토큰 갱신 시도");
        getRefreshToken().then((success) => {
          if (success) connectSSE();
        });
      } else {
        connectSSE();
      }
    }

    return () => {
      console.log("🛑 SSE 연결 해제");
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, []); // ⚠️ 의존성 배열을 빈 배열로 유지하여 최초 한 번만 실행됨

  return (
    <SSEContext.Provider
      value={{ messages, clearMessages: () => setMessages([]) }}
    >
      {children}
    </SSEContext.Provider>
  );
};

export const useSSE = () => useContext(SSEContext);
