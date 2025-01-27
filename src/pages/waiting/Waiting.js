import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import instance from "../../api/axios";
import Header from "../Header";
import "../css/Waiting.css"; // 분리된 CSS 파일 import

const Waiting = () => {
  const location = useLocation();
  const storeInfo = { ...location.state };
  const navigate = useNavigate();
  const [personnelCount, setPersonnelCount] = useState(1); // 기본 예약 인원 1명
  const [waitingType, setWaitingType] = useState(""); // 선택한 대기 타입

  // 예약 인원 증가
  const increaseGuestCount = () => setPersonnelCount((prev) => prev + 1);

  // 예약 인원 감소 (최소값 1)
  const decreaseGuestCount = () =>
    setPersonnelCount((prev) => Math.max(1, prev - 1));

  // 대기 타입 선택 토글 핸들러
  const handleWaitingTypeChange = (type) =>
    setWaitingType((prev) => (prev === type ? "" : type));

  const handleWaitingEnroll = async () => {
    if (!waitingType) {
      alert("대기 타입을 선택하세요.");
      return;
    }

    try {
      await instance.post(
        `/stores/${storeInfo.storeId}/waiting/online`,
        { personnelCount, waitingType }, // 예약 인원과 대기 타입 전달
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      navigate("/home");
    } catch (error) {
      console.error("Failed to fetch reservation details:", error);
      navigate("/home");
    }
  };

  // waitingTypeList가 존재하지 않을 경우 빈 배열로 처리
  const waitingTypeList = storeInfo.waitingTypeList || [];

  return (
    <div className="app">
      <div className="store-details-container">
        <Header />
        <div className="store-details">
          <div className="store-header">
            <h2 className="store-detail-name">{storeInfo.storeName}</h2>
          </div>
          <div className="store-detail-image-gallery">
            {storeInfo.storeImageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`store-image-${index}`}
                className="store-detail-image"
              />
            ))}
          </div>
          <div className="store-contents-info-title">
            <span>가게 설명</span>
            <p>{storeInfo.storeContents}</p>
          </div>

          {/* 예약 인원 */}
          <div className="guest-count-title">
            <p>예약 인원</p>
            <div className="guest-count-box">
              <div className="guest-count-container">
                <button
                  onClick={decreaseGuestCount}
                  className="guest-count-button-minus"
                >
                  −
                </button>
                <span className="guest-count">{personnelCount}</span>
                <button
                  onClick={increaseGuestCount}
                  className="guest-count-button-plus"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 대기 타입 선택 */}
          <div className="waiting-type-title">
            <p>대기 타입 선택</p>
          </div>
          <div className="waiting-type-options">
            {waitingTypeList.map((type, index) => (
              <button
                key={index}
                className={`waiting-type-button ${
                  waitingType === type ? "selected" : ""
                }`}
                onClick={() => handleWaitingTypeChange(type)}
              >
                {type === "TO_GO" ? "포장" : "매장"}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleWaitingEnroll}
          className="store-detail-reserve-button"
        >
          등록하기
        </button>
      </div>
    </div>
  );
};

export default Waiting;
