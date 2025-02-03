import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Header from "../HeaderV2";
import Footer from "../Footer";
import instance from "../../api/axios";
import "../css/WaitingDetails.css";
import { fetchPartypeopleList, deletePartyPeopleOne, deleteEveryPartyPeople, sendPartyRequestFromWaiting, leaveParty } from "../party/partyService";

const WaitingDetails = () => {
  const { waitingId } = useParams(); // URL에서 waitingId를 가져옴
  const navigate = useNavigate();
  const [waitingDetails, setWaitingDetails] = useState(null);
  const [waitingNow, setWaitingNow] = useState(null);
  const [partyDetails, setPartyDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserSearchModalOpen, setIsUserSearchModalOpen] = useState(false);
  const [searchType, setSearchType] = useState("nickname"); // 드롭다운 선택 값
  const [searchValue, setSearchValue] = useState(""); // 검색창 입력 값
  const [userList, setUserList] = useState([]);  // 사용자 검색 결과 상태

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
    navigate(-1);
  };

  const handleDefer = async () => {
    await fetchWaitinDelay();
    navigate(-1);
  };

  const handleReview = () => {
    navigate(`/review/write`, {
      state: {
        storeName: waitingDetails.storeName,
        storeId: waitingDetails.storeId,
        targetId: waitingId,
        targetObject: "WAITING",
      },
    });
  };

  if (!waitingDetails) {
    return <p>로딩 중...</p>;
  }

  const handleSearch = async () => {
    const params = {
      nickname: searchType === "nickname" ? searchValue.trim() : null,
      email: searchType === "email" ? searchValue.trim() : null,
      phoneNumberBottom: searchType === "phoneNumberBottom" ? searchValue.trim() : null,
    };

    try {
      const response = await axios.get("/users/search", { params });
      setUserList(response.data);
    } catch (error) {
      console.error("검색 실패:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUserList([]);  // 검색 결과 초기화
  };

  const handleGetParty = async (partyId) => {
    try {
      const response = await fetchPartypeopleList(partyId);
      setPartyDetails(response);
      console.log(response);
    } catch (error) {
      console.error("검색 실패:", error);
    }
  };

  const handleDeletePartyOne = async (partyId, userId) => {
    try {
      await deletePartyPeopleOne(partyId, userId);
      alert("파티원 추방에 성공하였습니다.");
      await handleGetParty(partyId);

       // reservationDetails의 invitationPeople을 갱신
      const updatedWaitingDetails = { ...waitingDetails };
      updatedWaitingDetails.invitationPeople = updatedWaitingDetails.invitationPeople.filter(
        (person) => person.userId !== userId
      );
      setWaitingDetails(updatedWaitingDetails);
    } catch (error) {
      // 서버에서 에러 메시지가 있는 경우
      if (error.response && error.response.data && error.response.data.message) {
        // 서버에서 반환한 에러 메시지
        alert(`[파티원 추방 실패]: ${error.response.data.message}`);
      } else {
        // 그 외의 에러 처리
        alert("파티원 추방에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleDeleteEveryParty = async (partyId) => {
    try {
      await deleteEveryPartyPeople(partyId);
      alert("전체 추방에 성공하였습니다.");
      console.log("1");
      //일행 목록 갱신
      await handleGetParty(partyId);
      console.log("2");
      // 예약자(대표자)는 남기고 나머지 사람들을 비우도록 처리
      const updatedWaitingDetails = { ...waitingDetails };
      updatedWaitingDetails.invitationPeople = updatedWaitingDetails.invitationPeople.filter(
        (person) => person.partyRole === "REPRESENTATIVE"  // 대표자만 남기고 모두 삭제
      );
      console.log("3");
      setWaitingDetails(updatedWaitingDetails);
      console.log("4");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        // 서버에서 반환한 에러 메시지
        alert(`[전체 추방 실패]: ${error.response.data.message}`);
      } else {
        // 그 외의 에러 처리
        alert("전체 추방에 실패했습니다. 다시 시도해주세요.");
      }
    }
  }

  const sendPartyInvitation = async (userId, waitingId) => {
    try {
      const response = await sendPartyRequestFromWaiting(userId, waitingId);
      console.log("초대 버튼 클릭됨", userId, waitingId);
      alert("파티 초대에 성공하였습니다.");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        // 서버에서 반환한 에러 메시지
        alert(`[파티 초대 실패]: ${error.response.data.message}`);
      } else {
        // 그 외의 에러 처리
        alert("파티 초대에 실패했습니다. 다시 시도해주세요.");
      }
    }
  }

    const handleLeaveParty = async (partyId) => {
      try {
        const response = await leaveParty(partyId);
        alert("파티 탈퇴 성공하였습니다.");
        navigate(`/orderlist`);
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          // 서버에서 반환한 에러 메시지
          alert(`[파티 탈퇴 실패]: ${error.response.data.message}`);
        } else {
          // 그 외의 에러 처리
          alert("파티 탈퇴에 실패했습니다. 다시 시도해주세요.");
        }
      }
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
          <div className="party-info">
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
                {person.userImage ? (
                  <img
                    className="party-image"
                    src={person.userImage}
                    alt="프로필 이미지"
                  />
                ) : (
                  <img
                    className="party-image"
                    src={require("../../assets/company-logo.png")}
                    alt="기본 프로필 이미지"
                  />)}
                <p>{person.userName}</p>
              </div>
            ))}
          </div>

          <div className="invition-button">
            {waitingDetails.waitingStatus === "PENDING" && (
              <>
                {/* 초대장 보내기 버튼 추가 */}
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    handleGetParty(waitingDetails.partyId);
                  }}
                >
                  + 일행관리
                </button>
                <button onClick={() => handleLeaveParty(waitingDetails.partyId)}>
                  - 탈퇴하기
                </button>
              </>
            )}
          </div>
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>일행관리</h2>
                <div>
                  {/* 예약자 출력 */}
                  {partyDetails.find((party) => party.partyRole === "REPRESENTATIVE") && (
                    <p>예약자: {partyDetails.find((party) => party.partyRole === "REPRESENTATIVE").name}</p>
                  )}
                  {/* 일행 출력 (대표자 제외) */}
                    <p>일행: </p>
                    {partyDetails
                      .filter((party) => party.partyRole !== "REPRESENTATIVE") // 대표자 제외
                      .map((party, index) => (
                        <div className="search-list-item" key={index}>
                          <p>{party.name}</p>
                          <button onClick={() => handleDeletePartyOne(waitingDetails.partyId, party.userId)}>추방</button>
                        </div>
                      ))}

                    {partyDetails.filter((party) => party.partyRole !== "REPRESENTATIVE").length === 0 && <p>일행이 없습니다.</p>}
                    <button onClick={() => handleDeleteEveryParty(waitingDetails.partyId)}>전체추방</button>
                </div>
                <button onClick={() => setIsUserSearchModalOpen(true)}>유저 찾기</button>
                <button onClick={closeModal}>닫기</button>
              </div>
            </div>
          )}

          {isUserSearchModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>유저 찾기</h2>
                <div className="modal-search">
                  <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="nickname">닉네임</option>
                    <option value="email">메일</option>
                    <option value="phoneNumberBottom">전화번호(뒷자리)</option>
                  </select>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <button onClick={handleSearch}>검색</button>
                </div>
                <div className="modal-search-list">
                  {userList.length > 0 ? (
                    userList.map((user) => (
                      <div key={user.id} className="search-list-item">
                        <p>{user.nickname} ({user.phoneNumberBottom})</p>
                        <button onClick={() => {
                          console.log("버튼 클릭됨", user.id, waitingId);
                          sendPartyInvitation(user.id, waitingId);
                        }}>일행 초대</button>
                      </div>
                    ))
                  ) : (
                    <p>검색 결과가 없습니다.</p>
                  )}
                </div>
                <button onClick={() => setIsUserSearchModalOpen(false)}>닫기</button>
              </div>
            </div>
          )}
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
                {!waitingDetails.exist && (
                  <>
                    <button onClick={handleReview}>리뷰 작성하기</button>
                  </>
                )}
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
