// =========================================================
// FIREBASE CONFIG — Cosmic Spend
// Ambil dari: Firebase Console → Project Settings →
//             General → "Your apps" → SDK setup and configuration
// =========================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "ISI_API_KEY_KAMU",
  authDomain: "ISI_PROJECT_ID.firebaseapp.com",
  projectId: "ISI_PROJECT_ID",
  storageBucket: "ISI_PROJECT_ID.appspot.com",
  messagingSenderId: "ISI_SENDER_ID",
  appId: "ISI_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
