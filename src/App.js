import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import StoreDetails from "./pages/store/StoreDetails";
import InterestStores from "./pages/store/InterestStores";

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
      </Routes>
    </Router>
  );
}

export default App;
