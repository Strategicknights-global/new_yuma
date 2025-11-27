import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Plus, Minus, Trash2, ChevronRight, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";  // ✅ Import Navbar

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, totalCartValue, loadingCart } =
    useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

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
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ Navbar always on top */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-red-600">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="font-semibold text-gray-800">Shopping Cart</span>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Your Cart</h1>

        {cart && cart.length > 0 ? (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
              <ul role="list" className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <li key={item.cartKey} className="flex p-4 sm:p-6">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-md object-cover sm:w-32 sm:h-32"
                      />
                    </div>
                    <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-md font-semibold text-gray-900">
                            <Link to={`/products/${item.id}`}>
                              {item.displayName}
                            </Link>
                          </h3>
                        </div>
                        <p className="mt-1 text-lg font-bold text-red-600">
                          ₹{item.price}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity(item.cartKey, item.quantity - 1)
                            }
                            className="p-2 text-gray-500 hover:text-gray-800"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 text-md font-medium text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.cartKey, item.quantity + 1)
                            }
                            className="p-2 text-gray-500 hover:text-gray-800"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.cartKey)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Order Summary */}
            <div className="mt-8 lg:mt-0 lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Order Summary
                </h2>
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>₹{totalCartValue.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Shipping and taxes will be calculated at checkout.
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
                <div className="mt-6 text-center">
                  <Link
                    to="/products"
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    or Continue Shopping<span aria-hidden="true"> &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty Cart View
          <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Your cart is empty
            </h2>
            <p className="mt-2 text-gray-600">
              Looks like you haven't added anything to your cart yet.
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
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
