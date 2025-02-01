import axios from "../../api/axios";

export const fetchPartyRequestList = async () => {

    try {
      //JWT 토큰 가져오기
      const token = localStorage.getItem("accessToken");
  
      const response = await axios.get(`/receive/invitations`, {
        headers : {
          Authorization : `Bearer ${token}`,
        },
      });
  
      return response.data; 
    } catch (error) {
      console.error("Error fetching party request info:", error);
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












export const fetchFriend = async (userId) => {

  try {
    //JWT 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    const response = await axios.get(`/friends/users/${userId}`, {
      headers : {
        Authorization : `Bearer ${token}`,
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

    const response = await axios.get(`/friends`, {
      headers : {
        Authorization : `Bearer ${token}`,
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
  
      const response = await axios.get(`/friends/request`, {
        headers : {
          Authorization : `Bearer ${token}`,
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
  
      const response = await axios.delete(`/friends/users/${userId}`, {
        headers : {
          Authorization : `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error deleting friend:", error);
      throw error;
    }
  };

  export const updateFriendRequest = async (friendRequestId, invitationStatus) => {

    try {
      //JWT 토큰 가져오기
      const token = localStorage.getItem("accessToken");
  
      const response = await axios.patch(
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