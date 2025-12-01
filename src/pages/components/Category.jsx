import React from "react";
import { Activity, Apple, Baby, Users, Coffee, Heart } from "lucide-react";

export default function Categories() {
  return (
    <div className="w-full overflow-x-auto py-20 bg-white"> {/* Keep main background white */}
      <h1 className="
        font-['Poppins']
        text-center
        text-[20px] sm:text-4xl md:text-[48px] 
        font-extrabold 
        text-[#07602e] 
        font-serif
      ">
        PureRoots Wellness
      </h1>

      <div className="flex gap-20 justify-center min-w-max px-4 mt-10">
        <Category icon={<Activity className="w-10 h-10 text-[#2f8f2b]" />} label="Protein Rich" />
        <Category icon={<Apple className="w-10 h-10 text-[#2f8f2b]" />} label="Zero Sugar" />
        <Category icon={<Baby className="w-10 h-10 text-[#2f8f2b]" />} label="For 6 Months" />
        <Category icon={<Heart className="w-10 h-10 text-[#2f8f2b]" />} label="Kids(1+ years)" />
        <Category icon={<Coffee className="w-10 h-10 text-[#2f8f2b]" />} label="Busy Life" />
        <Category icon={<Users className="w-10 h-10 text-[#2f8f2b]" />} label="Working Womens" />
      </div>
    </div>
  );
}

function Category({ icon, label }) {
  return (
    <a className="flex flex-col items-center transition-transform duration-300 hover:-translate-y-1">
      <div className="
        w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24
        rounded-full 
        flex items-center justify-center
        shadow-lg
        relative overflow-hidden
        bg-gradient-to-br from-[#f7ffe0] to-[#d0f5a9]  /* yellowish-green gradient */
      ">
        <span className="relative z-10">{icon}</span>
      </div>

      <div className="text-center mt-3 text-sm sm:text-base md:text-lg drop-shadow-sm text-[#2f8f2b]">
        {label}
      </div>
    </a>
  );
}
