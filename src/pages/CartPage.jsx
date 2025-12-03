import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Plus, Minus, X, ChevronRight, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, totalCartValue, loadingCart } =
    useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const shippingCost = 0; // Free shipping
  const deliveryFee = 10;
  const discount = 25; // 25% discount
  const discountAmount = (totalCartValue * discount) / 100;
  const finalTotal = totalCartValue + shippingCost + deliveryFee - discountAmount;

  const handleCheckout = () => {
    if (!isLoggedIn || !user?.uid) {
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter email:", email);
    setEmail("");
  };

  if (loadingCart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className=" hover:text-[#57ba40]">Home</Link>
          {/* <ChevronRight className="w-4 h-4 mx-2" /> */}
           <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Cart</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">YOUR CART</h1>

        {cart && cart.length > 0 ? (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.cartKey}
                  className="bg-white rounded-lg p-6 flex items-center gap-6 shadow-sm"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link
                      to={`/products/${item.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-gray-700"
                    >
                      {item.displayName}
                    </Link>
                    <p className="text-xl font-bold text-gray-900 mt-2">
                      ₹{item.price}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.cartKey, item.quantity - 1)
                        }
                        className="text-gray-600 hover:text-gray-900 p-1"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.cartKey, item.quantity + 1)
                        }
                        className="text-gray-600 hover:text-gray-900 p-1"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.cartKey)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary - Right Column */}
            <div className="lg:col-span-1 mt-8 lg:mt-0">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">
                      ₹{totalCartValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Discount (-{discount}%)</span>
                    <span className="font-medium text-red-600">
                      -₹{discountAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-gray-900">
                      ₹{deliveryFee.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add promo code"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    <button className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gray-900 text-white py-3 rounded-full font-semibold text-base hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  Go to Checkout
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Empty Cart View
          <div className="text-center bg-white p-12 rounded-lg shadow-sm">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Your cart is empty
            </h2>
            <p className="mt-2 text-gray-600">
              Looks like you haven't added anything to your cart yet.
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-block px-8 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        )}

        {/* Newsletter Section */}
        {cart && cart.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-teal-700 to-teal-600 rounded-2xl p-8 text-white">
  <div className="max-w-2xl">
    <h2 className="text-2xl font-bold mb-2">
      WE’RE HERE TO HELP YOU!
    </h2>
    <p className="text-teal-100 mb-6">
      Have questions about our products, orders, or services? Reach out anytime.
    </p>

    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="bg-white text-teal-700 p-3 rounded-full">
          📞
        </span>
        <p className="text-lg">+91 98765 43210</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="bg-white text-teal-700 p-3 rounded-full">
          ✉️
        </span>
        <p className="text-lg">support@yoursite.com</p>
      </div>
    </div>
  </div>
</div>

        )}
      </main>
    </div>
  );
};

export default CartPage;