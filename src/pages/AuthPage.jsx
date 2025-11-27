import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const AuthPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLoginMode) {
      // Login Logic
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/'); // Redirect to home on successful login
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Signup Logic
      if (!displayName) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update Firebase Auth profile
        await updateProfile(user, { displayName });

        // Create user document in Firestore
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
        navigate('/'); // Redirect to home on successful signup
      } catch (err) {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
            <Link to="/">
                <div className="mx-auto w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Y</span>
                </div>
            </Link>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">{isLoginMode ? 'Welcome Back!' : 'Create an Account'}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="font-medium text-red-600 hover:underline">
              {isLoginMode ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div>
              <label htmlFor="displayName" className="text-sm font-medium text-gray-700">Full Name</label>
              <input id="displayName" name="displayName" type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-medium text-gray-700">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
              {loading ? 'Processing...' : (isLoginMode ? 'Log In' : 'Sign Up')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;