import axios from "../../api/axios";

export const fetchStoreInfo = async (storeId) => {
  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    const response = await axios.get(`/stores/${storeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }); // Spring Boot의 유저 정보 API 호출

    return response.data; // 유저 정보 반환
  } catch (error) {
    console.error("Error fetching store info:", error);
    throw error;
  }
};
