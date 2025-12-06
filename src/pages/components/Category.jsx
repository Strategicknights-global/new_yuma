import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Apple, Baby, Users, Coffee, Heart, Tag, Truck } from "lucide-react";
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Categories() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const categoryList = [
    { icon: <Baby className="w-10 h-10 text-[#2f8f2b]" />, label: "Kids Friendly" },
    { icon: <Users className="w-10 h-10 text-[#2f8f2b]" />, label: "Women's Care" },
    { icon: <Coffee className="w-10 h-10 text-[#2f8f2b]" />, label: "Diabetes Friendly" },
    { icon: <Apple className="w-10 h-10 text-[#2f8f2b]" />, label: "Zero Sugar" },
    { icon: <Activity className="w-10 h-10 text-[#2f8f2b]" />, label: "Nutrient Rich" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("Kids Friendly");
  const [allProducts, setAllProducts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [notification, setNotification] = useState("");
  useEffect(() => {
    const goalsRef = collection(db, "shopGoals"); 
    
    const unsubscribe = onSnapshot(goalsRef, (snapshot) => {
      const goalsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(goalsData);
    }, (error) => {
      console.error("❌ Error fetching goals:", error);
    });

    return () => unsubscribe();
  }, []);

  // Fetch wishlist using onSnapshot
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) setWishlist(snap.data().wishlist || []);
      else setWishlist([]);
    });
    return () => unsubscribe();
  }, [user]);

  // Load wishlist from localStorage for non-authenticated users
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2500);
  };

  const handleWishlistToggle = async (product, e) => {
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

    // If user is logged in, sync with Firebase
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        if (wishlist.includes(product.id)) {
          await updateDoc(userRef, { wishlist: arrayRemove(product.id) });
        } else {
          await updateDoc(userRef, { wishlist: arrayUnion(product.id) });
        }
      } catch (error) {
        console.error("Error updating wishlist:", error);
      }
    }
  };

  const handleAddToCart = (product, buttonRef, closeOverlay = null) => {
    if (!product.inStock) {
      showNotification(`${product.name} is currently out of stock`);
      return;
    }
    const variant = product.selectedVariant || product.variants?.[0] || null;
    addToCart(product, 1, variant);
    showNotification(`${product.name} added to cart`);
    if (closeOverlay) closeOverlay();
    if (buttonRef?.current) {
      buttonRef.current.style.transform = "scale(0.95)";
      setTimeout(() => { if (buttonRef.current) buttonRef.current.style.transform = "scale(1)"; }, 150);
    }
  };
  useEffect(() => {
    const productsRef = collection(db, "products");
    
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllProducts(products);
      setLoading(false);
    }, (error) => {
      console.error("❌ Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const selectedGoal = goals.find(g => 
    g.name?.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
  );
  const selectedGoalId = selectedGoal?.id;

  const filteredProducts = allProducts.filter((product) => {
    if (selectedGoalId && product.goalId === selectedGoalId) {

      return true;
    }
    if (product.goalName && String(product.goalName).trim().toLowerCase() === String(selectedCategory).trim().toLowerCase()) {
      return true;
    }

    if (selectedGoalId && product.goalIds?.includes(selectedGoalId)) {
      return true;
    }
    
    return false;
  });
  

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleCategoryClick = (categoryLabel) => {
    setSelectedCategory(categoryLabel);
  };

  return (
    <div className="w-full py-20 bg-white relative">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
          {notification}
        </div>
      )}

      {/* Title */}
      <h1 className="text-center text-[20px] sm:text-4xl md:text-[48px] font-extrabold text-[#07602e] font-serif">
        Pick What Fits Your Goal
      </h1>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-10 sm:gap-16 md:gap-20 px-4 mt-10">
        {categoryList.map((cat, index) => (
          <Category
            key={index}
            icon={cat.icon}
            label={cat.label}
            onClick={() => handleCategoryClick(cat.label)}
            active={selectedCategory === cat.label}
          />
        ))}
      </div>

      {/* Products Carousel - Only show if products exist */}
      {!loading && filteredProducts.length > 0 && (
        <>
          <h2 className="text-xl sm:text-2xl font-bold mt-14 mb-4 text-center text-[#07602e]">
            {selectedCategory} Products
          </h2>

          <div className="overflow-x-auto px-6 py-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="flex gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlist={wishlist}
                  onToggleWishlist={handleWishlistToggle}
                  onAddToCart={handleAddToCart}
                  onClick={() => handleProductClick(product.id)}
                  navigate={navigate}
                  showNotification={showNotification}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center mt-14">
          <div className="w-12 h-12 border-4 border-[#2f8f2b] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* No Products Message */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center mt-14 text-gray-500">
          <p className="text-lg">No products found for {selectedCategory}</p>
          <p className="text-sm mt-2">Make sure goals are created in admin panel with exact names</p>
        </div>
      )}
    </div>
  );
}

