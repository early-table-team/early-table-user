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
  const navigate = useNavigate();
  const eventSourceRef = useRef(null);
  const SSE_MAX_RETRY = 1; // 최대 재연결 횟수
  let retryCount = 0;

  // 토큰 갱신 함수
  const getRefreshToken = async () => {
    if (isRefreshing) return false;
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

      console.log(newAccessToken);

      if (!newAccessToken || newAccessToken === "undefined") {
        navigate("/login");
        return false;
      }

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

  // SSE 연결 함수

  const connectSSE = () => {
    if (eventSourceRef.current) {
      console.log("⚠️ 기존 SSE 연결이 존재하여 중복 연결 방지");
      return;
    }

    console.log("🔗 SSE 연결 시작...");
    eventSourceRef.current = new EventSourcePolyfill(
      "https://api.earlytable.kr/notifications/subscribe",
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
      retryCount = 0; // 재연결 성공 시 카운트 초기화
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

      if (retryCount >= SSE_MAX_RETRY) {
        console.log("🚫 최대 재연결 횟수 초과, 로그인 페이지로 이동");
        localStorage.clear();
        navigate("/login");
        return;
      }

      retryCount++;

      // 401 에러 시 토큰 갱신 시도
      if (error?.status === 401) {
        console.log(`🔄 [${retryCount}/${SSE_MAX_RETRY}] 토큰 갱신 시도 중...`);
        const success = await getRefreshToken();
        if (success) {
          console.log("🔄 SSE 재연결 시도...");
          connectSSE();
        } else {
          console.log("❌ 토큰 갱신 실패, 로그인 페이지로 이동");
          localStorage.clear();
          navigate("/login");
        }
      } else {
        console.log("⏳ 5초 후 SSE 재연결 시도...");
        setTimeout(() => connectSSE(), 5000); // 일정 시간 후 재연결
      }
    };

    // 10분 후 자동 재연결
    setTimeout(() => {
      console.log("⏳ SSE 연결 시간 초과, 재연결 시도...");
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      connectSSE();
    }, 600000);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || accessToken === "undefined") {
      console.log("⚠️ 액세스 토큰 없음, 토큰 갱신 시도");
      getRefreshToken().then((success) => {
        if (success) {
          connectSSE();
        } else {
          navigate("/login");
        }
      });
    } else {
      connectSSE();
    }

    return () => {
      console.log("🛑 SSE 연결 해제");
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, []); // 최초 한 번만 실행

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
