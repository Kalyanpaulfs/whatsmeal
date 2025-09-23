// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtERI3htXHPEircAPwGs52giTdn3j0cys",
  authDomain: "food-order-restaurant-3da72.firebaseapp.com",
  projectId: "food-order-restaurant-3da72",
  storageBucket: "food-order-restaurant-3da72.firebasestorage.app",
  messagingSenderId: "732278276059",
  appId: "1:732278276059:web:1d537f6cd1263f3c8871fe",
  measurementId: "G-JXCHCLQN9D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
