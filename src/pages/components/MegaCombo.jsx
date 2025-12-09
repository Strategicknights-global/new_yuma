import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronLeft, Heart, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  query,
  where,
  getDocs,
  collection,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

// -----------------------
// Helper Functions
// -----------------------
function getProductPrice(product) {
  if (!product) return 0;

  if (product.variants?.length > 0) {
    const first = product.variants[0];
    return first.discountPrice ?? first.price ?? product.originalPrice ?? 0;
  }

  return product.discountPrice ?? product.price ?? product.originalPrice ?? 0;
}

function getDiscountPercentage(product) {
  try {
    const first = product.variants?.[0];
    const original = first?.price ?? product.originalPrice;
    const discounted = first?.discountPrice ?? product.discountPrice;

    if (!original || !discounted) return 0;

    return ((original - discounted) / original) * 100;
  } catch {
    return 0;
  }
}

// -----------------------
// ProductCard Component
// -----------------------
function ComboProductCard({ product, wishlist, onToggleWishlist, onAddToCart, navigate, showNotification }) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || null
  );
  const [showOverlay, setShowOverlay] = useState(false);
  const buttonRef = useRef(null);

  const price =
    selectedVariant?.discountPrice ??
    selectedVariant?.price ??
    getProductPrice(product);

  const discountPercentage = getDiscountPercentage(product);
  const isInStock = product.inStock !== false;

  let originalPrice = null;
  if (selectedVariant) {
    originalPrice = selectedVariant.price;
  } else if (product.variants && product.variants.length > 0) {
    originalPrice = product.variants[0].price;
  } else {
    originalPrice = product.originalPrice;
  }

  return (
    <div className="snap-start min-w-[250px] max-w-[250px]">
      {/* Image + badge + wishlist */}
      <div className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
        <img
          src={product.images?.[0]}
          alt={product.name}
          onClick={() => navigate(`/products/${product.id}`)}
          loading="lazy"
          className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
        />

        {/* Discount badge */}
        <div className="absolute top-2 left-2 flex flex-row gap-1 z-10">
          {discountPercentage > 0 && (
            <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
              <Tag size={12} className="text-orange-100" />
              <span>{Math.round(discountPercentage)}% OFF</span>
            </div>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white hover:scale-110 transition-all duration-300 z-10 shadow-md"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              wishlist.includes(product.id)
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>

        {/* Out of stock overlay */}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[5]">
            <div className="bg-black/90 text-white px-6 py-3 rounded-lg font-bold text-sm shadow-xl">
              OUT OF STOCK
            </div>
          </div>
        )}

        {/* Choose options button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOverlay(true);
          }}
          className="
            absolute bottom-3 left-1/2 -translate-x-1/2
            bg-black text-white font-semibold 
            px-5 py-2 rounded-[12px]
            opacity-100 md:opacity-0            
            md:group-hover:opacity-100         
            transition-all duration-300 whitespace-nowrap
          "
        >
          Choose Options
        </button>

        {/* Overlay (Choose Variants + Add to Cart) */}
        {showOverlay && (
          <div
            className="absolute inset-0 bg-white z-50 flex flex-col p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowOverlay(false)}
              className="absolute top-2 right-2 bg-gray-100 p-2 rounded-full hover:bg-gray-200 z-10"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold text-gray-800 mb-2 pr-8">
              {product.name}
            </h2>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-base font-bold text-red-600">
                ₹{price}
              </span>
              {selectedVariant?.discountPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>

            {product.variants && product.variants.length > 0 && (
              <>
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Choose weight:
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {product.variants.map((v, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVariant(v);
                      }}
                      className={`px-3 py-1.5 text-sm rounded-lg border 
                        ${
                          selectedVariant === v
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-700 border-gray-300"
                        }
                      `}
                    >
                      {v.weight || v.size || `Variant ${index + 1}`}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart({ ...product, selectedVariant });
                setShowOverlay(false);
              }}
              className="w-full bg-black text-white py-2.5 rounded-xl font-semibold text-sm mb-2"
              disabled={!isInStock}
            >
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </button>

            <p
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products/${product.id}`);
              }}
              className="text-center text-sm text-gray-700 underline cursor-pointer"
            >
              View full details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------
// Main Banner Component
// -----------------------
export default function MegaComboBanner({ title = 'Mega Combo Packs', limit = 20 }) {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");

  const scrollerRef = useRef(null);

  // Load wishlist
  useEffect(() => {
    if (!user) {
      const guestWishlist = JSON.parse(
        localStorage.getItem("guestWishlist") || "[]"
      );
      setWishlist(guestWishlist);
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

  // Get category ID by name
  const getCategoryId = async (name) => {
    const q = query(
      collection(db, "categories"),
      where("name", "==", name)
    );

    const snap = await getDocs(q);
    if (snap.empty) return null;

    return snap.docs[0].id;
  };

  // Fetch products by category ID
  const getCategoryProducts = async (categoryId) => {
    const q = query(
      collection(db, "products"),
      where("categoryId", "==", categoryId)
    );

    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  // Load combo products
  useEffect(() => {
    const loadComboProducts = async () => {
      setLoading(true);

      try {
        const categoryId = await getCategoryId("Combos");
        
        if (!categoryId) {
          console.log("Combos category not found");
          setProducts([]);
          setLoading(false);
          return;
        }

        let fetchedProducts = await getCategoryProducts(categoryId);
        setProducts(fetchedProducts.slice(0, limit));
      } catch (error) {
        console.error("Error fetching combo products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadComboProducts();
  }, [limit]);

  // Auto-scroll effect
  useEffect(() => {
    if (products.length <= 1) return; // Don't auto-scroll if 1 or fewer products

    const scrollInterval = setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;

      const maxScroll = el.scrollWidth - el.clientWidth;
      const currentScroll = el.scrollLeft;

      if (currentScroll >= maxScroll - 10) {
        // Reset to start when reaching the end
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll by one card width
        el.scrollBy({ left: 270, behavior: 'smooth' });
      }
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(scrollInterval);
  }, [products]);

  const scrollBy = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = 270;
    el.scrollBy({ left: cardWidth * dir, behavior: "smooth" });
  };

  const showNotificationMsg = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleWishlistToggle = async (product) => {
    if (!isLoggedIn) {
      const guestWishlist = JSON.parse(
        localStorage.getItem("guestWishlist") || "[]"
      );

      if (guestWishlist.includes(product.id)) {
        const updated = guestWishlist.filter((id) => id !== product.id);
        localStorage.setItem("guestWishlist", JSON.stringify(updated));
        setWishlist(updated);
        showNotificationMsg(`${product.name} removed from wishlist`);
      } else {
        const updated = [...guestWishlist, product.id];
        localStorage.setItem("guestWishlist", JSON.stringify(updated));
        setWishlist(updated);
        showNotificationMsg(`${product.name} added to wishlist`);
      }
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      if (wishlist.includes(product.id)) {
        await updateDoc(userRef, { wishlist: arrayRemove(product.id) });
        showNotificationMsg(`${product.name} removed from wishlist`);
      } else {
        await updateDoc(userRef, { wishlist: arrayUnion(product.id) });
        showNotificationMsg(`${product.name} added to wishlist`);
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
      showNotificationMsg("Failed to update wishlist");
    }
  };

  const handleAddToCart = (productData) => {
    const product = productData.selectedVariant
      ? { ...productData, selectedVariant: productData.selectedVariant }
      : productData;

    if (!product.inStock) {
      showNotificationMsg(`${product.name} is currently out of stock`);
      return;
    }

    const variant =
      product.selectedVariant ||
      (product.variants && product.variants.length > 0
        ? product.variants[0]
        : null);

    addToCart(product, 1, variant);

    const displayName = variant
      ? `${product.name} (${variant.weight || variant.size})`
      : product.name;
    showNotificationMsg(`${displayName} added to cart`);
  };

  if (loading) {
    return (
      <section className="w-full p-6 max-w-7xl mx-auto">
        <div className="relative mega-banner bg-gradient-to-br from-[#57ba40] via-[#4fa838] to-[#43942f] p-6 md:p-8 shadow-2xl rounded-3xl">
          <div className="text-center py-10 text-white">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4">Loading combos…</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full p-6 max-w-7xl mx-auto">
      <style>{`
        .mega-scroll::-webkit-scrollbar { display: none; }
        .mega-banner::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
          pointer-events: none;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .mega-banner h3 {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          {notification}
        </div>
      )}

      <div className="relative mega-banner bg-gradient-to-br from-[#57ba40] via-[#4fa838] to-[#43942f] p-6 md:p-8 shadow-2xl rounded-3xl overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        {/* Content Container */}
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">
          {/* Left Side - Title Section */}
          <div className="flex-shrink-0 text-white lg:w-80 lg:pr-6">
            <div className="relative">
              <div className="absolute -top-2 -left-2 w-20 h-20 bg-orange-500 rounded-full opacity-20 blur-xl"></div>
              <h3 className="text-5xl lg:text-6xl font-black mb-2 relative">
                <span className="bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  {title}
                </span>
              </h3>
              <div className="h-1 w-24 bg-gradient-to-r from-orange-400 to-transparent rounded-full mb-3"></div>
              <p className="text-lg opacity-90 font-medium">
                Swipe to explore the best combos.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-sm opacity-75">Limited Time Offers</span>
              </div>
            </div>
          </div>

          {/* Vertical Divider (Desktop Only) */}
          <div className="hidden lg:block w-px h-48 bg-white/20"></div>

          {/* Right Side - Product Slider */}
          <div className="flex-1 w-full lg:pl-4">
            <div 
              ref={scrollerRef} 
              className="mega-scroll flex gap-4 overflow-x-auto py-2 snap-x snap-mandatory"
            >
              {products.length === 0 ? (
                <div className="text-white/80 py-10 px-4 text-center w-full">
                  <p className="text-2xl font-semibold">Coming Soon......</p>
                  <p className="text-sm mt-2 opacity-75">
                    Exciting combo packs are on their way!
                  </p>
                </div>
              ) : (
                products.map((p) => (
                  <ComboProductCard
                    key={p.id}
                    product={p}
                    wishlist={wishlist}
                    onToggleWishlist={handleWishlistToggle}
                    onAddToCart={handleAddToCart}
                    navigate={navigate}
                    showNotification={showNotificationMsg}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* View All Button */}
        {/* {products.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate('/products?category=Combos')}
              className="bg-white text-[#57ba40] px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              View All Combos
            </button>
          </div>
        )} */}
      </div>
    </section>
  );
}