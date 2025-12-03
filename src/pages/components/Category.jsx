import React from "react";
import { Activity, Apple, Baby, Users, Coffee, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Categories() {
  const navigate = useNavigate();

  const handleClick = (name) => {
    navigate(`/products?customCategory=${encodeURIComponent(name)}`);
  };

  return (
    <div className="w-full py-20 bg-white">
      <h1 className="text-center text-[20px] sm:text-4xl md:text-[48px] font-extrabold text-[#07602e] font-serif">
        Pick What Fits Your Goal
      </h1>

      <div className="flex flex-wrap justify-center gap-10 sm:gap-16 md:gap-20 px-4 mt-10">
         <Category
          icon={<Baby className="w-10 h-10 text-[#2f8f2b]" />}
          label="Kids Friendly"
          onClick={handleClick}
        />
        <Category
          icon={<Users className="w-10 h-10 text-[#2f8f2b]" />}
          label="Women's Care"
          onClick={handleClick}
        />
         <Category
          icon={<Coffee className="w-10 h-10 text-[#2f8f2b]" />}
          label="Diabetes Friendly"
          onClick={handleClick}
        />
         <Category
          icon={<Apple className="w-10 h-10 text-[#2f8f2b]" />}
          label="Zero Sugar"
          onClick={handleClick}
        />
        <Category
          icon={<Activity className="w-10 h-10 text-[#2f8f2b]" />}
          label="Nutrient Rich"
          onClick={handleClick}
        />
       
       
       
        
      </div>
    </div>
  );
}

function Category({ icon, label, onClick }) {
  return (
    <a
      onClick={() => onClick(label)}
      className="flex flex-col items-center cursor-pointer transition-transform duration-300 hover:-translate-y-1"
    >
      <div
        className="
          w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
          rounded-full flex items-center justify-center
          shadow-lg bg-gradient-to-br from-[#f7ffe0] to-[#d0f5a9]
        "
      >
        {icon}
      </div>

      <div className="text-center mt-3 text-sm sm:text-base md:text-lg text-[#2f8f2b]">
        {label}
      </div>
    </a>
  );
}
