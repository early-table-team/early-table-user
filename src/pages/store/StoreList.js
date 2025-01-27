import React, { useEffect, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import instance from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const StoreList = () => {
  const location = useLocation();
  const { keyword } = location.state || {}; // 전달된 state를 가져옴
  const [KeywordStores, setInterestStores] = useState([]);
  const navigate = useNavigate(); // useNavigate 훅을 사용

  useEffect(() => {
    const fetchKewordStores = async () => {
      let accessToken = localStorage.getItem("accessToken");

      try {
        const response = await instance.get(
          "/stores/search/keywords",
          { keyword },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        setInterestStores(response.data.stores);
      } catch (error) {
        console.error("키워드 가게 목록을 가져오는 데 실패:", error);
      }
    };

    fetchKewordStores();
  }, [keyword, navigate]);

  return (
    <div className="app">
      <div className="interest-stores-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="interest-stores">
          <p className="section-title">{keyword}</p>
          {KeywordStores.length > 0 ? (
            KeywordStores.map((store) => (
              <div key={store.storeId} className="interest-store-card">
                <img
                  src={store.storeImageUrl}
                  alt={store.storeName}
                  className="interest-store-image"
                />
                <div className="interest-store-details">
                  <p className="interest-store-name">{store.storeName}</p>
                  <p className="interest-store-contents">
                    {store.storeContents.length > 10
                      ? `${store.storeContents.slice(0, 10)}...`
                      : store.storeContents}
                  </p>
                  <p className="interest-store-rating">
                    ⭐{store.averageRating} ({store.countReview})
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
