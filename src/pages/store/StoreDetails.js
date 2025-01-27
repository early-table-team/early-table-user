import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../../api/axios";
import Header from "../Header";
import "../css/StoreDetails.css";

const StoreDetails = () => {
  const [storeDetails, setStoreDetails] = useState(null);
  const [error, setError] = useState(null);
  const { storeId } = useParams();
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
    }
  }, [storeId, navigate]);

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
    starPoint,
    reviewCount,
  } = storeDetails;

  const imageUrls = Object.keys(storeImageUrlMap).map(
    (key) => storeImageUrlMap[key]
  );

  return (
    <div className="app">
      <div className="store-details-container">
        <Header />
        <div className="store-details">
          {/* 가게 이름과 평점/리뷰 개수 */}
          <div className="store-header">
            <h2 className="store-detail-name">{storeName}</h2>
            <div
              className="store-review-info"
              onClick={() =>
                navigate(`/review`, { state: { storeId: storeId } })
              }
            >
              <span>⭐ {starPoint}</span>
              <span> 리뷰 {reviewCount}개 &gt;</span>
            </div>
          </div>
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
        {/* 버튼 렌더링 */}
        <div>
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
