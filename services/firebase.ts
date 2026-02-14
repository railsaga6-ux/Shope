
// Use modular imports for Firebase v9+
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

/**
 * Firebase Configuration
 * These values are typically managed via environment variables 
 * (e.g., process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
 */
const firebaseConfig = {
  apiKey: "AIzaSy_MOCK_API_KEY", // Placeholder for actual API key
  authDomain: "pointshop-elite.firebaseapp.com",
  projectId: "pointshop-elite",
  storageBucket: "pointshop-elite.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize and export core services for use throughout the app
// This prevents multiple initializations of the same service and resolves "no exported member" errors.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
