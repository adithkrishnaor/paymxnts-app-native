import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: "paymxnts-cc793",
  storageBucket: "paymxnts-cc793.firebasestorage.app",
  messagingSenderId: "869881641017",
  appId: "1:869881641017:web:1a9d54c8387fab9cad35e8",
  measurementId: "G-LDWTEVHPLX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
