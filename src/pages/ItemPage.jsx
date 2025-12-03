import React, { useState } from 'react';
import { 
  Heart, 
  Star, 
  ChevronLeft, 
  Search, 
  User, 
  ShoppingCart, 
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
  Twitter
} from 'lucide-react';

const ItemPage = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('500g');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "John Customer",
      rating: 5,
      comment: "The malt drink is so refreshing and rich in flavor! I also liked the spicy snack mix — absolutely addictive. The packaging was neat and delivery was quick."
    },
    {
      id: 2,
      name: "Sarah Johnson",
      rating: 5,
      comment: "The malt drink is so refreshing and rich in flavor! I also liked the spicy snack mix — absolutely addictive. The packaging was neat and delivery was quick."
    },
    {
      id: 3,
      name: "Mike Wilson",
      rating: 5,
      comment: "The malt drink is so refreshing and rich in flavor! I also liked the spicy snack mix — absolutely addictive. The packaging was neat and delivery was quick."
    }
  ]);

  const productImages = [
    '/api/placeholder/400/400',
    '/api/placeholder/400/400',
    '/api/placeholder/400/400',
    '/api/placeholder/400/400'
  ];

  const relatedProducts = [
    { id: 1, name: 'ABC Milk Mix', price: 125, originalPrice: null, rating: 4.5, reviews: 24 },
    { id: 2, name: 'ABC Milk Mix', price: 175, originalPrice: null, rating: 4.5, reviews: 24 },
    { id: 3, name: 'ABC Milk Mix', price: 175, originalPrice: null, rating: 4.5, reviews: 24 },
    { id: 4, name: 'ABC Milk Mix', price: 325, originalPrice: null, rating: 4.5, reviews: 24 }
  ];

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const ratingDistribution = [
    { stars: 5, percentage: 84, count: 42 },
    { stars: 4, percentage: 10, count: 5 },
    { stars: 3, percentage: 4, count: 2 },
    { stars: 2, percentage: 2, count: 1 },
    { stars: 1, percentage: 0, count: 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="font-bold text-xl">Hamro Food Pvt.</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-gray-700 hover:text-gray-900">Home</a>
                <a href="/products" className="text-gray-700 hover:text-gray-900">Products</a>
                <a href="/about" className="text-gray-700 hover:text-gray-900">About us</a>
                <a href="/contact" className="text-gray-700 hover:text-gray-900">Contact</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Search className="w-5 h-5 text-gray-600" />
              <User className="w-5 h-5 text-gray-600" />
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  Cart
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-gray-900">Home</a>
          <span>/</span>
          <a href="/products" className="hover:text-gray-900">Products</a>
          <ChevronLeft className="w-4 h-4 rotate-180" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg border overflow-hidden">
              <img 
                src="/api/placeholder/500/500" 
                alt="ABC Milk Mix"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex space-x-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg border-2 overflow-hidden ${
                    selectedImage === index ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ABC Milk Mix – 500g | Natural Ingredients | No Preservatives | Rich & Creamy | Perfect for All Ages
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(4.5)}
                  <span className="text-sm text-gray-600 ml-2">4.5 (24 Reviews)</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-red-500 font-medium">-10%</span>
                <span className="text-3xl font-bold text-gray-900">RS 450</span>
                <span className="text-lg text-gray-500 line-through">MRP 500</span>
              </div>
            </div>

            {/* Check Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check Availability
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter pincode"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                />
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Check
                </button>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-2 rounded-full ${isWishlisted ? 'text-red-500' : 'text-gray-400'}`}
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="flex space-x-3">
                <button className="flex-1 bg-red-500 text-white py-3 px-6 rounded-md hover:bg-red-600 font-medium">
                  Add to Cart
                </button>
                <button className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 font-medium">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg border p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  <img 
                    src="/api/placeholder/200/200" 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                <div className="flex items-center space-x-1 mb-2">
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-600">{product.rating}</span>
                  <span className="text-sm text-gray-600">({product.reviews} Reviews)</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold">₹{product.price}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 text-sm border border-orange-500 text-orange-500 py-2 px-3 rounded hover:bg-orange-50">
                    Add to Cart
                  </button>
                  <button className="flex-1 text-sm bg-orange-500 text-white py-2 px-3 rounded hover:bg-orange-600">
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Reviews */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Products Review</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1 mb-1">
                        {renderStars(review.rating)}
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{review.name}</p>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Review Summary */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customers Review</h2>
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(4.5)}
                </div>
                <span className="font-bold text-lg">4 out of 5</span>
              </div>
              
              <div className="space-y-2 mb-6">
                {ratingDistribution.map((rating) => (
                  <div key={rating.stars} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{rating.stars} star</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-400 h-2 rounded-full"
                        style={{ width: `${rating.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{rating.percentage}%</span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Review the Product</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex space-x-1">
                      {renderStars(0)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                    <textarea
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Contact */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <span className="font-bold text-xl">Hamro Food Pvt.</span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>123 Street Address, Location, Sample City – 123456, Tamil Nadu, India</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Click here to chat on WhatsApp +91 99999 99999</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/about" className="hover:text-gray-900">About Us</a></li>
                <li><a href="/benefits" className="hover:text-gray-900">Benefits of Varna</a></li>
                <li><a href="/testimonials" className="hover:text-gray-900">Testimonials</a></li>
                <li><a href="/journey" className="hover:text-gray-900">Our Journey</a></li>
                <li><a href="/contact" className="hover:text-gray-900">Contact Us</a></li>
                <li><a href="/terms" className="hover:text-gray-900">Terms & Conditions</a></li>
                <li><a href="/delivery" className="hover:text-gray-900">Delivery Information</a></li>
              </ul>
            </div>

            {/* Our Policy */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Our Policy</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/privacy" className="hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="/shipping" className="hover:text-gray-900">Shipping Policy</a></li>
                <li><a href="/return" className="hover:text-gray-900">Return Policy</a></li>
                <li><a href="/refund" className="hover:text-gray-900">Refund Policy</a></li>
              </ul>
            </div>

            {/* My Account & Social */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">My Account</h3>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li><a href="/profile" className="hover:text-gray-900">My Profile</a></li>
                <li><a href="/orders" className="hover:text-gray-900">Order History</a></li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 mb-4">Follow us on</h3>
              <div className="flex space-x-3">
                <Instagram className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
                <Facebook className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
                <Linkedin className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
                <Twitter className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ItemPage;