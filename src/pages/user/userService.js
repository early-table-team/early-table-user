import axios from "../../api/axios";

export const fetchUserInfo = async () => {

  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    const response = await axios.get("/users/mine", {
      headers : {
        Authorization : `Bearer ${token}`,
      },
    }); // Spring Boot의 유저 정보 API 호출

    return response.data; // 유저 정보 반환
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

export const fetchUserReservationCount = async () => {

  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    const response = await axios.get("/users/count", {
      headers : {
        Authorization : `Bearer ${token}`,
      },
    }); 

    return response.data; // 유저 정보 반환
  } catch (error) {
    console.error("Error fetching user reservation count info:", error);
    throw error;
  }
};

