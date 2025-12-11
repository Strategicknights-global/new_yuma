import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Plus, Minus, X, ChevronRight, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, totalCartValue, loadingCart, appliedCoupon, discountAmount, applyCoupon, removeCoupon } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  const shippingCost = 0; // Free shipping
  const finalTotal = Math.max(0, totalCartValue - discountAmount);

  const handleApplyCoupon = async () => {
      if (!couponCodeInput.trim()) return;
      setApplyingCoupon(true);
      setCouponError("");
      try {
          await applyCoupon(couponCodeInput);
          setCouponCodeInput("");
      } catch (err) {
          setCouponError(err.message);
      } finally {
          setApplyingCoupon(false);
      }
  };

  const handleCheckout = () => {
    if (!isLoggedIn || !user?.uid) {
      navigate("/login?redirect=/checkout");
    } else {
      navigate("/checkout");
    }
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
          <Link to="/" className="hover:text-green-600">Home</Link>
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
                 className="bg-white rounded-lg p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 shadow-sm"

                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || "https://placehold.co/96x96/e5e7eb/6b7280?text=No+Image"}
                      alt={item.name}
                      className="w-24 h-24 rounded-lg object-cover bg-gray-100"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/96x96/e5e7eb/6b7280?text=No+Image";
                      }}
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
                        onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.cartKey)}
                      className="text-red-500 hover:text-red-600 p-2"
                      aria-label="Remove item"
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>


                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
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
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">Looks like you haven't added anything to your cart yet.</p>
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

       
      </main>
    </div>
  );
};

export default CartPage;
