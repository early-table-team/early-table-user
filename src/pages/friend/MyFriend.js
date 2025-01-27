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
  const [searchKeyword, setSearchKeyword] = useState("");
  const [userList, setUserList] = useState([]);  // 사용자 검색 결과 상태
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

    try {
      const response = await axios.get(
        `/users/search?searchKeyword=${searchKeyword}`,  // 쿼리 파라미터로 전달
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 검색 결과를 상태에 저장
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
    setSearchKeyword("");  // 검색어 초기화
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
          <div>
            <Link to="/mypage">
              <button>뒤로가기</button>
            </Link>
            친구 관리
          </div>
          <div className="myfriend-slide-div">
            <div className="myfriend-div-name">
              <div onClick={() => setIsDiv1Visible(true)}>친구목록</div>
              <div onClick={() => setIsDiv1Visible(false)}>친구요청</div>
            </div>
            <div>
              {isDiv1Visible ? (
                <div className="myfriend-div-1">
                  친구목록들...
                  {friendList.map((friend) => (
                    <li key={friend.userId} className="friendlist">
                      <Link to={`/friends/users/${friend.userId}`}>{friend.nickName}</Link>
                      <button onClick={() => handleButtonDeleteFriendClick(friend.userId)}>친구삭제</button>
                    </li>
                  ))}
                </div>
              ) : (
                <div className="myfriend-div-2">
                  친구요청들...
                  {friendRequestList.map((request) => (
                    <li key={request.friendRequestId} className="requestlist">
                      <Link to={`/friends/users/${request.sendUserId}`}>{request.sendUserId}</Link>
                      <button onClick={() => handleButtonUpdateFriendRequestClick(request.friendRequestId, 'ACCEPTED')}>수락</button>
                      <button onClick={() => handleButtonUpdateFriendRequestClick(request.friendRequestId, 'REJECTED')}>거절</button>
                    </li>
                  ))}
                </div>
              )}
              {isModalOpen && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h2>유저찾기</h2>
                    <div className="modal-search">
                      <input
                        type="text"
                        placeholder="닉네임,이메일,전화번호 뒷자리"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="search-user-input"
                      />
                      <button onClick={handleSearch}>검색</button>
                    </div>
                    <div className="modal-search-list">
                      {userList.length > 0 ? (
                        userList.map((user) => (
                          <Link to={`/friends/users/${user.id}`}>
                          <div key={user.id} className="search-result-item">
                            {user.nickname} ({user.phoneNumberBottom})
                            <button onClick={() => handleAddFriend(user.id)}>친구 요청</button>
                          </div>
                          </Link>
                        ))
                      ) : (
                        <p>검색 결과가 없습니다.</p>
                      )}
                    </div>
                    <button onClick={closeModal}>닫기</button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <button onClick={() => setIsModalOpen(true)}>플러스버튼</button>
            </div>
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
