import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { ChevronRight } from "lucide-react";

const OrderStatusBadge = ({ status }) => {
  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-800",
    Shipped: "bg-blue-100 text-blue-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-3 py-1 text-sm font-medium rounded-full ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { user, isLoggedIn } = useAuth(); // ✅ updated
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user?.uid) {
      navigate("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() };

          // ✅ Ensure only the owner can view this order
          if (orderData.userId === user.uid) {
            setOrder(orderData);
          } else {
            console.error("Access denied: User does not own this order.");
            navigate("/profile");
          }
        } else {
          console.error("Order not found.");
          navigate("/profile");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, isLoggedIn, orderId, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Loading order details...
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Order not found or access denied.
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <Link to="/profile" className="hover:text-red-600">
            My Account
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="font-semibold text-gray-800">Order Details</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-6 border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-sm text-gray-500">
                Placed on{" "}
                {order.createdAt?.toDate
                  ? order.createdAt.toDate().toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Shipping Info */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
              <div className="text-gray-600">
                <p>{order.shippingDetails?.name}</p>
                <p>{order.shippingDetails?.address}</p>
                <p>
                  {order.shippingDetails?.city}, {order.shippingDetails?.state}{" "}
                  {order.shippingDetails?.pincode}
                </p>
                <p>Phone: {order.shippingDetails?.phone}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
              <div className="text-gray-600">
                <p className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{order.totalAmount?.toFixed(2)}</span>
                </p>
                <p className="flex justify-between font-bold text-gray-800 mt-2">
                  <span>Total:</span>
                  <span>₹{order.totalAmount?.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Items in this order</h2>
            <ul className="divide-y divide-gray-200 border-t border-b">
              {order.items?.map((item) => (
                <li key={item.cartKey} className="flex py-4">
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="w-16 h-16 rounded object-cover mr-4"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold">{item.displayName}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetailPage;
