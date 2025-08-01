import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDeFct37pfg7lpWtbgRA3yhvZfiIvlHHro",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: "paymxnts-17b10",
  storageBucket: "paymxnts-17b10.firebasestorage.app",
  messagingSenderId: "389385329696",
  appId: "1:389385329696:web:9d20f95b4b0eb24eb0b045",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
