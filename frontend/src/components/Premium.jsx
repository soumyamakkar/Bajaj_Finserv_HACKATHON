import React from 'react'
import {pricing} from "../data"
import {PlanList} from "./index"

export default function Premium() {
const {icon,plans,title} =pricing
  return (
    <div>
        <section className="section" id ="pricing" >
        {/* section title */}
    
        <div className="section-title-group max-h-[540px] mx-auto px-4 lg:px-0 " data-aos="fade-up" data-aos-offset="200" data-aos-delay="200">
            <img src={icon} alt="pricing icon" />
            <h2 className="h2 section-title">
            {title}
            <span className="text-primary-200">.</span>
            </h2>
        </div>
        <div>
            <PlanList plans={plans}/>
        </div>
        </section>
    </div>
  )
}
