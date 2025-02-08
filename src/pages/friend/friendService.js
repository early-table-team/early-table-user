import instance from "../../api/axios";

export const fetchFriend = async (userId) => {
  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    const response = await instance.get(`/friends/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // 유저 정보 반환
  } catch (error) {
    console.error("Error fetching friend user info:", error);
    throw error;
  }
};

export const fetchFriendList = async () => {
  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    const response = await instance.get(`/friends`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching friend info:", error);
    throw error;
  }
};

export const fetchFriendRequestList = async () => {
  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    const response = await instance.get(`/friends/request`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching friend request info:", error);
    throw error;
  }
};

export const deleteFriend = async (userId) => {
  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    await instance.delete(`/friends/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error deleting friend:", error);
    throw error;
  }
};

export const updateFriendRequest = async (
  friendRequestId,
  invitationStatus
) => {
  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    await instance.patch(
      `/friends/request/${friendRequestId}`,
      { invitationStatus }, // 요청 본문에 상태 전달
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error updating friend request:", error);
    throw error;
  }
};
