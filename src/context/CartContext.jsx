import React, { createContext, useState, useContext, useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Clean object for Firestore
const sanitize = (obj) =>
  JSON.parse(JSON.stringify(obj, (key, value) => (value === undefined ? null : value)));

export const CartProvider = ({ children }) => {
  const { user, loading } = useAuth();

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  useEffect(() => {
    const loadCart = async () => {
      setLoadingCart(true);
      if (!user?.uid) {
        const localCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        setCart(localCart);
        setWishlist(JSON.parse(localStorage.getItem("guestWishlist")) || []);
        setLoadingCart(false);
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        const cloudCart = snap.exists() && snap.data().cart ? snap.data().cart : [];
        const cloudWishlist = snap.exists() && snap.data().wishlist ? snap.data().wishlist : [];
        const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const mergedCart = [...cloudCart, ...guestCart];

        setCart(mergedCart);
        setWishlist(cloudWishlist);
        await setDoc(userRef, { cart: mergedCart }, { merge: true });
        localStorage.removeItem("guestCart");
      } catch (error) {
        console.error("Cart loading error:", error);
      }

      setLoadingCart(false);
    };

    if (!loading) loadCart();
  }, [user, loading]);
  const saveGuestCart = (cart) => {
    localStorage.setItem("guestCart", JSON.stringify(cart));
  };

  const updateFirestore = async (newData) => {
    if (!user?.uid) return;
    try {
      const sanitized = sanitize(newData);
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, sanitized);
    } catch (err) {
      console.error("Firestore update failed:", err);
    }
  };
  const addToCart = (product, quantity = 1, variant = null) => {
    setCart((prevCart) => {
      const cartKey = variant ? `${product.id}-${variant.size}` : product.id;

      const existingIndex = prevCart.findIndex((i) => i.cartKey === cartKey);

      let updatedCart;

      if (existingIndex > -1) {
        updatedCart = prevCart.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        const price = variant?.discountPrice ?? variant?.price ?? product.price ?? 0;
        const displayName = variant
          ? `${product.name} (${variant.size})`
          : product.name;

        updatedCart = [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            displayName,
            cartKey,
            quantity,
            price,
            variant: variant ? sanitize(variant) : null,
            image: product.images?.[0] || null,
          },
        ];
      }
      if (!user?.uid) {
        saveGuestCart(updatedCart);
      } else {

        updateFirestore({ cart: updatedCart });
      }

      return updatedCart;
    });
  };

  const updateQuantity = (cartKey, newQuantity) => {
    const updatedCart =
      newQuantity < 1
        ? cart.filter((i) => i.cartKey !== cartKey)
        : cart.map((i) => (i.cartKey === cartKey ? { ...i, quantity: newQuantity } : i));

    setCart(updatedCart);

    if (!user?.uid) saveGuestCart(updatedCart);
    else updateFirestore({ cart: updatedCart });
  };
  const removeFromCart = (cartKey) => {
    const updatedCart = cart.filter((i) => i.cartKey !== cartKey);

    setCart(updatedCart);

    if (!user?.uid) saveGuestCart(updatedCart);
    else updateFirestore({ cart: updatedCart });
  };

  const clearCart = () => {
    setCart([]);

    if (!user?.uid) saveGuestCart([]);
    else updateFirestore({ cart: [] });
  };

  const totalCartItems = cart.reduce((t, i) => t + i.quantity, 0);
  const totalCartValue = cart.reduce((t, i) => t + i.price * i.quantity, 0);

  // Recalculate discount whenever cart changes or coupon changes
  useEffect(() => {
    if (appliedCoupon) {
      let discount = 0;
      if (appliedCoupon.type === "percentage") {
        discount = (totalCartValue * appliedCoupon.value) / 100;
      } else if (appliedCoupon.type === "flat") {
        discount = appliedCoupon.value;
      }
      // Ensure discount doesn't exceed total
      if (discount > totalCartValue) discount = totalCartValue;
      setDiscountAmount(discount);
    } else {
      setDiscountAmount(0);
    }
  }, [cart, appliedCoupon, totalCartValue]);

  const applyCoupon = async (code) => {
    if (!code) throw new Error("Please enter a coupon code");

    // 1. Get coupon from Firestore
    const couponsRef = collection(db, "coupons");
    const q = query(couponsRef, where("code", "==", code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Invalid coupon code");
    }

    const couponDoc = querySnapshot.docs[0];
    const coupon = couponDoc.data();
    const now = new Date();

    // 2. Validate
    // Handle Firestore Timestamp or regular Date objects
    const startDate = coupon.startDate?.seconds ? new Date(coupon.startDate.seconds * 1000) : new Date(coupon.startDate);
    const endDate = coupon.endDate?.seconds ? new Date(coupon.endDate.seconds * 1000) : new Date(coupon.endDate);

    if (coupon.startDate && now < startDate) {
      throw new Error("Coupon is not yet active");
    }
    if (coupon.endDate && now > endDate) {
      throw new Error("Coupon has expired");
    }
    if (coupon.maxRedemptions && (coupon.usageCount || 0) >= coupon.maxRedemptions) {
      throw new Error("Coupon usage limit reached");
    }

    // Check per-user limit
    if (user?.uid && coupon.perUserLimit) {
      const userUsage = coupon.usersRedeemed?.[user.uid] || 0;
      if (userUsage >= coupon.perUserLimit) {
        throw new Error(`You have already used this coupon ${coupon.perUserLimit} times`);
      }
    }

    setAppliedCoupon({ ...coupon, id: couponDoc.id });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCartItems,
        totalCartValue,
        loadingCart,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
