import axios from "axios";

// 🔹 Axios 인스턴스 생성
const instance = axios.create({
  baseURL: "https://api.earlytable.kr", // Spring Boot 서버 주소
  withCredentials: true, // 쿠키 포함 요청
});

// 🔹 액세스 토큰을 가져오는 함수
const getAccessToken = () => localStorage.getItem("accessToken");

// 🔹 요청 인터셉터: 헤더에 액세스 토큰 추가
instance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 리프레시 토큰을 사용해 새로운 액세스 토큰을 가져오는 함수
const refreshAccessToken = async () => {
  try {
    const response = await instance.post(
      "/users/refresh",
      {},
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // HttpOnly 쿠키 포함
      }
    );

    const newAccessToken = response.data.accessToken;
    if (!newAccessToken) throw new Error("새로운 액세스 토큰 없음");

    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("❌ 리프레시 토큰 만료: 로그인 페이지로 이동");
    localStorage.removeItem("accessToken");
    window.location.href = "/login"; // 로그인 페이지로 리디렉션
    return null;
  }
};

// 🔹 응답 인터셉터: 401 응답 처리 (액세스 토큰 갱신 후 요청 재시도)
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 방지 플래그 설정

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest); // 요청 재시도
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
