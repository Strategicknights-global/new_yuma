import React from "react";
import Navbar from "../../components/Navbar"; // <-- update path if needed

const sectionStyle = "text-xl font-semibold mt-6 mb-2";
const paraStyle = "text-gray-700 leading-relaxed mb-4";
const listStyle = "list-disc ml-6 text-gray-700 leading-relaxed mb-4";

export default function Terms() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* 🔥 Navbar at the top */}
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10 font-sans">
        <h1 className="text-4xl font-bold text-center mb-10 text-[#c0392b]">
          Yuma's Fresh Foods – Terms and Conditions
        </h1>

        {/* ================= REFUND POLICY ================= */}
     
        {/* ================= TERMS & CONDITIONS ================= */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Terms & Conditions</h2>

          <h3 className={sectionStyle}>1. Use of Website</h3>
          <p className={paraStyle}>
            By using our website, you agree to provide accurate information and follow all guidelines.
          </p>

          <h3 className={sectionStyle}>2. Payments</h3>
          <p className={paraStyle}>
            All payments must be made in INR using available secure methods.
          </p>

          <h3 className={sectionStyle}>3. Order Cancellation</h3>
          <p className={paraStyle}>
            Orders can be canceled only before they are dispatched for delivery.
          </p>

          <h3 className={sectionStyle}>4. Liability Limitations</h3>
          <p className={paraStyle}>
            We are not responsible for delays caused by logistics partners or unforeseen circumstances.
          </p>
        </div>

   
   
        
      </div>
    </div>
  );
}
