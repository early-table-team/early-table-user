import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../../api/axios"; // axios 인스턴스
import Header from "../Header";
import "../css/StoreDetails.css";

const StoreDetails = () => {
  const [storeDetails, setStoreDetails] = useState(null); // 상태 변수
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const { storeId } = useParams(); // URL 파라미터로 storeId 받기
  const navigate = useNavigate();

  useEffect(() => {
    // JWT 토큰 확인
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login"); // 로그인 페이지로 리다이렉트
    } else {
      const fetchStoreDetails = async () => {
        try {
          const response = await instance.get(`/stores/${storeId}`, {
            headers: {
              Authorization: `Bearer ${token}`, // 토큰 포함
            },
          });
          setStoreDetails(response.data); // 받은 데이터 상태에 저장
          setLoading(false); // 로딩 완료
        } catch (error) {
          setError("가게 정보를 가져오는 데 실패했습니다."); // 에러 처리
          setLoading(false); // 로딩 완료
        }
      };

      fetchStoreDetails();
    }
  }, [storeId, navigate]);

  // 로딩 중일 때 표시할 내용
  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 에러가 있을 때 표시할 내용
  if (error) {
    return <div>{error}</div>;
  }

  // 가게 정보가 없을 때 표시할 내용
  if (!storeDetails) {
    return <div>가게 정보가 없습니다.</div>;
  }

  // storeDetails에서 필요한 정보 추출
  const {
    storeName,
    storeTel,
    storeContents,
    storeAddress,
    storeCategory,
    ownerName,
    storeImageUrlMap,
    starPoint,
    reviewCount,
  } = storeDetails;

  // 이미지 URL 순서대로 가져오기
  const imageUrls = Object.keys(storeImageUrlMap).map(
    (key) => storeImageUrlMap[key]
  );

  const handleReserveClick = () => {
    // 예약하기 버튼 클릭 시 예약 화면으로 이동 또는 기능 구현
    navigate(`/reserve/${storeId}`);
  };

  return (
    <div className="app">
      <div className="store-details-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="store-details">
          <h2 className="store-details-name">{storeName}</h2>

          {/* 가게 이미지들 표시 */}
          <div className="store-image-gallery">
            {imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`store-image-${index}`}
                className="store-details-image"
              />
            ))}
          </div>

          <p className="store-description">{storeContents}</p>

          <div className="store-info">
            <p>전화번호: {storeTel}</p>
            <p>주소: {storeAddress}</p>
            <p>카테고리: {storeCategory}</p>
            <p>사장님: {ownerName}</p>
            <p>평점: {starPoint}</p>
            <p>리뷰 수: {reviewCount}</p>
          </div>
        </div>
        {/* 예약하기 버튼 */}
        <div className="reserve-button-container">
          <button className="reserve-button" onClick={handleReserveClick}>
            예약하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreDetails;
