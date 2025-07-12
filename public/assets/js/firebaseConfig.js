// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9T_Ai-SNZaoP7WSC3eIBHgMJHfnw5J_E",
  authDomain: "itsupportswp.firebaseapp.com",
  projectId: "itsupportswp",
  storageBucket: "itsupportswp.firebasestorage.app",
  messagingSenderId: "782971532",
  appId: "1:782971532:web:e394f211af0abe597b01a9",
  measurementId: "G-1D3N4KQ7J1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);