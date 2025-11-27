import React from "react";
import Navbar from "../../components/Navbar"; // <-- update path if needed

const sectionStyle = "text-xl font-semibold mt-6 mb-2";
const paraStyle = "text-gray-700 leading-relaxed mb-4";
const listStyle = "list-disc ml-6 text-gray-700 leading-relaxed mb-4";

export default function Policies() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* 🔥 Navbar at the top */}
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10 font-sans">
        <h1 className="text-4xl font-bold text-center mb-10 text-[#c0392b]">
          Yumas Fresh Foods – Policies
        </h1>

        {/* ================= REFUND POLICY ================= */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Refund Policy</h2>
          <p className={paraStyle}>
            At <b>Yumas Fresh Foods</b>, your satisfaction is important to us. Due to the nature of
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
