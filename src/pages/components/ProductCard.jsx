import React, { useState, useRef } from "react";
import { Heart, Tag } from "lucide-react";

// -----------------------
// Local Helper Functions
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
export default function ProductCard({
  product,
  categories,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  navigate,
  showNotification,
}) {
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

  return (
    <div className="max-w-[250px] w-full mx-auto">
      {/* Image + badge + wishlist */}
      <div className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
        <img
          src={product.images?.[0]}
          alt={product.name}
          onClick={() => navigate(`/products/${product.id}`)}
          className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
        />

        {/* Discount badge */}
        <div className="absolute top-2 left-2 flex flex-row gap-1 z-10">
          {discountPercentage > 0 && (
            <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
              <Tag size={12} />
              <span>{Math.round(discountPercentage)}% OFF</span>
            </div>
          )}
        </div>

        {/* Wishlist button */}
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

        {/* Out of stock overlay */}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <div className="bg-black/90 text-white px-6 py-3 rounded-lg text-sm font-bold">
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
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black text-white font-semibold px-5 py-2 rounded-xl opacity-100 md:opacity-0 md:group-hover:opacity-100 duration-300 whitespace-nowrap"
        >
          Choose Options
        </button>

        {/* Overlay (Choose Variants + Add to Cart) */}
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

            {/* Price */}
            <div className="flex items-center gap-2 my-3">
              <span className="text-red-600 font-bold text-lg">₹{price}</span>
              {selectedVariant?.discountPrice && (
                <span className="text-sm line-through text-gray-400">
                  ₹
                  {product.variants?.[0]?.price ?? product.originalPrice}
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
              ref={buttonRef}
              onClick={() =>
                onAddToCart(
                  { ...product, selectedVariant },
                  buttonRef,
                  () => setShowOverlay(false)
                )
              }
              disabled={!isInStock}
              className="w-full bg-black text-white py-2.5 rounded-lg font-semibold mb-3 transition-transform duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </button>

            <p
              onClick={() => navigate(`/products/${product.id}`)}
              className="text-center text-sm text-gray-700 underline cursor-pointer"
            >
              View full details
            </p>
          </div>
        )}
      </div>

      {/* Name + Price */}
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
              ₹
              {product.variants?.[0]?.price ?? product.originalPrice}
            </span>
          )}
        </div>

        <p
          onClick={() => navigate(`/products/${product.id}`)}
          className="text-center text-sm text-gray-700 underline cursor-pointer"
        >
          View full details
        </p>
      </div>
    </div>
  );
}
