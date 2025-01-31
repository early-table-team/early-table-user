import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import Header from "../Header";
import Footer from "../Footer";
import "../css/MyFriend.css";
import { fetchFriendList, fetchFriendRequestList, deleteFriend, updateFriendRequest } from "./friendService";

const MyFriend = () => {
  const [isDiv1Visible, setIsDiv1Visible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friendList, setFriendList] = useState([]);
  const [friendRequestList, setFriendRequestList] = useState([]);
  const [searchType, setSearchType] = useState("nickname"); // 드롭다운 선택 값
  const [searchValue, setSearchValue] = useState(""); // 검색창 입력 값
  const [userList, setUserList] = useState([]);  // 사용자 검색 결과 상태
  const [activeTab, setActiveTab] = useState("friend");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchFriendInfo = async () => {
      try {
        const friendListData = await fetchFriendList();
        setFriendList(friendListData);

        const friendRequestListData = await fetchFriendRequestList();
        setFriendRequestList(friendRequestListData);
      } catch (err) {
        setError("Failed to load friend info.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriendInfo();
  }, []);

  const handleSearch = async () => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

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

  const handleAddFriend = async (receivedUserId) => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
  
    try {
      const response = await axios.post(
        "/friends/request",  // 엔드포인트
        { receivedUserId },  // 요청 본문에 보낼 데이터
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // 성공적으로 친구 요청이 전송되었을 때
      console.log(response.data);
      alert("친구 요청 전송에 성공하였습니다.");
    } catch (error) {
      // 서버에서 에러 메시지가 있는 경우
      if (error.response && error.response.data && error.response.data.message) {
        // 서버에서 반환한 에러 메시지
        alert(`[친구요청 실패]: ${error.response.data.message}`);
      } else {
        // 그 외의 에러 처리
        alert("친구 요청 전송에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 모달 닫을 때 상태 초기화
  const closeModal = () => {
    setIsModalOpen(false);
    setUserList([]);  // 검색 결과 초기화
  };

  const handleButtonDeleteFriendClick = async (userId) => {
    try {
        await deleteFriend(userId);
        alert("친구삭제 성공");
        setFriendList(friendList.filter((friend) => friend.userId !== userId)); // 삭제된 친구 제거
      } catch (error) {
        alert("친구삭제 실패");
      }
};

const handleButtonUpdateFriendRequestClick = async (friendRequestId, invitationStatus) => {
  try {
    await updateFriendRequest(friendRequestId, invitationStatus);
    alert(`친구요청 ${invitationStatus === 'ACCEPTED' ? '수락' : '거절'} 성공`);

    // 친구 요청을 수락한 경우
    if (invitationStatus === 'ACCEPTED') {
      // 친구 요청 수락 후 친구 목록 갱신
      const acceptedRequest = friendRequestList.find(
        (request) => request.friendRequestId === friendRequestId
      );

      // 친구 목록에 추가
      if (acceptedRequest) {
        setFriendList((prevList) => [
          ...prevList,
          { userId: acceptedRequest.sendUserId, nickName: acceptedRequest.sendUserNickname },
        ]);
      }
    }

    // 친구 요청 목록에서 해당 요청 제거
    setFriendRequestList(friendRequestList.filter((request) => request.friendRequestId !== friendRequestId));
  } catch (error) {
    alert(`친구요청 ${invitationStatus === 'ACCEPTED' ? '수락' : '거절'} 실패`);
  }
};

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="home">
          <div className="sub-header-container">
            <Link to="/mypage">
              <button className = "back-button">◀</button>
            </Link>
            <div className="sub-header-text">친구 관리</div>
          </div>
          <div className="myfriend-slide-div">
            <div className="tab-container">
              <button 
              className={activeTab === "friend" ? "active" : ""}
              onClick={() => {
                setActiveTab("friend");
                setIsDiv1Visible(true);}
              }>
                친구목록
              </button>
              <button 
              className={activeTab === "request" ? "active" : ""}
              onClick={() => {
                setActiveTab("request");
                setIsDiv1Visible(false);}
              }>
                친구요청
              </button>
            </div>
            <div>
              {isDiv1Visible ? (
                <div className="myfriend-div-1">
                  <div className="list-container">
                  {friendList.map((friend) => (
                    <div className="friend-list-item">
                    <div key={friend.userId} className="friendlist">
                      <div className="little-profileimage">
                      <img
                        src={friend.profileImageUrl}
                        alt="프로필 이미지"
                      />
                      </div>
                      <Link to={`/friends/users/${friend.userId}`}>{friend.nickName}</Link>
                      <div className="myfriend-button-group">
                      <button 
                      className="myfriend-button"
                      onClick={() => handleButtonDeleteFriendClick(friend.userId)}>친구삭제</button>
                      </div>
                    </div>
                    </div>
                  ))}
                </div>
                </div>
                
              ) : (
                <div className="myfriend-div-2">
                  <div className="list-container">
                  {friendRequestList.map((request) => (
                    <div className="list-item">
                    <div key={request.friendRequestId} className="requestlist">
                      <div className="little-profileimage">
                      <img
                        src={request.profileImageUrl}
                        alt="프로필 이미지"
                      />
                      </div>
                      <Link to={`/friends/users/${request.sendUserId}`}>{request.sendUserNickname}</Link>
                      <div className="myfriend-button-group">
                      <button 
                      className="myfriend-button"
                      onClick={() => handleButtonUpdateFriendRequestClick(request.friendRequestId, 'ACCEPTED')}>수락</button>
                      <button 
                      className="myfriend-button"
                      onClick={() => handleButtonUpdateFriendRequestClick(request.friendRequestId, 'REJECTED')}>거절</button>
                      </div>
                    </div>
                    </div>
                  ))}
                </div>
                </div>
              )}
              {isModalOpen && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h2>유저찾기</h2>
                    <div className="modal-search">
                      <select 
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="search-criteria-dropdown"
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
                      <button 
                      className="search-button"
                      onClick={handleSearch}>검색</button>
                    </div>
                    <div className="modal-search-list">
                      {userList.length > 0 ? (
                        userList.map((user) => (
                          <div key={user.id} className="friend-list-item">
                          <Link to={`/friends/users/${user.id}`}>
                          <div className="little-profileimage">
                            <img
                              src={user.profileImageUrl}
                              alt="프로필 이미지"
                            />
                          </div>
                            {user.nickname} ({user.phoneNumberBottom})
                            </Link>
                            <button 
                            className="myfriend-button"
                            onClick={() => handleAddFriend(user.id)}>친구 요청</button>
                          </div>
                        ))
                      ) : (
                        <p>검색 결과가 없습니다.</p>
                      )}
                    </div>
                    <button 
                    className="search-button"
                    onClick={closeModal}>닫기</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="friend-button-container">
              <button 
              className="plus-button" 
              onClick={() => setIsModalOpen(true)}>+</button>
            </div>
        </div>
        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MyFriend;
