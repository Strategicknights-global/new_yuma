// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { collection, getDocs, doc, getDoc, addDoc, Timestamp } from 'firebase/firestore';
// import { db } from '../../firebase';
// import { useAuth } from '../context/AuthContext';
// import { useCart } from '../context/CartContext';
// import Navbar from '../components/Navbar';
// import logo from '../assets/logo.png';

// import {
//     Star, ShoppingCart, MapPin, Mail, Instagram, Facebook, Youtube, Linkedin, Twitter
// } from 'lucide-react';

// import img1 from '../assets/image1.webp';
// import img2 from '../assets/image2.jpg';
// import img3 from '../assets/image3.jpg';
// import img4 from '../assets/image4.jpg';
// import video1 from '../assets/video1.mp4';

// import bg1 from '../assets/bg1.webp';
// import bg2 from '../assets/bg2.jpg';
// import bg3 from '../assets/bg3.jpg';
// import bg4 from '../assets/bg4.jpg';
// import bg5 from '../assets/bg5.jpg';

// // ✅ Swiper imports
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay, Pagination, Navigation, EffectCreative} from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/pagination';
// import 'swiper/css/navigation';
// import 'swiper/css/effect-coverflow'; 

// const HomePage = () => {
//     const navigate = useNavigate();
//     const { currentUser } = useAuth();
//     const { addToCart } = useCart();

//     // UI State
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [currentTestimonial, setCurrentTestimonial] = useState(0);
//     const [activeCategory, setActiveCategory] = useState('All');
//     const [newsletterEmail, setNewsletterEmail] = useState('');
//     const [showNotification, setShowNotification] = useState(false);
//     const [notificationMessage, setNotificationMessage] = useState('');
//     const [addedProducts, setAddedProducts] = useState([]);

//     // Data State
//     const [products, setProducts] = useState([]);
//     const [popularProducts, setPopularProducts] = useState([]);
//     const [comboProducts, setComboProducts] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [siteConfig, setSiteConfig] = useState({
//         heroSlides: [], testimonials: [], features: [], footerInfo: { socials: {} }
//     });

//     // ✅ Helper: Get correct product price
//     const getProductPrice = (product) => {
//         if (product.variants && product.variants.length > 0) {
//             const firstVariant = product.variants[0];
//             return firstVariant.discountPrice || firstVariant.price || 0;
//         }
//         return product.price || 0;
//     };

//     // Data Fetching from Firebase
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);

//                 const configDoc = await getDoc(doc(db, 'siteConfiguration', 'mainConfig'));
//                 if (configDoc.exists()) setSiteConfig(configDoc.data());

//                 // ✅ Fetch categories
//                 const categoriesSnapshot = await getDocs(collection(db, 'categories'));
//                 setCategories(categoriesSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

//                 // ✅ Fetch products
//                 const productsSnapshot = await getDocs(collection(db, 'products'));
//                 const allProducts = productsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
//                 setProducts(allProducts);

//                 setPopularProducts(allProducts.filter(p => p.isPopular === true).sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)));

//                 // ✅ Only COMBO products, limit 3
//                 setComboProducts(allProducts.filter(p => p.productType === "COMBO").slice(0, 3));

//             } catch (err) {
//                 console.error("Error fetching homepage data:", err);
//                 setError("Failed to load content. Please refresh the page.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, []);

//     // Auto-slide functionality
//     useEffect(() => {
//         if (!siteConfig.testimonials?.length) return;
//         const interval = setInterval(() => setCurrentTestimonial(p => (p + 1) % siteConfig.testimonials.length), 4000);
//         return () => clearInterval(interval);
//     }, [siteConfig.testimonials]);

//     // Handlers
//     const triggerNotification = (message) => {
//         setNotificationMessage(message);
//         setShowNotification(true);
//         setTimeout(() => setShowNotification(false), 3000);
//     };

//     const handleCartAnimation = (e, product) => {
//   const button = e.currentTarget;

//   if (!button.classList.contains("loading")) {
//     button.classList.add("loading");

//     // Add to cart logic
//     handleAddToCart(product);

//     // Change button text to "Added"
//     setAddedProducts((prev) => [...prev, product.id]);

//     setTimeout(() => {
//       button.classList.remove("loading");
//     }, 3700);
//   }
// };

//     const handleBuyNow = (product) => {
//         addToCart(product);
//         navigate('/cart');
//     };

