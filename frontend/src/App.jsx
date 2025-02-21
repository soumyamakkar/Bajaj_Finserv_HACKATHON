import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LeaderBoard from "./pages/LeaderBoard";
// Import pages
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import TwoFactor from "./pages/two-factor";
import Dashboard from "./pages/Dashboard";
import Profile from "./components/Profile";
// import Premium from "./components/Premium";
// import BicepCurlCounter from "./components/curl";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/two-factor" element={<TwoFactor/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path = "/profile" element = {<Profile/>}/>
        <Route path ="/leaderboard" element= {<LeaderBoard/>}/>
        {/* <Route path = "/premium-plan" element={<Premium/>}/> */}
        {/* <Route path = "/bicep-curl-counter" element={<BicepCurlCounter/>}/> */}
      </Routes>
    </Router>
  );
};

export default App;