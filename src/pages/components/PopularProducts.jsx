import React, {
  useEffect,
  useState,
  useRef,
  lazy,
  Suspense
} from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import {
  doc,
  collection,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { Heart, Truck, Tag } from "lucide-react";

/* -------------------------- helpers ------------------------- */
const getProductPrice = (product) => {
  if (product.variants && product.variants.length > 0) {
    const v = product.variants[0];
    return v.discountPrice ?? v.price ?? 0;
  }
  return product.price ?? 0;
};

const getDiscountPercentage = (product) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants[0].discountPercentage || 0;
  }
  return 0;
};

/* -------------------- PopularProducts main -------------------- */
const ProductCard = lazy(() => import("./ProductCard"));

const PopularProducts = ({ products = [], categories = [] }) => {
  // states
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeGoal, setActiveGoal] = useState(null);
  const [goals, setGoals] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notification, setNotification] = useState("");

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isLoggedIn } = useAuth();

  const [searchParams] = useSearchParams();
  const [showComingSoon, setShowComingSoon] = useState(true);

  // Track if we've already migrated for this user session
  const hasMigratedRef = useRef(false);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    // read ?category=... and ?goal=...
    const urlCategory = searchParams.get("category");
    const urlGoal = searchParams.get("goal");

    if (urlGoal) {
      setActiveGoal(urlGoal);
      setActiveCategory("All");
    } else if (urlCategory) {
      // decode and set
      setActiveCategory(decodeURIComponent(urlCategory));
      setActiveGoal(null);
    }
  }, [searchParams]);

  // ✅ COMBINED EFFECT: Handle both migration and real-time updates
  useEffect(() => {
    console.log("🔄 Wishlist effect triggered. User:", user?.uid || "No user");

    if (!user) {
      // ✅ Load from localStorage for non-logged-in users
      const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      console.log("📱 Loading from localStorage:", localWishlist);
      setWishlist(localWishlist);
      hasMigratedRef.current = false; // Reset migration flag on logout
      isFirstRenderRef.current = true; // Reset first render flag
      return;
    }

    // ✅ For logged-in users: Set up Firebase listener AND migrate
    const userRef = doc(db, "users", user.uid);
    
    // 🔥 ONLY run migration on the FIRST render to avoid double execution
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      
      // Capture localStorage IMMEDIATELY
      const localWishlistSnapshot = JSON.parse(localStorage.getItem("wishlist") || "[]");
      console.log("📸 Captured localStorage snapshot:", localWishlistSnapshot);
      
      // Migration function
      const migrateWishlist = async () => {
        if (hasMigratedRef.current) {
          console.log("⏭️ Migration already done for this session");
          return;
        }

        try {
          console.log("📦 Using wishlist snapshot:", localWishlistSnapshot);

          if (localWishlistSnapshot.length === 0) {
            console.log("✅ No items in localStorage to migrate");
            hasMigratedRef.current = true;
            return;
          }

          // Get current Firebase data
          const userSnap = await getDoc(userRef);
          console.log("🔥 Firebase user doc exists:", userSnap.exists());

          let firebaseWishlist = [];
          if (userSnap.exists()) {
            firebaseWishlist = userSnap.data().wishlist || [];
            console.log("🔥 Existing Firebase wishlist:", firebaseWishlist);
          }

          // Merge wishlists using the snapshot
          const mergedWishlist = [...new Set([...firebaseWishlist, ...localWishlistSnapshot])];
          console.log("🔀 Merged wishlist:", mergedWishlist);

          // Update or create Firebase document with merge: true to avoid permission issues
          await setDoc(userRef, { wishlist: mergedWishlist }, { merge: true });

          console.log("✅ Wishlist migrated successfully!");
          
          // Clear localStorage after successful migration
          localStorage.removeItem("wishlist");
          console.log("🗑️ LocalStorage cleared");
          
          hasMigratedRef.current = true;

        } catch (error) {
          console.error("❌ Migration error:", error);
          // Don't block the app if migration fails - just log it
          // User can still use their Firebase wishlist
        }
      };

      // Run migration
      migrateWishlist();
    }

    // Set up real-time listener (runs on every render)
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const fbWishlist = snap.data().wishlist || [];
        console.log("🔴 Firebase snapshot updated:", fbWishlist);
        setWishlist(fbWishlist);
      } else {
        console.log("⚠️ User document doesn't exist yet");
        setWishlist([]);
      }
    }, (error) => {
      console.error("❌ Snapshot error:", error);
    });

    return () => {
      console.log("🧹 Cleaning up Firebase listener");
      unsub();
    };
  }, [user]);

  // fetch goals from firestore
  useEffect(() => {
    const goalsRef = collection(db, "shopGoals");
    const unsub = onSnapshot(goalsRef, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setGoals(arr);
    });
    return () => unsub();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2500);
  };

  // ✅ UPDATED: handleWishlistToggle with localStorage support
  const handleWishlistToggle = async (product, e) => {
    e?.stopPropagation();
    console.log("❤️ Toggle wishlist for:", product.name, "User:", user?.uid || "No user");

    if (!user) {
      // ✅ For non-logged-in users: use localStorage
      const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      
      if (localWishlist.includes(product.id)) {
        const updated = localWishlist.filter(id => id !== product.id);
        localStorage.setItem("wishlist", JSON.stringify(updated));
        setWishlist(updated);
        console.log("➖ Removed from localStorage:", product.id);
        showNotification(`${product.name} removed from wishlist`);
      } else {
        const updated = [...localWishlist, product.id];
        localStorage.setItem("wishlist", JSON.stringify(updated));
        setWishlist(updated);
        console.log("➕ Added to localStorage:", product.id);
        showNotification(`${product.name} added to wishlist`);
      }
      return;
    }

    // ✅ For logged-in users: use Firebase
    try {
      const userRef = doc(db, "users", user.uid);

      // First check if document exists
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // Create document with this item
        console.log("📝 Creating new user document with wishlist");
        await setDoc(userRef, { wishlist: [product.id] }, { merge: true });
        showNotification(`${product.name} added to wishlist`);
        return;
      }

      // Document exists, update it
      if (wishlist.includes(product.id)) {
        console.log("➖ Removing from Firebase:", product.id);
        await updateDoc(userRef, { wishlist: arrayRemove(product.id) });
        showNotification(`${product.name} removed from wishlist`);
      } else {
        console.log("➕ Adding to Firebase:", product.id);
        await updateDoc(userRef, { wishlist: arrayUnion(product.id) });
        showNotification(`${product.name} added to wishlist`);
      }
    } catch (error) {
      console.error("❌ Error updating wishlist:", error);
      showNotification("Failed to update wishlist. Please try again.");
    }
  };

  const handleAddToCart = (product, buttonRef, closeOverlay = null) => {
    if (!product.inStock) {
      showNotification(`${product.name} is currently out of stock`);
      return;
    }
    const variant = product.variants?.[0] ?? null;
    addToCart(product, 1, variant);
    showNotification(`${product.name} added to cart`);
    if (closeOverlay) closeOverlay();
    if (buttonRef?.current) {
      buttonRef.current.style.transform = "scale(0.95)";
      setTimeout(() => { if (buttonRef.current) buttonRef.current.style.transform = "scale(1)"; }, 150);
    }
  };

  // FILTER: safe and supports category id OR category name in product
  const filteredProducts = (products || []).filter((p) => {
    // If goal active, match by goal id/name
    if (activeGoal) {
      // sometimes goal store as id or name; check both
      if (p.goalId) {
        if (p.goalId === activeGoal) return true;
      }
      if (p.goalName) {
        if (String(p.goalName).trim().toLowerCase() === String(activeGoal).trim().toLowerCase()) return true;
      }
      return false;
    }

    if (activeCategory === "All") return true;

    const activeCatStr = String(activeCategory || "").trim().toLowerCase();

    // 1) If product has direct category name field
    if (p.category) {
      if (String(p.category).trim().toLowerCase() === activeCatStr) return true;
    }

    // 2) If product has categoryId -> lookup in categories array
    if (p.categoryId && Array.isArray(categories) && categories.length > 0) {
      const cat = categories.find((c) => String(c.id) === String(p.categoryId) || String(c.id) === String(p.categoryId?.id));
      const catName = cat?.name ?? "";
      if (String(catName).trim().toLowerCase() === activeCatStr) return true;
    }

    // 3) fallback: if product has metadata or tags that include category text
    if (p.tags && Array.isArray(p.tags)) {
      const found = p.tags.some(t => String(t).trim().toLowerCase() === activeCatStr);
      if (found) return true;
    }

    return false;
  });

  const getDiverseProducts = (products, categories) => {
    const diverse = [];
    const used = new Set();
    
    // Try to get one product from each category first
    categories.forEach(cat => {
      const productFromCat = products.find(p => {
        if (used.has(p.id)) return false;
        
        // Check if product belongs to this category
        if (p.category && String(p.category).trim().toLowerCase() === String(cat.name).trim().toLowerCase()) {
          return true;
        }
        if (p.categoryId && (String(p.categoryId) === String(cat.id) || String(p.categoryId?.id) === String(cat.id))) {
          return true;
        }
        return false;
      });
      
      if (productFromCat) {
        diverse.push(productFromCat);
        used.add(productFromCat.id);
      }
    });
    
    // Fill remaining slots with any other products
    products.forEach(p => {
      if (diverse.length >= 4) return;
      if (!used.has(p.id)) {
        diverse.push(p);
        used.add(p.id);
      }
    });
    
    return diverse.slice(0, 4);
  };

  return (
    <section className="py-12 bg-white relative">
      {notification && (
        <div className="fixed top-20 right-4 z-[9999] bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
          {notification}
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-['Poppins'] text-5xl md:text-6xl text-[#07602e]">
            {activeGoal ? `Shop for ${goals.find(g => g.id === activeGoal)?.name ?? activeGoal}` : "Popular Products"}
          </h2>
          {/* <div className="text-xs text-gray-500 mt-2">
            Debug: {user ? `Logged in as ${user.uid.slice(0, 8)}...` : "Not logged in"} | 
            Wishlist items: {wishlist.length}
          </div> */}
        </div>

        {/* category buttons */}
        <div className="flex justify-center mb-8 space-x-4 flex-wrap gap-y-2">
          <button
            onClick={() => { setActiveCategory("All"); setActiveGoal(null); }}
            className={`px-4 py-2 rounded-lg transition-colors ${activeCategory === "All" && !activeGoal ? "bg-[#00a63e] text-white" : "bg-white border border-[#57ba40] text-gray-700 hover:bg-green-50"}`}
          >
            All Categories
          </button>

          {(categories || []).map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.name); setActiveGoal(null); }}
              className={`px-4 py-2 rounded-lg transition-colors ${activeCategory === cat.name ? "bg-[#00a63e] text-white" : "bg-white border border-[#57ba40] text-gray-700 hover:bg-green-50"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* products grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl text-[#57ba40] font-semibold flex items-center gap-2 justify-center">
              Coming Soon
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
              </span>
            </p>
            {!showComingSoon && (
              <button 
                onClick={() => { setActiveGoal(null); setActiveCategory("All"); }} 
                className="mt-4 text-[#57ba40] font-bold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <Suspense fallback={<div>Loading products...</div>}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:mx-50">
              {/* Show only 4 diverse products on homepage, but all on products page */}
              {getDiverseProducts(filteredProducts, categories).slice(0, 4).map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  categories={categories}
                  wishlist={wishlist}
                  onToggleWishlist={handleWishlistToggle}
                  onAddToCart={handleAddToCart}
                  navigate={navigate}
                  showNotification={showNotification}
                />
              ))}
            </div>
            {filteredProducts.length > 4 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => navigate("/products")} 
                  className="px-6 py-2 bg-[#00a63e] text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition"
                >
                  Explore More ({filteredProducts.length - 4} more products)
                </button>
              </div>
            )}
          </Suspense>
        )}
      </div>
    </section>
  );
};

export default PopularProducts;