//     const handleSubscribe = async () => {
//         if (!newsletterEmail || !/^\S+@\S+\.\S+$/.test(newsletterEmail)) {
//             return triggerNotification("Please enter a valid email.");
//         }
//         try {
//             await addDoc(collection(db, 'subscriptions'), { email: newsletterEmail, subscribedAt: Timestamp.now() });
//             triggerNotification("Thank you for subscribing!");
//             setNewsletterEmail('');
//         } catch (error) {
//             triggerNotification("Subscription failed. Please try again.");
//         }
//     };

//     if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>;
//     if (error) return <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-700 font-semibold p-8 text-center">{error}</div>;

//     // ✅ Filter products by category
//     const filteredProducts = products.filter(p => {
//         if (activeCategory === 'All') return true;
//         return p.categoryId === activeCategory;
//     });

//     const testimonials = [
//         { quote: "The malt drink is so refreshing and rich in flavor!", name: "Priya M.", title: "Coimbatore" },
//         { quote: "I ordered the combo pack of snacks and malt — fresh & tasty!", name: "Raju M.", title: "Coimbatore" },
//         { quote: "Crispy and fresh! Tasted like my childhood.", name: "Nivi M.", title: "Coimbatore" }
//     ];

//    const youtubeShorts = [
//   { id: 1, videoId: "Lz-5ViiCZmo" },
//   { id: 2, videoId: "2iHlsmkp6I4" },
//   { id: 3, videoId: "qT0Olwyv108" },
//   { id: 4, videoId: "JLbVad08jkQ" },
//   { id: 5, videoId: "CiUEODyBsQk" },
// ];
// // ✅ Reels Array
// const instagramReels = [
//   { id: 1, url: "https://www.instagram.com/p/DMNetXrzVmO/embed" },
//   { id: 2, url: "https://www.instagram.com/p/C7txaVJz9Zl/embed" },
//   { id: 3, url: "https://www.instagram.com/p/C6mnA4kKxL_/embed" },
// ];


//     // ✅ Features Array
// const features = [
//   { icon: bg1, title: 'From Trusted Farmers', description: 'We source the best ingredients from farmers we trust.' },
//   { icon: bg2, title: 'Freshly Packed', description: 'Our products are packed with care to ensure maximum freshness.' },
//   { icon: bg3, title: 'Hand Picked Ingredients', description: 'Each ingredient is carefully chosen by hand for quality.' },
//   { icon: bg4, title: '100% Organic', description: 'We use only organic ingredients for healthy, tasty food.' },
//   { icon: bg5, title: 'Door Step Delivery', description: 'Enjoy our fresh products delivered right to your door.' },
// ];


//     return (
//         <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
//             {showNotification && <div className="fixed top-20 right-4 z-[100] bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">{notificationMessage}</div>}

//             <Navbar />

//             {/* ✅ Hero Banner */}
//             <section className="relative w-full h-[350px] md:h-[500px] bg-black overflow-hidden">
//                 <Swiper modules={[Autoplay, Pagination, Navigation]} autoplay={{ delay: 4000 }} loop pagination={{ clickable: true }} navigation className="w-full h-full">
//                     <SwiperSlide><video src={video1} autoPlay loop muted playsInline className="w-full h-full object-cover" /></SwiperSlide>
//                     <SwiperSlide><img src={img1} alt="Banner 1" className="w-full h-full object-cover" /></SwiperSlide>
//                     <SwiperSlide><img src={img2} alt="Banner 2" className="w-full h-full object-cover" /></SwiperSlide>
//                     <SwiperSlide><img src={img3} alt="Banner 3" className="w-full h-full object-cover" /></SwiperSlide>
//                     <SwiperSlide><img src={img4} alt="Banner 4" className="w-full h-full object-cover" /></SwiperSlide>
//                 </Swiper>
//             </section>

//             {/* Offer Banner */}
//             <section className="py-8 bg-white">
//                 <div className="container mx-auto px-4 text-center">
//                     <div className="bg-gradient-to-r from-green-100 via-green-200 to-green-400 p-6 rounded-xl shadow-lg">
//                         <h3 className="text-2xl font-bold text-gray-800 mb-4">Don't miss the discounts</h3>
//                         <div className="flex justify-center items-center overflow-hidden">
//                             <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
//                                 <div className="text-4xl">🎉</div>
//                                 <div>
//                                     <p className="text-lg font-semibold text-gray-800">Special Festival Offers</p>
//                                     <p className="text-sm text-gray-600">Up to 30% off on selected items</p>
//                                 </div>
//                                 <div className="text-4xl">🎁</div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* ✅ Popular Products Section with Categories */}
//             <section className="py-12 bg-white">
//                 <div className="container mx-auto px-4">
//                     <h2 className="text-3xl font-bold text-center mb-8 text-[#01796f]">Popular Products</h2>

