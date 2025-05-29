import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: "paymxnts-cc793",
  storageBucket: "paymxnts-cc793.firebasestorage.app",
  messagingSenderId: "869881641017",
  appId: "1:869881641017:web:1a9d54c8387fab9cad35e8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
