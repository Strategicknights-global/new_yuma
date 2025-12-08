import React from "react";
import Navbar from "../../components/Navbar"; // <-- update path if needed

const sectionStyle = "text-xl font-semibold mt-6 mb-2";
const paraStyle = "text-gray-700 leading-relaxed mb-4";
const listStyle = "list-disc ml-6 text-gray-700 leading-relaxed mb-4";

export default function Refund() {
  return (
    <div className="w-full min-h-screen bg-white">

      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10 font-sans">
        <h1 className="text-4xl font-bold text-center mb-10 text-[#c0392b]">
          Yuma's Fresh Foods – Refund Policies
        </h1>

        {/* ================= REFUND POLICY ================= */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Refund Policy</h2>
          <p className={paraStyle}>
            At <b>Yuma's Fresh Foods</b>, your satisfaction is important to us. Due to the nature of
            food products, refunds are handled with care and consideration.
          </p>

          <h3 className={sectionStyle}>1. Eligibility for Refund</h3>
          <ul className={listStyle}>
            <li>Damaged or spoiled items upon delivery.</li>
            <li>Wrong item delivered.</li>
            <li>Missing items in your order.</li>
          </ul>

          <h3 className={sectionStyle}>2. Non-Refundable Items</h3>
          <ul className={listStyle}>
            <li>Items consumed partially.</li>
            <li>Opened packaging without valid reason.</li>
            <li>Requests made after 24 hours of delivery.</li>
          </ul>

          <h3 className={sectionStyle}>3. How to Request a Refund</h3>
          <p className={paraStyle}>
            You can contact us via email or WhatsApp with order details and photos.
          </p>
        </div>

      
        
      </div>
    </div>
  );
}
