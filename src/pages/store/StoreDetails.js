import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../../api/axios";
import Header from "../HeaderV2";
import { useSSE } from "../../SSEProvider.js"; // SSE Context 사용
import "../css/StoreDetails.css";

const StoreDetails = () => {
  const [storeDetails, setStoreDetails] = useState(null);
  const [error, setError] = useState(null);
  const [currentViewers, setCurrentViewers] = useState(0); // 실시간 조회자 수
  const { storeId } = useParams();
  const { messages } = useSSE(); // 전역 메시지 가져오기
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
    } else {
      const fetchStoreDetails = async () => {
        try {
          const response = await instance.get(`/stores/${storeId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStoreDetails(response.data);
        } catch (error) {
          setError("가게 정보를 가져오는 데 실패했습니다.");
        }
      };

      fetchStoreDetails();

      // 입장 시 API 호출
      const startView = async () => {
        try {
          await instance.post(
            `/stores/${storeId}/view/start`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (error) {
          console.error("입장 시 API 호출 실패", error);
        }
      };

      startView();

      // cleanup 시 퇴장 API 호출
      return () => {
        const stopView = async () => {
          try {
            await instance.post(
              `/stores/${storeId}/view/stop`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          } catch (error) {
            console.error("퇴장 시 API 호출 실패", error);
          }
        };

        stopView();
      };
    }
  }, [storeId, navigate]);

  // "STORE_VIEW" 메시지 처리
  useEffect(() => {
    messages.forEach((message) => {
      if (message.type === "STORE_VIEW" && message.data) {
        setCurrentViewers(message.data); // 실시간 조회자 수 업데이트
      }
    });
  }, [messages, storeId]);

  if (error) return <div>{error}</div>;
  if (!storeDetails) return <div>가게 정보가 없습니다.</div>;

  const {
    storeName,
    storeTel,
    storeContents,
    storeAddress,
    storeCategory,
    ownerName,
    storeImageUrlMap,
    storeTypeList,
    waitingTypeList,
    starPoint = 0, // 기본값 설정
    reviewCount = 0, // 기본값 설정
  } = storeDetails;

  const imageUrls = Object.keys(storeImageUrlMap).map(
    (key) => storeImageUrlMap[key]
  );

  return (
    <div className="app">
      <div className="store-details-container">
        <Header />
        <div className="store-details">
          <div className="store-detail-image-gallery">
            {imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`store-image-${index}`}
                className="store-detail-image"
              />
            ))}
          </div>
          <div className="store-view-count">
            <p>지금 {currentViewers}명이 보고 있어요</p>
          </div>
          <div className="store-header">
            <h2 className="store-detail-name">{storeName}</h2>
            <div
              className="store-detail-review-info"
              onClick={() =>
                navigate(`/store/${storeId}/reviews`, {
                  state: {
                    storeName: storeName,
                  },
                })
              }
            >
              <span>⭐ {starPoint}</span>
              <span> 리뷰 {reviewCount}개 &gt;</span>
            </div>
          </div>
          <div className="store-contents-info-title">
            <span>가게 설명</span>
            <p>{storeContents}</p>
          </div>
          <div className="store-detail-info">
            <div className="store-info-row">
              <span>전화번호</span>
              <p>{storeTel}</p>
            </div>
            <div className="store-info-row">
              <span>카테고리</span>
              <p>{storeCategory}</p>
            </div>
            <div className="store-info-row">
              <span>사장님</span>
              <p> {ownerName}</p>
            </div>
            <div className="store-info-row">
              <span>주소</span>
            </div>
            <div className="store-info-row">
              <p>{storeAddress}</p>
            </div>
          </div>
        </div>
        <div className="buttons-container">
          {storeTypeList.includes("RESERVATION") && (
            <button
              className="store-detail-reserve-button"
              onClick={() =>
                navigate("/reservation", {
                  state: {
                    storeId: storeId,
                    storeName: storeName,
                    storeImageUrls: imageUrls,
                    storeContents: storeContents,
                  },
                })
              }
            >
              예약하기
            </button>
          )}
          {storeTypeList.includes("REMOTE") && (
            <button
              className="store-detail-reserve-button"
              onClick={() =>
                navigate("/waiting", {
                  state: {
                    storeId: storeId,
                    storeName: storeName,
                    storeImageUrls: imageUrls,
                    storeContents: storeContents,
                    waitingTypeList: waitingTypeList,
                  },
                })
              }
            >
              웨이팅하기
            </button>
          )}
          {!storeTypeList.includes("RESERVATION") &&
            !storeTypeList.includes("REMOTE") &&
            (storeTypeList.length === 0 ||
              storeTypeList.includes("ONSITE")) && (
              <button className="store-detail-reserve-button disabled">
                현장 이용
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default StoreDetails;
