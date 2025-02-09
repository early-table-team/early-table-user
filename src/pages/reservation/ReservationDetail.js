import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import instance from "../../api/axios";
import axios from "../../api/axios";
import Header from "../HeaderV2";
import Footer from "../Footer";
import "../css/ReservationDetails.css";
import {
  fetchPartypeopleList,
  deletePartyPeopleOne,
  deleteEveryPartyPeople,
  sendPartyRequest,
  leaveParty,
} from "../party/partyService";

const ReservationDetails = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservationDetails, setReservationDetails] = useState(null);
  const [partyDetails, setPartyDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserSearchModalOpen, setIsUserSearchModalOpen] = useState(false);
  const [searchType, setSearchType] = useState("nickname"); // 드롭다운 선택 값
  const [searchValue, setSearchValue] = useState(""); // 검색창 입력 값
  const [userList, setUserList] = useState([]); // 사용자 검색 결과 상태
  const [loginUser, setloginUser] = useState(); //로그인 사용자 정보

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

    //로그인한 사용자 정보 가져오기 (사용자 role에 따라 버튼 visible처리를 위함)
    const fetchLoginUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await instance.get("/users/mine", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }); // Spring Boot의 유저 정보 API 호출
        setloginUser(response.data);
      } catch (error) {
        console.error("로그인 유저 정보 가져오는 중 오류 발생", error);
      }
    };
    fetchLoginUserData();
  }, [reservationId, navigate]);

  if (!reservationDetails) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>예약 정보를 불러오는 중...</p>
      </div>
    );
  }

  const handleReview = () => {
    navigate(`/review/write`, {
      state: {
        storeName: reservationDetails.storeName,
        storeId: reservationDetails.storeId,
        targetId: reservationId,
        targetObject: "RESERVATION",
      },
    });
  };

  const handleCancel = async (reservationId) => {
    if (window.confirm("예약을 취소하시겠습니까?")) {
      try {
        await instance
          .patch(`/reservations/${reservationId}`)
          .then((success) => {
            if (success) {
              alert("예약이 취소되었습니다.");
              navigate("/home");
            } else {
              alert("예약 취소가 실패하였습니다.");
              navigate("/home");
            }
          });
      } catch (error) {
        alert("예약 취소가 실패하였습니다.");
        navigate("/home");
      }
    }
  };

  const handleSearch = async () => {
    const params = {
      nickname: searchType === "nickname" ? searchValue.trim() : null,
      email: searchType === "email" ? searchValue.trim() : null,
      phoneNumberBottom:
        searchType === "phoneNumberBottom" ? searchValue.trim() : null,
    };

    try {
      const response = await instance.get("/users/search", { params });
      setUserList(response.data);
    } catch (error) {
      console.error("검색 실패:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUserList([]); // 검색 결과 초기화
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
      const updatedReservationDetails = { ...reservationDetails };
      updatedReservationDetails.invitationPeople =
        updatedReservationDetails.invitationPeople.filter(
          (person) => person.userId !== userId
        );
      setReservationDetails(updatedReservationDetails);
    } catch (error) {
      // 서버에서 에러 메시지가 있는 경우
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
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

      //일행 목록 갱신
      await handleGetParty(partyId);

      // 예약자(대표자)는 남기고 나머지 사람들을 비우도록 처리
      const updatedReservationDetails = { ...reservationDetails };
      updatedReservationDetails.invitationPeople =
        updatedReservationDetails.invitationPeople.filter(
          (person) => person.partyRole === "REPRESENTATIVE" // 대표자만 남기고 모두 삭제
        );
      setReservationDetails(updatedReservationDetails);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // 서버에서 반환한 에러 메시지
        alert(`[전체 추방 실패]: ${error.response.data.message}`);
      } else {
        // 그 외의 에러 처리
        alert("전체 추방에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const sendPartyInvitation = async (userId, reservationId) => {
    try {
      await sendPartyRequest(userId, reservationId);
      console.log("초대 버튼 클릭됨", userId, reservationId);
      alert("파티 초대에 성공하였습니다.");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // 서버에서 반환한 에러 메시지
        alert(`[파티 초대 실패]: ${error.response.data.message}`);
      } else {
        // 그 외의 에러 처리
        alert("파티 초대에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleLeaveParty = async (partyId) => {
    try {
      await leaveParty(partyId);
      alert("파티 탈퇴 성공하였습니다.");
      navigate(`/orderlist`);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // 서버에서 반환한 에러 메시지
        alert(`[파티 탈퇴 실패]: ${error.response.data.message}`);
      } else {
        // 그 외의 에러 처리
        alert("파티 탈퇴에 실패했습니다. 다시 시도해주세요.");
      }
    }
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
              <span>
                {new Date(reservationDetails.reservationDate)
                  .toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false, // 24시간 형식
                  })
                  .replace(" ", "")
                  .replace(" ", " ")}
              </span>
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
                {person.userImage ? (
                  <img
                    className="reservation-party-image"
                    src={person.userImage}
                    alt="프로필 이미지"
                  />
                ) : (
                  <img
                    className="reservation-party-image"
                    src={require("../../assets/company-logo.png")}
                    alt="기본 프로필 이미지"
                  />
                )}
                <p>{person.userName}</p>
              </div>
            ))}
          </div>

          <div className="reservation-invition-button">
            {reservationDetails.reservationStatus === "PENDING" && (
              <>
                {reservationDetails.invitationPeople.some(
                  (person) =>
                    person.partyRole === "REPRESENTATIVE" &&
                    person.userId === loginUser.id
                ) ? (
                  <button
                    onClick={() => {
                      setIsModalOpen(true);
                      handleGetParty(reservationDetails.partyId);
                    }}
                  >
                    + 일행관리
                  </button>
                ) : (
                  <button
                    onClick={() => handleLeaveParty(reservationDetails.partyId)}
                  >
                    - 탈퇴하기
                  </button>
                )}
              </>
            )}
          </div>
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>일행관리</h2>
                <div>
                  {/* 예약자 출력 */}
                  {partyDetails.find(
                    (party) => party.partyRole === "REPRESENTATIVE"
                  ) && (
                    <p>
                      예약자:{" "}
                      {
                        partyDetails.find(
                          (party) => party.partyRole === "REPRESENTATIVE"
                        ).name
                      }
                    </p>
                  )}
                  {/* 일행 출력 (대표자 제외) */}
                  <p>일행: </p>
                  {partyDetails
                    .filter((party) => party.partyRole !== "REPRESENTATIVE") // 대표자 제외
                    .map((party, index) => (
                      <div className="search-list-item" key={index}>
                        <p>{party.name}</p>
                        <button
                          onClick={() =>
                            handleDeletePartyOne(
                              reservationDetails.partyId,
                              party.userId
                            )
                          }
                        >
                          추방
                        </button>
                      </div>
                    ))}

                  {partyDetails.filter(
                    (party) => party.partyRole !== "REPRESENTATIVE"
                  ).length === 0 && <p>일행이 없습니다.</p>}
                </div>
                <div>
                  <button
                    className="search-button"
                    onClick={() =>
                      handleDeleteEveryParty(reservationDetails.partyId)
                    }
                  >
                    전체추방
                  </button>
                  <button
                    className="search-button"
                    onClick={() => setIsUserSearchModalOpen(true)}
                  >
                    유저 찾기
                  </button>
                  <button className="search-button" onClick={closeModal}>
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}

          {isUserSearchModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>유저 찾기</h2>
                <div className="modal-search">
                  <select
                    value={searchType}
                    className="search-criteria-dropdown"
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <option value="nickname">닉네임</option>
                    <option value="email">메일</option>
                    <option value="phoneNumberBottom">전화번호(뒷자리)</option>
                  </select>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="search-user-input"
                  />
                  <button className="search-button" onClick={handleSearch}>
                    검색
                  </button>
                </div>
                <div className="modal-search-list">
                  {userList.length > 0 ? (
                    userList.map((user) => (
                      <div key={user.id} className="search-list-item">
                        <p>
                          {user.nickname} ({user.phoneNumberBottom})
                        </p>
                        <button
                          className="myfriend-button"
                          onClick={() => {
                            console.log("버튼 클릭됨", user.id, reservationId);
                            sendPartyInvitation(user.id, reservationId);
                          }}
                        >
                          일행 초대
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>검색 결과가 없습니다.</p>
                  )}
                </div>
                <button
                  className="search-button"
                  onClick={() => setIsUserSearchModalOpen(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          )}
          <div className="reservation-action-buttons">
            {reservationDetails.reservationStatus === "PENDING" && (
              <>
                <button onClick={() => navigate(-1)}>목록</button>
                <button onClick={() => handleCancel(reservationId)}>
                  예약 취소
                </button>
              </>
            )}
            {reservationDetails.reservationStatus === "COMPLETED" && (
              <>
                <button onClick={() => navigate(-1)}>목록</button>
                {!reservationDetails.exist && (
                  <>
                    <button onClick={handleReview}>리뷰 작성하기</button>
                  </>
                )}
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
