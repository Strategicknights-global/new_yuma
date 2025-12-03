import React from "react";

const RefundPolicy = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Refund & Cancellation Policy</h1>

      <p className="mb-4">
        At <b>Yumas Fresh Foods</b>, we take pride in delivering high-quality products.
        Due to the perishable nature of our food items, we currently do not accept
        returns once the order is delivered.
      </p>

      <h2 className="text-xl font-semibold mb-2">Order Cancellation</h2>
      <p className="mb-4">
        Orders can be cancelled **within 30 minutes** of placing them.
        After this window, cancellation may not be possible.
      </p>

      <h2 className="text-xl font-semibold mb-2">Refunds</h2>
      <p className="mb-4">
        Refunds are applicable only if:
      </p>
      <ul className="list-disc ml-6 mb-4">
        <li>You received a damaged or incorrect product</li>
        <li>The product was spoiled at the time of delivery</li>
      </ul>

      <p>
        To request a refund, please contact our support team with your order
        details and clear photos of the issue.
      </p>
    </div>
  );
};

export default RefundPolicy;
