import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../HeaderV2";
import Footer from "../Footer";
import StoreName from "./StoreName";
import instance from "../../api/axios";

const StoreList = () => {
  const location = useLocation();
  const { keyword } = location.state; // 전달된 state를 가져옴
  const [keywordStores, setInterestStores] = useState([]);
  const navigate = useNavigate(); // useNavigate 훅을 사용
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKewordStores = async () => {
      let accessToken = localStorage.getItem("accessToken");

      try {
        const response = await instance.get(
          `/stores/search/keywords?keyword=${keyword}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setInterestStores(response.data);
      } catch (error) {
        console.error("키워드 가게 목록을 가져오는 데 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKewordStores();
  }, [keyword, navigate]);

  const handleCardClick = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>가게 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="interest-stores-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="interest-stores">
          <p className="section-title">{keyword}</p>
          {keywordStores.length > 0 ? (
            keywordStores.map((store) => (
              <div
                key={store.storeId}
                home-store-start
                className="interest-store-card"
                onClick={() => handleCardClick(store.storeId)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={store.imageUrl}
                  alt={store.storeName}
                  className="interest-store-image"
                />
                <div className="interest-store-details">
                  <p className="interest-store-name">
                    <StoreName name={store.storeName} />
                  </p>
                  <p className="interest-store-contents">
                    {store.storeContents.length > 10
                      ? `${store.storeContents.slice(0, 10)}...`
                      : store.storeContents}
                  </p>
                  <p className="interest-store-rating">
                    ⭐{store.starPoint} ({store.reviewCount})
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>해당 키워드의 가게가 없습니다.</p>
          )}
        </div>

        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default StoreList;
