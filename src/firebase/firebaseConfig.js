// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBEpsN3zgOxBE5mEfhaYd5raoKUIVjgEeU",
  authDomain: "dplataforma.firebaseapp.com",
  projectId: "dplataforma",
  storageBucket: "dplataforma.firebasestorage.app",
  messagingSenderId: "82207618129",
  appId: "1:82207618129:web:6cb1e5fa7feb71bcaf3470",
  measurementId: "G-FPK7D1TTYW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export const db = getFirestore(app);
const storage = getStorage(app);