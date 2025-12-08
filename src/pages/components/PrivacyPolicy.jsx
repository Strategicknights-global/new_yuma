import React from "react";
import Navbar from "../../components/Navbar"; // <-- update path if needed

const sectionStyle = "text-xl font-semibold mt-6 mb-2";
const paraStyle = "text-gray-700 leading-relaxed mb-4";
const listStyle = "list-disc ml-6 text-gray-700 leading-relaxed mb-4";

export default function Privacy() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* 🔥 Navbar at the top */}
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10 font-sans">
        <h1 className="text-4xl font-bold text-center mb-10 text-[#c0392b]">
          Yuma's Fresh Foods –Privacy Policies
        </h1>




        {/* ================= PRIVACY POLICY ================= */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Privacy Policy</h2>

          <h3 className={sectionStyle}>1. Information We Collect</h3>
          <ul className={listStyle}>
            <li>Name, email, phone number, and address</li>
            <li>Order details and payment method (never card number)</li>
            <li>Device and usage data</li>
          </ul>

          <h3 className={sectionStyle}>2. How We Use Your Information</h3>
          <ul className={listStyle}>
            <li>To deliver products</li>
            <li>For customer service</li>
            <li>To improve our services</li>
          </ul>

          <h3 className={sectionStyle}>3. Data Protection</h3>
          <p className={paraStyle}>
            Your data is encrypted and never shared with third parties without consent.
          </p>
        </div>



        
      </div>
    </div>
  );
}
