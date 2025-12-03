import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckCircle } from 'lucide-react';

const OrderSuccessPage = () => {
  const { orderId } = useParams(); // Get orderId from URL

  return (
    <div className="min-h-screen bg-gray-100">
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white p-10 rounded-lg shadow-lg">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Thank you for your order!</h1>
          <p className="mt-4 text-gray-600">
            Your order has been placed successfully. Your order ID is:
          </p>
          <p className="mt-2 text-lg font-semibold text-red-600 bg-red-50 p-2 rounded-md inline-block">
            {orderId}
          </p>
          <p className="mt-4 text-gray-600">
            We've sent a confirmation email to you. You can view your order details in your profile.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/orders" className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
              View My Orders
            </Link>
            <Link to="/products" className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderSuccessPage;