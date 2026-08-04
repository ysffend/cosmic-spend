import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Kalau ternyata sudah login, langsung lempar ke dashboard
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "expense tracker.html";
});

const form = document.getElementById("registerForm");
const errorBox = document.getElementById("authError");
const errorText = document.getElementById("authErrorText");
const registerBtn = document.getElementById("registerBtn");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const googleBtn = document.getElementById("googleLoginBtn");

function showError(message) {
  errorText.textContent = message;
  errorBox.classList.remove("hidden");
}
function hideError() {
  errorBox.classList.add("hidden");
}
function setLoading(loading) {
  registerBtn.disabled = loading;
  registerBtn.textContent = loading ? "Memproses..." : "Daftar";
}

function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "Email sudah terdaftar. Coba masuk saja.";
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/weak-password":
      return "Password minimal 6 karakter.";
    default:
      return "Gagal daftar. Silakan coba lagi.";
  }
}

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const email = document.getElementById("email").value.trim();
  const password = passwordInput.value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    showError("Konfirmasi password tidak cocok.");
    return;
  }

  setLoading(true);
  try {
    await createUserWithEmailAndPassword(auth, email, password);
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
    showError("Gagal daftar dengan Google. Coba lagi.");
  }
});