//                     {/* ✅ Category buttons */}
//                     <div className="flex justify-center mb-8 space-x-4 flex-wrap">
//                         <button onClick={() => setActiveCategory('All')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeCategory === 'All' ? 'bg-[#01796f] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>All</button>
//                         {categories.map(cat => (
//                             <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeCategory === cat.id ? 'bg-[#01796f] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{cat.name}</button>
//                         ))}
//                     </div>

//                     {/* ✅ Filtered Products */}
//                                         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//                                             {filteredProducts.slice(0, 8).map(p => (
//                                                 <div key={p.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform transform hover:scale-105">
//                                                     <Link to={`/products/${p.id}`}>
//                                                         <img src={p.images?.[0]} alt={p.name} className="w-full h-48 object-cover" />
//                                                         <div className="p-4 text-center">
//                                                             <h3 className="text-md font-semibold text-gray-800 mb-2">{p.name}</h3>
//                                                             <div className="text-xl font-bold text-[#b85a00] mb-4">₹{getProductPrice(p)}</div>
//                                                         </div>
//                                                     </Link>
//                                                     <div className="flex justify-center space-x-2 p-4">
//                                                         <button 
//                                                             onClick={(e) => handleCartAnimation(e, p)} 
//                                                             className="button"
//                                                         >
//                                                             <span>
//                                                             {addedProducts.includes(p.id) ? "Added" : "Add to Cart"}
//                                                             </span>
//                                                             <div className="cart">
//                                                             <svg viewBox="0 0 36 26">
//                                                                 <polyline points="1 2.5 6 2.5 10 18.5 25.5 18.5 28.5 7.5 7.5 7.5"></polyline>
//                                                                 <polyline points="15 13.5 17 15.5 22 10.5"></polyline>
//                                                             </svg>
//                                                             </div>
//                                                         </button>
                    
//                                                         <button 
//                                                             onClick={() => handleBuyNow(p)} 
//                                                             className="bg-[#ffa500] px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#ff6e00]">
//                                                             Buy Now
//                                                         </button>
//                                                         </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 </section>
                    

//             {/* ✅ Mega Combo Section */}
//             <section className="py-12 bg-white">
//                 <div className="container mx-auto px-4">
//                     <div className="flex flex-col lg:flex-row items-center bg-[#c8ffba] rounded-xl p-8 shadow-md">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full lg:w-3/4 mb-6 lg:mb-0">
//                             {comboProducts.map(p => (
//                                 <div key={p.id} className="bg-white rounded-lg p-4 shadow-sm flex flex-col items-center text-center">
//                                     <img src={p.images[0]} alt={p.name} className="w-full h-40 object-contain" />
//                                     <h3 className="font-semibold text-gray-800 mt-2">{p.name}</h3>
//                                     <div className="text-lg font-bold text-[#b85a00] mb-4">₹{getProductPrice(p)}</div>
//                                     <div className="flex space-x-2">
//                                         <button onClick={() => handleAddToCart(p)} className="flex items-center bg-[#f0c242] px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#e0b034]">
//                                             <ShoppingCart className="w-4 h-4 mr-1" /> Add
//                                         </button>
//                                         <button onClick={() => handleBuyNow(p)} className="bg-[#b85a00] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#a14f00]">
//                                             Buy Now
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                         <div className="w-full lg:w-1/4 text-center lg:text-right">
//                             <h3 className="text-3xl font-bold text-[#b85a00] mb-4">Mega Combo Packs</h3>
//                             <Link to="/products?category=Combos" className="bg-[#b85a00] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a14f00] transition-colors">View all combos</Link>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//                     {/* ✅ Why Choose Us */}
//         <section className="py-12 bg-gray-50">
//         <div className="container mx-auto px-4">
//             <h2 className="text-3xl font-bold text-center mb-8 text-[#b85a00]">
//             Why buy from Yuma Fresh Foods?
//             </h2>
//             <div className="flex flex-wrap justify-center gap-8">
//             {features.map((feature, index) => (
//                 <div
//                 key={index}
//                 className="bg-white rounded-xl shadow-lg p-6 w-48 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300"
//                 >
//                 <img
//                     src={feature.icon}
//                     alt={feature.title}
//                     className="w-20 h-20 object-cover rounded-full mb-4 border-4 border-[#b85a00]/20"
//                 />
//                 <h3 className="text-lg font-semibold text-gray-800 mb-2">
//                     {feature.title}
//                 </h3>
//                 <p className="text-sm text-gray-600">{feature.description}</p>
//                 </div>
//             ))}
//             </div>
//         </div>
//         </section>

