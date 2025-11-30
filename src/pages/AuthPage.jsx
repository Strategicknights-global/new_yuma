import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,     // Imported
  signInWithPopup         // Imported
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Added getDoc
import { auth, db } from '../../firebase';
import signbackground from "../assets/sign_background.png";

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

  // --- Email/Password Logic ---
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

  // --- Google Sign-In Logic ---
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document already exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Only create a new document if it doesn't exist (First time login)
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          role: 'user',
          createdAt: new Date(),
          cart: [],
          wishlist: [],
          orders: [],
        });
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      setError("Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-100"
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

          {/* Name Field (Signup Only) */}
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
              className="absolute right-3 top-10" // Adjusted top slightly for alignment
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

        {/* Divider */}
        <div className="relative flex items-center justify-center w-full mt-6 border-t border-gray-300">
          <div className="absolute px-3 bg-white text-gray-500 text-sm">
            Or continue with
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 mt-4 space-x-2 transition-colors duration-300 border border-gray-300 rounded-md group hover:bg-gray-50 focus:outline-none"
        >
          {/* Google Color Icon SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700 group-hover:text-black">
            Sign in with Google
          </span>
        </button>

      </div>
    </div>
  );
};

export default AuthPage;