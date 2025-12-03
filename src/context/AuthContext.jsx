import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from 'firebase/auth';
import { auth } from '../../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing auth listener...');

    // ✅ Ensure user stays logged in across refreshes
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            console.log('AuthProvider: User logged in:', firebaseUser.uid);
          } else {
            console.log('AuthProvider: No user logged in');
          }
          setUser(firebaseUser);
          setLoading(false);
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error('AuthProvider: Persistence error:', error);
        setLoading(false);
      });
  }, []);

  // ✅ Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      console.log('AuthProvider: User logged out');
    } catch (error) {
      console.error('AuthProvider: Logout error:', error);
      throw error; // so UI can catch & handle
    }
  };

  const value = {
    user,
    isLoggedIn: !!user,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* ⏳ Don’t render children until loading is finished */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
