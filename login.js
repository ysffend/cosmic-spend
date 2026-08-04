import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Kalau ternyata sudah login, langsung lempar ke dashboard
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "expense tracker.html";
});

const form = document.getElementById("loginForm");
const errorBox = document.getElementById("authError");
const errorText = document.getElementById("authErrorText");
const successBox = document.getElementById("authSuccess");
const successText = document.getElementById("authSuccessText");
const loginBtn = document.getElementById("loginBtn");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const googleBtn = document.getElementById("googleLoginBtn");
const forgotLink = document.getElementById("forgotPasswordLink");
const rememberMe = document.getElementById("rememberMe");

// Kalau baru aja selesai daftar (register.js redirect ke sini), kasih tau usernya
const params = new URLSearchParams(window.location.search);
if (params.get("registered") === "1") {
  successText.textContent = "Akun berhasil dibuat! Silakan masuk.";
  successBox.classList.remove("hidden");
}

function showError(message) {
  successBox.classList.add("hidden");
  errorText.textContent = message;
  errorBox.classList.remove("hidden");
}
function hideError() {
  errorBox.classList.add("hidden");
}
function setLoading(loading) {
  loginBtn.disabled = loading;
  loginBtn.textContent = loading ? "Memproses..." : "Masuk";
}

// Terjemahin error code Firebase jadi pesan yang enak dibaca
function friendlyError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email atau password salah.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
    default:
      return "Gagal masuk. Silakan coba lagi.";
  }
}

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();
  setLoading(true);

  const email = document.getElementById("email").value.trim();
  const password = passwordInput.value;

  try {
    // "Ingat saya" dicentang -> tetap login walau browser ditutup
    // Nggak dicentang -> logout otomatis pas tab/browser ditutup
    await setPersistence(
      auth,
      rememberMe.checked ? browserLocalPersistence : browserSessionPersistence,
    );
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "expense tracker.html";
  } catch (err) {
    showError(friendlyError(err.code));
  } finally {
    setLoading(false);
  }
});

googleBtn.addEventListener("click", async () => {
  hideError();
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    window.location.href = "expense tracker.html";
  } catch (err) {
    showError("Gagal masuk dengan Google. Coba lagi.");
  }
});

forgotLink.addEventListener("click", async (e) => {
  e.preventDefault();
  hideError();
  const email = document.getElementById("email").value.trim();
  if (!email) {
    showError("Isi email dulu, baru klik 'Lupa password?'.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Link reset password sudah dikirim ke " + email);
  } catch (err) {
    showError("Gagal kirim email reset. Pastikan email sudah terdaftar.");
  }
});
