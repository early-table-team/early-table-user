import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import instance from "../../api/axios";
import qs from "qs";
import Header from "../HeaderV2";
import Footer from "../Footer";

const SearchResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [requestData] = useState(location.state || {}); // 전달받은 데이터 초기화

  const [searchStores, setSearchStores] = useState([]);

  useEffect(() => {
    if (!requestData) {
      console.error("No data received!");
    }
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
    } else {
      const getStores = async (requestData) => {
        try {
          const response = await instance.get("/stores/search", {
            params: requestData,
            paramsSerializer: (params) =>
              qs.stringify(params, { arrayFormat: "repeat" }),
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response);
          setSearchStores(response.data);
        } catch (error) {
          console.error("검색 중 오류 발생:", error);
          alert("검색에 실패했습니다!");
        }
      };

      getStores(requestData);
    }
  }, [navigate, requestData]);

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
          <p className="section-title">검색 결과</p>
          {searchStores.length > 0 ? (
            searchStores.map((store) => (
              <div
                key={store.storeId}
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
                  <p className="interest-store-name">{store.storeName}</p>
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

export default SearchResult;
