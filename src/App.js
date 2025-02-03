import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SSEProvider } from "./SSEProvider";
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
import OrderList from "./pages/OrderList";
import WaitingDetails from "./pages/waiting/WaitingDetail";
import ReservationDetails from "./pages/reservation/ReservationDetail";
import Waiting from "./pages/waiting/Waiting";
import Reservation from "./pages/reservation/Reservation";
import WriteReview from "./pages/store/WriteReview";
import StoreList from "./pages/store/StoreList";
import ModifyReview from "./pages/store/ModifyReview";
import SearchFilter from "./pages/SearchFilter";
import Reservation from "./pages/reservation/Reservation";
import SearchResult from "./pages/store/SearchStoreList";
import Notification from "./pages/Notification";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Register & Login은 SSEProvider 없이 렌더링 */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* 🔹 SSEProvider를 적용할 나머지 페이지들 */}
        <Route
          path="/*"
          element={
            <SSEProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/store/:storeId" element={<StoreDetails />} />
                <Route path="/stores/keyword" element={<StoreList />} />
                <Route path="/interest" element={<InterestStores />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/orderlist" element={<OrderList />} />
                <Route path="/waiting" element={<Waiting />} />
                <Route path="/notification" element={<Notification />} />
                <Route path="/reservation" element={<Reservation />} />
                <Route path="/review" element={<MyReview />} />
                <Route path="/review/write" element={<WriteReview />} />
                <Route path="/review/modify" element={<ModifyReview />} />
                <Route path="/friends" element={<MyFriend />} />
                <Route path="/delete-user" element={<DeleteUser />} />
                <Route path="/friends/users/:userId" element={<FriendInfo />} />
                <Route
                  path="/store/:storeId/reviews"
                  element={<StoreReviews />}
                />
                <Route path="/myinfo" element={<MyInfo />} />
                <Route path="/myinfo/password" element={<UpdatePassword />} />
                <Route path="/myinfo/info" element={<UpdateMyInfo />} />
                <Route
                  path="/waiting/:waitingId"
                  element={<WaitingDetails />}
                />
                <Route
                  path="/reservation/:reservationId"
                  element={<ReservationDetails />}
                />
                <Route path="/filter" element={<SearchFilter />} />
                <Route path="/searchResult" element={<SearchResult />} />
              </Routes>
            </SSEProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
