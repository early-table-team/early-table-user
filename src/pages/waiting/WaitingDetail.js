import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import instance from "../../api/axios";
import "../css/WaitingDetails.css";

const WaitingDetails = () => {
  const { waitingId } = useParams(); // URL에서 waitingId를 가져옴
  const navigate = useNavigate();
  const [waitingDetails, setWaitingDetails] = useState(null);
  const [waitingNow, setWaitingNow] = useState(null);

  useEffect(() => {
    // 웨이팅 상세 정보 가져오기
    const fetchWaitingDetails = async () => {
      try {
        const response = await instance.get(`/waiting/${waitingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setWaitingDetails(response.data);

        // 웨이팅 상태가 "PENDING"일 경우 현재 순서 및 예상 대기 시간 가져오기
        if (response.data.waitingStatus === "PENDING") {
          const waitingNowResponse = await instance.get(
            `/waiting/${waitingId}/now`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          setWaitingNow(waitingNowResponse.data);
        }
      } catch (error) {
        console.error("웨이팅 상세 정보를 가져오는 중 오류 발생:", error);
        navigate("/home");
      }
    };

    fetchWaitingDetails();
  }, [waitingId, navigate]); // waitingId와 navigate만 의존성 배열에 포함시킴

  const fetchWaitingCancel = async () => {
    try {
      const response = await instance.delete(
        `/waiting/${waitingId}/status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch reservation details:", error);
      navigate("/home");
    }
  };

  const fetchWaitinDelay = async () => {
    try {
      const response = await instance.patch(
        `/waiting/${waitingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      console.log(response.data);
    } catch (error) {
      console.error("Failed to fetch reservation details:", error);
      navigate("/home");
    }
  };

  const handleCancel = async () => {
    await fetchWaitingCancel();
    navigate("/orderlist");
  };

  const handleDefer = async () => {
    await fetchWaitinDelay();
    navigate("/orderlist");
  };

  const handleReview = () => {
    navigate(`/review/waiting/${waitingId}`);
  };

  if (!waitingDetails) {
    return <p>로딩 중...</p>;
  }

  return (
    <div className="app">
      <div className="store-details-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="waiting-details-container">
          <h2 className="waiting-store-name">{waitingDetails.storeName}</h2>
          <button
            className="view-store-button"
            onClick={() => navigate(`/store/${waitingDetails.storeId}`)}
          >
            웨이팅한 매장 자세히보기 &gt;
          </button>

          <div className="current-status">
            {waitingDetails.waitingStatus === "COMPLETED" && (
              <p className="status-message">입장이 완료되었습니다.</p>
            )}
            {waitingDetails.waitingStatus === "PENDING" && waitingNow && (
              <>
                <p className="status-title">현재 나의 순서 </p>
                <span className="waiting-status-message">
                  {waitingNow.sequence}
                </span>
                <span class="unit">번</span>
                <p>
                  예상 대기 시간
                  <p className="time-message">{waitingNow.estimatedTime}</p>
                </p>
              </>
            )}
            {waitingDetails.waitingStatus === "CANCELED" && (
              <p className="status-message">웨이팅이 취소되었습니다.</p>
            )}
          </div>

          <div className="waiting-info">
            <div className="waiting-info-row">
              <span>웨이팅 번호</span>
              <span>{waitingDetails.waitingNumber} 번</span>
            </div>
            <div className="waiting-info-row">
              <span>이용 방식</span>
              <span> {waitingDetails.waitingType}</span>
            </div>
            <div className="waiting-info-row">
              <span>총 입장 인원</span>
              <span> {waitingDetails.personnelCount} 명</span>
            </div>
          </div>
          <div class="party-info">
            함께 방문해요!(
            {Object.keys(waitingDetails.partyPeople).length}/
            {waitingDetails.personnelCount}명)
          </div>
          <div className="party-people">
            {waitingDetails.partyPeople.map((person, index) => (
              <div
                key={index}
                className="party-person"
                onClick={() => navigate(`/user/${person.userId}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={person.userImage}
                  alt={person.userName}
                  className="party-image"
                />
                <p>{person.userName}</p>
              </div>
            ))}
          </div>

          <div className="invition-button">
            {waitingDetails.waitingStatus === "PENDING" && (
              <>
                {/* 초대장 보내기 버튼 추가 */}
                <button
                  onClick={() => navigate(`/invitations/waiting/${waitingId}`)}
                >
                  + 초대장 보내기
                </button>
              </>
            )}
          </div>

          <div className="action-buttons">
            {waitingDetails.waitingStatus === "PENDING" && (
              <>
                <button onClick={() => navigate(-1)}>목록</button>
                <button onClick={handleCancel}>취소</button>
                <button onClick={handleDefer}>미루기</button>
              </>
            )}
            {waitingDetails.waitingStatus === "COMPLETED" && (
              <>
                <button onClick={() => navigate(-1)}>목록</button>
                <button onClick={handleReview}>리뷰 작성하기</button>
              </>
            )}
            {waitingDetails.waitingStatus === "CANCELED" && (
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

export default WaitingDetails;
