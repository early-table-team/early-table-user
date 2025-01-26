import { useNavigate } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import instance from "../../api/axios";
import React, { useEffect, useState } from 'react';
import "../css/UpdateMyInfo.css"




const UpdateMyInfo = () => {

    const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅


    const [form, setForm] = useState({
        nickname: "",
        phoneNumber: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };


    function formatPhoneNumber(event) {
        const rawValue = event.target.value.replace(/[^0-9]/g, ""); // 숫자만 추출

        // 전화번호 포맷팅
        const formattedValue = rawValue
            .replace(/^(\d{3})(\d{4})(\d{1,4})$/, "$1-$2-$3") // 010-1234-5678
            .replace(/^(\d{3})(\d{1,4})$/, "$1-$2"); // 입력 중간 포맷팅

        // handleChange 호출 시 올바른 이벤트 객체 형식 전달
        handleChange({
            target: {
                name: "phoneNumber",  // 적절한 name 값
                value: formattedValue // 포맷팅된 전화번호 값
            }
        });
        
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("nickname", form.nickname);
        formData.append("phoneNumber", form.phoneNumber);

        try {
            await instance.put("/users", formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // multipart/form-data로 전송
                },
            });
            alert("정보 수정 완료");
            navigate("/myinfo");
        } catch (error) {
            alert("정보 수정에 실패했습니다.");
        }
    };



    return (
        <div className="app">
            <div className="info-container">
                <div className="header-container">
                    <Header />
                </div>

                <div className="info">
                    {/* 내 정보 섹션 */}
                    <div className="inputs-container">

                        <label
                            for="nickname"
                            className="info-title"
                        >닉네임</label>
                        <input
                            className="info-input"
                            type="text"
                            id="nickname"
                            name="nickname"
                            value={form.nickname}
                            onChange={handleChange}
                        />
                        <label
                            for="phoneNumber"
                            className="info-title"
                        >전화번호</label>
                        <input
                            className="info-input"
                            type="text"
                            id="phoneNumber"
                            name="phoneNumber"
                            maxlength="13"
                            value={form.phoneNumber}
                            onChange={(e) => {
                                handleChange(e); // 입력값 관리
                                formatPhoneNumber(e); // 포맷팅 처리
                            }}
                        />
                    </div>
                    {/* 버튼 섹션 */}

                    <button
                        className="buttons"
                        onClick={handleSubmit}
                    >저장</button>

                </div>
                <div className="footer-container">
                    <Footer />
                </div>
            </div>
        </div>
    );

};

export default UpdateMyInfo;