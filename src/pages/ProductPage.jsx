import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext"; // ✅ use AuthContext
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";

const PRODUCTS_PER_PAGE = 8;

const ProductPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth(); // ✅ from AuthContext

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategories, setActiveCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(1000);
  const [sortOption, setSortOption] = useState("top-sales");
  const [currentPage, setCurrentPage] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Handle query params (search, category, sort, price, page)
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
    setPriceRange(Number(params.get("price")) || 1000);
    setCurrentPage(Number(params.get("page")) || 1);
  }, [location.search, categories]);

  // Fetch products & categories
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

  // Sync filters with query params
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
    if (priceRange < 1000) params.set("price", priceRange);
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

  // Filter + Sort
  const filteredProducts = useMemo(() => {
    let filtered = products
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(
        (p) =>
          activeCategories.length === 0 || activeCategories.includes(p.categoryId)
      )
      .filter((p) => (p.price || p.variants?.[0]?.price) <= priceRange);

    const sorted = [...filtered];
    switch (sortOption) {
      case "top-sales":
        sorted.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      case "price-asc":
        sorted.sort(
          (a, b) =>
            (a.price || a.variants?.[0]?.price) -
            (b.price || b.variants?.[0]?.price)
        );
        break;
      case "price-desc":
        sorted.sort(
          (a, b) =>
            (b.price || b.variants?.[0]?.price) -
            (a.price || a.variants?.[0]?.price)
        );
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
    setPriceRange(1000);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  // Handle View Details → redirect if not logged in
  const handleViewDetails = (id) => {
    if (isLoggedIn) {
      navigate(`/products/${id}`);
    } else {
      setShowLoginModal(true);
    }
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 text-lg text-[#000000]">Categories</h3>
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
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
      <Navbar />

      {notification && (
        <div className="fixed top-20 right-4 z-[100] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          {notification}
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center 
    bg-black/50 backdrop-blur-sm z-[200]">

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
            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-1 bg-[#ffffff] p-6 rounded-lg shadow-sm h-fit">
              <FilterPanel />
            </aside>

            {/* Product Grid */}
            <div className="lg:col-span-3">
              <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                {/* Search */}
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

                {/* Mobile Filters */}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    {paginatedProducts.map((p) => {
                      const displayPrice =
                        p.variants?.[0]?.discountPrice ??
                        p.variants?.[0]?.price ??
                        p.price;
                      const originalPrice =
                        p.variants?.[0]?.price ?? p.originalPrice;
                      const isComplex = p.comboItems || p.variants;

                      return (
                        <div
                          key={p.id}
                          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col group"
                        >
                          <div className="p-4 flex flex-col flex-grow">
                            <div className="block relative mb-4">
                              <img
                                src={p.images?.[0]}
                                alt={p.name}
                                className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                              />
                              {p.isNew && (
                                <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                  NEW
                                </span>
                              )}
                            </div>

                            <h3 className="font-semibold text-[#000000] mb-2 flex-grow">
                              {p.name}
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
                              {isComplex ? (
                                <button
                                  onClick={() => handleViewDetails(p.id)}
                                  className="w-full text-center bg-[#57ba40] text-white py-2 px-4 rounded font-semibold hover:bg-[#222222] text-sm"
                                >
                                  View Details
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    p.inStock
                                      ? showNotification(
                                          "Please login to add to cart or implement a guest cart."
                                        )
                                      : null
                                  }
                                  disabled={!p.inStock}
                                  className={`flex-1 py-2 px-4 rounded font-semibold text-sm transition-colors ${
                                    p.inStock
                                      ? "bg-[#57ba40] text-[#ffffff] hover:bg-[#222222]"
                                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  }`}
                                >
                                  {p.inStock ? "Add to Cart" : "Out of Stock"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="flex items-center px-4 py-2 text-orange-700 rounded-lg disabled:opacity-50"
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
                      className="flex items-center px-4 py-2 text-orange-700 rounded-lg disabled:opacity-50"
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
