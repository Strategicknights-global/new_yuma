import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const offers = [
  {
    text: (
      <>
        ⚡ <span className="text-red-600 font-bold">20% OFF</span> Your First Order! Use Code FIRST20
      </>
    ),
    link: "/products?offer=FIRST20",
  },
  {
    text: (
      <>
        🚚 <span className="text-blue-700 font-bold">FREE SHIPPING</span> on Orders Over ₹500! 🎉
      </>
    ),
    link: "/products?offer=FREESHIP",
  },
  {
    text: (
      <>
        ⏰ <span className="text-green-100 font-bold">Limited Time Offer!</span> Shop Now! ⭐
      </>
    ),
    link: "/products?offer=LIMITEDTIME",
  },
];

const OfferBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ANIMATION_MS = 12000; // 12s per line

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, ANIMATION_MS);
    return () => clearInterval(timer);
  }, [ANIMATION_MS]);

  return (
    <>
      <div className="w-full bg-yellow-200 overflow-hidden fixed top-0 left-0 z-50 border-b border-green-200 h-14">
        <div
          key={currentIndex}
          className="marquee-item text-brown-800 font-semibold text-lg"
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
