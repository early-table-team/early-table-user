import React, { useState, useEffect } from "react";
import instance from "../../api/axios";
import Header from "../HeaderV3";
import Footer from "../Footer";
import "../css/MyFriend.css";
import { updatePartyRequest } from "./partyService";
import { fetchFriend } from "../friend/friendService";

const MyPartyRequest = () => {
  const [partyRequestList, setPartyRequestList] = useState([]);
  const token = localStorage.getItem("accessToken");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestInfo = async () => {
      try {
        const response = await instance.get("/receive/invitations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const partyRequestListWithUserName = await Promise.all(
          response.data.map(async (request) => {
            try {
              console.log(request.sendUserId);
              const userData = await fetchFriend(request.sendUserId);
              return { ...request, nickname: userData.nickname };
            } catch {
              return { ...request, nickname: "유저 정보 없음" };
            }
          })
        );

        setPartyRequestList(partyRequestListWithUserName);
        console.log("2차 완료");
      } catch (error) {
        // 서버에서 에러 메시지가 있는 경우
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          // 서버에서 반환한 에러 메시지
          alert(
            `Error fetching party request info.: ${error.response.data.message}`
          );
        } else {
          // 그 외의 에러 처리
          alert("Error fetching party request info.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequestInfo();
  }, []);

  const handleButtonUpdatePartyRequestClick = async (invitationId, status) => {
    try {
      await updatePartyRequest(invitationId, status);
      alert(`일행요청 ${status === "ACCEPTED" ? "수락" : "거절"} 성공`);

      // 일행 요청을 수락한 경우
      if (status === "ACCEPTED") {
        // 일행 요청 수락 후 일행 목록 갱신
        const acceptedRequest = partyRequestList.find(
          (request) => request.invitationId === invitationId
        );
      }

      // 일행 요청 목록에서 해당 요청 제거
      setPartyRequestList(
        partyRequestList.filter(
          (request) => request.invitationId !== invitationId
        )
      );
    } catch (error) {
      alert(
        `일행요청 ${status === "ACCEPTED" ? "수락" : "거절"} 실패: ${
          error.response.data.message
        }`
      );
    }
  };

  if (error) return <p>{error}</p>;

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header navText="일행 관리" navLink="/mypage" />
        </div>
        <div className="home">
          <div className="myfriend-div-2">
            <div className="list-container-myfriend">
              {partyRequestList
                .filter((request) => request.status === "PENDING")
                .map((request) => (
                  <div className="friend-list-item">
                    <div key={request.invitationId} className="friendlist">
                      <div className="party-content-box">
                        <span className="list-status">{request.source}</span>
                        <h3>{request.storeName}</h3>
                        <p>
                          {new Date(
                            request.reservationTime
                          ).toLocaleDateString()}{" "}
                          {new Date(
                            request.reservationTime
                          ).toLocaleTimeString()}
                        </p>
                        <p>초대 by {request.nickname}</p>
                      </div>
                      <div className="myfriend-button-group">
                        <button
                          className="myfriend-button-accepted"
                          onClick={() =>
                            handleButtonUpdatePartyRequestClick(
                              request.invitationId,
                              "ACCEPTED"
                            )
                          }
                        >
                          수락
                        </button>
                        <button
                          className="myfriend-button"
                          onClick={() =>
                            handleButtonUpdatePartyRequestClick(
                              request.invitationId,
                              "REJECTED"
                            )
                          }
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="footer-container">
          <Footer />
        </div>
      </div>
      {/* ✅ 로딩 중일 때만 오버레이 표시 */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>친구 정보를 불러오는 중...</p>
        </div>
      )}
    </div>
  );
};

export default MyPartyRequest;
