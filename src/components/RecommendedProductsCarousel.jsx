import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart, Truck, Tag } from "lucide-react";

const RecommendedProductsCarousel = ({ recommendedProducts, onToggleWishlist, wishlist }) => {
  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Responsive scroll distance
  const getScrollBy = () => {
    if (typeof window === 'undefined') return 272;
    if (window.innerWidth < 640) return 200; // Mobile: card width + gap
    if (window.innerWidth < 1024) return 240; // Tablet
    return 272; // Desktop
  };

  const handleScroll = (direction) => {
    if (!containerRef.current) return;
    const scrollBy = getScrollBy();
    const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;

    let newPosition = scrollPosition;
    if (direction === "left") {
      newPosition = Math.max(scrollPosition - scrollBy, 0);
    } else {
      newPosition = Math.min(scrollPosition + scrollBy, maxScroll);
    }

    containerRef.current.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setScrollPosition(newPosition);
  };

  return (
    <div className="relative">
      {/* LEFT ARROW - Hidden on mobile if at start */}
      <button
        onClick={() => handleScroll("left")}
        className={`absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full shadow-md p-1.5 sm:p-2 hover:bg-gray-100 transition-all ${
          scrollPosition === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* RIGHT ARROW - Hidden on mobile if at end */}
      <button
        onClick={() => handleScroll("right")}
        className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full shadow-md p-1.5 sm:p-2 hover:bg-gray-100 transition-all"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* CAROUSEL CONTAINER */}
      <div 
        ref={containerRef} 
        className="flex overflow-x-auto sm:overflow-x-hidden scroll-smooth gap-3 sm:gap-4 px-8 sm:px-10 pb-2 snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {recommendedProducts.map((product) => {
          const price =
            product.variants?.[0]?.discountPrice ??
            product.variants?.[0]?.price ??
            product.price;
          const originalPrice = product.variants?.[0]?.price ?? product.originalPrice;
          const discountPercentage = product.variants?.[0]?.discountPercentage || 0;
          const isInStock = product.inStock !== false;
          const isWishlisted = wishlist?.includes(product.id);

          return (
            <div 
              key={product.id} 
              className="flex-shrink-0 w-48 sm:w-56 md:w-64 snap-start"
            >
              <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-56 sm:h-64 md:h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* BADGES */}
                  <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex flex-col gap-1 z-10">
                    {isInStock && (
                      <div className="bg-[#57ba40] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center gap-0.5 sm:gap-1">
                        <Truck size={10} className="text-teal-100 hidden sm:block" /> 
                        <span className="hidden sm:inline">Free Shipping</span>
                        <span className="sm:hidden">Free Ship</span>
                      </div>
                    )}
                    {discountPercentage > 0 && (
                      <div className="bg-orange-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center gap-0.5 sm:gap-1 w-fit">
                        <Tag size={10} className="text-orange-100 hidden sm:block" /> 
                        {Math.round(discountPercentage)}% OFF
                      </div>
                    )}
                  </div>

                  {/* WISHLIST HEART */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleWishlist?.(product);
                    }}
                    className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-white hover:scale-110 transition-all duration-300 z-10 shadow-md"
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                        isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
                      }`}
                    />
                  </button>

                  {/* OUT OF STOCK OVERLAY */}
                  {!isInStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[5]">
                      <span className="bg-black/90 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-bold text-xs sm:text-sm">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}

                  {/* PRODUCT INFO */}
                  <div className="p-3 sm:p-4 text-center">
                    <h3 className="text-sm sm:text-md font-semibold text-gray-800 truncate group-hover:text-red-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-1">
                      <span className="text-base sm:text-lg font-bold text-[#b85a00]">₹{price}</span>
                      {price < originalPrice && (
                        <span className="text-xs sm:text-sm text-gray-400 line-through">₹{originalPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* SCROLL INDICATORS (Mobile only) */}
      <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
        {recommendedProducts.slice(0, Math.min(5, recommendedProducts.length)).map((_, index) => (
          <div
            key={index}
            className="w-1.5 h-1.5 rounded-full bg-gray-300"
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProductsCarousel;