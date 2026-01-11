import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Replace with your Firebase project config object
// You can find this in the Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyA_Tg7-tiaurV2fw3wmJg7j7eQ1L8rhh3Q",
  authDomain: "portfolio-ritik-1.firebaseapp.com",
  projectId: "portfolio-ritik-1",
  storageBucket: "portfolio-ritik-1.firebasestorage.app",
  messagingSenderId: "61143114752",
  appId: "1:61143114752:web:d92f6e6424e2b6c28a64e5",
  measurementId: "G-NNJN6TE4JR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
