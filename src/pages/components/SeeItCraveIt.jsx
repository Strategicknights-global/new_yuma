// src/components/SeeItCraveIt.jsx
import React from "react";
import { ThreeDVideoRing } from "./ThreeDVideoRing"; // Adjust the import path

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
      <h2 className="text-3xl font-bold text-center mb-8 text-[#b85a00]">
        See It. Crave It. Taste It
      </h2>
      
      <div className="relative w-full h-[700px] md:h-[900px] flex items-center justify-center">
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