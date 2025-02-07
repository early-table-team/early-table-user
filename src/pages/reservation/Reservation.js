import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import instance from "../../api/axios";
import Header from "../Header";
import "../css/Reservation.css"; // 분리된 CSS 파일 import
import {
  addDays,
  format,
  startOfToday,
  isSameDay,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ko } from "date-fns/locale"; // 한국어 로케일

const Reservation = () => {
  const location = useLocation();
  const storeInfo = { ...location.state };
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜
  const today = startOfToday(); // 오늘 날짜
  const [restDates, setRestDates] = useState();
  const [reservationTimes, setReservationTimes] = useState();
  const [error, setError] = useState(null); // 에러 상태
  const token = localStorage.getItem("accessToken");
  const [menus, setMenus] = useState(null);
  const [isSelect1Visible, setSelect1Visible] = useState(true); // select1-container 보이게 하는 상태
  const [isSelect2Visible, setSelect2Visible] = useState(false); // select2-container 숨기기 상태
  const [isSelect3Visible, setSelect3Visible] = useState(false); // select2-container 숨기기 상태
  const [quantities, setQuantities] = useState([]);
  const [form, setForm] = useState({
    personnelCount: 1,
    reservationDate: "",
    menuList: [],
  });

  const bottomRefs = useRef([]);

  const scrollToBottom = (index) => {
    if (bottomRefs.current[index]) {
      bottomRefs.current[index].scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      const fetchStoreDetails = async () => {
        try {
          const response = await instance.get(
            `/stores/${storeInfo.storeId}/rest-date`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setRestDates(response.data);
        } catch (error) {
          setError("가게 정보를 가져오는 데 실패했습니다.");
        }
      };

      fetchStoreDetails();
    }
  }, [navigate, storeInfo.storeId]);

  useEffect(() => {
    if (selectedDate !== null && form.personnelCount !== null) {
      getDateTimes();
    }
  }, [selectedDate, form.personnelCount]);

  // 오늘 날짜와 요일 포맷팅
  const formattedToday = format(today, "yyyy년 MM월 dd일 (EEEE)", {
    locale: ko,
  });

  // 예약 인원 증가
  const increaseGuestCount = () => {
    handleChange({
      target: {
        name: "personnelCount",
        value: form.personnelCount + 1,
      },
    });

    scrollToBottom(0);
  };

  // 예약 인원 감소 (최소값 1)
  const decreaseGuestCount = () => {
    if (form.personnelCount > 1) {
      handleChange({
        target: {
          name: "personnelCount",
          value: form.personnelCount - 1,
        },
      });
    }
    scrollToBottom(0);
  };

  // 오늘부터 30일간의 날짜 생성
  const days = eachDayOfInterval({
    start: today,
    end: addDays(today, 29),
  });

  // 시작 날짜의 요일 확인
  const firstDayOfMonth = startOfWeek(today, { weekStartsOn: 0 }); // 주 시작일: 일요일
  const lastDayOfMonth = endOfWeek(addDays(today, 29), { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  // 전체 날짜 중 특정 요일 제거
  const filteredDays = calendarDays.filter(
    (day) => ![0, 3].includes(day.getDay()) // 일요일(0)과 수요일(3) 제외
  );

  // 날짜 클릭 핸들러
  const handleDateClick = async (date) => {
    scrollToBottom(0);

    setSelectedDate(date); // 클릭한 날짜를 상태로 저장

    handleChange({
      target: {
        name: "reservationDate",
        value: "",
      },
    });
  };

  const getDateTimes = async () => {
    // 날짜를 YYYY-MM-DD 형식으로 변환
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    try {
      const response = await instance.get(
        `/stores/${storeInfo.storeId}/reservations/total`,
        {
          params: {
            date: formattedDate,
            personnelCount: form.personnelCount,
          }, // LocalDate에 맞게 파라미터 전달
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 시간 순으로 정렬 (원본 데이터 유지)
      const sortedTimes = [...response.data].sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.reservationTime}Z`).getTime();
        const timeB = new Date(`1970-01-01T${b.reservationTime}Z`).getTime();
        return timeA - timeB; // 시간 순으로 오름차순 정렬
      });
      
      const timeMap = new Map();
      
      sortedTimes.forEach((item) => {
        if (!timeMap.has(item.reservationTime)) {
          // 해당 시간대가 처음이면 추가
          timeMap.set(item.reservationTime, item);
        } else {
          const existingItem = timeMap.get(item.reservationTime);
          // 기존 아이템의 remainTableCount가 0이고 새로운 것이 0보다 크면 교체
          if (existingItem.remainTableCount === 0 && item.remainTableCount > 0) {
            timeMap.set(item.reservationTime, item);
          }
        }
      });
      
      // Map을 배열로 변환
      const filteredTimes = Array.from(timeMap.values());
      
      console.log(filteredTimes);
      
      setReservationTimes(filteredTimes); // 정렬된 예약 시간 상태 업데이트
      
    } catch (error) {
      setError("가게 정보를 가져오는 데 실패했습니다."); // 에러 처리
    }
  };
  // 휴무일에 해당하는 날짜 비활성화
  const isHoliday = (date) =>
    (restDates?.restDates || []).some((holiday) =>
      isSameDay(date, new Date(holiday))
    );

  const getMenuList = async () => {
    try {
      const response = await instance.get(
        `/stores/${storeInfo.storeId}/menus`,
        {
          params: {
            personnelCount: form.personnelCount,
          }, // LocalDate에 맞게 파라미터 전달
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data);
      // 시간 순으로 정렬

      setMenus(response.data); // 정렬된 예약 시간 상태 업데이트
    } catch (error) {
      setError("가게 정보를 가져오는 데 실패했습니다."); // 에러 처리
    }
  };

  // 메뉴가 업데이트되면, 수량을 메뉴의 개수만큼 초기화
  useEffect(() => {
    if (menus?.length > 0) {
      setQuantities(new Array(menus?.length).fill(0)); // 모든 메뉴의 수량을 0으로 초기화
    }
  }, [menus]);

  const handleTimeClick = (time) => {
    var reservationDate = format(selectedDate, "yyyy-MM-dd") + "T" + time;
    handleChange({
      target: {
        name: "reservationDate",
        value: reservationDate,
      },
    });
  };

  const handleNextClick = () => {
    if (isSelect1Visible && form.reservationDate) {
      setSelect1Visible(false); // select1-container 숨기기
      setSelect2Visible(true); // select2-container 보이기
      setSelect1Visible(false); // select3-container 숨기기

      if (menus === null) {
        getMenuList();
      }
    } else if (isSelect1Visible) {
      alert("예약 일시를 선택해주세요.")

    } else if (isSelect2Visible && selectedDate && reservationTimes && quantities.reduce((sum, count) => sum + count, 0) != 0) {
      // updateMenuList();
      setReservation();
    } else if (isSelect2Visible) {
      alert("메뉴는 한 가지 이상 선택해야합니다.")
    }
  };

  const handlePrevClick = () => {
    if (isSelect2Visible) {
      // select2-container가 보이는 상태일 때는 handlePrevClick 호출
      setSelect1Visible(true);
      setSelect2Visible(false);
      setSelect3Visible(false);
    } else if (isSelect1Visible) {
      // select1-container가 보이는 상태일 때는 navigate 호출
      navigate(`/store/${storeInfo.storeId}`);
    }
  };

  // 메뉴 수량 증가
  const increaseQuantity = (index) => {
    const newQuantities = [...quantities];
    newQuantities[index] = newQuantities[index] + 1;
    setQuantities(newQuantities);
  };

  // 메뉴 수량 감소
  const decreaseQuantity = (index) => {
    const newQuantities = [...quantities];
    if (newQuantities[index] > 0) {
      newQuantities[index] = newQuantities[index] - 1;
      setQuantities(newQuantities);
    }
  };

  const setReservation = async () => {
    const menuList = menus
      .map((menu, index) => ({
        menuId: menu.menuId,
        menuCount: quantities[index] || 0, // 수량이 없으면 기본값 0
      }))
      .filter(item => item.menuCount > 0); // 수량이 0인 항목 제거

    const requestData = {
      personnelCount: form.personnelCount,
      reservationDate: form.reservationDate,
      menuList: menuList,
    };

    try {
      const response = await instance.post(
        `/stores/${storeInfo.storeId}/reservations`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);
      localStorage.setItem("tid", response.data.tid);
      localStorage.setItem("partnerOrderId", response.data.reservationId);
      localStorage.setItem("partnerUserId", response.data.userId);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const paymentUrl = response.data.paymentUrl; // 카카오페이 결제 URL

      // 📌 페이지 이동 방식으로 카카오페이 결제 진행
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("결제 요청 실패:", error);
      alert("결제 요청 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    scrollToBottom(0);
  }, [form.personnelCount]);

  useEffect(() => {
    if (form.personnelCount) {
      scrollToBottom(1);
    }
  }, [form.reservationDate]);

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pgToken = urlParams.get("pg_token");
    const tid = localStorage.getItem("tid");
    const partnerOrderId = localStorage.getItem("partnerOrderId");
    const partnerUserId = localStorage.getItem("partnerUserId");

    if (pgToken) {
      console.log("PG 토큰 확인:", pgToken);
      completePayment(pgToken, tid, partnerOrderId, partnerUserId);
    }
  }, []);

  const completePayment = async (
    pgToken,
    tid,
    partnerOrderId,
    partnerUserId
  ) => {
    console.log("결제 완료 요청 데이터:", {
      pgToken,
      tid,
      partnerOrderId,
      partnerUserId,
    });

    try {
      // 결제 승인 API 호출 (서버로 pgToken, tid, partnerOrderId, partnerUserId 전달)
      const response = await instance.post("/approve", null, {
        params: {
          tid,
          partnerOrderId,
          partnerUserId,
          pgToken,
        },
      });
      console.log("결제 승인 서버 응답:", response.data);
      alert("결제가 완료되었습니다!");

      // UI 상태 변경 (결제 완료 화면 표시)
      setPaymentSuccess(true);
    } catch (error) {
      console.error("결제 실패:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
    }
  };

  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    const messageListener = (event) => {
      if (event.origin !== window.location.origin) return; // 보안: 같은 도메인에서만 처리

      if (event.data.type === "paymentSuccess") {
        const { pgToken } = event.data.payload;
        const tid = localStorage.getItem("tid");
        const partnerOrderId = localStorage.getItem("partnerOrderId");
        const partnerUserId = localStorage.getItem("partnerUserId");

        // 결제 승인 요청
        completePayment(pgToken, tid, partnerOrderId, partnerUserId);
      }
    };

    window.addEventListener("message", messageListener);

    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, []);

  useEffect(() => {
    // 팝업에서 `pg_token`을 부모 창으로 전달하면 여기서 받음
    const messageListener = (event) => {
      if (event.origin !== window.location.origin) return; // 보안 체크

      if (event.data.type === "paymentSuccess") {
        console.log("결제 성공 데이터:", event.data.payload);
        setResponseData(event.data.payload); // 상태 업데이트
      }
    };

    window.addEventListener("message", messageListener);

    return () => {
      window.removeEventListener("message", messageListener);
    };
  }, []);

  return (
    <div className="app">
      <div className="store-details-container">
        <Header />
        <div className="store-details">
          <div className="store-header">
            <h2
              className="store-detail-name"
              style={{ display: isSelect3Visible ? "none" : "flex" }}
            >
              {storeInfo.storeName}
            </h2>
          </div>
          <div
            className="store-detail-image-gallery"
            style={{ display: isSelect3Visible ? "none" : "flex" }}
          ></div>
          <div
            className="store-contents-info-title"
            style={{ display: isSelect3Visible ? "none" : "flex" }}
          >
            <span>가게 설명</span>
            <p>{storeInfo.storeContents}</p>
          </div>

          {/* select1-container: 보이거나 숨기기 */}
          {isSelect1Visible && (
            <div className="select1-container">
              {/* 예약 인원 */}
              <div className="guest-count-title">
                <p>예약 인원</p>
                <div className="guest-count-box">
                  <div className="guest-count-container">
                    <button
                      onClick={decreaseGuestCount}
                      className="guest-count-button"
                    >
                      −
                    </button>
                    <span className="guest-count">{form.personnelCount}</span>
                    <button
                      onClick={increaseGuestCount}
                      className="guest-count-button"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 예약 일시 선택 */}
              <div className="calendar-title">
                <p>예약 일시</p>
              </div>

              {/* 달력 */}
              <div className="calendar">
                <div className="month-header">
                  {selectedDate
                    ? format(selectedDate, "yyyy년 MM월", { locale: ko }) // 선택된 날짜로 월 표시
                    : format(calendarDays[0], "yyyy년 MM월", {
                        locale: ko,
                      })}{" "}
                  {/* 첫 달이 기본 표시 */}
                </div>

                {/* 요일 헤더 */}
                <div className="calendar-header">
                  {["일", "월", "화", "수", "목", "금", "토"].map(
                    (day, index) => (
                      <div key={index} className="calendar-day-header">
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* 날짜 */}
                <div className="calendar-grid">
                  {calendarDays.map((day, index) => {
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(day)}
                        className={`calendar-day 
                          ${isSameDay(day, selectedDate) ? "selected" : ""} 
                          ${
                            !days.some((validDay) => isSameDay(day, validDay))
                              ? "disabled"
                              : ""
                          } 
                          ${isHoliday(day) ? "disabled" : ""} 
                          ${
                            restDates?.restWeekDay?.includes(day.getDay())
                              ? "disabled"
                              : ""
                          }`}
                        disabled={
                          !days.some((validDay) => isSameDay(day, validDay)) || // 30일 외 날짜 비활성화
                          isHoliday(day) || // 휴무일 비활성화
                          restDates?.restWeekDay?.includes(day.getDay()) // 특정 요일 비활성화
                        }
                      >
                        {format(day, "d")}
                      </button>
                    );
                  })}
                </div>

                <div
                  ref={(el) => (bottomRefs.current[0] = el)}
                  className="reservation-times"
                >
                  {reservationTimes?.map(
                    ({ reservationTime, remainTableCount }, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleTimeClick(reservationTime);
                        }}
                        className={`time-button ${
                          remainTableCount === 0 ? "disabled" : ""
                        } ${
                          form.reservationDate.includes(
                            reservationTime.slice(0, 5)
                          )
                            ? "selected"
                            : ""
                        }`}
                        disabled={
                          remainTableCount === 0 ||
                          form.reservationDate.includes(
                            reservationTime.slice(0, 5)
                          )
                        } // 이미 선택된 시간은 비활성화
                      >
                        {reservationTime}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* 선택된 날짜 표시 */}
              {form.reservationDate && (
                <div
                  className={`selected-date-info ${
                    form.reservationDate ? "" : "hidden"
                  }`}
                >
                  <p ref={(el) => (bottomRefs.current[1] = el)}>
                    {format(selectedDate, "yyyy년 MM월 dd일 (EE) ", {
                      locale: ko,
                    })}
                    {form.reservationDate
                      ? `${form.reservationDate.slice(
                          11,
                          13
                        )}시 ${form.reservationDate.slice(14, 16)}분`
                      : ""}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* select2-container: 보이거나 숨기기 */}
          {isSelect2Visible && (
            <div className="select2-container">
              <div className="menu-title">
                <p>메뉴</p>
                <div>
                  {menus?.map((menu, index) => (
                    <div key={index}>
                      <div>
                        <h4>{menu.menuName}</h4>
                        {menu.menuStatus === "RECOMMENDED" && (
                          <span className="recommended"> 추천!</span>
                        )}

                        {/* 수량 선택 */}
                        <div className="quantity-container">
                          <button onClick={() => decreaseQuantity(index)}>
                            −
                          </button>
                          <span className="menu-count">
                            {quantities[index]}
                          </span>
                          <button onClick={() => increaseQuantity(index)}>
                            +
                          </button>
                        </div>
                      </div>

                      <p className="price">
                        {menu.menuPrice.toLocaleString()} 원
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* select3-container: 보이거나 숨기기 */}
          {isSelect3Visible && (
            <div className="select3-container">
              <h4>예약이 완료되었습니다</h4>
              <p className="store-name">{storeInfo.storeName}</p>
              <p className="title">예약 인원</p>
              <span className="reservation-info">{form.personnelCount} 명</span>
              <p className="title">예약 일시</p>
              <span>
                {format(selectedDate, "yyyy년 MM월 dd일 (EE) ", { locale: ko })}
                {form.reservationDate
                  ? `${form.reservationDate.slice(
                      11,
                      13
                    )}시 ${form.reservationDate.slice(14, 16)}분`
                  : ""}
              </span>
            </div>
          )}

          <div
            className={`button-container ${
              isSelect1Visible ? "sticky" : "absolute"
            }`}
          >
            <button
              className={"prev-button"}
              style={{ display: isSelect3Visible ? "none" : "flex" }}
              onClick={handlePrevClick}
            >
              이전
            </button>

            <button
              className={"next-button"}
              style={{ display: isSelect3Visible ? "none" : "flex" }}
              onClick={handleNextClick}
            >
              {isSelect1Visible ? "다음" : "예약"}
            </button>

            <button
              className={"done-button"}
              style={{ display: isSelect3Visible ? "flex" : "none" }}
              onClick={() => navigate("/home")}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;
