// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app"; // Import getApps and getApp
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration - READ FROM ENVIRONMENT VARIABLES
const firebaseConfig = {
  // Use process.env to read from .env.local
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId is optional, add if you use Analytics
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// --- Initialize Firebase ---
// Prevent initializing multiple times (important for Next.js hot reloading)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); // Changed from firestore to db to match usage in profile page
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Initialize Messaging only on the client-side
let messagingInstance = null; // Use a different variable name
if (typeof window !== 'undefined') {
    try {
        messagingInstance = getMessaging(app);
    } catch (err) {
        console.error("Failed to initialize Firebase Messaging:", err);
    }
}
export const messaging = messagingInstance; // Export the instance (can be null)

// --- ADDED THIS ---
// Export firestore instance with the name used in profile page for consistency
export const firestore = db;