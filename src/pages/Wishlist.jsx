import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayRemove,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Heart, X } from "lucide-react";

const Wishlist = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Get wishlist from localStorage for non-logged-in users
  const getLocalWishlist = () => {
    try {
      const stored = localStorage.getItem("wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // ✅ Save wishlist to localStorage
  const saveLocalWishlist = (productIds) => {
    localStorage.setItem("wishlist", JSON.stringify(productIds));
  };

  // ✅ Sync local wishlist to Firebase when user logs in
  useEffect(() => {
    const syncLocalToFirebase = async () => {
      if (isLoggedIn && user?.uid) {
        const localWishlist = getLocalWishlist();
        if (localWishlist.length > 0) {
          try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
              const existingWishlist = userSnap.data().wishlist || [];
              // Merge local and Firebase wishlists (remove duplicates)
              const mergedWishlist = [...new Set([...existingWishlist, ...localWishlist])];
              
              await updateDoc(userRef, {
                wishlist: mergedWishlist,
              });
            } else {
              // Create user document if it doesn't exist
              await setDoc(userRef, {
                wishlist: localWishlist,
                email: user.email,
              });
            }
            
            // Clear local storage after syncing
            localStorage.removeItem("wishlist");
          } catch (err) {
            console.error("Error syncing wishlist:", err);
          }
        }
      }
    };

    syncLocalToFirebase();
  }, [isLoggedIn, user]);

  // ✅ Listen to wishlist changes (Firebase for logged-in, localStorage for guests)
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);

      if (isLoggedIn && user?.uid) {
        // ✅ For logged-in users: use Firebase realtime listener
        const userRef = doc(db, "users", user.uid);

        const unsubscribe = onSnapshot(userRef, async (snap) => {
          if (snap.exists()) {
            const wishlist = snap.data().wishlist || [];

            // Fetch product details for each wishlist item
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
      } else {
        // ✅ For guest users: use localStorage
        const localWishlist = getLocalWishlist();

        if (localWishlist.length > 0) {
          const productPromises = localWishlist.map(async (productId) => {
            const prodRef = doc(db, "products", productId);
            const prodSnap = await getDoc(prodRef);
            if (prodSnap.exists()) {
              return { id: prodSnap.id, ...prodSnap.data() };
            }
            return null;
          });

          const products = (await Promise.all(productPromises)).filter(Boolean);
          setWishlistProducts(products);
        }
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, isLoggedIn]);

  // ✅ Remove from wishlist (works for both logged-in and guest users)
  const handleRemoveFromWishlist = async (productId) => {
    try {
      if (isLoggedIn && user?.uid) {
        // Remove from Firebase
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          wishlist: arrayRemove(productId),
        });
      } else {
        // Remove from localStorage
        const localWishlist = getLocalWishlist();
        const updatedWishlist = localWishlist.filter((id) => id !== productId);
        saveLocalWishlist(updatedWishlist);
        
        // Update UI immediately
        setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-[#57ba40]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#000000]">Wishlist</span>
        </div>

        {/* Header with Heart Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 border-2 border-gray-800 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-gray-800" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">My Wishlist</h1>
          {!isLoggedIn && (
            <p className="text-sm text-gray-600 mt-2">
              <Link to="/login" className="text-[#57ba40] hover:underline">
                Sign in
              </Link>{" "}
              to save your wishlist permanently
            </p>
          )}
        </div>

        {wishlistProducts.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 border-b border-gray-200 px-6 py-4 font-semibold text-gray-700 text-sm">
              <div className="col-span-1"></div>
              <div className="col-span-4">Product name</div>
              <div className="col-span-2 text-center">Unit price</div>
              <div className="col-span-2 text-center">Stock status</div>
              <div className="col-span-3"></div>
            </div>

            {/* Table Body */}
            {wishlistProducts.map((p) => {
              const displayPrice =
                p.variants?.[0]?.discountPrice ??
                p.variants?.[0]?.price ??
                p.price;
              const originalPrice =
                p.variants?.[0]?.price ?? p.originalPrice;
              
              const hasDiscount = originalPrice && displayPrice < originalPrice;

              return (
                <div
                  key={p.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-6 border-b border-gray-200 hover:bg-gray-50 transition-colors items-center"
                >
                  {/* Remove Button */}
                  <div className="md:col-span-1 flex justify-end md:justify-center absolute top-2 right-2 md:relative md:top-auto md:right-auto">
                    <button
                      onClick={() => handleRemoveFromWishlist(p.id)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Product Image and Name */}
                  <div className="md:col-span-4 flex items-center gap-4">
                    <Link to={`/products/${p.id}`}>
                      <img
                        src={p.images?.[0]}
                        alt={p.name}
                        className="w-20 h-20 object-cover rounded border border-gray-200"
                      />
                    </Link>
                    <Link
                      to={`/products/${p.id}`}
                      className="font-medium text-gray-900 hover:text-[#57ba40] transition-colors"
                    >
                      {p.name}
                    </Link>
                  </div>

                  {/* Unit Price */}
                  <div className="md:col-span-2 text-left md:text-center">
                    {hasDiscount && (
                      <div className="text-gray-400 line-through text-sm">
                        ₹{originalPrice}
                      </div>
                    )}
                    <div className={`font-bold ${hasDiscount ? 'text-orange-600' : 'text-gray-900'}`}>
                      ₹{displayPrice}
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="md:col-span-2 text-left md:text-center">
                    <span className="text-green-600 font-medium">In Stock</span>
                  </div>

                  {/* Add to Cart Button and Date */}
                  <div className="md:col-span-3 flex flex-col items-start md:items-end gap-2">
                    <div className="text-xs text-gray-500">
                      Added on: {new Date().toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <Link
                      to={`/products/${p.id}`}
                      className="bg-[#57ba40] text-white px-6 py-2 rounded hover:bg-[#ffffff] hover:border hover:border-[#57ba40] hover:text-[#57ba40] transition-colors font-medium text-sm"
                    >
                      Add to cart
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm px-4 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-600 mt-2">
              Browse products and add them to your wishlist.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block px-6 py-2 bg-[#57ba40] text-white font-semibold rounded-lg hover:bg-[#222222] transition-colors"
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