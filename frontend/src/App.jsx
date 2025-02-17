import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import pages
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import TwoFactor from "./pages/two-factor";
import Dashboard from "./pages/Dashboard";
import Profile from "./components/Profile";

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
      </Routes>
    </Router>
  );
};

export default App;
