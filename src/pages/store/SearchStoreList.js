import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import instance from "../../api/axios";
import qs from "qs";
import Header from "../HeaderV2";
import Footer from "../Footer";
import StoreName from "./StoreName";

const SearchResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [requestData] = useState(location.state || {}); // 전달받은 데이터 초기화
  const [searchStores, setSearchStores] = useState([]); // 가게 리스트
  const [page, setPage] = useState(1); // 현재 페이지 번호
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부
  const observer = useRef(null); // Intersection Observer 참조

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const getStores = async (pageNum) => {
      try {
        const response = await instance.get("/stores/search", {
          params: { ...requestData, page: pageNum, size: 10 }, // 페이지네이션 적용
          paramsSerializer: (params) =>
            qs.stringify(params, { arrayFormat: "repeat" }),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.length === 0) {
          setHasMore(false); // 더 이상 가져올 데이터 없음
        } else {
          setSearchStores((prevStores) => [...prevStores, ...response.data]); // 기존 데이터에 추가
        }
      } catch (error) {
        console.error("검색 중 오류 발생:", error);
        alert("검색에 실패했습니다!");
      }
    };

    getStores(page);
  }, [navigate, requestData, page]);

  // 무한 스크롤 감지 함수
  const lastStoreRef = useCallback(
    (node) => {
      if (!hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1); // 페이지 증가
        }
      });

      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

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
            searchStores.map((store, index) => (
              <div
                key={store.storeId}
                className="interest-store-card"
                onClick={() => handleCardClick(store.storeId)}
                style={{ cursor: "pointer" }}
                ref={index === searchStores.length - 1 ? lastStoreRef : null} // 마지막 요소 감지
              >
                <img
                  src={store.imageUrl}
                  alt={store.storeName}
                  className="interest-store-image"
                />
                <div className="interest-store-details">
                  <StoreName name={store.storeName} />
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
            <p>해당 검색에 해당하는 가게가 없습니다.</p>
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
