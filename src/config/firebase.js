import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Expose Auth to window for browser console testing (DEV ONLY)
if (import.meta.env.DEV) {
  window.auth = auth;
  
  // Log the Firebase ID Token automatically on auth state change (DEV ONLY)
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        console.log("🔥 Firebase ID Token:", token);
      } catch (error) {
        console.error("Error getting Firebase ID Token:", error.message);
      }
    } else {
      console.log("No user logged in to Firebase");
    }
  });
}

/**
 * Utility function to get the current Firebase ID token.
 * Useful for making authenticated requests to the backend.
 */
export const getFirebaseToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};

export default app;

