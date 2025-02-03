import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import Banner from "./Banner";
import CategoryCard from "./store/CategoryCard";
import StoreSlider from "./store/StoreSlider";
import "./css/Home.css";
import category1 from "../assets/category1.jpg";
import category2 from "../assets/category2.jpg";
import category3 from "../assets/category3.jpg";
import category4 from "../assets/category4.jpg";
import category5 from "../assets/category5.jpg";
import category6 from "../assets/category6.jpg";
import category7 from "../assets/category7.jpg";
import category8 from "../assets/category8.jpg";
import instance from "../api/axios";

const categories = [
  { name: "오마카세", image: category1 },
  { name: "애견동반", image: category2 },
  { name: "비건", image: category3 },
  { name: "혼밥", image: category4 },
  { name: "무한리필", image: category5 },
  { name: "새로오픈", image: category6 },
  { name: "파인다이닝", image: category7 },
  { name: "룸", image: category8 },
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
      if (!token || token === undefined) {
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

  const handleCardClick = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="home">
          {/* 캐러셀 배너 추가 */}
          <Banner />
          {/* 카테고리 섹션 */}
          <div className="categories-container">
            <h2 className="section-title">카테고리</h2>
            <div className="categories-grid">
              {categories.map((category, index) => (
                <CategoryCard key={index} category={category} />
              ))}
            </div>
          </div>

          <div className="gap-box"></div>

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