//             {/* see it , crave it , taste it */}
//             <section className="py-12 bg-white">
//             <div className="container mx-auto px-4">
//                 <h2 className="text-3xl font-bold text-center mb-8 text-[#b85a00]">
//                 See It. Crave It. Taste It
//                 </h2>
//                 <Swiper
//                 effect={'creative'}
//                 grabCursor={true}
//                 centeredSlides={true}
//                 slidesPerView={1.3}
//                 spaceBetween={20}
//                 loop={true}
//                 autoplay={{ delay: 6000, disableOnInteraction: false }}
//                 pagination={{ clickable: true }}
//                 modules={[Autoplay, Pagination, EffectCreative]}
//                 creativeEffect={{
//                     prev: {
//                     shadow: true,
//                     translate: ['-25%', 0, -200],
//                     rotate: [0, 0, -8],
//                     },
//                     next: {
//                     shadow: true,
//                     translate: ['25%', 0, -200],
//                     rotate: [0, 0, 8],
//                     },
//                 }}
//                 className="w-full max-w-5xl"
//                 >
//                 {youtubeShorts.map((short) => (
//                     <SwiperSlide
//                     key={short.id}
//                     className="w-52 h-[45rem] md:w-60 md:h-[50rem]"
//                     >
//                     {/* Card Container */}
//                     <div className="relative w-full h-96 bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-2xl overflow-hidden shadow-2xl border border-gray-700 group hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
                        
//                         {/* Video Container */}
//                         <div className="relative w-full h-full rounded-2xl overflow-hidden">
//                         <iframe
//             className="w-full h-full object-cover"
//             src={`https://www.youtube.com/embed/${short.videoId}?autoplay=1&mute=1&loop=1&playlist=${short.videoId}`}
//             title="YouTube Short"
//             frameBorder="0"
//             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//             allowFullScreen
//             />
                        
//                         {/* Overlay Gradient */}
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                         </div>
                        
//                         {/* Play Button Overlay */}
//                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
//                         <div className="bg-white/20 backdrop-blur-md rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300">
//                             <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
//                             <path d="M8 5v14l11-7z"/>
//                             </svg>
//                         </div>
//                         </div>
                        
//                         {/* Corner Accent */}
//                         <div className="absolute top-0 right-0 w-16 h-16">
//                         <div className="absolute top-2 right-2 w-3 h-3 bg-[#b85a00] rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
//                         </div>
                        
//                         {/* Bottom Info Bar (Optional) */}
//                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
//                         <div className="flex items-center justify-between text-white">
//                             <span className="text-sm font-medium">Watch Now</span>
//                             <div className="flex space-x-1">
//                             <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
//                             <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
//                             <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
//                             </div>
//                         </div>
//                         </div>
                        
//                     </div>
//                     </SwiperSlide>
//                 ))}
//                 </Swiper>
//             </div>
//             </section>
            
//             {/* ✅ Testimonials */}
//                         <section className="py-12 bg-white">
//               <div className="container mx-auto px-4 text-center">
//                 <div className="bg-[#50c878] text-white py-12 px-8 rounded-xl shadow-lg">
//                   <h2 className="text-3xl font-bold mb-8">Here is what Customer say</h2>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                     {testimonials.map((testimonial, index) => (
//                       <div
//                         key={index}
//                         className={`bg-white text-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center animate-pop`}
//                         style={{ animationDelay: `${index * 0.5}s` }}
//                       >
//                         <div className="mb-4">
//                           {Array.from({ length: 5 }, (_, i) => (
//                             <Star
//                               key={i}
//                               className="w-5 h-5 inline-block text-yellow-400 fill-yellow-400"
//                             />
//                           ))}
//                         </div>
//                         <p className="text-md italic mb-4">"{testimonial.quote}"</p>
//                         <p className="font-semibold">{testimonial.name}</p>
//                         <p className="text-sm">{testimonial.title}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
            
//               {/* Add popping animation */}
//               <style>{`
//                 @keyframes pop {
//                   0%, 100% { transform: scale(1); }
//                   50% { transform: scale(1.08); }
//                 }
//                 .animate-pop {
//                   animation: pop 2.5s ease-in-out infinite;
//                 }
//               `}</style>
//             </section>

