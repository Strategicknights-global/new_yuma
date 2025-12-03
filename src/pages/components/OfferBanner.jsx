"use client";
import React from "react";
import { motion } from "framer-motion";
import discounts from "../../assets/discounts.png"; // adjust path if needed

const OfferBanner = () => {
  return (
    <div className="relative w-full h-[350px] md:h-[150px] flex items-center justify-center bg-white overflow-hidden">
      <motion.img
        src={discounts}
        alt="Discounts"
        className="w-auto h-[80%] object-contain"
        animate={{
          y: [0, -15, 0], // moves up & down smoothly
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default OfferBanner;
