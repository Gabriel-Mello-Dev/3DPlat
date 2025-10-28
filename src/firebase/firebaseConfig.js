// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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