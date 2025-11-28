import React from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import img2 from "../../assets/product2.png";

export default function MegaComboBanner() {
  return (
    <div className="w-full p-8 max-w-7xl mx-auto">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(2deg); }
          75% { transform: translateY(-8px) rotate(-2deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.6); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .float-animation {
          animation: float 4s ease-in-out infinite;
        }

        .float-delayed {
          animation: float 4s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .slide-up {
          animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .scale-in {
          animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .shimmer-bg {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }

        .pattern-bg {
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
        }

        .dot-pattern {
          background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      <div className="mb-12">
        <div className="relative bg-gradient-to-br from-[#57ba40] via-[#4fa838] to-[#43942f] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center shadow-2xl overflow-hidden">

          {/* Animated Background Patterns */}
          <div className="absolute inset-0 pattern-bg opacity-50"></div>
          <div className="absolute inset-0 dot-pattern opacity-30"></div>
          
          {/* Shimmer Effect Overlay */}
          <div className="absolute inset-0 shimmer-bg pointer-events-none"></div>

          {/* Decorative Circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>

          {/* LEFT CONTENT */}
          <div className="relative z-10 slide-up max-w-md">
            <div className="flex items-center gap-2 mb-4">
              
              <span className="bg-[#e7000b] text-white font-bold px-4 py-1 rounded-full text-xs uppercase tracking-wide shadow-md">
                Special Offer
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-3">
              Mega Combo
              <br />
              <span className="text-yellow-300">Packs</span>
            </h2>

            <p className="text-white text-lg mt-2 mb-8 opacity-95 font-medium">
              Curated bundles for better savings 
            </p>

            <button className="group flex items-center gap-2 bg-white text-[#57ba40] px-8 py-4 rounded-full font-bold hover:bg-yellow-300 hover:text-green-900 shadow-2xl transition-all hover:scale-105 hover:shadow-yellow-300/50">
              Shop Now
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* RIGHT SIDE PRODUCT IMAGE */}
          <div className="relative mt-8 md:mt-0 scale-in">
            {/* Glow Effect Behind Image */}
            <div className="absolute inset-0 bg-yellow-300 opacity-20 blur-3xl rounded-full scale-110"></div>
            
            {/* Floating Product Image */}
           
              <img
                src={img2}
                alt="Mega Combo Product"
                className="w-72 h-72 md:w-80 md:h-80 object-contain drop-shadow-2xl"
              />
          

         
           
           
          </div>

        </div>
      </div>
    </div>
  );
}