import React from "react";

const ShippingPolicy = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Shipping & Delivery Policy</h1>

      <p className="mb-4">
        We deliver fresh food products quickly and safely to your doorstep.
      </p>

      <h2 className="text-xl font-semibold mb-2">Delivery Timeline</h2>
      <p className="mb-4">
        Orders are dispatched within **24 hours** and delivered within **1–3
        days**, depending on your location.
      </p>

      <h2 className="text-xl font-semibold mb-2">Shipping Charges</h2>
      <p className="mb-4">
        Shipping charges, if applicable, will be displayed at checkout.
      </p>

      <h2 className="text-xl font-semibold mb-2">Order Tracking</h2>
      <p className="mb-4">
        Once dispatched, tracking details will be shared on WhatsApp or Email.
      </p>

      <h2 className="text-xl font-semibold mb-2">Delivery Areas</h2>
      <p>
        We currently deliver to most major cities. Remote locations may require
        extra time.
      </p>
    </div>
  );
};

export default ShippingPolicy;
