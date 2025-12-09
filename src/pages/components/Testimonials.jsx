import React from "react";
import { Star, Quote } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import image1 from "../../assets/testimonials/testimonial1.jpeg";
import image2 from "../../assets/testimonials/testimonial2.jpeg";
import image3 from "../../assets/testimonials/testimonial3.jpeg";
import image4 from "../../assets/testimonials/testimonial4.jpeg";
import image5 from "../../assets/testimonials/testimonial5.jpeg";
import image6 from "../../assets/testimonials/testimonial6.jpeg";
import image7 from "../../assets/testimonials/testimonial7.jpeg";
import image8 from "../../assets/testimonials/testimonial8.jpeg";
/*{import image9 from "../../assets/testimonials/testimonial9.jpeg";}*/
import image10 from "../../assets/testimonials/testimonial10.jpeg";
import image11 from "../../assets/testimonials/testimonial11.jpeg";
import image12 from "../../assets/testimonials/testimonial12.jpeg";


const testimonials = [
 {image: image1},
 {image: image2},
 {image: image3},
 {image: image4},
 {image: image5},
 {image: image6},
 {image: image7},
 {image: image8},
//  {image: image9},
 {image: image10},
 {image: image11},
 {image: image12},
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
<Swiper
  modules={[Pagination, Autoplay]}
  spaceBetween={30}
  slidesPerView={1}
  autoplay={{ delay: 2500 }}
  pagination={{ clickable: true }}
  breakpoints={{
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 }
  }}
  className="max-w-6xl mx-auto pb-12"
>
  {testimonials.map((t, i) => (
    <SwiperSlide key={i}>
      <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
        
        <img 
          src={t.image} 
          alt={`testimonial-${i}`}
          className="w-full h-180 object-cover rounded-xl shadow-md border"
        />

      </div>
    </SwiperSlide>
  ))}
</Swiper>

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