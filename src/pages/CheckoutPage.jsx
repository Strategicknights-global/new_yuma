import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ChevronRight, Truck, Home } from "lucide-react";
import Navbar from "../components/Navbar";
import { sendOrderEmails } from "../../src/utils/emailService"; // Import email service

const PRODUCT_COLLECTION_NAME = "products";

const CheckoutPage = () => {
  const { user, isLoggedIn } = useAuth();
  const { cart, totalCartValue, clearCart, loadingCart, appliedCoupon, discountAmount, applyCoupon, removeCoupon } = useCart();
  const navigate = useNavigate();

  const [shippingDetails, setShippingDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    country: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [shippingMethod, setShippingMethod] = useState("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  
  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  const shippingCost = shippingMethod === "free" ? 0 : 15;
  const finalTotal = Math.max(0, totalCartValue + shippingCost - discountAmount);

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

  useEffect(() => {
    if (!loadingCart) {
      if (!isLoggedIn || !user?.uid) {
        navigate("/login?redirect=/checkout");
      } else if (cart.length === 0) {
        navigate("/products");
      }
    }
  }, [isLoggedIn, user, cart, loadingCart, navigate]);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    // Validate shipping details
    for (const key in shippingDetails) {
      if (!shippingDetails[key]) {
        setError("Please fill in all shipping details.");
        return;
      }
    }

    setLoading(true);

    try {
      // Step 1: Verify stock
      const newOrderRef = doc(collection(db, "orders"));
      const orderId = newOrderRef.id.substring(0, 8).toUpperCase();

      await runTransaction(db, async (transaction) => {
        for (const item of cart) {
          const productId = item.productId || item.id;
          const productName =
            item.displayName ||
            (item.variant ? `${item.name} (${item.variant.size})` : item.name);
          
          if (!productId) {
            throw new Error(`Cannot verify stock for item: ${productName}. Missing product ID.`);
          }

          const productDocRef = doc(db, PRODUCT_COLLECTION_NAME, productId);
          const productDoc = await transaction.get(productDocRef);

          if (!productDoc.exists()) {
            throw new Error(`Product "${productName}" not found. Cannot place order.`);
          }

          const productData = productDoc.data();
          
          if (!productData.inStock) {
            throw new Error(`We're sorry, "${productName}" is currently out of stock.`);
          }
        }
      });

      // Step 2: Initiate Razorpay payment
      const amountInPaise = Math.round(finalTotal * 100);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: "INR",
        name: "Yuma's Fresh Foods",
        description: `Order #${orderId}`,
        prefill: {
          name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
          email: shippingDetails.email,
          contact: shippingDetails.phone,
        },
        handler: async (response) => {
          try {
            // Prepare order data
            const orderData = {
              userId: user.uid,
              userEmail: user.email,
              items: cart,
              subtotal: totalCartValue,
              shippingCost: shippingCost,
              discountAmount: discountAmount,
              couponCode: appliedCoupon ? appliedCoupon.code : null,
              totalAmount: finalTotal,
              shippingDetails,
              shippingMethod,
              status: "Confirmed",
              paymentStatus: "Paid",
              razorpayPaymentId: response.razorpay_payment_id,
              createdAt: serverTimestamp(),
              orderId,
            };

            // Save order to Firestore and update coupon usage
            await runTransaction(db, async (transaction) => {
              if (appliedCoupon) {
                 const couponRef = doc(db, "coupons", appliedCoupon.id);
                 const couponDoc = await transaction.get(couponRef);
                 if (couponDoc.exists()) {
                     const couponData = couponDoc.data();
                     // Optional: Re-validate limits here for strict consistency
                     const newUsageCount = (couponData.usageCount || 0) + 1;
                     const newUsersRedeemed = { ...couponData.usersRedeemed, [user.uid]: (couponData.usersRedeemed?.[user.uid] || 0) + 1 };
                     
                     transaction.update(couponRef, { 
                         usageCount: newUsageCount,
                         usersRedeemed: newUsersRedeemed
                     });
                 }
              }
              transaction.set(newOrderRef, orderData);
            });

            console.log("✅ Order saved to database");

            // Send confirmation emails to customer and admin
            const emailResults = await sendOrderEmails({
              ...orderData,
              createdAt: new Date(), // Use actual date for email formatting
            });

            // Log email results
            if (emailResults.customer.success) {
              console.log("✅ Customer confirmation email sent");
            } else {
              console.warn("⚠️ Customer email failed (order still placed):", emailResults.customer.error);
            }

            if (emailResults.admin.success) {
              console.log("✅ Admin notification email sent");
            } else {
              console.warn("⚠️ Admin email failed (order still placed):", emailResults.admin.error);
            }

            // Clear cart
            await clearCart();
            setLoading(false);

            // Show success message
            const emailNote = (emailResults.customer.success && emailResults.admin.success)
              ? "Check your email for confirmation!"
              : emailResults.customer.success
              ? "Confirmation email sent!"
              : "";

            setToast({ 
              show: true, 
              message: `Order placed successfully! ${emailNote}`, 
              type: "success" 
            });
            
            // Redirect to products page
            setTimeout(() => {
              navigate("/products", { state: { orderSuccess: true } });
            }, 3000);

          } catch (err) {
            console.error("❌ Order creation error:", err);
            setToast({ 
              show: true, 
              message: "Failed to create order. Please contact support.", 
              type: "error" 
            });
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled. Please try again.");
            setLoading(false);
          },
        },
        theme: {
          color: "#000000",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Order preparation error:", err);
      let errorMessage = "Failed to place order. Please check stock and try again.";
      if (
        err.message &&
        (err.message.includes("stock") ||
          err.message.includes("product") ||
          err.message.includes("ID"))
      ) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (loadingCart || !isLoggedIn || !user || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 px-8 py-4 rounded-lg shadow-2xl text-white font-semibold flex items-center gap-3 z-[9999] ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
          style={{
            animation: "slideInUp 0.3s ease-out"
          }}
        >
          {toast.type === "success" && (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-[#57ba40]">Home</Link>
           <span className="mx-2">/</span>
          <span className="text-[#000000] font-medium">Checkout</span>
        </div>

        <form onSubmit={handlePlaceOrder} className="lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Left Column - Shipping Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name*
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={shippingDetails.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={shippingDetails.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email address*
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={shippingDetails.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street address*
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={shippingDetails.street}
                    onChange={handleInputChange}
                    placeholder="House number and street name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country / Region*
                  </label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={shippingDetails.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Town / City*
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={shippingDetails.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State*
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={shippingDetails.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode*
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={shippingDetails.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone*
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={shippingDetails.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Method</h2>
              <div className="space-y-3">
                <div
                  onClick={() => setShippingMethod("free")}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    shippingMethod === "free" 
                      ? "border-gray-900 bg-gray-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      shippingMethod === "free" ? "border-gray-900" : "border-gray-300"
                    }`}>
                      {shippingMethod === "free" && (
                        <div className="w-3 h-3 rounded-full bg-gray-900"></div>
                      )}
                    </div>
                    <Truck className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Free Shipping</p>
                      <p className="text-sm text-gray-500">7-30 business days</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">₹0</p>
                </div>

                <div
                  onClick={() => setShippingMethod("express")}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    shippingMethod === "express" 
                      ? "border-gray-900 bg-gray-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      shippingMethod === "express" ? "border-gray-900" : "border-gray-300"
                    }`}>
                      {shippingMethod === "express" && (
                        <div className="w-3 h-3 rounded-full bg-gray-900"></div>
                      )}
                    </div>
                    <Home className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Express Shipping</p>
                      <p className="text-sm text-gray-500">2-3 business days</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">₹15.00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Cart</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.cartKey} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                      <img
                        src={item.image || item.images?.[0]}
                        alt={item.displayName || item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.displayName || item.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                {appliedCoupon ? (
                    <div className="flex justify-between items-center bg-green-50 p-3 rounded border border-green-200">
                        <div>
                            <p className="text-sm font-medium text-green-800">Coupon: {appliedCoupon.code}</p>
                            <p className="text-xs text-green-600">
                                {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% off` : `₹${appliedCoupon.value} off`}
                            </p>
                        </div>
                        <button onClick={removeCoupon} type="button" className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={couponCodeInput}
                                onChange={(e) => setCouponCodeInput(e.target.value)}
                                placeholder="Discount code"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                            <button 
                                type="button"
                                onClick={handleApplyCoupon}
                                disabled={applyingCoupon}
                                className="px-4 py-2 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 disabled:opacity-50"
                            >
                                {applyingCoupon ? "..." : "Apply"}
                            </button>
                        </div>
                        {couponError && <p className="text-red-500 text-xs">{couponError}</p>}
                    </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{totalCartValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shippingCost === 0 ? "Free" : `₹${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">₹{finalTotal.toFixed(2)}</span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Continue to Payment"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CheckoutPage;