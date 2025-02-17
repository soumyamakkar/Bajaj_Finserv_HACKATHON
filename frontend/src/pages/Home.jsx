import React from "react";

import Aos from 'aos';
import 'aos/dist/aos.css';

// import components
import { About, Banner, Community, Faq, Footer, Header, Join, Pricing, Workouts } from "../components"

const Home = () => {
  
  // aos initialization
  Aos.init({
    duration:500,
    delay:400
  })
  return (
    <div className="mx-auto bg-page overflow-hidden relative">
      <Header />
      <Banner />
      <About />
      <Workouts />
      <Pricing />
      <Community />
      <Faq />
      <Join />
      <Footer />
    </div>
  );
};

export default Home;
