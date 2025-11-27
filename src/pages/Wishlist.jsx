import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Heart } from "lucide-react";

const Wishlist = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to wishlist changes
  useEffect(() => {
    if (!isLoggedIn || !user?.uid) {
      navigate("/login?redirect=/wishlist");
      return;
    }

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, async (snap) => {
      if (snap.exists()) {
        const wishlist = snap.data().wishlist || [];

        // fetch product details for each wishlist item
        const productPromises = wishlist.map(async (productId) => {
          const prodRef = doc(db, "products", productId);
          const prodSnap = await getDoc(prodRef);
          if (prodSnap.exists()) {
            return { id: prodSnap.id, ...prodSnap.data() };
          }
          return null;
        });

        const products = (await Promise.all(productPromises)).filter(Boolean);
        setWishlistProducts(products);
      } else {
        setWishlistProducts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isLoggedIn, navigate]);

  // remove from wishlist
  const handleRemoveFromWishlist = async (productId) => {
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        wishlist: arrayRemove(productId),
      });
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-orange-50">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-orange-900 mb-8">My Wishlist</h1>

        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {wishlistProducts.map((p) => {
              const displayPrice =
                p.variants?.[0]?.discountPrice ??
                p.variants?.[0]?.price ??
                p.price;
              const originalPrice =
                p.variants?.[0]?.price ?? p.originalPrice;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col group"
                >
                  <div className="p-4 flex flex-col flex-grow">
                    <Link
                      to={`/products/${p.id}`}
                      className="block relative mb-4"
                    >
                      <img
                        src={p.images?.[0]}
                        alt={p.name}
                        className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <h3 className="font-semibold text-orange-800 mb-2 flex-grow">
                      <Link to={`/products/${p.id}`}>{p.name}</Link>
                    </h3>

                    <div className="flex items-baseline gap-2 mb-4">
                      {originalPrice && displayPrice < originalPrice && (
                        <span className="text-base text-orange-500 line-through">
                          ₹{originalPrice}
                        </span>
                      )}
                      <span className="text-xl font-bold text-orange-900">
                        ₹{displayPrice}
                      </span>
                    </div>

                    <div className="flex space-x-2 mt-auto">
                      <Link
                        to={`/products/${p.id}`}
                        className="flex-1 text-center bg-orange-500 text-white py-2 px-4 rounded font-semibold hover:bg-orange-600 text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleRemoveFromWishlist(p.id)}
                        className="p-2 rounded-full hover:bg-red-50"
                        aria-label="Remove from wishlist"
                      >
                        <Heart className="w-6 h-6 fill-red-500 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-orange-100 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-orange-800">
              Your Wishlist is Empty
            </h2>
            <p className="text-orange-600 mt-2">
              Browse products and add them to your wishlist.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;