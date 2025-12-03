import React from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { quote: "The malt drink is so refreshing and rich in flavor!", name: "Priya M.", title: "Coimbatore" },
  { quote: "I ordered the combo pack of snacks and malt — fresh & tasty!", name: "Raju M.", title: "Coimbatore" },
  { quote: "Crispy and fresh! Tasted like my childhood.", name: "Nivi M.", title: "Coimbatore" },
];

const Testimonials = () => (
  <section className="py-20 bg-gradient-to-br from-[#57ba40]/10 to-white relative overflow-hidden">
    {/* Decorative elements */}
    <div className="absolute top-0 left-0 w-72 h-72 bg-[#57ba40]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#57ba40]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    
    <div className="container mx-auto px-4 relative z-10 max-w-[1200px]">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          What Our Customers Say
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Join thousands of satisfied customers enjoying authentic flavors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <div 
            key={i} 
            className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
          >
            <div className="relative">
              <Quote className="w-10 h-10 text-[#57ba40] opacity-50 mb-4" />
              
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star 
                    key={idx} 
                    className="w-5 h-5 text-amber-400 fill-amber-400 transition-transform duration-300 group-hover:scale-110" 
                    style={{ transitionDelay: `${idx * 50}ms` }}
                  />
                ))}
              </div>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                "{t.quote}"
              </p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#57ba40] to-[#3d8a2d] flex items-center justify-center text-white font-bold text-lg">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.title}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <style>{`
      @keyframes blob {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
      }
      .animate-blob {
        animation: blob 7s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
    `}</style>
  </section>
);

export default Testimonials;