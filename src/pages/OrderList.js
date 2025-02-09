import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../pages/HeaderV2";
import Footer from "../pages/Footer";
import "../pages/css/OrderList.css";
import instance from "../api/axios";

const OrderList = () => {
  const [activeTab, setActiveTab] = useState("waiting"); // "waiting" or "reservation"
  const [data, setData] = useState({ waiting: [], reservation: [] }); // 두 개의 리스트 관리
  const [page, setPage] = useState({ waiting: 0, reservation: 0 }); // 각 탭별 페이지 관리
  const [hasMore, setHasMore] = useState({ waiting: true, reservation: true }); // 각 탭별 데이터 여부
  const [loading, setLoading] = useState(false); // 로딩 상태
  const observerRef = useRef(null); // IntersectionObserver를 위한 ref
  const navigate = useNavigate();

  // ✅ API 호출 함수
  const fetchList = useCallback(async () => {
    if (!hasMore[activeTab] || loading) return; // 더 가져올 데이터가 없거나 로딩 중이면 중단

    setLoading(true); // 요청 시작 시 로딩 상태로 설정

    try {
      const endpoint = activeTab === "waiting" ? "/waiting" : "/reservations";
      const response = await instance.get(endpoint, {
        params: { page: page[activeTab], size: 5 }, // 페이지네이션 적용
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const newData = response.data;
      setData((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], ...newData], // 기존 데이터 유지 + 새로운 데이터 추가
      }));

      if (newData.length < 5) {
        setHasMore((prev) => ({ ...prev, [activeTab]: false })); // 마지막 페이지 도달
      }
    } catch (error) {
      console.error("목록을 가져오는 중 오류 발생:", error);
    } finally {
      setLoading(false); // 로딩 완료 후 상태 해제
    }
  }, [activeTab, page, hasMore, loading]);

  // ✅ 데이터가 없을 때 fetchList 실행
  useEffect(() => {
    if (data[activeTab].length === 0) {
      fetchList(); // 현재 탭의 데이터가 없을 때만 요청
    }
  }, [activeTab, data, fetchList]);

  // ✅ 페이지 번호가 변경될 때마다 fetchList 호출
  useEffect(() => {
    if (page[activeTab] > 0) {
      fetchList(); // 페이지 번호가 증가할 때마다 새로운 데이터 요청
    }
  }, [page, activeTab, fetchList]);

  // ✅ 무한 스크롤 감지
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore[activeTab] && !loading) {
          console.log("📡 스크롤 끝에 도달, 페이지 증가");
          setPage((prev) => ({
            ...prev,
            [activeTab]: prev[activeTab] + 1, // 현재 탭의 페이지 증가
          }));
        }
      },
      { threshold: 0.1 } // 10% 보일 때 트리거
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [hasMore, activeTab, loading]);

  // ✅ 클릭 시 상세 페이지로 이동
  const handleItemClick = (item) => {
    if (activeTab === "waiting") {
      navigate(`/waiting/${item.waitingId}`);
    } else {
      navigate(`/reservation/${item.reservationId}`);
    }
  };

  // ✅ 리스트 렌더링
  const renderList = () => {
    const list = data[activeTab];

    if (list.length === 0) {
      return <p className="no-data-message">내역이 없습니다.</p>;
    }

    return (
      <div className="list-container">
        {list.map((item, index) => (
          <div
            key={index}
            className="list-item"
            onClick={() => handleItemClick(item)}
          >
            <div className="list-header">
              <span className="list-type">
                {activeTab === "waiting" ? item.waitingType : "예약"}
              </span>
              <span className="list-status">
                {activeTab === "waiting"
                  ? item.waitingStatus
                  : item.reservationStatus}
              </span>
            </div>
            <div className="list-content">
              <h3>{item.storeName}</h3>
              <p>{item.datetime}</p>
            </div>
          </div>
        ))}
        <div ref={observerRef} className="observer-trigger"></div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="list-page-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="tab-container">
          <button
            className={activeTab === "waiting" ? "active" : ""}
            onClick={() => setActiveTab("waiting")}
          >
            웨이팅
          </button>
          <button
            className={activeTab === "reservation" ? "active" : ""}
            onClick={() => setActiveTab("reservation")}
          >
            예약
          </button>
        </div>

        <div className="content-container">{renderList()}</div>

        <div className="footer-container">
          <Footer />
        </div>
      </div>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>예약/웨이팅 정보를 불러오는 중...</p>
        </div>
      )}
    </div>
  );
};

export default OrderList;
