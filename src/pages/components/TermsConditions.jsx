import React from "react";

const TermsConditions = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>

      <p className="mb-4">
        Welcome to <b>Yumas Fresh Foods</b>. By using our website, you agree to the
        terms and conditions mentioned below.
      </p>

      <h2 className="text-xl font-semibold mb-2">Use of Website</h2>
      <p className="mb-4">
        You agree not to misuse our services, attempt unauthorized access, or
        copy content without written permission.
      </p>

      <h2 className="text-xl font-semibold mb-2">Product Information</h2>
      <p className="mb-4">
        We ensure accurate product descriptions, but actual product appearance
        may vary slightly.
      </p>

      <h2 className="text-xl font-semibold mb-2">Payments</h2>
      <p className="mb-4">
        All payments must be made online. We use secure gateways for smooth and
        safe transactions.
      </p>

      <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
      <p>
        Yumas Fresh Foods is not responsible for delays caused by natural events,
        courier issues, or technical problems beyond our control.
      </p>
    </div>
  );
};

export default TermsConditions;