//             {/* ✅ Follow on Social Media (Instagram Reels Embed) */}
// <section className="py-12 bg-white">
//   <div className="container mx-auto px-4 text-center">
//     <h2 className="text-3xl font-bold mb-8 text-[#b85a00]">Follow us on Social Media</h2>

//     <div className="flex overflow-x-auto gap-6 p-4 -mx-4 scrollbar-hide justify-center">
//       {instagramReels.map((reel) => (
//         <div key={reel.id} className="flex-shrink-0 w-[350px] h-[600px] rounded-lg overflow-hidden shadow-lg">
//           <iframe
//             src={reel.url}
//             width="100%"
//             height="600"
//             frameBorder="0"
//             scrolling="no"
//             allowtransparency="true"
//             allow="encrypted-media"
//             title={`Instagram Reel ${reel.id}`}
//           ></iframe>
//         </div>
//       ))}
//     </div>

//     <button
//       onClick={() =>
//         window.open("https://www.instagram.com/strategic_knights?igsh=dzR6dGRlcjc3N3Q%3D", "_blank")
//       }
//       className="mt-8 bg-[#b85a00] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#a14f00] transition-colors"
//     >
//       Follow us on Instagram
//     </button>
//   </div>
// </section>

//             {/* ✅ Footer */}
//                         <footer className="bg-[#01796f] text-white py-12">
//                             <div className="container mx-auto px-4 flex flex-col md:flex-row items-center md:items-start justify-between">
//                                 <div className="mb-8 md:mb-0 text-center md:text-left">
//                                     <img src="/images/yuma-logo.png" alt="Yuma's Fresh Foods Logo" className="w-32 mb-4 mx-auto md:mx-0" />
//                                     <div className="flex items-center justify-center md:justify-start mb-2">
//                                         <MapPin className="w-4 h-4 mr-2" />
//                                         <p className="text-sm">123 Street Address, Oil Nagar, Sample City - 123456 Tamil Nadu, India</p>
//                                     </div>
//                                     <div className="flex items-center justify-center md:justify-start mb-2">
//                                         <Mail className="w-4 h-4 mr-2" />
//                                         <p className="text-sm">info@gmail.com</p>
//                                     </div>
//                                     <button className="bg-orange-500 text-white px-4 py-2 mt-4 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
//                                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2"><path d="M12.04 2.872c-5.41 0-9.8 4.39-9.8 9.8s4.39 9.8 9.8 9.8c1.6 0 3.2-.4 4.6-1l4.8 1.3-1.3-4.8c.6-1.4 1-3 1-4.6 0-5.41-4.39-9.8-9.8-9.8zm4.7 13.9l-1.6 1c-.4.2-.9.3-1.4.3-1 0-2.2-.4-3.5-1.7-1.3-1.3-1.7-2.5-1.7-3.5 0-.5.1-1 .3-1.4l1-1.6c.1-.2.3-.3.6-.3l1.8.6c.2.1.4.2.5.5l.3.6c.1.2 0 .4-.2.6l-.8.8c-.3.3-.3.8-.1 1.1l.4.4c.3.3.6.3 1 .1l.8-.8c.2-.2.4-.2.6-.1l.6.3c.2.1.3.3.3.5l.6 1.8c.1.2 0 .4-.1.6zm-4.7 0c0-.1 0-.3.1-.4l.8-.8c.1-.1.2-.2.4-.1l.8.8c.1.1.2.1.4.1l.6-.3c.1-.1.3-.1.4-.2l.6-1.8c.1-.3 0-.6-.2-.7l-.8-.8c-.3-.3-.6-.3-.7-.1l-.4.4c-.1.1-.3.1-.4.1l-.8-.8c-.1-.1-.3-.2-.4-.2l-1.6-.7c-.2-.1-.5-.1-.7.1l-1.2 1.2c-.3.3-.4.7-.2 1.1l.4.4c.3.3.6.3 1 .1l.8-.8c.2-.2.4-.2.6-.1l.6.3c.2.1.3.3.3.5l.6 1.8c.1.2 0 .4-.1.6z"/></svg>
//                                         <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noopener noreferrer" className="ml-2">Click here to chat on Whatsapp</a>
//                                     </button>
//                                 </div>
//                                 <div className="flex-1 flex flex-col md:flex-row justify-between text-center md:text-left">
//                                     <div className="mb-6 md:mb-0">
//                                         <h4 className="font-bold text-lg mb-4">Quick Links</h4>
//                                         <ul className="space-y-2 text-sm">
//                                             <li><Link to="/about" className="hover:underline">About Us</Link></li>
//                                             <li><Link to="/benefits" className="hover:underline">Benefits of Yuma</Link></li>
//                                             <li><Link to="/testimonials" className="hover:underline">Testimonials</Link></li>
//                                             <li><Link to="/journey" className="hover:underline">Our Journey</Link></li>
//                                             <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
//                                             <li><Link to="/terms" className="hover:underline">Terms & Conditions</Link></li>
//                                             <li><Link to="/delivery" className="hover:underline">Delivery Information</Link></li>
//                                         </ul>
//                                     </div>
//                                     <div className="mb-6 md:mb-0">
//                                         <h4 className="font-bold text-lg mb-4">Our Policy</h4>
//                                         <ul className="space-y-2 text-sm">
//                                             <li><Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
//                                             <li><Link to="/shipping-policy" className="hover:underline">Shipping Policy</Link></li>
//                                             <li><Link to="/return-policy" className="hover:underline">Return Policy</Link></li>
//                                             <li><Link to="/refund-policy" className="hover:underline">Refund Policy</Link></li>
//                                         </ul>
//                                     </div>
//                                     <div>
//                                         <h4 className="font-bold text-lg mb-4">Follow us on</h4>
//                                         <div className="flex justify-center md:justify-start space-x-4 mb-6">
//                                             <a href="#" aria-label="Instagram"><Instagram className="w-6 h-6 hover:text-gray-200" /></a>
//                                             <a href="#" aria-label="Facebook"><Facebook className="w-6 h-6 hover:text-gray-200" /></a>
//                                             <a href="#" aria-label="Youtube"><Youtube className="w-6 h-6 hover:text-gray-200" /></a>
//                                             <a href="#" aria-label="LinkedIn"><Linkedin className="w-6 h-6 hover:text-gray-200" /></a>
//                                             <a href="#" aria-label="Twitter"><Twitter className="w-6 h-6 hover:text-gray-200" /></a>
//                                         </div>
//                                         <h4 className="font-bold text-lg mb-2">My Account</h4>
//                                         <ul className="space-y-2 text-sm">
//                                             <li><Link to="/profile" className="hover:underline">My Profile</Link></li>
//                                             <li><Link to="/orders" className="hover:underline">Order History</Link></li>
//                                         </ul>
//                                     </div>
//                                 </div>
//                             </div>
//                         </footer>
//                     </div>
//                 );
//             };
            
