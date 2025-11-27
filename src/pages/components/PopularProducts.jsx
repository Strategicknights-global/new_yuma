import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { Heart } from "lucide-react";

const getProductPrice = (product) => {
  if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0];
    return firstVariant.discountPrice ?? firstVariant.price ?? 0;
  }
  return product.price ?? 0;
};

const PopularProducts = ({ products, categories }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isLoggedIn } = useAuth();

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

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 2500);
  };

  const handleWishlistToggle = async (product) => {
    if (!isLoggedIn) {
      navigate("/login");
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
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const variant =
      product.variants && product.variants.length > 0 ? product.variants[0] : null;

    addToCart(product, 1, variant);

    const displayName = variant ? `${product.name} (${variant.size})` : product.name;
    showNotification(`${displayName} added to cart`);

    if (buttonRef && buttonRef.current) {
      buttonRef.current.classList.add("clicked");
      setTimeout(() => {
        buttonRef.current.classList.remove("clicked");
      }, 1500);
    }
  };

  const handleBuyNow = (product) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const variant =
      product.variants && product.variants.length > 0 ? product.variants[0] : null;

    addToCart(product, 1, variant);

    const displayName = variant ? `${product.name} (${variant.size})` : product.name;
    showNotification(`${displayName} added to cart`);

    setTimeout(() => navigate("/cart"), 800);
  };

  const filteredProducts = products.filter((p) =>
    activeCategory === "All" ? true : p.categoryId === activeCategory
  );

  return (
    <section className="py-12 bg-white relative">
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
          {notification}
        </div>
      )}

      {/* ✅ Animation Styles */}
      <style>{`
        .cart-button {
          position: relative;
          padding: 10px;
          width: 140px;
          height: 44px;
          border: 0;
          border-radius: 10px;
          background-color: #01796f;
          outline: none;
          cursor: pointer;
          color: #fff;
          transition: .3s ease-in-out;
          overflow: hidden;
          font-size: 14px;
        }
        .cart-button:hover {
          background-color: #02665e;
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
          font-size: 0.9em;
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

        /* ✅ Image hover effect */
        .product-image {
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .product-image:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
      `}</style>

      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 via-green-500 to-green-700 bg-clip-text text-transparent animate-gradient">
  Popular Products
</h2>


        <div className="flex justify-center mb-8 space-x-4 flex-wrap">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-4 py-2 rounded-lg ${
              activeCategory === "All" ? "bg-[#01796f] text-white" : "bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg ${
                activeCategory === cat.id ? "bg-[#01796f] text-white" : "bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 8).map((p) => {
            const price = getProductPrice(p);
            const isWishlisted = wishlist.includes(p.id);
            const buttonRef = useRef(null);

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition relative"
              >
                <button
                  onClick={() => handleWishlistToggle(p)}
                  className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-gray-100 transition"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isWishlisted ? "text-red-500 fill-red-500" : "text-gray-500"
                    }`}
                  />
                </button>

                <Link to={`/products/${p.id}`}>
                  <img
                    src={p.images?.[0]}
                    alt={p.name}
                    className="product-image w-full h-48 object-cover rounded-t-xl"
                  />
                  <div className="p-4 text-center">
                    <h3 className="text-md font-semibold text-gray-800">
                      {p.name}
                    </h3>
                    <div className="text-xl font-bold text-[#b85a00]">₹{price}</div>
                  </div>
                </Link>

                <div className="flex justify-center space-x-2 p-4">
                  <button
                    ref={buttonRef}
                    onClick={() => handleAddToCart(p, buttonRef)}
                    className="cart-button"
                  >
                    <span className="add-to-cart">Add to cart</span>
                    <span className="added">Added</span>
                    <i className="fas fa-shopping-cart"></i>
                    <i className="fas fa-box"></i>
                  </button>

                  <button
                    onClick={() => handleBuyNow(p)}
                    className="bg-[#b85a00] text-white px-4 py-2 rounded-lg hover:bg-[#944800] transition"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;