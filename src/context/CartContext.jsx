import React, { createContext, useState, useContext, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "./AuthContext";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// ✅ Helper: remove Firestore-unsupported values
const sanitize = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => (value === undefined ? null : value))
  );
};

export const CartProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);

  // ✅ Load cart + wishlist from Firestore on login
  useEffect(() => {
    const manageUserData = async () => {
      if (loading) return;
      setLoadingCart(true);

      if (user?.uid) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setCart(userData.cart || []);
            setWishlist(userData.wishlist || []);
          } else {
            setCart([]);
            setWishlist([]);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setCart([]);
          setWishlist([]);
        }
      } else {
        setCart([]);
        setWishlist([]);
      }

      setLoadingCart(false);
    };

    manageUserData();
  }, [user, loading]);

  // ✅ Always sanitize before updating Firestore
  const updateFirestore = async (newData) => {
    if (user?.uid) {
      try {
        const sanitizedData = sanitize(newData);
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, sanitizedData);
      } catch (error) {
        console.error("Failed to update Firestore:", error);
      }
    }
  };

  // ✅ Add item to cart (safe, no mutation, increments only by +1 each click)
  const addToCart = (product, quantity = 1, variant = null) => {
    setCart((prevCart) => {
      const cartKey = variant ? `${product.id}-${variant.size}` : product.id;

      const existingItemIndex = prevCart.findIndex(
        (item) => item.cartKey === cartKey
      );

      let updatedCart;
      if (existingItemIndex > -1) {
        // Update existing item with new quantity
        updatedCart = prevCart.map((item, idx) =>
          idx === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const price =
          variant?.discountPrice ?? variant?.price ?? product.price ?? 0;
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

      updateFirestore({ cart: updatedCart });
      return updatedCart;
    });
  };

  // ✅ Update quantity
  const updateQuantity = (cartKey, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartKey);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.cartKey === cartKey ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    updateFirestore({ cart: updatedCart });
  };

  // ✅ Remove from cart
  const removeFromCart = (cartKey) => {
    const updatedCart = cart.filter((item) => item.cartKey !== cartKey);
    setCart(updatedCart);
    updateFirestore({ cart: updatedCart });
  };

  // ✅ Clear entire cart
  const clearCart = async () => {
    setCart([]);
    await updateFirestore({ cart: [] });
  };

  // ✅ Toggle wishlist
  const toggleWishlist = (productId) => {
    const updatedWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    setWishlist(updatedWishlist);
    updateFirestore({ wishlist: updatedWishlist });
  };

  // ✅ Totals
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCartValue = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const value = {
    cart,
    wishlist,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleWishlist,
    totalCartItems,
    totalCartValue,
    loadingCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};