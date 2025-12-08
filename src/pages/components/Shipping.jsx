import React from "react";
import Navbar from "../../components/Navbar"; // <-- update path if needed

const sectionStyle = "text-xl font-semibold mt-6 mb-2";
const paraStyle = "text-gray-700 leading-relaxed mb-4";
const listStyle = "list-disc ml-6 text-gray-700 leading-relaxed mb-4";

export default function Shipping() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* 🔥 Navbar at the top */}
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10 font-sans">
        <h1 className="text-4xl font-bold text-center mb-10 text-[#c0392b]">
          Yuma's Fresh Foods –Shipping Policies
        </h1>



        {/* ================= SHIPPING POLICY ================= */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Shipping Policy</h2>

          <h3 className={sectionStyle}>1. Delivery Areas</h3>
          <p className={paraStyle}>
            We currently deliver within selected serviceable areas. Delivery availability is displayed during checkout.
          </p>

          <h3 className={sectionStyle}>2. Delivery Timelines</h3>
          <p className={paraStyle}>
            Standard delivery takes 1–2 days. Same-day delivery options may be available.
          </p>

          <h3 className={sectionStyle}>3. Failed Deliveries</h3>
          <p className={paraStyle}>
            If the customer is unavailable, delivery may be rescheduled or canceled based on the situation.
          </p>
        </div>

        
      </div>
    </div>
  );
}
