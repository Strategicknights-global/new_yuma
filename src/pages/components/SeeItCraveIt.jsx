import React from "react";
import { ThreeDVideoRing } from "./ThreeDVideoRing";
import { Sparkles, Eye, Heart, UtensilsCrossed } from "lucide-react";

const youtubeShorts = [
  { id: 1, videoId: "Lz-5ViiCZmo" },
  { id: 2, videoId: "2iHlsmkp6I4" },
  { id: 3, videoId: "qT0Olwyv108" },
  { id: 4, videoId: "JLbVad08jkQ" },
  { id: 5, videoId: "CiUEODyBsQk" },
  { id: 6, videoId: "Lz-5ViiCZmo" },
  { id: 7, videoId: "2iHlsmkp6I4" },
  { id: 8, videoId: "qT0Olwyv108" },
  { id: 9, videoId: "JLbVad08jkQ" },
  { id: 10, videoId: "CiUEODyBsQk" },
];

const SeeItCraveIt = () => (
  <section className="py-12 bg-white overflow-hidden">
    <div className="container mx-auto px-4">
       
          <h2 className="text-4xl md:text-5xl font-bold text-center flex items-center justify-center flex-wrap gap-4">
            <span className="text-slate-800">See It</span>
            <Eye className="w-10 h-10 text-amber-600" />
            <span className="text-slate-700">Crave It</span>
            <Heart className="w-10 h-10 text-orange-500 fill-orange-500" />
            <span className="text-[#b85a00]">Taste It</span>
            <UtensilsCrossed className="w-10 h-10 text-[#b85a00]" />
          </h2>
         <p className="text-gray-600 text-lg max-w-2xl mx-auto text-center mt-[10px]">
          Taste that turns moments into memories.
        </p>
      <div className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center">
        <ThreeDVideoRing
          videos={youtubeShorts}
          width={350}
          height={625}
          // --- Value Changed Here for Maximum Closeness ---
          videoDistance={600}   // Reduced from 400 to make the ring even tighter
          // --- Other props remain the same ---
          perspective={1200}
          autoRotate={true}
          rotationSpeed={40}
        />
      </div>
    </div>
  </section>
);

export default SeeItCraveIt;