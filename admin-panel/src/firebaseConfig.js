// Import the functions you need from the SDKs you need
  import { initializeApp } from "firebase/app";
  import { getAuth } from "firebase/auth";
  import { getFunctions } from "firebase/functions";

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDlV3pHMVFYp3YmUMDqwN-WYf_iKDX1fsw",
    authDomain: "studio-4973053271-10a9d.firebaseapp.com",
    projectId: "studio-4973053271-10a9d",
    storageBucket: "studio-4973053271-10a9d.appspot.com",
    messagingSenderId: "100382390299",
    appId: "1:100382390299:web:cfd2ffd457b8a0175f60be"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize and export Firebase services
  export const auth = getAuth(app);
  export const functions = getFunctions(app);