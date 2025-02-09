import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import instance from "../../api/axios"; // Axios 인스턴스 가져오기
import Header from "../Header";
import Footer from "../Footer";

const Processing = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pgToken = urlParams.get("pg_token");

    if (pgToken) {
      completePayment(
        pgToken,
        localStorage.getItem("tid"),
        localStorage.getItem("partnerOrderId"),
        localStorage.getItem("partnerUserId")
      );
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
      // ✅ 결제 승인 API 호출
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

      // ✅ 결제 성공 시 예약 상세 페이지로 이동
      navigate(`/reservation/${partnerOrderId}`);
    } catch (error) {
      console.error("결제 실패:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
      navigate("/home");
    }
  };

  return (
    <div className="app">
      <div className="home-container">
        <div className="header-container">
          <Header />
        </div>
        <div className="content-container">
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>⏳ 결제 승인 처리 중...</p>
          </div>
        </div>
        <div className="footer-container">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Processing;
