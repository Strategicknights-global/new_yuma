// src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import { ChevronRight, Package } from "lucide-react";
import Navbar from "../components/Navbar";

const Orders = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user?.uid) {
      navigate("/login?redirect=/orders");
      return;
    }

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        setOrders(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isLoggedIn, navigate]);

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          Order History
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Date:{" "}
                      {order.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total: ₹{order.totalAmount?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-red-600 hover:text-red-800"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No Orders Yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't placed any orders with us yet.
              </p>
              <div className="mt-6">
                <Link
                  to="/products"
                  className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Orders;