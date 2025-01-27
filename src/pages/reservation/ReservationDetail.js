import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import instance from "../../api/axios";
import Header from "../Header";
import Footer from "../Footer";
import "../css/ReservationDetails.css";

const ReservationDetails = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservationDetails, setReservationDetails] = useState(null);

  useEffect(() => {
    // Fetch reservation details
    const fetchReservationDetails = async () => {
      try {
        const response = await instance.get(`/reservations/${reservationId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setReservationDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch reservation details:", error);
        navigate("/home");
      }
    };

    fetchReservationDetails();
  }, [reservationId, navigate]);

  if (!reservationDetails) {
    return <p>로딩 중...</p>;
  }

  const handleReview = () => {
    navigate(`/review/write`, {
      state: {
        storeName: reservationDetails.storeName,
        targetId: reservationId,
        targetObject: "RESERVATION",
      },
    });
  };

  const handleModify = (item) => {
    navigate(`/reservation/${reservationId}/change`);
  };

  return (
    <div className="app">
      <div className="store-details-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="reservation-details-container">
          <h2 className="reservation-store-name">
            {reservationDetails.storeName}
          </h2>
          <button
            className="view-store-button"
            onClick={() => navigate(`/store/${reservationDetails.storeId}`)}
          >
            예약한 매장 자세히보기 &gt;
          </button>

          <div className="reservation-current-status">
            {reservationDetails.reservationStatus === "COMPLETED" && (
              <p className="reservation-status-message">
                예약이 완료되었습니다.
              </p>
            )}
            {reservationDetails.reservationStatus === "PENDING" && (
              <p className="reservation-status-message">
                예약이 설정되었습니다.
              </p>
            )}
            {reservationDetails.reservationStatus === "CANCELED" && (
              <p className="reservation-status-message">
                예약이 취소되었습니다.
              </p>
            )}
          </div>

          <div className="reservation-info">
            <div className="reservation-info-row">
              <span>예약 일시</span>
              <span>{reservationDetails.reservationDate}</span>
            </div>
            <div className="reservation-info-row">
              <span>입장 인원</span>
              <span> {reservationDetails.personnelCount} 명</span>
            </div>
          </div>

          <div className="menu-info">
            <h3>메뉴 정보</h3>
            <ul>
              {reservationDetails.menuList.map((menu) => (
                <li key={menu.menuId}>
                  {menu.menuName} - {menu.menuCount}개
                </li>
              ))}
            </ul>
          </div>

          <div className="reservation-party-info">
            함께 방문해요! ({reservationDetails.invitationPeople.length}/
            {reservationDetails.personnelCount}명)
          </div>
          <div className="reservation-party-people">
            {reservationDetails.invitationPeople.map((person, index) => (
              <div
                key={index}
                className="reservation-party-person"
                onClick={() => navigate(`/user/${person.userId}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={person.userImage}
                  alt={person.userName}
                  className="reservation-party-image"
                />
                <p>{person.userName}</p>
              </div>
            ))}
          </div>

          <div className="reservation-invition-button">
            {reservationDetails.reservationStatus === "PENDING" && (
              <>
                {/* 초대장 보내기 버튼 추가 */}
                <button
                  onClick={() =>
                    navigate(`/invitations/reservation/${reservationId}`)
                  }
                >
                  + 초대장 보내기
                </button>
              </>
            )}
          </div>

          <div className="reservation-action-buttons">
            {reservationDetails.reservationStatus === "PENDING" && (
              <>
                <button onClick={() => navigate(-1)}>목록</button>
                <button onClick={handleModify}>예약 변경</button>
              </>
            )}
            {reservationDetails.reservationStatus === "COMPLETED" && (
              <>
                <button onClick={() => navigate(-1)}>목록</button>
                <button onClick={handleReview}>리뷰 작성하기</button>
              </>
            )}
            {reservationDetails.reservationStatus === "CANCELED" && (
              <button onClick={() => navigate(-1)}>목록</button>
            )}
          </div>
        </div>
        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ReservationDetails;
