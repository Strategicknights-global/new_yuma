import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const offers = [
  {
    text: (
      <>
      <span className="font-['Poppins'] font-sans text-[#ffffff] font-bold">20% OFF</span> <span className="font-['poppins'] font-bold text-[#000000] ">Your First Order! Use Code</span><span style={{color:"#ffffff",fontStyle:"bold",marginLeft:"4px"}}>FIRST20</span>
      </>
    ),
    link: "/products?offer=FIRST20",
  },
  {
    text: (
      <>
        <span className="font-['Poppins'] font-sans text-[#ffffff] font-bold">FREE SHIPPING</span> <span className="text-black">on Orders Over</span><span className="text-white"> ₹500! </span>
      </>
    ),
    link: "/products?offer=FREESHIP",
  },
  {
    text: (
      <>
       <span className="font-['Poppins'] font-sans text-[#ffffff] font-bold">Limited Time Offer!</span> Shop Now! 
      </>
    ),
    link: "/products?offer=LIMITEDTIME",
  },
];

const OfferBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ANIMATION_MS = 12000; 
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, ANIMATION_MS);
    return () => clearInterval(timer);
  }, [ANIMATION_MS]);

  return (
    <>
      <div className="w-full bg-[#57ba40] overflow-hidden fixed top-0 left-0 z-100 border-b border-green-200 h-14">
        <div
          key={currentIndex}
          className="marquee-item text-[#3D2817] font-['Poppins']  font-semibold text-lg"
        >
          <Link to={offers[currentIndex].link} className="inline-block px-4">
            {offers[currentIndex].text}
          </Link>
        </div>
      </div>

      <style>{`
        .marquee-item {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          white-space: nowrap;
          animation: slide ${ANIMATION_MS / 600}s linear forwards;
        }
        @keyframes slide {
          0%   { left: 100%; transform: translateY(-50%); }
          100% { left: -100%; transform: translateY(-50%); }
        }
      `}</style>
    </>
  );
};

export default OfferBanner;