//             export default HomePage;


import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// ✅ Components
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


const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comboProducts, setComboProducts] = useState([]);
  const [addedProducts, setAddedProducts] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // ✅ Get correct product price
  const getProductPrice = (product) => {
    if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      return firstVariant.discountPrice || firstVariant.price || 0;
    }
    return product.price || 0;
  };

  // ✅ Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Categories
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        setCategories(categoriesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Products
        const productsSnapshot = await getDocs(collection(db, "products"));
        const allProducts = productsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(allProducts);

        // Combo products
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

  // ✅ Notification
  const triggerNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // ✅ Add-to-cart button animation
  const handleCartAnimation = (e, product) => {
    const button = e.currentTarget;
    if (!button.classList.contains("loading")) {
      button.classList.add("loading");
      handleAddToCart(product);
      setAddedProducts((prev) => [...prev, product.id]);
      setTimeout(() => button.classList.remove("loading"), 3700);
    }
  };

  // ✅ Handle Add to Cart
  const handleAddToCart = (product) => {
    addToCart(product);
    triggerNotification(`${product.name} added to cart`);
  };

  // ✅ Buy Now
  const handleBuyNow = (product) => {
    addToCart(product);
    navigate("/cart");
  };

  // ✅ Newsletter Subscribe
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

  // ✅ Loading / Error UI
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
      {/* ✅ Notifications */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-[100] bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          {notificationMessage}
        </div>
      )}

      <Navbar />

      <HeroBanner />

      <br></br>
      <OfferBanner
        altText="Delicious Millets Collection"
        overlayText="Healthy Millets, Delivered Fresh 🌾"
      />
      

      <PopularProducts
        products={products}
        categories={categories}
        addToCart={handleAddToCart}
        addedProducts={addedProducts}
        handleCartAnimation={handleCartAnimation}
        handleBuyNow={handleBuyNow}
        getProductPrice={getProductPrice}
      />

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
