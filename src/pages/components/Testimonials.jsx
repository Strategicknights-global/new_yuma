import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  { quote: "The malt drink is so refreshing and rich in flavor!", name: "Priya M.", title: "Coimbatore" },
  { quote: "I ordered the combo pack of snacks and malt — fresh & tasty!", name: "Raju M.", title: "Coimbatore" },
  { quote: "Crispy and fresh! Tasted like my childhood.", name: "Nivi M.", title: "Coimbatore" },
];

const Testimonials = () => (
  <section className="py-12 bg-white">
    <div className="container mx-auto px-4 text-center">
      <div className="bg-[#50c878] text-white py-12 px-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-8">Here is what Customers say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white text-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center animate-pop" style={{ animationDelay: `${i * 0.5}s` }}>
              <div className="mb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="w-5 h-5 inline-block text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="italic mb-4">"{t.quote}"</p>
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm">{t.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    <style>{`
      @keyframes pop {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
      }
      .animate-pop {
        animation: pop 2.5s ease-in-out infinite;
      }
    `}</style>
  </section>
);

export default Testimonials;
