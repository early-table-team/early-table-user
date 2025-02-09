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
  const [loading, setLoading] = useState(true);
  const { storeId } = useParams();
  const { messages } = useSSE(); // 전역 메시지 가져오기
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 현재 이미지 인덱스

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
        } finally {
          setLoading(false);
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

  // 이미지 슬라이드 로직
  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === imageUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  };

  const handleInterestClick = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const response = await instance.post(
        `/interests/stores/${storeId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert(response.data);
        navigate(`/store/${storeId}`); // 다시 가게 화면으로 이동
      }
    } catch (error) {
      alert("관심가게 등록에 실패했습니다.");
      console.error(error.response.data);
    }
  };

  if (error) return <div>{error}</div>;

  // storeDetails가 null이 아니고 loading이 false일 때만 구조 분해 할당을 수행
  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>가게 정보를 불러오는 중...</p>
      </div>
    );
  }

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

  const handleReservationClick = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      // 예약 가능 인원 체크 API 호출
      const response = await instance.post(
        `/${storeId}/request`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        navigate("/reservation", {
          // 예약 페이지로 이동
          state: {
            storeId: storeId,
            storeName: storeName,
            storeImageUrls: imageUrls,
            storeContents: storeContents,
          },
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        alert("예약 가능 인원이 초과되었습니다."); // TOO_MANY_REQUESTS(429) 처리
      } else {
        alert("예약 요청에 실패했습니다.");
      }
    }
  };

  return (
    <div className="app">
      <div className="store-details-container">
        <Header />
        <div className="store-details">
          {/* 캐러셀 배너 이미지 */}
          <div className="store-detail-image-gallery">
            {imageUrls?.length > 0 && (
              <img
                src={imageUrls[currentImageIndex]}
                alt={`store-image-${currentImageIndex}`}
                className="store-detail-image"
              />
            )}
            {/* 이전 버튼 */}
            <button className="carousel-button prev" onClick={goToPrevImage}>
              &#10094;
            </button>
            {/* 다음 버튼 */}
            <button className="carousel-button next" onClick={goToNextImage}>
              &#10095;
            </button>
          </div>
          <div className="store-view-count">
            <p>지금 {currentViewers}명이 보고 있어요</p>
          </div>
          <div className="store-header">
            <h2 className="store-detail-name">{storeName}</h2>
            {/* 관심가게 이모지 버튼 */}
            <button
              className="store-detail-interest-button"
              onClick={handleInterestClick}
            >
              ❤️
            </button>
          </div>
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
              onClick={handleReservationClick} // API 호출 후 이동
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
