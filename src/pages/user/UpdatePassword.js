import { useNavigate } from "react-router-dom";
import Header from "../HeaderV2";
import Footer from "../Footer";
import instance from "../../api/axios";
import React, { useState } from "react";
import "../css/UpdatePassword.css";

const UpdatePassword = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅

  const [form, setForm] = useState({
    password: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleNewPwChange = (e) => {
    const { name, value } = e.target;

    // 상태 업데이트
    setForm((prevForm) => {
      const updatedForm = { ...prevForm, [name]: value };

      // 비밀번호 유효성 검증
      const resultElement = document.getElementById("result");
      if (validatePassword(updatedForm.newPassword)) {
        resultElement.textContent = "";
      } else {
        resultElement.textContent =
          "영문(대/소문자), 숫자, 특수문자를 포함하고 8자 이상이어야 합니다.";
      }

      return updatedForm;
    });
  };

  function validatePassword(password) {
    // 정규식 조건
    const hasUpperCase = /[A-Z]/.test(password); // 대문자 포함
    const hasLowerCase = /[a-z]/.test(password); // 소문자 포함
    const hasNumber = /[0-9]/.test(password); // 숫자 포함
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // 특수문자 포함
    const isValidLength = password.length >= 8; // 최소 8자 이상

    // 모든 조건 만족 여부 확인
    if (
      (hasUpperCase || hasLowerCase) &&
      hasNumber &&
      hasSpecialChar &&
      isValidLength
    ) {
      return true;
    } else {
      return false;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("password", form.password);
    formData.append("newPassword", form.newPassword);

    try {
      await instance.patch("/users/pw", formData, {
        headers: {
          "Content-Type": "application/json", // JSON으로 전송
        },
      });
      alert("비밀번호 변경 완료");
      navigate("/myinfo");
    } catch (error) {
      console.error("Error occurred:", error); // 에러 메시지 출력

      alert("비밀번호 변경에 실패했습니다.");
    }
  };

  return (
    <div className="app">
      <div className="password-container">
        <div className="header-container">
          <Header />
        </div>

        <div className="password">
          {/* 내 정보 섹션 */}
          <div className="inputs-container">
            <label for="password" className="password-title">
              기존 비밀번호
            </label>
            <input
              className="password-input"
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            <label for="newPassword" className="password-title">
              변경할 비밀번호
            </label>
            <input
              className="password-input"
              type="password"
              id="newPassword"
              name="newPassword"
              value={form.newPassword}
              onChange={handleNewPwChange}
            />
            <p id="result" className="result"></p>
          </div>
          {/* 버튼 섹션 */}

          <button className="buttons" onClick={handleSubmit}>
            저장
          </button>
        </div>
        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
