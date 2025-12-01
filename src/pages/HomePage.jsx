import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import HeroBanner from "./components/HeroBanner";
import OfferBanner from "./components/OfferBanner";
import PopularProducts from "./components/PopularProducts";
import MegaCombo from "./components/MegaCombo";
import WhyChooseUs from "./components/WhyChooseUs";
import SeeItCraveIt from "./components/SeeItCraveIt";
import Testimonials from "./components/Testimonials";
import SocialMedia from "./components/SocialMedia";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Categories from "./components/Category";


const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comboProducts, setComboProducts] = useState([]);
  const [addedProducts, setAddedProducts] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const getProductPrice = (product) => {
    if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      return firstVariant.discountPrice || firstVariant.price || 0;
    }
    return product.price || 0;
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        setCategories(categoriesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        const productsSnapshot = await getDocs(collection(db, "products"));
        const allProducts = productsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(allProducts);
        setComboProducts(allProducts.filter((p) => p.productType === "COMBO").slice(0, 3));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load content. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const triggerNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  const handleCartAnimation = (e, product) => {
    const button = e.currentTarget;
    if (!button.classList.contains("loading")) {
      button.classList.add("loading");
      handleAddToCart(product);
      setAddedProducts((prev) => [...prev, product.id]);
      setTimeout(() => button.classList.remove("loading"), 3700);
    }
  };
  const handleAddToCart = (product) => {
    addToCart(product);
    triggerNotification(`${product.name} added to cart`);
  };
  const handleBuyNow = (product) => {
    addToCart(product);
    navigate("/cart");
  };
  const handleSubscribe = async () => {
    if (!newsletterEmail || !/^\S+@\S+\.\S+$/.test(newsletterEmail)) {
      return triggerNotification("Please enter a valid email.");
    }
    try {
      await addDoc(collection(db, "subscriptions"), {
        email: newsletterEmail,
        subscribedAt: Timestamp.now(),
      });
      triggerNotification("Thank you for subscribing!");
      setNewsletterEmail("");
    } catch (error) {
      triggerNotification("Subscription failed. Please try again.");
    }
  };
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-700 font-semibold p-8 text-center">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {showNotification && (
        <div className="fixed top-20 right-4 z-[100] bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          {notificationMessage}
        </div>
      )}

      <Navbar />

      <HeroBanner />

      <br></br>
      {/* <OfferBanner
        altText="Delicious Millets Collection"
        overlayText="Healthy Millets, Delivered Fresh 🌾"
      />
       */}

      <PopularProducts
        products={products}
        categories={categories}
        addToCart={handleAddToCart}
        addedProducts={addedProducts}
        handleCartAnimation={handleCartAnimation}
        handleBuyNow={handleBuyNow}
        getProductPrice={getProductPrice}
      />
<Categories/>
      <MegaCombo
        products={comboProducts}
        addToCart={handleAddToCart}
        handleBuyNow={handleBuyNow}
      />

      <WhyChooseUs />
      <SeeItCraveIt />
      <Testimonials />
      <SocialMedia />
    </div>
  );
};

export default HomePage;
