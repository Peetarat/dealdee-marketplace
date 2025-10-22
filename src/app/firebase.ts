// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjg9UVVYqoYkZlwyU6Q2miDWK-uan-RfM",
  authDomain: "dealdee-bf882.firebaseapp.com",
  projectId: "dealdee-bf882",
  storageBucket: "dealdee-bf882.appspot.com",
  messagingSenderId: "851678554325",
  appId: "1:851678554325:web:ab03549c1f1a3717025a5c"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
let messaging;
if (typeof window !== 'undefined') {
    try {
        messaging = getMessaging(app);
    } catch (err) {
        console.error("Failed to initialize messaging:", err);
    }
}
export { messaging };
