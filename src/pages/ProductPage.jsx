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

  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.[0] || null
  );
  const [showOverlay, setShowOverlay] = useState(false);

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
    <>
      <div className="max-w-[250px] w-full">
        <div className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
          <img
            src={product.images?.[0]}
            alt={product.name}
            onClick={() => navigate(`/products/${product.id}`)}
            className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
          />

          <div className="absolute top-2 left-2 flex flex-row gap-1 z-10">
            {discountPercentage > 0 && (
              <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1 w-fit">
                <Tag size={12} className="text-orange-100" />
                <span>{Math.round(discountPercentage)}% OFF</span>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white hover:scale-110 transition-all duration-300 z-10 shadow-md"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 hover:text-red-500"
              }`}
            />
          </button>

          {!isInStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[5]">
              <div className="bg-black/90 text-white px-6 py-3 rounded-lg font-bold text-sm shadow-xl">
                OUT OF STOCK
              </div>
            </div>
          )}

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

        <div
          onClick={() => navigate(`/products/${product.id}`)}
          className="pt-3 text-center cursor-pointer"
        >
          <h3 className="text-[15px] font-semibold text-gray-800 line-clamp-1">
            {product.name}
          </h3>

          <div className="flex justify-center items-center gap-2 mt-1">
            <span className="text-[18px] font-bold text-[#b85a00]">
              ₹{price}
            </span>
            {selectedVariant?.discountPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>
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
      </div>
    </>
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

  // Load wishlist from localStorage for guests or Firebase for logged-in users
  useEffect(() => {
    if (!user) {
      // Guest user - load from localStorage
      const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
      setWishlist(guestWishlist);
      return;
    }
    
    // Logged-in user - load from Firebase
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
    const customCategory = params.get("customCategory");

    if (customCategory) {
      setActiveCategories([customCategory]);
    }

    const categoryName = params.get("category");
    const category = categories.find((c) => c.name === categoryName);

    setSearchTerm(params.get("search") || "");
    setActiveCategories(
      customCategory
        ? [customCategory]
        : category
        ? [category.id]
        : params.get("categories")?.split(",").filter(Boolean) || []
    );
  }, [location.search, categories]);

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
    return products
      .filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((p) => {
        if (activeCategories.length === 0) return true;
        const textCategory = activeCategories[0];

        return (
          p.categoryName === textCategory ||
          p.customCategory === textCategory ||
          p.customCategories?.includes(textCategory) ||
          p.tags?.includes(textCategory)
        );
      })
      .filter((p) => getProductPrice(p) <= priceRange)
      .sort((a, b) => {
        switch (sortOption) {
          case "top-sales":
            return (b.salesCount || 0) - (a.salesCount || 0);
          case "price-asc":
            return getProductPrice(a) - getProductPrice(b);
          case "price-desc":
            return getProductPrice(b) - getProductPrice(a);
          case "name-asc":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleWishlistToggle = async (product) => {
    if (!isLoggedIn) {
      // Guest user - use localStorage
      const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
      
      if (guestWishlist.includes(product.id)) {
        const updated = guestWishlist.filter(id => id !== product.id);
        localStorage.setItem('guestWishlist', JSON.stringify(updated));
        setWishlist(updated);
        showNotification(`${product.name} removed from wishlist`);
      } else {
        const updated = [...guestWishlist, product.id];
        localStorage.setItem('guestWishlist', JSON.stringify(updated));
        setWishlist(updated);
        showNotification(`${product.name} added to wishlist`);
      }
      return;
    }

    // Logged-in user - use Firebase
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

  const handleAddToCart = (productData) => {
    const product = productData.selectedVariant
      ? { ...productData, selectedVariant: productData.selectedVariant }
      : productData;

    if (!product.inStock) {
      showNotification(`${product.name} is currently out of stock`);
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
    showNotification(`${displayName} added to cart`);
  };

  const handleBuyNow = (product) => {
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

      {notification && (
        <div className="fixed top-20 right-4 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          {notification}
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
                  className="w-full md:w-auto px-6 py-2 bg-[#ffffff] border border-[#57ba40] text-[#57ba40] rounded-lg hover:bg-[#57ba40] hover:text-[#ffffff] flex items-center justify-center gap-2 lg:hidden"
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