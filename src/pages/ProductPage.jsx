import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Heart,
  Truck,
  Tag,
} from "lucide-react";

const PRODUCTS_PER_PAGE = 8;

// --- HELPERS ---
const getProductPrice = (product) => {
  if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0];
    return firstVariant.discountPrice ?? firstVariant.price ?? 0;
  }
  return product.price ?? 0;
};

const getDiscountPercentage = (product) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants[0].discountPercentage || 0;
  }
  return 0;
};
const ProductCard = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
}) => {
  const navigate = useNavigate();
  const buttonRef = useRef(null);

  const price = getProductPrice(product);
  const discountPercentage = getDiscountPercentage(product);
  const isInStock = product.inStock;
  let originalPrice = null;
  if (product.variants && product.variants.length > 0) {
    originalPrice = product.variants[0].price;
  } else {
    originalPrice = product.originalPrice;
  }
  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition relative max-w-[250px] w-full flex flex-col group cursor-pointer"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product);
        }}
        className="absolute top-3 right-3 z-20 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
      >
        <Heart
          className={`w-5 h-5 ${
            isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500"
          }`}
        />
      </button>
       <div className="absolute top-2 left-2 flex flex-row gap-1 z-10">
                        
                          <>
                          {product.inStock && (
          <div className="bg-[#57ba40] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                              <Truck size={12} className="text-teal-100" />
                              <span className="text-[13px]">Free Shipping</span>
                            </div>
      )}
      
                          
                            {discountPercentage > 0 && (
                              <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1 w-fit">
                                <Tag size={12} className="text-orange-100" />
                                <span>{Math.round(discountPercentage)}% OFF</span>
                              </div>
                            )}
                          </>
                       
                      </div>
      <div className="block overflow-hidden rounded-t-xl">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="product-image w-full h-48 object-cover"
        />
      </div>

      <div className="p-4 text-center flex-grow flex flex-col">
        <h3 className="text-md font-semibold text-gray-800 line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-2 mt-1 mb-4">
          <div className="text-xl font-bold text-[#b85a00]">₹{price}</div>
          {isInStock && discountPercentage > 0 && originalPrice && (
            <div className="text-xs text-gray-400 line-through">
              ₹{originalPrice}
            </div>
          )}
        </div>
        <div className="flex justify-center space-x-2 mt-auto">
          <button
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, buttonRef);
            }}
            disabled={!isInStock}
            className={`cart-button ${
              !isInStock ? "disabled-out-of-stock" : ""
            }`}
          >
            {isInStock ? (
              <>
                <span className="add-to-cart">Add</span>
                <span className="added">Added</span>
                <i className="fas fa-shopping-cart"></i>
                <i className="fas fa-box"></i>
              </>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </button>

          {isInStock && (
            <button
              onClick={() => handleBuyNow(p)}
              className="text-white px-4 py-2 rounded-lg bg-[#57ba40] 
               hover:bg-[#f0fdf4] hover:border-2 hover:border-[#57ba40]
               hover:text-[#57ba40] transition"
            >
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
const ProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategories, setActiveCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(5000);
  const [sortOption, setSortOption] = useState("top-sales");
  const [currentPage, setCurrentPage] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);

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
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productsSnapshot = await getDocs(collection(db, "products"));
        setProducts(
          productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );

        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        setCategories(
          categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Could not load products. Please check permissions or try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryName = params.get("category");
    const category = categories.find((c) => c.name === categoryName);

    setSearchTerm(params.get("search") || "");
    setActiveCategories(
      category
        ? [category.id]
        : params.get("categories")?.split(",").filter(Boolean) || []
    );
    setSortOption(params.get("sort") || "top-sales");
    setPriceRange(Number(params.get("price")) || 5000);
    setCurrentPage(Number(params.get("page")) || 1);
  }, [location.search, categories]);
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (activeCategories.length > 0) {
      if (activeCategories.length === 1) {
        const category = categories.find((c) => c.id === activeCategories[0]);
        if (category) params.set("category", category.name);
      } else {
        params.set("categories", activeCategories.join(","));
      }
    }
    if (sortOption !== "top-sales") params.set("sort", sortOption);
    if (priceRange < 5000) params.set("price", priceRange);
    if (currentPage > 1) params.set("page", currentPage);

    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [
    searchTerm,
    activeCategories,
    sortOption,
    priceRange,
    currentPage,
    navigate,
    location.pathname,
    categories,
  ]);
  const filteredProducts = useMemo(() => {
    let filtered = products
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(
        (p) =>
          activeCategories.length === 0 ||
          activeCategories.includes(p.categoryId)
      )
      .filter((p) => getProductPrice(p) <= priceRange);

    const sorted = [...filtered];
    switch (sortOption) {
      case "top-sales":
        sorted.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      case "price-asc":
        sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [products, searchTerm, activeCategories, priceRange, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleWishlistToggle = async (product) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
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
      setShowLoginModal(true);
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
    setTimeout(() => navigate("/cart"), 800);
  };

  const handleCategoryToggle = (catId) => {
    setActiveCategories((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId]
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setActiveCategories([]);
    setSortOption("top-sales");
    setPriceRange(5000);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 text-lg text-[#000000]">
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center space-x-2 cursor-pointer text-[#000000]"
            >
              <input
                type="checkbox"
                checked={activeCategories.includes(cat.id)}
                onChange={() => handleCategoryToggle(cat.id)}
                className="rounded text-orange-600 focus:ring-[#57ba40]"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3 text-lg text-[#000000]">Sort By</h3>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full p-2 border border-[#57ba40] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#000000] bg-white text-[#000000]"
        >
          <option value="top-sales">Top Sales</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>
      <div>
        <h3 className="font-semibold mb-3 text-lg text-[#000000]">
          Price Range: 0 - ₹{priceRange}
        </h3>
        <input
          type="range"
          min="100"
          max="10000"
          step="100"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-[#57ba40]"
        />
      </div>
      <button
        onClick={handleClearFilters}
        className="w-full py-2 bg-[#57ba40] text-[#ffffff] rounded-lg hover:bg-[#222222] transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  if (loading)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#ffffff]">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#ffffff] text-red-600 font-semibold p-8 text-center">
          {error}
        </div>
      </>
    );

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col relative">
      <Navbar />
      <style>{`
        .cart-button {
          position: relative;
          padding: 10px;
          flex: 1;
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
          white-space: nowrap;
        }
        .cart-button span.add-to-cart{ opacity: 1;font-size: 16px; white-space: nowrap; }
        .cart-button span.added { opacity: 0; }

        .cart-button.clicked .fa-shopping-cart {
          animation: cart 1.5s ease-in-out forwards;
        }
        .cart-button.clicked .fa-box {
          animation: box 1.5s ease-in-out forwards;
        }
        .cart-button.clicked span.add-to-cart {
          animation: txt1 1.5s ease-in-out forwards;
        }
        .cart-button.clicked span.added {
          animation: txt2 1.5s ease-in-out forwards;
        }

        @keyframes cart {
          0% { left: -10%; }
          40%, 60% { left: 50%; }
          100% { left: 110%; }
        }
        @keyframes box {
          0%, 40% { top: -20%; }
          60% { top: 40%; left: 52%; }
          100% { top: 40%; left: 112%; }
        }
        @keyframes txt1 {
          0% { opacity: 1; }
          20%, 100% { opacity: 0; }
        }
        @keyframes txt2 {
          0%, 80% { opacity: 0; }
          100% { opacity: 1; }
        }

        /* Image hover effect */
        .product-image {
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .product-image:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
        
        /* Disabled Out of Stock Button */
        .cart-button.disabled-out-of-stock {
          border: 2px solid #ff0000 !important;
          background-color: #ffe5e5 !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }

        .cart-button.disabled-out-of-stock span,
        .cart-button.disabled-out-of-stock i {
          color: #ff0000 !important;
          opacity: 1 !important;
        }

        /* Hide animations when disabled */
        .cart-button.disabled-out-of-stock.clicked .fa-shopping-cart,
        .cart-button.disabled-out-of-stock.clicked .fa-box,
        .cart-button.disabled-out-of-stock.clicked span.add-to-cart,
        .cart-button.disabled-out-of-stock.clicked span.added {
          animation: none !important;
        }
        .cart-button span.out-of-stock {
          white-space: nowrap !important;
          font-size: 0.85em;
        }
      `}</style>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
      />

      {notification && (
        <div className="fixed top-20 right-4 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          {notification}
        </div>
      )}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[200]">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-xl font-semibold text-[#000000] mb-4">
              You are not logged in
            </h2>
            <p className="text-[#000000] mb-6">Please login to continue</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-lg bg-[#57ba40] text-white hover:bg-[#222222]"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow">
        <div className="bg-[#ffffff] py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center text-sm text-[#57ba40] font-bold">
              <Link to="/" className="hover:text-[#57ba40]">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="font-semibold text-[#000000]">Products</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            <aside className="hidden lg:block lg:col-span-1 bg-[#ffffff] p-6 rounded-lg shadow-sm h-fit">
              <FilterPanel />
            </aside>
            <div className="lg:col-span-3">
              <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                <div className="flex-1 w-full relative">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-[#57ba40] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#000000] bg-white text-[#000000]"
                  />
                  <Search className="absolute right-3 top-2.5 w-5 h-5 text-[#000000]" />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full md:w-auto px-6 py-2 bg-orange-100 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-200 flex items-center justify-center gap-2 lg:hidden"
                >
                  <Filter className="w-4 h-4" /> Filters{" "}
                  {activeCategories.length > 0 && (
                    <span className="bg-orange-600 text-white w-5 h-5 text-xs rounded-full flex items-center justify-center">
                      {activeCategories.length}
                    </span>
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="lg:hidden bg-[#ffffff] p-6 rounded-lg shadow-sm mb-6">
                  <FilterPanel />
                </div>
              )}

              {paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 mx-15">
                    {paginatedProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        isWishlisted={wishlist.includes(p.id)}
                        onToggleWishlist={handleWishlistToggle}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                      />
                    ))}
                  </div>
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="flex items-center px-4 py-2 text-[#57ba40] rounded-lg disabled:opacity-50"
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </button>
                    <span className="text-[#57ba40] font-medium">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="flex items-center px-4 py-2 text-[#57ba40] rounded-lg disabled:opacity-50"
                      disabled={currentPage >= totalPages || totalPages === 0}
                    >
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-[#ffffff] rounded-lg shadow-sm border border-[#57ba40]">
                  <h2 className="text-2xl font-semibold text-[#000000]">
                    No Products Found
                  </h2>
                  <p className="text-[#000000] mt-2">
                    Try adjusting your search or filters.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-6 px-6 py-2 bg-[#57ba40] text-white font-semibold rounded-lg hover:bg-[#222222] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
