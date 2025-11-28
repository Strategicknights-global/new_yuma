import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from "../assets/logo.png";

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About us' },
  { to: '/contact', label: 'Contact' },
  { to: '/bulk-enquiry', label: 'Bulk Enquiry' },
];

const OFFER_BAR_HEIGHT = 56;

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { totalCartItems } = useCart();

  const isHomePage = location.pathname === '/';

  // Handle scroll only on home page
  useEffect(() => {
    if (!isHomePage) return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomePage]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setIsMobileMenuOpen(false);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error logging out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ✅ Navbar styling
  let navbarClasses = 'w-full transition-all duration-300 z-40';
  let navPositionStyles = {};
  let textColor = 'text-gray-700';
  let iconColor = 'text-gray-700';

  if (isHomePage) {
    // Home page: overlay hero section
    navbarClasses += ' fixed left-0 right-0';
    navPositionStyles = { top: `${OFFER_BAR_HEIGHT}px` };

    if (!scrolled) {
      navbarClasses += ' bg-transparent';
      textColor = 'text-white';
      iconColor = 'text-white';
    } else {
      navbarClasses += ' bg-white shadow-md';
    }
  } else {
    // Other pages: normal flow, not overlay
    navbarClasses += ' relative bg-white shadow-md';
    navPositionStyles = { marginTop: `${OFFER_BAR_HEIGHT}px` }; // pushes navbar below banner
  }

  return (
    <nav style={navPositionStyles} className={navbarClasses}>
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={ logo } alt="Yuma Foods Logo" className="h-20 w-auto" />
          <span
            className={`text-3xl font-bold ${textColor}`}
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Yuma Foods
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${isActive ? 'font-bold border-b-2 border-green-600' : ''} ${textColor} hover:text-green-600 transition-colors`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center space-x-4">
          <form
            onSubmit={handleSearch}
            className={`flex items-center rounded-md overflow-hidden ${
              isHomePage && !scrolled
                ? 'border border-white/30'
                : 'border border-gray-300'
            }`}
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`px-3 py-1.5 focus:outline-none text-sm w-32 md:w-48 ${
                isHomePage && !scrolled
                  ? 'text-white placeholder-white bg-transparent'
                  : 'text-gray-700 bg-white'
              }`}
            />
            <button
              type="submit"
              className={`p-1.5 ${
                isHomePage && !scrolled
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Search className={`w-5 h-5 ${iconColor}`} />
            </button>
          </form>

          <Link to="/wishlist" className="relative p-2 rounded-full">
            <Heart className={`w-6 h-6 ${iconColor}`} />
          </Link>

          <Link to="/cart" className="relative p-2 rounded-full">
            <ShoppingCart className={`w-6 h-6 ${iconColor}`} />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative group">
              <button className="flex items-center space-x-1 p-2 rounded-full">
                <User className={`w-6 h-6 ${iconColor}`} />
                <span className={`text-sm ${textColor}`}>
                  {user.email?.split('@')[0] || 'User'}
                </span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <Link to="/cart" className="relative p-1">
            <ShoppingCart className={`w-6 h-6 ${iconColor}`} />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={iconColor}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4">
          <form onSubmit={handleSearch} className="flex px-6 mb-4">
            <input
              type="text"
              placeholder="Search products..."
              className="flex-grow p-2 border rounded-l-md focus:outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-red-600 text-white p-2 rounded-r-md">
              <Search className="w-5 h-5" />
            </button>
          </form>
          <div className="flex flex-col px-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block text-gray-700 hover:text-red-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/wishlist"
              className="block text-gray-700 hover:text-red-600 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Wishlist
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block text-gray-700 hover:text-red-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  className="block text-gray-700 hover:text-red-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="block w-full text-left text-gray-700 hover:text-red-600 font-medium disabled:opacity-50"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block text-red-600 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
