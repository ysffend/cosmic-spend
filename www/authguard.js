import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Kalau belum login, tendang balik ke halaman login
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  const emailLabel = document.getElementById("userEmailLabel");
  if (emailLabel) emailLabel.textContent = user.email;

  // Kasih tau expense_tracker.js siapa yang lagi login,
  // supaya data transaksi/budget/saldo bisa di-load khusus akun ini
  // (bukan data global yang ketuker antar akun).
  window.cosmicSpendUid = user.uid;
  window.dispatchEvent(
    new CustomEvent("cosmicspend:userReady", { detail: { uid: user.uid } }),
  );
});

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "login.html";
      });
    });
  }
});
