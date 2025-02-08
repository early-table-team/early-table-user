import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../pages/HeaderV2";
import Footer from "../pages/Footer";
import "../pages/css/OrderList.css";
import instance from "../api/axios";

const OrderList = () => {
  const [activeTab, setActiveTab] = useState("waiting"); // "waiting" or "reservation"
  const [waitingList, setWaitingList] = useState([]);
  const [reservationList, setReservationList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 웨이팅 목록 가져오기
    const fetchWaitingList = async () => {
      try {
        const response = await instance.get("/waiting", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        setWaitingList(response.data);
      } catch (error) {
        console.error("웨이팅 목록을 가져오는 중 오류 발생:", error);
      }
    };

    // 예약 목록 가져오기
    const fetchReservationList = async () => {
      try {
        const response = await instance.get("reservations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        setReservationList(response.data);
      } catch (error) {
        console.error("예약 목록을 가져오는 중 오류 발생:", error);
      }
    };

    fetchWaitingList();
    fetchReservationList();
  }, []);

  const handleItemClick = (item) => {
    if (activeTab === "waiting") {
      navigate(`/waiting/${item.waitingId}`);
    } else {
      navigate(`/reservation/${item.reservationId}`);
    }
  };

  const renderList = () => {
    const list = activeTab === "waiting" ? waitingList : reservationList;

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
    </div>
  );
};

export default OrderList;
