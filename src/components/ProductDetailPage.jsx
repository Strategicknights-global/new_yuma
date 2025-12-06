import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import RecommendedProductsCarousel from './RecommendedProductsCarousel';

import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  addDoc,
  serverTimestamp,
  documentId,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import { Heart, CheckCircle, XCircle, Star } from 'lucide-react';

const StarRating = ({ rating, size = 'w-5 h-5' }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`${size} text-yellow-400 fill-yellow-400`} />
      ))}
      {halfStar && <Star key="half" className={`${size} text-yellow-400 fill-yellow-200`} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${size} text-gray-300`} />
      ))}
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user, isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const MAX_WORDS = 200;
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = { id: productSnap.id, ...productSnap.data() };
          setProduct(productData);
          setSelectedImageIndex(0);
          if (productData.variants?.length > 0) {
            setSelectedVariant(productData.variants[0]);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product || !id) return;

    const fetchRelatedProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        let related = [];
        if (product.category) {
          const q = query(
            productsRef,
            where("category", "==", product.category),
            where(documentId(), "!=", id),
            limit(10)
          );
          const snapshot = await getDocs(q);
          snapshot.forEach((doc) => related.push({ id: doc.id, ...doc.data() }));
        }
        const otherQ = query(productsRef, where(documentId(), "!=", id), limit(10));
        const otherSnap = await getDocs(otherQ);
        otherSnap.forEach((doc) => {
          if (!related.find((r) => r.id === doc.id)) {
            related.push({ id: doc.id, ...doc.data() });
          }
        });
        related.sort((a, b) => {
          if (a.category === product.category && b.category !== product.category) return -1;
          if (a.category !== product.category && b.category === product.category) return 1;
          return 0;
        });

        setRecommendedProducts(related);
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      }
    };

    fetchRelatedProducts();
  }, [product, id]);

  useEffect(() => {
    if (!id) return;

    const reviewsRef = collection(db, 'products', id, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedReviews = [];
      querySnapshot.forEach((doc) => {
        fetchedReviews.push({ id: doc.id, ...doc.data() });
      });
      setReviews(fetchedReviews);
    }, (err) => console.error("Error fetching reviews:", err));

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!user) return setWishlist([]);
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) setWishlist(docSnap.data().wishlist || []);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (isLoggedIn && user) setNewReviewName(user.displayName || '');
  }, [user, isLoggedIn]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) return setShowLoginModal(true);
    if (!product?.inStock) return showNotification('This product is out of stock.');
    addToCart(product, quantity, selectedVariant);
    const displayName = selectedVariant ? `${product.name} (${selectedVariant.size})` : product.name;
    showNotification(`${quantity} x ${displayName} added to cart!`);

    if (buttonRef.current) {
      buttonRef.current.classList.add("clicked");
      setTimeout(() => buttonRef.current.classList.remove("clicked"), 1500);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) return setShowLoginModal(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      if (wishlist.includes(product.id)) {
        await updateDoc(userRef, { wishlist: arrayRemove(product.id) });
        showNotification(`${product.name} removed from wishlist`);
      } else {
        await updateDoc(userRef, { wishlist: arrayUnion(product.id) });
        showNotification(`${product.name} added to wishlist`);
      }
    } catch (err) {
      console.error('Error updating wishlist:', err);
      showNotification('Failed to update wishlist.');
    }
  };

  const handleCommentChange = (e) => {
    const text = e.target.value;
    const currentWords = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    if (currentWords <= MAX_WORDS) {
      setNewReviewComment(text);
      setWordCount(currentWords);
    } else {
      showNotification(`Your review cannot exceed ${MAX_WORDS} words.`);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return showNotification("Please log in to submit a review.");
    if (!newReviewName.trim() || !newReviewRating || !newReviewComment.trim()) return showNotification("Please fill all fields.");
    if (wordCount > MAX_WORDS) return showNotification(`Review must be ${MAX_WORDS} words or less.`);

    setReviewSubmitting(true);
    try {
      const reviewsCollectionRef = collection(db, 'products', product.id, 'reviews');
      await addDoc(reviewsCollectionRef, {
        userId: user.uid,
        userName: newReviewName.trim(),
        rating: newReviewRating,
        comment: newReviewComment.trim(),
        createdAt: serverTimestamp(),
      });
      showNotification("Review submitted successfully!");
      setNewReviewRating(0);
      setNewReviewComment('');
      setWordCount(0);
    } catch (err) {
      console.error("Error submitting review:", err);
      showNotification("Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => { if (quantity > 1) setQuantity((q) => q - 1); };

  if (loading) return <><Navbar /><div className="min-h-screen flex items-center justify-center text-lg sm:text-xl font-semibold px-4">Loading Product...</div></>;
  if (error) return <><Navbar /><div className="min-h-screen flex items-center justify-center text-red-500 px-4 text-center">{error}</div></>;
  if (!product) return null;

  const displayPrice = selectedVariant?.discountPrice ?? selectedVariant?.price ?? product.price;
  const originalPrice = selectedVariant?.price ?? product.originalPrice;
  const stockStatus = product.inStock ? "in" : "out";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {notification && (
        <div className="fixed top-20 right-4 z-[100] bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg animate-pulse text-sm sm:text-base max-w-[90vw]">
          {notification}
        </div>
      )}

      <style>{`
        .cart-button { 
          position: relative; 
          padding: 10px; 
          width: 100%; 
          max-width: 160px; 
          height: 48px; 
          border: 1px solid #57ba40; 
          border-radius: 10px; 
          background-color:#ffffff; 
          outline: none; 
          cursor: pointer; 
          color: #fff; 
          transition: .3s ease-in-out; 
          overflow: hidden; 
          font-size: 14px; 
          font-weight: 600; 
        }
        @media (max-width: 640px) {
          .cart-button {
            font-size: 13px;
            height: 44px;
          }
        }
        .cart-button:hover { background-color: #57ba40; color: #ffffff}
        .cart-button:active { transform: scale(.9); }
        .cart-button .fa-shopping-cart { position: absolute; z-index: 2; top: 50%; left: -10%; font-size: 1.4em; transform: translate(-50%,-50%); color: #fff; }
        .cart-button .fa-box { position: absolute; z-index: 3; top: -20%; left: 52%; font-size: 1em; transform: translate(-50%,-50%); color: #fff; }
        .cart-button span { position: absolute; z-index: 3; left: 50%; top: 50%; font-size: 0.95em; color: #57ba40; transform: translate(-50%,-50%); }
        .cart-button span.add-to-cart { opacity: 1; }
        .cart-button span.added { opacity: 0; }
        .cart-button.clicked .fa-shopping-cart { animation: cart 1.5s ease-in-out forwards; }
        .cart-button.clicked .fa-box { animation: box 1.5s ease-in-out forwards; }
        .cart-button.clicked span.add-to-cart { animation: txt1 1.5s ease-in-out forwards; }
        .cart-button.clicked span.added { animation: txt2 1.5s ease-in-out forwards; }
        @keyframes cart { 0%{left:-10%;} 40%,60%{left:50%;} 100%{left:110%;} }
        @keyframes box { 0%,40%{top:-20%;} 60%{top:40%;left:52%;} 100%{top:40%;left:112%;} }
        @keyframes txt1 { 0%{opacity:1;} 20%,100%{opacity:0;} }
        @keyframes txt2 { 0%,80%{opacity:0;} 100%{opacity:1;} }
        .cart-button:hover span {
          color: #ffffff !important;
        }
      `}</style>
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 flex-grow">
        {/* Product Images and Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Section */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 h-auto sm:h-[400px] lg:h-[500px]">
            {product.images && product.images.length > 1 && (
              <div className="flex flex-row sm:flex-col gap-2 sm:gap-3 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
                {product.images.slice(0, 4).map((img, index) => (
                  <button 
                    key={`${img}-${index}`} 
                    onClick={() => setSelectedImageIndex(index)} 
                    className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === index ? 'border-red-500' : 'border-transparent hover:border-gray-400'}`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
            <div className="flex-grow h-[350px] sm:h-auto">
              {product.images && product.images[selectedImageIndex] && (
                <img 
                  src={product.images[selectedImageIndex]} 
                  alt={product.name} 
                  className="w-full h-full object-contain sm:object-cover rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg h-auto lg:h-[500px] lg:overflow-y-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <StarRating rating={averageRating} size="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base text-gray-600 font-medium">{averageRating} out of 5 ({reviews.length} ratings)</span>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-red-600">₹{displayPrice}</span>
              {originalPrice && displayPrice < originalPrice && (
                <span className="text-xl sm:text-2xl text-gray-500 line-through">₹{originalPrice}</span>
              )}
            </div>

            {product.variants?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Select Size:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button 
                      key={variant.size} 
                      onClick={() => setSelectedVariant(variant)} 
                      className={`px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base ${selectedVariant?.size === variant.size ? 'bg-red-600 text-white border-red-600' : 'hover:bg-gray-100'}`}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6 flex items-center gap-2">
              {stockStatus === "out" ? (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-600 text-sm sm:text-base">Out of Stock</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-600 text-sm sm:text-base">In Stock</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button onClick={decrementQuantity} className="p-2 sm:p-3 text-gray-500 hover:text-gray-800">-</button>
                <span className="px-3 sm:px-4 text-sm sm:text-md font-medium text-gray-800">{quantity}</span>
                <button onClick={incrementQuantity} className="p-2 sm:p-3 text-gray-500 hover:text-gray-800">+</button>
              </div>
              
              <button 
                ref={buttonRef} 
                onClick={handleAddToCart} 
                disabled={stockStatus !== "in"} 
                className="cart-button disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <span className="add-to-cart">Add to Cart</span>
                <span className="added">Added</span>
                <i className="fas fa-shopping-cart"></i>
                <i className="fas fa-box"></i>
              </button>
              
              <button 
                onClick={handleWishlistToggle} 
                className="p-2 sm:p-3 bg-gray-200 rounded-lg hover:bg-gray-300 flex-shrink-0"
              >
                <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}/>
              </button>
            </div>
          </div>
        </div>

        {/* Product Information Sections */}
        <div className="mt-8 sm:mt-12 space-y-6 sm:space-y-8">
          {product.description && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Product Description</h2>
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {product.benefits?.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Benefits</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm sm:text-base">
                {product.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {product.ingredientsBenefits?.length > 0 && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow overflow-x-auto">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Ingredients & Their Benefits</h2>
              <table className="w-full border border-gray-200 text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2 border">Ingredient</th>
                    <th className="p-2 border">Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  {product.ingredientsBenefits.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 border font-medium">{item.ingredient}</td>
                      <td className="p-2 border">{item.benefit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {product.howToUse && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-bold mb-2">How to Use</h2>
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{product.howToUse}</p>
            </div>
          )}

          {product.purityPackaging && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-bold mb-2">Purity & Packaging</h2>
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{product.purityPackaging}</p>
            </div>
          )}
        </div>
        
        {/* Reviews Section */}
        <div className="mt-8 sm:mt-12 bg-white p-4 sm:p-8 rounded-lg shadow">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Customer Reviews</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Reviews List */}
            <div className="max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2 sm:pr-4 space-y-4 sm:space-y-6">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center mb-2 flex-wrap gap-2">
                      <p className="font-bold text-gray-800 text-sm sm:text-base">{review.userName}</p>
                      <StarRating rating={review.rating} size="w-4 h-4" />
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {review.createdAt ? new Date(review.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm sm:text-base">Be the first to review this product!</p>
              )}
            </div>

            {/* Review Form */}
            <div>
              {isLoggedIn ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Write a Review</h3>
                  
                  <div>
                    <label htmlFor="review-name" className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Your Name</label>
                    <input 
                      id="review-name" 
                      type="text" 
                      value={newReviewName} 
                      onChange={(e) => setNewReviewName(e.target.value)} 
                      placeholder="Enter your name" 
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Your Rating</label>
                    <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`w-6 h-6 sm:w-8 sm:h-8 cursor-pointer transition-colors ${(hoverRating || newReviewRating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          onClick={() => setNewReviewRating(star)} 
                          onMouseEnter={() => setHoverRating(star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="review-comment" className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Your Review</label>
                    <textarea 
                      id="review-comment" 
                      value={newReviewComment} 
                      onChange={handleCommentChange} 
                      rows="5" 
                      placeholder="Share your thoughts on the product..." 
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                    ></textarea>
                    <p className={`text-xs sm:text-sm text-right mt-1 ${wordCount > MAX_WORDS ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                      {wordCount} / {MAX_WORDS} words
                    </p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={reviewSubmitting || wordCount > MAX_WORDS} 
                    className="w-full bg-red-600 text-white font-bold py-2 sm:py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-6 sm:p-8 rounded-lg">
                  <p className="text-base sm:text-lg font-semibold text-gray-800">Want to share your thoughts?</p>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 text-center">Please log in to write a review.</p>
                  <Link 
                    to="/login" 
                    className="bg-red-600 text-white font-bold py-2 px-4 sm:px-6 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                  >
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Products Section */}
        {recommendedProducts.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 text-center">You Might Also Like</h2>
            <RecommendedProductsCarousel 
              recommendedProducts={recommendedProducts}
              onToggleWishlist={handleWishlistToggle}
              wishlist={wishlist}
            />
          </div>
        )}
      </main>
   
    </div>
  );
};

export default ProductDetailPage;