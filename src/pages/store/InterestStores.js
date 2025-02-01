import React, { useEffect, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import "../css/InterestStores.css";
import instance from "../../api/axios";
import { useNavigate } from "react-router-dom"; // useNavigate 사용
import Cookies from "js-cookie";

const InterestStores = () => {
  const [interestStores, setInterestStores] = useState([]);
  const navigate = useNavigate(); // useNavigate 훅을 사용

  useEffect(() => {
    const fetchInterestStores = async () => {
      let accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        const refreshToken = Cookies.get("refreshToken");

        try {
          const response = await instance.post(
            "/refresh",
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            }
          );

          accessToken = response.data.accessToken;
          localStorage.setItem("accessToken", accessToken);
        } catch (error) {
          console.error("Token refresh failed:", error);
          navigate("/login"); // 실패 시 로그인 페이지로 이동
          return;
        }
      }

      try {
        const response = await instance.get("/interests/stores", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setInterestStores(response.data.stores);
      } catch (error) {
        console.error("관심 가게 목록을 가져오는 데 실패:", error);

        if (error.response?.status === 401) {
          navigate("/login"); // 인증 실패 시 로그인 페이지로 이동
        }
      }
    };

    fetchInterestStores();
  }, [navigate]);

  const handleCardClick = (storeId) => {
    navigate(`/store/${storeId}`);
  };

  return (
    <div className="app">
      <div className="interest-stores-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="interest-stores">
          <p className="section-title">관심 가게 목록</p>
          {interestStores.length > 0 ? (
            interestStores.map((store) => (
              <div
                key={store.storeId}
                className="interest-store-card"
                onClick={() => handleCardClick(store.storeId)}
                style={{ cursor: "pointer" }}
              >
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
            <p>관심 가게가 없습니다.</p>
          )}
        </div>

        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default InterestStores;
