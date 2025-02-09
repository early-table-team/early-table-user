import axios from "../../api/axios";

export const fetchPartyRequestList = async () => {
  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    const response = await axios.get(`/receive/reservation/invitations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching reservation party request info:", error);
    throw error;
  }
};

export const fetchWaitingPartyRequestList = async () => {
  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    const response = await axios.get(`/receive/waiting/invitations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching waiting party request info:", error);
    throw error;
  }
};

export const updatePartyRequest = async (invitationId, status) => {
  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    const response = await axios.patch(
      `/receive/invitations/${invitationId}`,
      { status }, // 요청 본문에 상태 전달
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error updating party request:", error);
    throw error;
  }
};

export const fetchPartypeopleList = async (partyId) => {
  try {
    // JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    // partyId를 쿼리 파라미터로 전달
    const response = await axios.get(
      `/party`, // 엔드포인트
      {
        params: { partyId }, // 쿼리 파라미터로 전달
        headers: {
          Authorization: `Bearer ${token}`, // Authorization 헤더
        },
      }
    );
    return response.data; // 응답 데이터 반환
  } catch (error) {
    console.error("Error fetching party people list:", error); // 오류 메시지 출력
    throw error; // 오류 다시 던짐
  }
};

export const deletePartyPeopleOne = async (partyId, userId) => {
  try {
    // JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    // partyId를 쿼리 파라미터로 전달
    const response = await axios.delete(
      `/party/partyPeople/users/${userId}`, // 엔드포인트
      {
        params: { partyId }, // 쿼리 파라미터로 전달
        headers: {
          Authorization: `Bearer ${token}`, // Authorization 헤더
        },
      }
    );
  } catch (error) {
    console.error("Error fetching party people list:", error); // 오류 메시지 출력
    throw error; // 오류 다시 던짐
  }
};

export const deleteEveryPartyPeople = async (partyId) => {
  try {
    // JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    // partyId를 쿼리 파라미터로 전달
    const response = await axios.delete(
      `/party/partyPeople/users`, // 엔드포인트
      {
        params: { partyId }, // 쿼리 파라미터로 전달
        headers: {
          Authorization: `Bearer ${token}`, // Authorization 헤더
        },
      }
    );
  } catch (error) {
    console.error("Error fetching party people list:", error); // 오류 메시지 출력
    throw error; // 오류 다시 던짐
  }
};

export const sendPartyRequest = async (userId, reservationId) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await axios.post(
      `/invitations/reservation/users/${userId}`,
      null, // 본문(body)은 비워둡니다.
      {
        params: { reservationId }, // reservationId를 쿼리 파라미터로 전달
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // 서버의 응답을 반환
  } catch (error) {
    console.error("Error sending party request:", error); // 오류 메시지 출력
    throw error; // 오류 다시 던짐
  }
};

export const sendPartyRequestFromWaiting = async (userId, waitingId) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await axios.post(
      `/invitations/waiting/users/${userId}`,
      null, // 본문(body)은 비워둡니다.
      {
        params: { waitingId }, // reservationId를 쿼리 파라미터로 전달
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // 서버의 응답을 반환
  } catch (error) {
    console.error("Error sending party request:", error); // 오류 메시지 출력
    throw error; // 오류 다시 던짐
  }
};

export const leaveParty = async (partyId) => {
  try {
    // JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    // partyId를 쿼리 파라미터로 전달
    const response = await axios.delete(
      `receive/invitations/${partyId}`, // 엔드포인트
      {
        // 쿼리 파라미터로 전달
        headers: {
          Authorization: `Bearer ${token}`, // Authorization 헤더
        },
      }
    );
  } catch (error) {
    console.error("Error fetching party people list:", error); // 오류 메시지 출력
    throw error; // 오류 다시 던짐
  }
};