// Category Button Component
function Category({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center cursor-pointer transition-transform duration-300 
        ${active ? "-translate-y-2" : "hover:-translate-y-1"}
      `}
    >
      <div
        className={`
          w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
          rounded-full flex items-center justify-center shadow-lg 
          bg-gradient-to-br from-[#f7ffe0] to-[#d0f5a9]
          ${active ? "ring-4 ring-[#2f8f2b]" : ""}
        `}
      >
        {icon}
      </div>

      <div
        className={`mt-3 text-sm sm:text-base md:text-lg ${
          active ? "text-[#064d25] font-bold" : "text-[#2f8f2b]"
        }`}
      >
        {label}
      </div>
    </button>
  );
}

// Integrated ProductCard Component - Matching PopularProducts exactly
function ProductCard({ product, wishlist, onToggleWishlist, onAddToCart, onClick, navigate, showNotification }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [showOverlay, setShowOverlay] = useState(false);
  const buttonRef = useRef(null);

  const price = selectedVariant?.discountPrice ?? selectedVariant?.price ?? product.price ?? 0;
  const originalPrice = selectedVariant?.price ?? product.originalPrice;
  const discountPercentage = selectedVariant?.discountPercentage || 0;
  const isInStock = product.inStock !== false;

  return (
    <div className="min-w-[250px] w-[250px] flex-shrink-0">
      <div className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
        {/* Lazy Loaded Image */}
        <img
          src={product.images?.[0] || "https://via.placeholder.com/150"}
          alt={product.name}
          onClick={onClick}
          loading="lazy" // <--- lazy loading here
          className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
        />

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 flex flex-row gap-1 z-10">
            <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
              <Tag size={12} />
              <span>{Math.round(discountPercentage)}% OFF</span>
            </div>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => onToggleWishlist(product, e)}
          className="absolute top-2 right-2 bg-white/90 p-2 rounded-full hover:bg-white hover:scale-110 transition duration-300 shadow-md z-10"
        >
          <Heart
            className={`w-5 h-5 transition-all duration-200 ${
              wishlist.includes(product.id)
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>

        {/* Out of Stock Overlay */}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <div className="bg-black/90 text-white px-6 py-3 rounded-lg text-sm font-bold">
              OUT OF STOCK
            </div>
          </div>
        )}

        {/* Choose Options Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOverlay(true);
          }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black text-white font-semibold px-5 py-2 rounded-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 duration-300 whitespace-nowrap z-10"
        >
          Choose Options
        </button>

        {/* Overlay */}
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
                <span className="text-sm line-through text-gray-400">₹{originalPrice}</span>
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

            <p 
              onClick={() => { navigate(`/products/${product.id}`); }} 
              className="text-center text-sm text-gray-700 underline cursor-pointer"
            >
              View full details
            </p>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div onClick={onClick} className="pt-3 text-center cursor-pointer">
        <h3 className="text-sm font-semibold line-clamp-1 text-gray-800">{product.name}</h3>
        <div className="flex justify-center items-center gap-2 mt-1">
          <span className="text-lg font-bold text-[#b85a00]">₹{price}</span>
          {selectedVariant?.discountPrice && (
            <span className="text-sm line-through text-gray-400">₹{originalPrice}</span>
          )}
        </div>
        <p 
          onClick={() => { navigate(`/products/${product.id}`); }} 
          className="text-center text-sm text-gray-700 underline cursor-pointer mt-1"
        >
          View full details
        </p>
      </div>
    </div>
  );
}
