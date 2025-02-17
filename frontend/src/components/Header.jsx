import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// import data
import { header } from "../data";

// import compenent
import { Nav, NavMobile } from "./index";

// import icons
import { RiMenu4Fill, RiCloseFill } from "react-icons/ri";

const Header = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [isActive, setIsAvtive] = useState(false);
  const [navMobile, setNavmobile] = useState(false);

  const { logo } = header;

  useEffect(() => {
    window.addEventListener("scroll", () => {
      window.scrollY > 80 ? setIsAvtive(true) : setIsAvtive(false);
    });
  }, []);

  // Function to handle login redirect
  const handleLogin = () => {
    navigate("/login"); // Redirect to login page
  };

  // Function to handle signup redirect
  const handleSignup = () => {
    navigate("/signup"); // Redirect to signup page
  };

  return (
    <header
      className={`${
        isActive ? "bg-neutral-500 py-[16px]" : "bg-transparent py-[20px]"
      } fixed max-w-[1440px] z-30 left-0 right-0 mx-auto 
    flex justify-between items-center px-[20px] lg:px-[80px] transition-all duration-300`}
    >
      {/* logo */}
      <a href="">
        <img src={logo} alt="logo" className="h-[30px]" />
      </a>
      {/* nav - initially hidden - show on desktop */}
      <Nav />
      {/* buttons - initially hidden - show on desktop */}
      <div className="hidden lg:flex space-x-4">
        <button className="btn btn-sm text-white" onClick={handleLogin}>Log in</button>
        <button className="btn btn-sm btn-primary" onClick={handleSignup}>Sign up</button>
      </div>
      {/* navmobile btn open and close - hidden on desktop */}
      {!navMobile ? (
        <div
          className="lg:hidden absolute right-4 cursor-pointer"
          onClick={() => setNavmobile(!navMobile)}
        >
          <RiMenu4Fill className="text-primary-200 text-3xl" />
        </div>
      ) : (
        <div
          className="lg:hidden absolute right-4 cursor-pointer"
          onClick={() => setNavmobile(!navMobile)}
        >
          <RiCloseFill className="text-primary-200 text-3xl" />
        </div>
      )}

      {/* nav mobile  - hide on desktop */}
      <NavMobile navMobile={navMobile} />
    </header>
  );
};

export default Header;
