import React, { useRef } from "react";
import { Link } from "react-router-dom";

// ✅ MegaCombo component with animated cart button
const MegaCombo = ({ products, addToCart, handleBuyNow }) => {
  // Add to cart handler with animation
  const handleAddToCart = (p, buttonRef) => {
    addToCart(p);

    if (buttonRef && buttonRef.current) {
      buttonRef.current.classList.add("clicked");
      setTimeout(() => {
        buttonRef.current.classList.remove("clicked");
      }, 1500);
    }
  };

  return (
    <section className="py-12 bg-white relative">
      {/* ✅ Animation Styles */}
      <style>{`
        .cart-button {
          position: relative;
          padding: 10px;
          width: 120px;
          height: 40px;
          border: 0;
          border-radius: 10px;
          background-color: #f0c242;
          outline: none;
          cursor: pointer;
          color: #fff;
          transition: .3s ease-in-out;
          overflow: hidden;
          font-size: 13px;
          font-weight: 600;
        }
        .cart-button:hover {
          background-color: #e0b034;
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
          color: #fff;
        }
        .cart-button .fa-box {
          position: absolute;
          z-index: 3;
          top: -20%;
          left: 52%;
          font-size: 0.9em;
          transform: translate(-50%,-50%);
          color: #fff;
        }
        .cart-button span {
          position: absolute;
          z-index: 3;
          left: 50%;
          top: 50%;
          font-size: 0.85em;
          color: #fff;
          transform: translate(-50%,-50%);
        }
        .cart-button span.add-to-cart { opacity: 1; }
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
      `}</style>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center bg-[#DCFCE7] rounded-xl p-8 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full lg:w-3/4 mb-6 lg:mb-0">
            {products.map((p) => {
              const buttonRef = useRef(null);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-lg p-4 shadow-sm flex flex-col items-center text-center"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-40 object-contain"
                  />
                  <h3 className="font-semibold text-gray-800 mt-2">{p.name}</h3>
                  <div className="text-lg font-bold text-[#b85a00] mb-4">
                    ₹{p.price}
                  </div>
                  <div className="flex space-x-2">
                    {/* ✅ Animated Cart Button */}
                    <button
                      ref={buttonRef}
                      onClick={() => handleAddToCart(p, buttonRef)}
                      className="cart-button"
                    >
                      <span className="add-to-cart">Add</span>
                      <span className="added">Added</span>
                      <i className="fas fa-shopping-cart"></i>
                      <i className="fas fa-box"></i>
                    </button>

                    {/* ✅ Buy Now Button */}
                    <button
                      onClick={() => handleBuyNow(p)}
                      className="bg-[#b85a00] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#a14f00]"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="w-full lg:w-1/4 text-center lg:text-right">
            <h3 className="text-3xl font-bold text-[#b85a00] mb-4">
              Mega Combo Packs
            </h3>
            <Link
              to="/products?category=Combos"
              className="bg-[#b85a00] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a14f00] transition-colors"
            >
              View all combos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MegaCombo;