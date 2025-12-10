import React from "react";

const ShippingPolicy = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Shipping & Delivery Policy</h1>

      <p className="mb-4">
        Welcome to <b> Yuma’s Fresh Foods.</b> Please review our shipping
        guidelines to understand how we process and deliver your orders.
      </p>

      <h2 className="text-xl font-semibold mb-2">Order Processing</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>
          <b>Prepaid Orders Only:</b> We accept only prepaid orders.
          Cash-on-Delivery (COD) <b>is not available</b>. All payments must be
          completed online at checkout.
        </li>
        <li>
          <b>Order Confirmation:</b> Once your payment is successful, you will
          receive an email or message confirming your order details.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Shipping Locations</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>
          We ship across India to all serviceable PIN codes. Delivery timelines
          for remote areas may be slightly longer.
        </li>
        <li>
          International shipping is <b>not available currently</b>
        </li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Shipping Charges</h2>
      <p className="mb-4">
        Shipping charges (if applicable) will be clearly displayed at checkout
        before you complete your payment.
      </p>
      <h2 className="text-xl font-semibold mb-2">Delivery Time</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>
          <b>Within Karnataka:</b> Typically arrive within{" "}
          <b> 5–7 business days,</b> depending on the location.
        </li>
        <li>
          {" "}
          <b>Other States:</b> Delivery may take <b>7–14 business days</b> based
          on the shipping address.
        </li>
      </ul>
      <p>
        Please note: Delivery timelines are estimates and may be affected by
        holidays, weather conditions, or courier delays.
      </p>
      <h2 className="text-xl font-semibold mb-2">Order Tracking</h2>
      <p className="mb-4">
        Once your order is shipped, you will receive a tracking number via email
        or message. You can use this number to track your order on the courier
        partner’s website.
      </p>
      <h2 className="text-xl font-semibold mb-2">Delivery Issues</h2>
      <p className="mb-4">
        <b> Failed Deliveries: </b>If the courier is unable to deliver due to an
        incorrect address or unavailability of the recipient, the package may be
        returned to us. In such cases, customers will be responsible for any
        additional shipping charges required for re-shipment.
      </p>
      <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
      <p>For any questions or concerns, please reach out to us at:</p>
      <p>
        <b>📧 yumas.customercare@gmail.com</b>
      </p>
    </div>
  );
};

export default ShippingPolicy;
