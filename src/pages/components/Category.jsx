import React from "react";
import { Tag, Leaf, ShieldCheck, HeartPulse, Flower2, Droplets } from "lucide-react";

export default function Categories() {
  return (
    <div className="w-full overflow-x-auto py-20 bg-[#ffffff] ">
        <h1 class="
        font-['Poppins']
        text-center
  text-[20px] sm:text-4xl md:text-[48px] 
  font-extrabold 
 text-[#07602e] 
  font-serif
">
PureRoots Wellness
</h1>
      <div className="flex gap-10 justify-center min-w-max px-4 mt-10">


        <Category icon={<Tag className="w-6 h-6 text-white" />} label="Deal of the Day" />
        <Category icon={<Leaf className="w-6 h-6 text-white" />} label="Teas & Infusions" />
        <Category icon={<ShieldCheck className="w-6 h-6 text-white" />} label="Immunity Boosters" />
        <Category icon={<HeartPulse className="w-6 h-6 text-white" />} label="Health & Wellness" />
        <Category icon={<Flower2 className="w-6 h-6 text-white" />} label="Digestive Wellness" />
        <Category icon={<Droplets className="w-6 h-6 text-white" />} label="Oil & Ghee" />

      </div>
    </div>
  );
}

function Category({ icon, label }) {
  return (
    <a className="flex flex-col items-center transition-transform duration-300 hover:-translate-y-1">
      
      <div className="
        w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28
        rounded-full bg-gradient-to-br from-[#57ba40] to-[#2f8f2b]
        flex items-center justify-center shadow-lg
        relative overflow-hidden
      ">
        <span className="relative z-10">{icon}</span>
      </div>

     <div className="text-center mt-3  text-sm sm:text-base md:text-lg 
                drop-shadow-sm">
  {label}
</div>


    </a>
  );
}
