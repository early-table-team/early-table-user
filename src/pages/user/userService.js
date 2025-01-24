import axios from "../../api/axios";

export const fetchUserInfo = async () => {

  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken"); // 로컬스토리지에 저장

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

