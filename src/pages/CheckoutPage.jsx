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
import { ChevronRight } from "lucide-react";

const PRODUCT_COLLECTION_NAME = "products";

const CheckoutPage = () => {
  const { user, isLoggedIn } = useAuth();
  const { cart, totalCartValue, clearCart, loadingCart } = useCart();
  const navigate = useNavigate();

  const [shippingDetails, setShippingDetails] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (!loadingCart) {
      if (!isLoggedIn || !user?.uid) {
        navigate("/login?redirect=/checkout");
      } else if (cart.length === 0) {
        navigate("/products");
      }
    }
  }, [isLoggedIn, user, cart, loadingCart, navigate]);

  // Auto-hide toast after 3 seconds
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
        // --- START: Stock Check Logic ---
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
        // --- END: Stock Check Logic ---
      });

      // Step 2: Initiate Razorpay payment
      const amountInPaise = Math.round(totalCartValue * 100);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: "INR",
        name: "Your Store Name",
        description: `Order #${orderId}`,
        prefill: {
          name: shippingDetails.name,
          email: user.email,
          contact: shippingDetails.phone,
        },
        handler: async (response) => {
          try {
            // Payment successful - save order to Firebase
            await runTransaction(db, async (transaction) => {
              transaction.set(newOrderRef, {
                userId: user.uid,
                userEmail: user.email,
                items: cart,
                totalAmount: totalCartValue,
                shippingDetails,
                status: "Confirmed",
                paymentStatus: "Paid",
                razorpayPaymentId: response.razorpay_payment_id,
                createdAt: serverTimestamp(),
                orderId,
              });
            });

            await clearCart();
            setLoading(false);

            // Show success toast
            setToast({ show: true, message: "Order placed successfully!", type: "success" });
            
            // Redirect to products page after 3 seconds
            setTimeout(() => {
              navigate("/products", { state: { orderSuccess: true } });
            }, 3000);
          } catch (err) {
            console.error("Order creation error:", err);
            setToast({ show: true, message: "Failed to create order. Please contact support.", type: "error" });
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
          color: "#DC2626",
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
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
          className={`fixed bottom-6 right-6 px-8 py-5 rounded-lg shadow-2xl text-white font-semibold flex items-center gap-3 z-[9999] ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
          style={{
            animation: "slideInUp 0.3s ease-out"
          }}
        >
          {toast.type === "success" && (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {toast.type === "error" && (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6  ">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-red-600">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="font-semibold text-gray-800">Checkout</span>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="lg:grid lg:grid-cols-3 lg:gap-8 min-h-screen flex items-center justify-center"
        >
          {/* Shipping Details */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={shippingDetails.name}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="address">Street Address</label>
              <input
                type="text"
                name="address"
                id="address"
                required
                value={shippingDetails.address}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  required
                  value={shippingDetails.city}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="state">State / Province</label>
                <input
                  type="text"
                  name="state"
                  id="state"
                  required
                  value={shippingDetails.state}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pincode">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  id="pincode"
                  required
                  value={shippingDetails.pincode}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  value={shippingDetails.phone}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-8 lg:mt-0 lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 border-b pb-4 mb-4">
                {cart.map((item) => (
                  <div
                    key={item.cartKey}
                    className="flex justify-between text-sm"
                  >
                    <p className="text-gray-600">
                      {item.displayName || item.name} x{item.quantity}
                    </p>
                    <p className="font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900">
                <p>Total</p>
                <p>₹{totalCartValue.toFixed(2)}</p>
              </div>
              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CheckoutPage;