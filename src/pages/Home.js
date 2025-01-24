import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventSourcePolyfill } from "event-source-polyfill";
import Header from "./Header";
import Footer from "./Footer";
import CategoryCard from "./store/CategoryCard";
import StoreSlider from "./store/StoreSlider";
import "./css/Home.css";
import logoImage from "../assets/company-logo.png";
import instance from "../api/axios";

const categories = [
  { name: "오마카세", image: logoImage },
  { name: "애견동반", image: logoImage },
  { name: "비건", image: logoImage },
  { name: "혼밥", image: logoImage },
  { name: "무한리필", image: logoImage },
  { name: "새로오픈", image: logoImage },
  { name: "파인다이닝", image: logoImage },
  { name: "룸", image: logoImage },
];

const Home = () => {
  const [stores, setStores] = useState({});
  const [keywords] = useState([
    "웨이팅 핫플!",
    "혼자 먹어요",
    "새로 오픈했어요!",
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    // 가게 정보 가져오기
    const fetchStores = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
      } else {
        try {
          const storeData = await Promise.all(
            keywords.map(async (keyword) => {
              const response = await instance.get(
                `/stores/search/keywords?keyword=${keyword}`,
                {
                  headers: {
                    "content-type": "text",
                    Authorization:
                      "Bearer " + localStorage.getItem("accessToken"),
                  },
                }
              );
              const data = await response.data;
              return {
                [keyword]: data.map((store) => ({
                  id: store.storeId,
                  name: store.storeName,
                  image: store.imageUrl,
                  starPoint: store.starPoint,
                  reviewCount: store.reviewCount,
                  category: store.storeCategory,
                })),
              };
            })
          );

          const storesObject = storeData.reduce(
            (acc, data) => ({ ...acc, ...data }),
            {}
          );
          setStores(storesObject);
        } catch (error) {
          console.error("가게 정보 가져오기 실패:", error);
        }
      }
    };

    fetchStores();
  }, [keywords, navigate]);

  // SSE 연결
  useEffect(() => {
    const connectSSE = () => {
      const eventSource = new EventSourcePolyfill(
        "http://localhost:8080/notifications/subscribe",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("accessToken"),
          },
          withCredentials: true,
          heartbeatTimeout: 600000, // 타임아웃을 60초로 설정
        }
      );

      eventSource.onopen = () => {
        console.log("SSE 연결 성공");
      };

      eventSource.onmessage = (event) => {
        console.log("알림 또는 데이터:", event.data);
      };

      eventSource.addEventListener("FRIEND", (event) => {
        console.log("특정 메시지 수신:", event.data);
      });

      eventSource.addEventListener("INIT", (event) => {
        console.log("특정 메시지 수신:", event.data);
      });

      eventSource.onerror = async (error) => {
        // 에러 상태가 401이면 토큰을 갱신하려 시도
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

            if (response.status === 401) {
              navigate("/login");
            }

            const newAccessToken = response.data.accessToken;
            localStorage.setItem("accessToken", newAccessToken);

            // SSE를 다시 연결
            eventSource.close();
            connectSSE(); // 새 토큰으로 다시 연결 시도
          } catch (err) {
            eventSource.close();
            navigate("/login"); // 토큰 갱신 실패 시 로그인 화면으로 이동
          }
        } else {
          // 401이 아닌 다른 오류인 경우
          eventSource.close();
        }

        // SSE 연결 오류 시 재연결 시도 (재시도 간격: 5초)
        //setTimeout(() => {
        //  console.log("5초 후 SSE 재연결 시도");
        //  connectSSE(); // 재연결 시도
        //}, 5000);
      };

      return eventSource;
    };

    const eventSource = connectSSE();

    // cleanup function
    return () => {
      eventSource.close();
    };
  }, [navigate]);

  const handleCardClick = (store) => {
    navigate(`/store/${store.id}`, { state: { store } });
  };

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="home">
          {/* 카테고리 섹션 */}
          <div className="categories-container">
            <h2 className="section-title">카테고리</h2>
            <div className="categories-grid">
              {categories.map((category, index) => (
                <CategoryCard key={index} category={category} />
              ))}
            </div>
          </div>

          {/* 키워드별 추천 가게 섹션 */}
          {Object.keys(stores).map((keyword, index) => (
            <div key={index} className="stores-container">
              <h2 className="section-title">{keyword}</h2>
              <StoreSlider
                stores={stores[keyword]}
                handleCardClick={handleCardClick}
              />
            </div>
          ))}
        </div>

        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Home;
