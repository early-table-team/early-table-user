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
    if (
      response?.status === 401 ||
      !newAccessToken ||
      newAccessToken === "undefined"
    ) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login"; // 로그인 페이지로 리디렉션
    }

    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("❌ 리프레시 토큰 만료: 로그인 페이지로 이동");
    localStorage.removeItem("accessToken");
    window.location.href = "/login"; // 로그인 페이지로 리디렉션
    return null;
  }
};

const MAX_RETRY_COUNT = 2; // 최대 재시도 횟수

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0; // 재시도 횟수 초기화
    }

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      originalRequest._retryCount < MAX_RETRY_COUNT
    ) {
      originalRequest._retryCount += 1; // 재시도 횟수 증가

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest); // 요청 재시도
      }
    }

    return Promise.reject(error); // 최대 재시도 횟수를 초과하면 에러 반환
  }
);

export default instance;
