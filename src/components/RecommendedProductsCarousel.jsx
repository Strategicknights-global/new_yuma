import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart, Truck, Tag } from "lucide-react";

const RecommendedProductsCarousel = ({ recommendedProducts, onToggleWishlist, wishlist }) => {
  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const scrollBy = 272; // card width + gap

  const handleScroll = (direction) => {
    if (!containerRef.current) return;
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
      {/* LEFT ARROW */}
      <button
        onClick={() => handleScroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full shadow-md p-2 hover:bg-gray-100"
      >
        <ChevronLeft size={24} />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={() => handleScroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full shadow-md p-2 hover:bg-gray-100"
      >
        <ChevronRight size={24} />
      </button>

      {/* CAROUSEL CONTAINER */}
      <div ref={containerRef} className="flex overflow-x-hidden scroll-smooth gap-4 px-10">
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
            <div key={product.id} className="flex-shrink-0 w-64">
              <div className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* BADGES */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {isInStock && (
                      <div className="bg-[#57ba40] text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                        <Truck size={12} className="text-teal-100" /> Free Shipping
                      </div>
                    )}
                    {discountPercentage > 0 && (
                      <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 w-fit">
                        <Tag size={12} className="text-orange-100" /> {Math.round(discountPercentage)}% OFF
                      </div>
                    )}
                  </div>

                  {/* WISHLIST HEART */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleWishlist(product);
                    }}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white hover:scale-110 transition-all duration-300 z-10 shadow-md"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
                      }`}
                    />
                  </button>

                  {/* OUT OF STOCK OVERLAY */}
                  {!isInStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[5]">
                      <span className="bg-black/90 text-white px-4 py-2 rounded-md font-bold text-sm">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}

                  {/* PRODUCT INFO */}
                  <div className="p-4 text-center">
                    <h3 className="text-md font-semibold text-gray-800 truncate group-hover:text-red-600">
                      {product.name}
                    </h3>
                    <div className="flex justify-center items-center gap-2 mt-1">
                      <span className="text-[18px] font-bold text-[#b85a00]">₹{price}</span>
                      {price < originalPrice && (
                        <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedProductsCarousel;
