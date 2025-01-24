import React, { useState,useEffect  } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Header from "../Header";
import Footer from "../Footer";
import "../css/MyFriend.css";
//import "./css/Register.css"; /////수정//

const MyFriend = ({ onEdit }) => {

      // 상태로 현재 보여줄 div를 관리
  const [isDiv1Visible, setIsDiv1Visible] = useState(true);
  const [isDiv2Visible, setIsDiv2Visible] = useState(false);

  const [userinfo, setUserInfo] = useState(false);

  const toggleDiv1 = () => {
    setIsDiv1Visible(true); 
    setIsDiv2Visible(false); 
  };
  const toggleDiv2 = () => {
    setIsDiv1Visible(false); 
    setIsDiv2Visible(true); 
  };

    // 모달 창 표시 여부를 관리하는 상태
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 모달 열기
    const openModal = () => {
      setIsModalOpen(true);
    };
  
    // 모달 닫기
    const closeModal = () => {
      setIsModalOpen(false);
    };
    
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
                    <div onClick={toggleDiv1}>친구목록</div>
                    <div onClick={toggleDiv2}>친구요청</div>
            </div>
            <div>
                {isDiv1Visible ? (
                    <div className="myfriend-div-1">
                    친구목록들...
                    </div>
                ) : (
                    <div className="myfriend-div-2">
                    친구요청들...
                    </div>
                )}
                {isModalOpen && (
                    <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>유저찾기</h2>
                        <div className="modal-search">
                            <input
                            type="text"
                            placeholder="검색"
                            value={userinfo}
                            onChange={(e) => setUserInfo(e.target.value)}
                            className="search-user-input"
                            />
                            <button>돋보기버튼</button>
                        </div>
                        <div className="modal-search-list">
                            lists...
                        </div>
                        <button onClick={closeModal}>닫기</button>
                    </div>
                    </div>
                )}
            </div>
            <div>
                <button onClick={openModal}>플러스버튼</button>
            </div>
          </div>  
          
        </div>
        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );

}
export default MyFriend;