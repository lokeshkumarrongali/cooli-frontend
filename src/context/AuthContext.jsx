import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "../config/firebase";
import api from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  // Restore session on mount
  useEffect(() => {
    let isMounted = true;
    
    if (!auth) {
      setError("Authentication failed to initialize. Please check configuration.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      if (isMounted) {
        setFirebaseUser(fUser);
        if (fUser) {
          try {
            await syncWithBackend(fUser);
          } catch (err) {
            console.error("Auto-sync failed:", err.message);
          }
        }
        setLoading(false);
      }
    }, (err) => {
      if (isMounted) {
        setError(err.message);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  /**
   * Synchronize Firebase user session with backend database
   */
  const syncWithBackend = async (fUser) => {
    try {
      console.log("Synchronizing user with backend...");
      const token = await fUser.getIdToken();
      
      const response = await api.post("/auth/login", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data?.data) {
        throw new Error("Invalid backend response. Please try again later.");
      }

      const backendUser = response.data.data.user;
      console.log("Backend sync successful:", backendUser);
      setUser(backendUser);
      setError(null);
      return backendUser;
    } catch (err) {
      console.error("Backend sync failed:", err.response?.status, err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.message || "Failed to synchronize session";
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      throw new Error(errorMsg);
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await syncWithBackend(userCredential.user);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await syncWithBackend(userCredential.user);
      
      try {
        await sendEmailVerification(userCredential.user);
      } catch (vErr) {
        // Log verification failure but don't block registration
        console.warn("Verification email triggered failed:", vErr.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await syncWithBackend(userCredential.user);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const triggerEmailVerification = async () => {
    try {
      if (!auth.currentUser) throw new Error("Please log in to verify your email.");
      setLoading(true);
      setError(null);
      await sendEmailVerification(auth.currentUser);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    isAuthenticated,
    error,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    sendPasswordReset,
    triggerEmailVerification,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
