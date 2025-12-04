import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  doc,
  collection,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
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

/* ----------------------- ProductCard ------------------------ */
/* ProductCard is a separate component so hooks can be used inside safely */
function ProductCard({ product, categories, wishlist, onToggleWishlist, onAddToCart, navigate, showNotification }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [showOverlay, setShowOverlay] = useState(false);
  const buttonRef = useRef(null);

  const price = selectedVariant?.discountPrice ?? selectedVariant?.price ?? getProductPrice(product);
  const discountPercentage = getDiscountPercentage(product);
  const isInStock = product.inStock !== false;

  return (
    <div className="max-w-[250px] w-full mx-auto">
      <div className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
        <img
          src={product.images?.[0]}
          alt={product.name}
          onClick={() => navigate(`/products/${product.id}`)}
          className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
        />

        <div className="absolute top-2 left-2 flex flex-row gap-1 z-10">
          {discountPercentage > 0 && (
            <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
              <Tag size={12} />
              <span>{Math.round(discountPercentage)}% OFF</span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => onToggleWishlist(product, e)}
          className="absolute top-2 right-2 bg-white/90 p-2 rounded-full hover:bg-white hover:scale-110 transition duration-300 shadow-md"
        >
          <Heart
            className={`w-5 h-5 transition-all duration-200 ${
              wishlist.includes(product.id)
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>

        {!isInStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <div className="bg-black/90 text-white px-6 py-3 rounded-lg text-sm font-bold">
              OUT OF STOCK
            </div>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOverlay(true);
          }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black text-white font-semibold px-5 py-2 rounded-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 duration-300 whitespace-nowrap"
        >
          Choose Options
        </button>

        {showOverlay && (
          <div
            className="absolute inset-0 bg-white z-[50] flex flex-col p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowOverlay(false)}
              className="absolute top-2 right-2 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold pr-10">{product.name}</h2>

            <div className="flex items-center gap-2 my-3">
              <span className="text-red-600 font-bold text-lg">₹{price}</span>
              {selectedVariant?.discountPrice && (
                <span className="text-sm line-through text-gray-400">₹{product.variants?.[0]?.price ?? product.originalPrice}</span>
              )}
            </div>

            {product.variants?.length > 0 && (
              <>
                <p className="text-sm text-gray-600 mb-2">Choose weight:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.variants.map((v, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        selectedVariant === v ? "bg-black text-white" : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {v.weight || v.size || `Variant ${index + 1}`}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              ref={buttonRef}
              onClick={() => onAddToCart({ ...product, selectedVariant }, buttonRef, () => setShowOverlay(false))}
              disabled={!isInStock}
              className="w-full bg-black text-white py-2.5 rounded-lg font-semibold mb-3 transition-transform duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </button>

            <p onClick={() => { navigate(`/products/${product.id}`); }} className="text-center text-sm text-gray-700 underline cursor-pointer">View full details</p>
          </div>
        )}
      </div>

      <div onClick={() => navigate(`/products/${product.id}`)} className="pt-3 text-center cursor-pointer">
        <h3 className="text-sm font-semibold line-clamp-1 text-gray-800">{product.name}</h3>
        <div className="flex justify-center items-center gap-2 mt-1">
          <span className="text-lg font-bold text-[#b85a00]">₹{price}</span>
          {selectedVariant?.discountPrice && <span className="text-sm line-through text-gray-400">₹{product.variants?.[0]?.price ?? product.originalPrice}</span>}
        </div>
          <p onClick={() => { navigate(`/products/${product.id}`); }} className="text-center text-sm text-gray-700 underline cursor-pointer">View full details</p>
      </div>
    </div>
  );
}

/* -------------------- PopularProducts main -------------------- */
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

  // wishlist live-updates
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) setWishlist(snap.data().wishlist || []);
      else setWishlist([]);
    });
    return () => unsub();
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
useEffect(() => {
  const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  setWishlist(savedWishlist);
}, []);
useEffect(() => {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}, [wishlist]);

const handleWishlistToggle = (product, e) => {
  e?.stopPropagation();

  let updated;

  if (wishlist.includes(product.id)) {
    updated = wishlist.filter(id => id !== product.id);
    showNotification(`${product.name} removed from wishlist`);
  } else {
    updated = [...wishlist, product.id];
    showNotification(`${product.name} added to wishlist`);
  }

  setWishlist(updated);
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

  return (
    <section className="py-12 bg-white relative">
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
          {notification}
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-['Poppins'] text-5xl md:text-6xl text-[#07602e]">
            {activeGoal ? `Shop for ${goals.find(g => g.id === activeGoal)?.name ?? activeGoal}` : "Popular Products"}
          </h2>
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
            <p className="text-xl text-gray-500">No products found matching your selection.</p>
            <button onClick={() => { setActiveGoal(null); setActiveCategory("All"); }} className="mt-4 text-[#57ba40] font-bold hover:underline">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:mx-50">
            {filteredProducts.slice(0, 8).map(prod => (
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
        )}
      </div>
    </section>
  );
};

export default PopularProducts;
