// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import {  ArrowLeft } from "lucide-react";
// import logo from "../assets/logo.png"
// import { 
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword, 
//   updateProfile,
//   GoogleAuthProvider,     // Imported
//   signInWithPopup         // Imported
// } from 'firebase/auth';
// import { doc, setDoc, getDoc } from 'firebase/firestore'; // Added getDoc
// import { auth, db } from '../../firebase';
// import signbackground from "../assets/sign_background.png";

// // Icons
// import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// const AuthPage = () => {
//   const [isLoginMode, setIsLoginMode] = useState(true);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [displayName, setDisplayName] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const navigate = useNavigate();

//   // --- Email/Password Logic ---
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     if (isLoginMode) {
//       // LOGIN
//       try {
//         await signInWithEmailAndPassword(auth, email, password);
//         navigate('/');
//       } catch (err) {
//         let msg = "Something went wrong. Please try again.";
//         switch (err.code) {
//           case "auth/invalid-credential":
//           case "auth/wrong-password":
//           case "auth/user-not-found":
//             msg = "Invalid User ID or Password";
//             break;
//           case "auth/invalid-email":
//             msg = "Please enter a valid email address.";
//             break;
//           default:
//             msg = "Login failed. Try again.";
//         }
//         setError(msg);
//       }
//     } else {
//       // SIGNUP
//       if (!displayName) {
//         setError("Please enter your name.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;

//         await updateProfile(user, { displayName });

//         await setDoc(doc(db, 'users', user.uid), {
//           uid: user.uid,
//           displayName,
//           email,
//           role: 'user',
//           createdAt: new Date(),
//           cart: [],
//           wishlist: [],
//           orders: [],
//         });

//         navigate('/');
//       } catch (err) {
//         setError(err.message);
//       }
//     }
//     setLoading(false);
//   };

//   // --- Google Sign-In Logic ---
//   const handleGoogleSignIn = async () => {
//     setError('');
//     setLoading(true);
//     try {
//       const provider = new GoogleAuthProvider();
//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;

//       // Check if user document already exists in Firestore
//       const userDocRef = doc(db, 'users', user.uid);
//       const userDocSnap = await getDoc(userDocRef);

//       if (!userDocSnap.exists()) {
//         // Only create a new document if it doesn't exist (First time login)
//         await setDoc(userDocRef, {
//           uid: user.uid,
//           displayName: user.displayName,
//           email: user.email,
//           role: 'user',
//           createdAt: new Date(),
//           cart: [],
//           wishlist: [],
//           orders: [],
//         });
//       }

//       navigate('/');
//     } catch (err) {
//       console.error(err);
//       setError("Google Sign-In failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//      <div 
//     className="min-h-screen flex items-center justify-center bg-gray-100 mt-20 "
//     style={{
//       backgroundImage: `url(${signbackground})`,
//       backgroundSize: "cover",
//       backgroundPosition: "center",
//       backgroundRepeat: "no-repeat",
//     }}
//   >
//       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md relative">
//  <button
//     onClick={() => navigate('/')}
//     className="absolute top-10 lg:top-10 left-4 flex items-center space-x-1 text-gray-700 hover:text-red-600"
//   >
//     <ArrowLeft className="w-6 h-6 lg:w-8 lg:h-8" />
   
//   </button>

//         <div className="text-center">
//           <Link to="/">
//             <img
//               src={logo}
//               alt="Logo"
//               className="mx-auto w-40 h-40 rounded-full object-cover"
//             />
//           </Link>

//           <h2 className="mt-4 text-2xl font-bold text-gray-900">
//             {isLoginMode ? 'Welcome Back!' : 'Create an Account'}
//           </h2>

//           <p className="mt-2 text-sm text-gray-600">
//             {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
//             <button
//               onClick={() => setIsLoginMode(!isLoginMode)}
//               className="font-medium text-red-600 hover:underline"
//             >
//               {isLoginMode ? 'Sign up' : 'Log in'}
//             </button>
//           </p>
//         </div>

//         {/* FORM */}
//         <form className="space-y-6" onSubmit={handleSubmit}>

//           {/* Name Field (Signup Only) */}
//           {!isLoginMode && (
//             <div>
//               <label className="text-sm font-medium text-gray-700">Full Name</label>
//               <input
//                 type="text"
//                 required
//                 value={displayName}
//                 onChange={(e) => setDisplayName(e.target.value)}
//                 className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
//               />
//             </div>
//           )}

//           {/* Email Field */}
//           <div>
//             <label className="text-sm font-medium text-gray-700">Email address</label>
//             <input
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
//             />
//           </div>

//           {/* Password Field + Eye Icon */}
//           <div className="relative">
//             <label className="text-sm font-medium text-gray-700">Password</label>
//             <input
//               type={showPassword ? "text" : "password"}
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm pr-10 focus:ring-red-500 focus:border-red-500"
//             />

//             {/* Eye Button */}
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-10" // Adjusted top slightly for alignment
//             >
//               {showPassword ? (
//                 <EyeSlashIcon className="w-5 h-5 text-gray-500" />
//               ) : (
//                 <EyeIcon className="w-5 h-5 text-gray-500" />
//               )}
//             </button>
//           </div>

//           {/* Centered Error Message */}
//           {error && (
//             <p className="text-sm text-red-600 text-center">
//               {error}
//             </p>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
//           >
//             {loading ? 'Processing...' : (isLoginMode ? 'Log In' : 'Sign Up')}
//           </button>
//         </form>

//         {/* Divider */}
//         <div className="relative flex items-center justify-center w-full mt-6 border-t border-gray-300">
//           <div className="absolute px-3 bg-white text-gray-500 text-sm">
//             Or continue with
//           </div>
//         </div>

//         {/* Google Sign In Button */}
//         <button
//           type="button"
//           onClick={handleGoogleSignIn}
//           disabled={loading}
//           className="w-full flex items-center justify-center px-4 py-2 mt-4 space-x-2 transition-colors duration-300 border border-gray-300 rounded-md group hover:bg-gray-50 focus:outline-none"
//         >
//           {/* Google Color Icon SVG */}
//           <svg className="w-5 h-5" viewBox="0 0 24 24">
//             <path
//               d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//               fill="#4285F4"
//             />
//             <path
//               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//               fill="#34A853"
//             />
//             <path
//               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//               fill="#FBBC05"
//             />
//             <path
//               d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//               fill="#EA4335"
//             />
//           </svg>
//           <span className="text-sm font-medium text-gray-700 group-hover:text-black">
//             Sign in with Google
//           </span>
//         </button>

//       </div>
//     </div>
//   );
// };

// export default AuthPage;
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
 import {  ArrowLeft } from "lucide-react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import signbackground from "../assets/sign_background.png";
import { EyeIcon, EyeSlashIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import logo from "../assets/logo.png"
const AuthPage = () => {
  const [authMethod, setAuthMethod] = useState('email'); 
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Email States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // General States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    // 1. Clear existing verifier to prevent "Already Rendered" error
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (err) {
        console.warn(err);
      }
      window.recaptchaVerifier = null;
    }

    // 2. Create new Verifier
    // We use 'invisible' to keep UI clean, but you can change to 'normal' if invisible fails often
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible', 
      'callback': (response) => {
        console.log("Recaptcha Verified");
      },
      'expired-callback': () => {
        setError("Recaptcha expired. Please try again.");
        setLoading(false);
      }
    });
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    if (phoneNumber.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }

    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      
      console.log("Sending OTP to:", formattedNumber);
      
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      
      setConfirmationResult(confirmation);
      setShowOtpInput(true); 
      setLoading(false);

    } catch (err) {
      console.error("OTP Error:", err);
      setLoading(false);

      // Reset recaptcha so user can try again immediately
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      if (err.code === 'auth/internal-error') {
        setError("Configuration Error: Please ensure you are using http://127.0.0.1:5173 and your Google Cloud API Key has no restrictions.");
      } else if (err.code === 'auth/invalid-app-credential') {
        setError("Security Block: Use 127.0.0.1 instead of localhost.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many attempts. Wait a while or restart router.");
      } else {
        setError(err.message || "Failed to send OTP.");
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (otp.length !== 6) {
      setError("Enter 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.phoneNumber || "Mobile User",
          email: "",
          phoneNumber: user.phoneNumber,
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
      setError("Invalid OTP or Code Expired.");
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLoginMode) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } catch (err) {
        setError("Invalid Email or Password");
      }
    } else {
      if (!displayName) { setError("Please enter your name."); setLoading(false); return; }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName });
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid, displayName, email, role: 'user', createdAt: new Date(), cart: [], wishlist: [], orders: []
        });
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid, displayName: user.displayName, email: user.email, role: 'user', createdAt: new Date(), cart: [], wishlist: [], orders: []
        });
      }
      navigate('/');
    } catch (err) {
      setError("Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-100 "
      style={{
        backgroundImage: `url(${signbackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-md p-4 space-y-6 bg-white rounded-lg shadow-md relative">

        {/* HEADER */}
       <div className="text-center mt-4 relative">

  {/* Back Arrow */}
  <button 
    onClick={() => navigate("/")}
    className="absolute left-0 top-8 p-2"
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor" 
      className="w-6 h-6 text-gray-700"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  </button>

  {/* Logo */}
  <Link to="/">
    <img 
      src={logo} 
      alt="Logo" 
      className="mx-auto w-28 h-28 rounded-full object-cover "
    />
  </Link>

  {/* Heading */}
  <h2 className="mt-3 text-2xl font-bold text-gray-900">
    {authMethod === 'email'
      ? (isLoginMode ? 'Welcome Back!' : 'Create an Account')
      : 'Mobile Login'}
  </h2>
</div>


        {/* TOGGLE BUTTONS */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => { setAuthMethod('email'); setError(''); }}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
              authMethod === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <EnvelopeIcon className="w-4 h-4 mr-2" /> Email
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('phone'); setError(''); }}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
              authMethod === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <PhoneIcon className="w-4 h-4 mr-2" /> Mobile
          </button>
        </div>

        {/* EMAIL FORM */}
        {authMethod === 'email' && (
          <>
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              {!isLoginMode && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Email address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
              </div>
              <div className="relative">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm pr-10 focus:ring-red-500 focus:border-red-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-10">
                  {showPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-500" /> : <EyeIcon className="w-5 h-5 text-gray-500" />}
                </button>
              </div>
              
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              
              <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
                {loading ? 'Processing...' : (isLoginMode ? 'Log In' : 'Sign Up')}
              </button>
            </form>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button onClick={() => setIsLoginMode(!isLoginMode)} className="font-medium text-red-600 hover:underline">
                {isLoginMode ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </>
        )}

        {/* PHONE FORM */}
        {authMethod === 'phone' && (
          <form className="space-y-6" onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp}>
            
            {/* RECAPTCHA CONTAINER */}
            <div id="recaptcha-container"></div>

            {!showOtpInput ? (
              <div>
                <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10 digit number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-700">Enter OTP</label>
                <input
                  type="text"
                  required
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-center tracking-widest text-lg"
                  maxLength={6}
                />
                <button 
                  type="button" 
                  onClick={() => { setShowOtpInput(false); setOtp(''); }} 
                  className="text-xs text-red-600 mt-2 hover:underline"
                >
                  Change Phone Number
                </button>
              </div>
            )}

            {error && <p className="text-sm text-red-600 text-center font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading 
                ? 'Processing...' 
                : (showOtpInput ? 'Verify OTP' : 'Send OTP')}
            </button>
          </form>
        )}

        {/* GOOGLE AUTH */}
        <div className="relative flex items-center justify-center w-full mt-6 border-t border-gray-300">
          <div className="absolute px-3 bg-white text-gray-500 text-sm">Or continue with</div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 mt-4 space-x-2 transition-colors duration-300 border border-gray-300 rounded-md group hover:bg-gray-50 focus:outline-none"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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