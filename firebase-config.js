// =========================================================
// FIREBASE CONFIG — Cosmic Spend
// Ambil dari: Firebase Console → Project Settings →
//             General → "Your apps" → SDK setup and configuration
// =========================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBiqjo3_1ulCSHWSWULacxyjNz3IABYsiY",
  authDomain: "cosmic-spend.firebaseapp.com",
  projectId: "cosmic-spend",
  storageBucket: "cosmic-spend.firebasestorage.app",
  messagingSenderId: "172683386482",
  appId: "1:172683386482:web:837bdf17d7eb0eb67aaceb",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
