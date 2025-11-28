import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import signbackground from "../assets/sign_background.png"


// Icons
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const AuthPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLoginMode) {
      // LOGIN
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } catch (err) {
        let msg = "Something went wrong. Please try again.";

        switch (err.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            msg = "Invalid User ID or Password";
            break;

          case "auth/invalid-email":
            msg = "Please enter a valid email address.";
            break;

          default:
            msg = "Login failed. Try again.";
        }

        setError(msg);
      }
    } else {
      // SIGNUP
      if (!displayName) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName });

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName,
          email,
          role: 'user',
          createdAt: new Date(),
          cart: [],
          wishlist: [],
          orders: [],
        });

        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100"
     style={{
    backgroundImage: `url(${signbackground})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
    
    
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">

        <div className="text-center">
          <Link to="/">
           <img
  src="/Yuma foods logo.png"
  alt="Logo"
  className="mx-auto w-40 h-40 rounded-full object-cover"
/>

          </Link>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {isLoginMode ? 'Welcome Back!' : 'Create an Account'}
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="font-medium text-red-600 hover:underline"
            >
              {isLoginMode ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

        {/* FORM */}
        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* Name Field */}
          {!isLoginMode && (
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Password Field + Eye Icon */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm pr-10 focus:ring-red-500 focus:border-red-500"
            />

            {/* Eye Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-12 transform -translate-y-1/2"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5 text-gray-500" />
              ) : (
                <EyeIcon className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>

          {/* Centered Error Message */}
          {error && (
            <p className="text-sm text-red-600 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLoginMode ? 'Log In' : 'Sign Up')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;