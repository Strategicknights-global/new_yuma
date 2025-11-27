import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

import bg1 from "../../assets/bg1.webp";
import bg2 from "../../assets/bg2.jpg";
import bg3 from "../../assets/bg3.jpg";
import bg4 from "../../assets/bg4.jpg";
import bg5 from "../../assets/bg5.jpg";

const features = [
  { icon: bg1, title: "From Trusted Farmers", description: "We source the best ingredients from farmers we trust." },
  { icon: bg2, title: "Freshly Packed", description: "Our products are packed with care to ensure maximum freshness." },
  { icon: bg3, title: "Hand Picked Ingredients", description: "Each ingredient is carefully chosen by hand for quality." },
  { icon: bg4, title: "100% Organic", description: "We use only organic ingredients for healthy, tasty food." },
  { icon: bg5, title: "Door Step Delivery", description: "Enjoy our fresh products delivered right to your door." },
];

const WhyChooseUs = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.2, once: false });

  return (
    <section ref={sectionRef} className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Animate the Title too */}
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl font-bold text-center mb-8 text-[#b85a00]"
        >
          Why buy from Yuma Fresh Foods?
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={
                isInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.5 }
              }
              transition={{
                duration: 0.8,
                delay: index * 0.2,
                type: "spring",
                stiffness: 80,
              }}
              className="bg-white rounded-xl shadow-lg p-6 w-48 flex flex-col items-center text-center hover:scale-110 transition-transform duration-300"
            >
              <img
                src={feature.icon}
                alt={feature.title}
                className="w-20 h-20 object-cover rounded-full mb-4 border-4 border-[#b85a00]/20"
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;