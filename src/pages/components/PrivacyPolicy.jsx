import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

      <p className="mb-4">
        Your privacy is important to us. This policy explains how we collect,
        use, and protect your information.
      </p>

      <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Name</li>
        <li>Contact details</li>
        <li>Delivery address</li>
        <li>Payment information (handled securely via payment gateway)</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">How We Use Your Information</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>To process orders</li>
        <li>To improve customer service</li>
        <li>To send order updates</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Data Protection</h2>
      <p className="mb-4">
        We do not store your payment information. All transactions are processed
        securely by authorized gateways.
      </p>

      <h2 className="text-xl font-semibold mb-2">Third-Party Sharing</h2>
      <p>
        We never sell or rent your data. Information is shared only with courier
        and payment partners to complete your order.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
