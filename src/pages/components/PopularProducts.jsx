import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  doc,
  collection, // Added collection to fetch goals
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { Heart, Truck, Tag, CheckCircle } from "lucide-react"; // Added CheckCircle

// Helper to get final price
const getProductPrice = (product) => {
  if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0];
    return firstVariant.discountPrice ?? firstVariant.price ?? 0;
  }
  return product.price ?? 0;
};

// Helper to get discount percentage
const getDiscountPercentage = (product) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants[0].discountPercentage || 0;
  }
  return 0;
};

const PopularProducts = ({ products, categories }) => {
  // --- STATE ---
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeGoal, setActiveGoal] = useState(null); // Filter for Goal
  const [goals, setGoals] = useState([]); // Store fetched goals
  const [wishlist, setWishlist] = useState([]);
  const [notification, setNotification] = useState("");
  
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isLoggedIn } = useAuth();

  // 1. Fetch User Wishlist
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setWishlist(docSnap.data().wishlist || []);
      } else {
        setWishlist([]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Fetch Shop Goals (New)
  useEffect(() => {
    const goalsRef = collection(db, "shopGoals");
    const unsubscribe = onSnapshot(goalsRef, (snapshot) => {
      const goalsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(goalsData);
    });
    return () => unsubscribe();
  }, []);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 2500);
  };

  const handleWishlistToggle = async (product) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    try {
      const userRef = doc(db, "users", user.uid);
      if (wishlist.includes(product.id)) {
        await updateDoc(userRef, { wishlist: arrayRemove(product.id) });
        showNotification(`${product.name} removed from wishlist`);
      } else {
        await updateDoc(userRef, { wishlist: arrayUnion(product.id) });
        showNotification(`${product.name} added to wishlist`);
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
      showNotification("Failed to update wishlist");
    }
  };

  const handleAddToCart = (product, buttonRef) => {
    if (!product.inStock) {
      showNotification(`${product.name} is currently out of stock`);
      return;
    }
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const variant =
      product.variants && product.variants.length > 0
        ? product.variants[0]
        : null;

    addToCart(product, 1, variant);

    const displayName = variant
      ? `${product.name} (${variant.size})`
      : product.name;
    showNotification(`${displayName} added to cart`);

    if (buttonRef && buttonRef.current) {
      buttonRef.current.classList.add("clicked");
      setTimeout(() => {
        buttonRef.current.classList.remove("clicked");
      }, 1500);
    }
  };

  const handleBuyNow = (product) => {
    if (!product.inStock) {
      showNotification(`${product.name} is currently out of stock`);
      return;
    }
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const variant =
      product.variants && product.variants.length > 0
        ? product.variants[0]
        : null;

    addToCart(product, 1, variant);
    showNotification(`${product.name} added to cart`);
    setTimeout(() => navigate("/cart"), 800);
  };

  // --- FILTER HANDLERS ---
  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    setActiveGoal(null); // Reset goal if category is picked
  };

  const handleGoalClick = (goalId) => {
    // Toggle: if clicking the same goal, turn it off
    if (activeGoal === goalId) {
        setActiveGoal(null);
    } else {
        setActiveGoal(goalId);
        setActiveCategory("All"); // Reset category if goal is picked
    }
  };

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter((p) => {
    // 1. Filter by Goal
    if (activeGoal) {
        return p.goalId === activeGoal;
    }
    // 2. Filter by Category
    if (activeCategory === "All") {
      return true;
    }
    return p.categoryId === activeCategory;
  });

  return (
    <section className="py-12 bg-white relative">
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
          {notification}
        </div>
      )}

      {/* ✅ CSS Styles */}
      <style>{`
        /* ... existing cart button styles ... */
        .cart-button {
          position: relative;
          padding: 10px;
          width: 140px;
          height: 44px;
          border: 2px solid #57ba40;
          border-radius: 10px;
          background-color: #ffffff;
          outline: none;
          cursor: pointer;
          color: #57ba40;
          transition: .3s ease-in-out;
          overflow: hidden;
          font-size: 14px;
        }
        .cart-button:hover:not(.disabled-out-of-stock) {
          background-color: #f0fdf4;
        }
        .cart-button:active {
          transform: scale(.9);
        }
        .cart-button .fa-shopping-cart {
          position: absolute;
          z-index: 2;
          top: 50%;
          left: -10%;
          font-size: 1.2em;
          transform: translate(-50%,-50%);
          color: #57ba40;
        }
        .cart-button .fa-box {
          position: absolute;
          z-index: 3;
          top: -20%;
          left: 52%;
          font-size: 0.9em;
          transform: translate(-50%,-50%);
          color: #57ba40;
        }
        .cart-button span {
          position: absolute;
          z-index: 3;
          left: 50%;
          top: 50%;
          font-size: 0.9em;
          color: #57ba40;
          transform: translate(-50%,-50%);
        }
        .cart-button span.add-to-cart { opacity: 1;font-size: 16px; white-space: nowrap; }
        .cart-button span.added { opacity: 0; }
        .cart-button.clicked .fa-shopping-cart { animation: cart 1.5s ease-in-out forwards; }
        .cart-button.clicked .fa-box { animation: box 1.5s ease-in-out forwards; }
        .cart-button.clicked span.add-to-cart { animation: txt1 1.5s ease-in-out forwards; }
        .cart-button.clicked span.added { animation: txt2 1.5s ease-in-out forwards; }

        @keyframes cart { 0% { left: -10%; } 40%, 60% { left: 50%; } 100% { left: 110%; } }
        @keyframes box { 0%, 40% { top: -20%; } 60% { top: 40%; left: 52%; } 100% { top: 40%; left: 112%; } }
        @keyframes txt1 { 0% { opacity: 1; } 20%, 100% { opacity: 0; } }
        @keyframes txt2 { 0%, 80% { opacity: 0; } 100% { opacity: 1; } }

        .product-image { transition: transform 0.4s ease, box-shadow 0.4s ease; }
        .product-image:hover { transform: scale(1.05); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
        
        .cart-button.disabled-out-of-stock {
          border: 2px solid #ff0000 !important;
          background-color: #ffe5e5 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }
        .cart-button.disabled-out-of-stock span, .cart-button.disabled-out-of-stock i { color: #ff0000 !important; opacity: 1 !important; }
        .cart-button.disabled-out-of-stock.clicked .fa-shopping-cart,
        .cart-button.disabled-out-of-stock.clicked .fa-box,
        .cart-button.disabled-out-of-stock.clicked span.add-to-cart,
        .cart-button.disabled-out-of-stock.clicked span.added { animation: none !important; }
        
        /* --- GOAL CARD STYLES --- */
        .goal-card-overlay {
            background: rgba(0,0,0,0.3);
            transition: background 0.3s ease;
        }
        .goal-card:hover .goal-card-overlay {
            background: rgba(0,0,0,0.5);
        }
        .goal-card:hover img {
            transform: scale(1.1);
        }
      `}</style>

      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-4">
            <h2 className="font-['Poppins'] font-sans font-medium text-[#07602e] text-5xl md:text-6xl relative">
              {activeGoal 
                ? `Shop for ${goals.find(g => g.id === activeGoal)?.name}` 
                : "Popular Products"}
            </h2>
          </div>
        </div>

        {/* --- EXISTING CATEGORY FILTERS --- */}
        <div className="flex justify-center mb-8 space-x-4 flex-wrap gap-y-2">
          <button
            onClick={() => handleCategoryClick("All")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeCategory === "All" && !activeGoal
                ? "bg-[#00a63e] text-white"
                : "bg-white border border-[#57ba40] text-gray-700 hover:bg-green-50"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeCategory === cat.id
                  ? "bg-[#00a63e] text-white"
                  : "bg-white border border-[#57ba40] text-gray-700 hover:bg-green-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* --- PRODUCTS GRID --- */}
        {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
                <p className="text-xl text-gray-500">No products found matching your selection.</p>
                <button onClick={() => { setActiveGoal(null); setActiveCategory("All"); }} className="mt-4 text-[#57ba40] font-bold hover:underline">
                    Clear all filters
                </button>
            </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:mx-50">
          {filteredProducts.slice(0, 8).map((product) => {
  const isWishlisted = wishlist.includes(product.id);
  const buttonRef = React.createRef();
  const isInStock = product.inStock !== false;

  // Variant selection support (default = first variant)
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || null
  );

  const price =
    selectedVariant?.discountPrice ??
    selectedVariant?.price ??
    getProductPrice(product);

  const discountPercentage = getDiscountPercentage(product);

  let originalPrice =
    selectedVariant?.price ??
    product.variants?.[0]?.price ??
    product.originalPrice;

  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div key={product.id} className="max-w-[250px] w-full mx-auto">
      {/* CARD WRAPPER */}
      <div className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">

        {/* PRODUCT IMAGE */}
        <img
          src={product.images?.[0]}
          alt={product.name}
          onClick={() => navigate(`/products/${product.id}`)}
          className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
        />

        {/* ----- BADGES TOP LEFT ----- */}
        <div className="absolute top-2 left-2 flex flex-row gap-1 z-10">
          {isInStock && (
            <div className="bg-[#57ba40] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
              <Truck size={12} />
              <span>Free Shipping</span>
            </div>
          )}

          {discountPercentage > 0 && (
            <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
              <Tag size={12} />
              <span>{Math.round(discountPercentage)}% OFF</span>
            </div>
          )}
        </div>

        {/* ----- WISHLIST TOP RIGHT ----- */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleWishlistToggle(product);
          }}
          className="absolute top-2 right-2 bg-white/90 p-2 rounded-full hover:bg-white hover:scale-110 transition duration-300 shadow-md"
        >
          <Heart
            className={`w-5 h-5 ${
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>

        {/* ----- OUT OF STOCK OVERLAY ----- */}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <div className="bg-black/90 text-white px-6 py-3 rounded-lg text-sm font-bold">
              OUT OF STOCK
            </div>
          </div>
        )}

        {/* ----- CHOOSE OPTIONS BUTTON (MOBILE ALWAYS VISIBLE) ----- */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOverlay(true);
          }}
          className="
            absolute bottom-3 left-1/2 -translate-x-1/2
            bg-black text-white font-semibold px-5 py-2 rounded-xl
            opacity-100 md:opacity-0 md:group-hover:opacity-100
            duration-300 whitespace-nowrap
          "
        >
          Choose Options
        </button>

        {/* ----- VARIANT OVERLAY PANEL ----- */}
        {showOverlay && (
          <div
            className="absolute inset-0 bg-white z-[50] flex flex-col p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowOverlay(false)}
              className="absolute top-2 right-2 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
            >
              ✕
            </button>

            {/* Name */}
            <h2 className="text-lg font-semibold pr-10">{product.name}</h2>

            {/* Price */}
            <div className="flex items-center gap-2 my-3">
              <span className="text-red-600 font-bold text-lg">₹{price}</span>
              {selectedVariant?.discountPrice && (
                <span className="text-sm line-through text-gray-400">
                  ₹{originalPrice}
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <>
                <p className="text-sm text-gray-600 mb-2">Choose weight:</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {product.variants.map((v, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        selectedVariant === v
                          ? "bg-black text-white"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {v.weight || v.size || `Variant ${index + 1}`}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Add to cart */}
            <button
              onClick={() => {
                handleAddToCart(
                  { ...product, selectedVariant },
                  buttonRef
                );
                setShowOverlay(false);
              }}
              disabled={!isInStock}
              className="w-full bg-black text-white py-2.5 rounded-lg font-semibold mb-3"
            >
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </button>

            {/* View details */}
            <p
              onClick={() => navigate(`/products/${product.id}`)}
              className="text-center text-sm text-gray-700 underline cursor-pointer"
            >
              View full details
            </p>
          </div>
        )}
      </div>

      {/* TITLE + PRICE SECTION */}
      <div
        onClick={() => navigate(`/products/${product.id}`)}
        className="pt-3 text-center cursor-pointer"
      >
        <h3 className="text-sm font-semibold line-clamp-1 text-gray-800">
          {product.name}
        </h3>

        <div className="flex justify-center items-center gap-2 mt-1">
          <span className="text-lg font-bold text-[#b85a00]">₹{price}</span>
          {selectedVariant?.discountPrice && (
            <span className="text-sm line-through text-gray-400">
              ₹{originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
})}

        </div>
        )}
      </div>
    </section>
  );
};

export default PopularProducts;