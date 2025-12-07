import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart, Tag } from "lucide-react";

const RecommendedProductsCarousel = ({ recommendedProducts, onToggleWishlist, wishlist, onAddToCart }) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);

  // Scroll distance based on screen size
  const getScrollBy = () => {
    if (window.innerWidth < 640) return 180; // Mobile
    if (window.innerWidth < 1024) return 220; // Tablet
    return 260; // Desktop
  };

  const handleScroll = (direction) => {
    if (!containerRef.current) return;

    const scrollBy = getScrollBy();
    const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;

    let newPosition =
      direction === "left"
        ? Math.max(scrollPosition - scrollBy, 0)
        : Math.min(scrollPosition + scrollBy, maxScroll);

    containerRef.current.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setScrollPosition(newPosition);
  };

  return (
    <div className="relative max-w-[450px] mx-auto sm:max-w-full">
      {/* LEFT ARROW */}
      <button
        onClick={() => handleScroll("left")}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-all ${
          scrollPosition === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={() => handleScroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* HORIZONTAL SCROLLER */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto scroll-smooth gap-3 px-3 sm:px-10 pb-2 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}</style>

        {recommendedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            wishlist={wishlist}
            onToggleWishlist={onToggleWishlist}
            onAddToCart={onAddToCart}
            navigate={navigate}
          />
        ))}
      </div>

      {/* MOBILE DOTS */}
      <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
        {recommendedProducts.slice(0, 5).map((_, index) => (
          <div key={index} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        ))}
      </div>
    </div>
  );
};


// =========================
// Product Card Component
// =========================

function ProductCard({ product, wishlist, onToggleWishlist, onAddToCart, navigate }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const buttonRef = useRef(null);

  const price = selectedVariant?.discountPrice ?? selectedVariant?.price ?? product.price;
  const originalPrice = selectedVariant?.price ?? product.originalPrice;
  const discountPercentage = selectedVariant?.discountPercentage || 0;
  const isInStock = product.inStock !== false;
  const isWishlisted = wishlist?.includes(product.id);

  return (
    <div className="flex-shrink-0 w-40 sm:w-48 md:w-56 snap-start">
      <div className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all">
        
        {/* Product Image */}
        <img
          src={product.images?.[0] || "https://via.placeholder.com/150"}
          alt={product.name}
          onClick={() => navigate(`/products/${product.id}`)}
          className="w-full h-56 sm:h-64 md:h-72 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110"
        />

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            <Tag size={12} className="inline-block mr-1" />
            {Math.round(discountPercentage)}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist?.(product);
          }}
          className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow transition hover:bg-white"
        >
          <Heart
            className={`w-5 h-5 ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>

      </div>

      {/* Product Info */}
      <div
        onClick={() => navigate(`/products/${product.id}`)}
        className="pt-3 text-center cursor-pointer"
      >
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
          {product.name}
        </h3>

        <div className="flex justify-center gap-2 items-center mt-1">
          <span className="text-lg font-bold text-[#b85a00]">₹{price}</span>
          {selectedVariant?.discountPrice && (
            <span className="text-xs line-through text-gray-400">₹{originalPrice}</span>
          )}
        </div>

        <p className="underline text-xs text-gray-700 mt-1">View details</p>
      </div>
    </div>
  );
}

export default RecommendedProductsCarousel;
