import React, { useState, useEffect } from "react";
import { Sprout, Package, Hand, Leaf, Truck, Star } from "lucide-react";

const features = [
  { 
    icon: Sprout, 
    title: "From Trusted Farmers", 
    description: "We source the best ingredients from farmers we trust.",
  },
  { 
    icon: Package, 
    title: "Freshly Packed", 
    description: "Our products are packed with care to ensure maximum freshness.",
  },
  { 
    icon: Hand, 
    title: "Hand Picked Ingredients", 
    description: "Each ingredient is carefully chosen by hand for quality.",
  },
  { 
    icon: Leaf, 
    title: "100% Organic", 
    description: "We use only organic ingredients for healthy, tasty food.",
  },
  { 
    icon: Truck, 
    title: "Door Step Delivery", 
    description: "Enjoy our fresh products delivered right to your door.",
  },
];

const WhyChooseUs = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [customerCount, setCustomerCount] = useState(0);
  const [rating, setRating] = useState(0);

  // Animated counter for customers
  useEffect(() => {
    const target = 3000;
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCustomerCount(target);
        clearInterval(timer);
      } else {
        setCustomerCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, []);

  // Animated counter for rating
  useEffect(() => {
    const target = 4.9;
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setRating(target);
        clearInterval(timer);
      } else {
        setRating(parseFloat(current.toFixed(1)));
      }
    }, 16);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes iconBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .icon-bounce {
          animation: iconBounce 2s ease-in-out infinite;
        }

        .stat-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.6s;
        }

        .stat-card:hover::before {
          left: 100%;
        }

        .stat-card:hover {
          transform: translateY(-12px) scale(1.03);
          box-shadow: 0 25px 50px rgba(87, 186, 64, 0.25);
        }

        .feature-icon-wrapper {
          position: relative;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .feature-icon-wrapper::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: #57ba40;
          opacity: 0;
          z-index: -1;
          animation: ripple 1.5s ease-out infinite;
        }

        .feature-icon-wrapper:hover::after {
          opacity: 0.3;
        }

        .stagger-1 { animation: fadeInUp 0.6s ease-out 0.1s both; }
        .stagger-2 { animation: fadeInUp 0.6s ease-out 0.2s both; }
        .stagger-3 { animation: fadeInUp 0.6s ease-out 0.3s both; }
        .stagger-4 { animation: fadeInUp 0.6s ease-out 0.4s both; }
        .stagger-5 { animation: fadeInUp 0.6s ease-out 0.5s both; }

        .gradient-border {
          position: relative;
          background: linear-gradient(135deg, #57ba40, #3d8a2d);
          border-radius: 1rem;
          padding: 2px;
        }

        .gradient-border-inner {
          background: white;
          border-radius: calc(1rem - 2px);
          height: 100%;
        }
      `}</style>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-16 fade-in-up">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-1 bg-[#57ba40] rounded-full"></div>
              <span className="text-[#57ba40] font-bold text-sm uppercase tracking-wider">
                Our Values
              </span>
              <div className="w-8 h-1 bg-[#57ba40] rounded-full"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              What Makes Us <span className="text-[#57ba40]">Special</span>
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Committed to quality, sustainability, and your satisfaction
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <div
                  key={index}
                  className={`stagger-${index + 1} text-center`}
                >
                  <div>
                    {/* Icon Circle */}
                    {/* <div className="w-20 h-20 mx-auto bg-[#57ba40]/10 rounded-full flex items-center justify-center mb-4">
                     
                    </div> */}
                     <Icon className="w-10 h-10 text-[#ef0e0eff] flex items-center justify-center mx-auto  mb-4 " />
                     
                    
                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed px-2">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 scale-in">
            {/* Happy Customers */}
            <div className="stat-card bg-gradient-to-br from-[#57ba40] to-[#3d8a2d] rounded-2xl p-8 text-center text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-5xl font-bold mb-2">
                  {customerCount.toLocaleString()}+
                </div>
                <div className="text-sm font-medium text-white/90">
                  Happy Customers
                </div>
                <div className="w-16 h-1 bg-white/30 mx-auto mt-3 rounded-full"></div>
              </div>
              {/* Decorative Element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
            </div>

            {/* 100% Organic */}
            <div className="stat-card bg-gradient-to-br from-[#57ba40] to-[#469636] rounded-2xl p-8 text-center text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-5xl font-bold mb-2">
                  100%
                </div>
                <div className="text-sm font-medium text-white/90">
                  Organic Products
                </div>
                <div className="w-16 h-1 bg-white/30 mx-auto mt-3 rounded-full"></div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
            </div>

            {/* Customer Rating */}
            <div className="stat-card bg-gradient-to-br from-[#57ba40] to-[#4aa838] rounded-2xl p-8 text-center text-white shadow-lg relative overflow-hidden">

  {/* Highlight Tag */}
  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white text-[#57ba40] text-xs font-semibold px-3 py-1 rounded-full shadow-md z-20">
    As per Google Reviews
  </div>

  <div className="relative z-10 mt-6">
    <div className="flex items-center justify-center gap-2 mb-2">
      <div className="text-5xl font-bold">
        {rating.toFixed(1)}
      </div>
      <Star className="w-10 h-10 fill-white" />
    </div>
    <div className="text-sm font-medium text-white/90">
      Customer Rating
    </div>
    <div className="w-16 h-1 bg-white/30 mx-auto mt-3 rounded-full"></div>
  </div>

  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
  <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
</div>

          </div>

          {/* Trust Badge */}
          <div className="mt-12 text-center fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#57ba40] to-[#3d8a2d] text-white px-8 py-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <Leaf className="w-6 h-6" />
              <span className="font-semibold">Trusted by 3,000+ Customers Nationwide</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyChooseUs;