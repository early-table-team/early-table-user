import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import StoreDetails from "./pages/store/StoreDetails";
import InterestStores from "./pages/store/InterestStores";
import MyPage from "./pages/user/MyPage";
import MyReview from "./pages/user/MyReview";
import MyFriend from "./pages/friend/MyFriend";
import DeleteUser from "./pages/user/DeleteUser";
import FriendInfo from "./pages/friend/FriendInfo";
import StoreReviews from "./pages/store/StoreReviews";
import MyInfo from "./pages/user/MyInfo";
import UpdatePassword from "./pages/user/UpdatePassword";
import UpdateMyInfo from "./pages/user/UpdateMyInfo";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/store/:storeId" element={<StoreDetails />} />
        <Route path="/interest" element={<InterestStores />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/review" element={<MyReview />} />
        <Route path="/friends" element={<MyFriend />} />
        <Route path="/delete-user" element={<DeleteUser />} />
        <Route path="/friendsinfo" element={<FriendInfo />} />
        <Route path="/store/:storeId/reviews" element={<StoreReviews />} />
        <Route path="/myinfo" element={<MyInfo />} />
        <Route path="/myinfo/password" element={<UpdatePassword />} />
        <Route path="/myinfo/info" element={<UpdateMyInfo />} />
      </Routes>
    </Router>
  );
}

export default App;
