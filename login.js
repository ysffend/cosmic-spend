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
  RecaptchaVerifier,
  signInWithPhoneNumber,
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

// =========================================================
// LOGIN VIA NOMOR HP (Phone Auth + OTP SMS)
//
// Alurnya beda sama Google (yang cuma 1 klik langsung selesai):
//   1. User isi nomor HP → klik "Kirim kode OTP"
//   2. Firebase kirim SMS via signInWithPhoneNumber()
//   3. Firebase butuh reCAPTCHA dulu sebelum kirim SMS,
//      supaya orang iseng nggak bisa spam-request OTP ke nomor
//      siapapun (itu kenapa ada RecaptchaVerifier di bawah)
//   4. User masukin kode OTP dari SMS → klik "Verifikasi & Masuk"
//   5. confirmationResult.confirm(kode) itu yang beneran nge-login-in
// =========================================================

const phoneLoginToggle = document.getElementById("phoneLoginToggle");
const phoneLoginBox = document.getElementById("phoneLoginBox");
const phoneNumberInput = document.getElementById("phoneNumber");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpBox = document.getElementById("otpBox");
const otpCodeInput = document.getElementById("otpCode");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

// Nyimpen "tiket" hasil kirim OTP; dipake lagi pas verifikasi kode.
let confirmationResult = null;
// reCAPTCHA cuma boleh dibikin sekali per halaman, makanya di-cache di sini.
let recaptchaVerifier = null;

phoneLoginToggle.addEventListener("click", () => {
  phoneLoginBox.classList.toggle("hidden");
});

function getRecaptchaVerifier() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }
  return recaptchaVerifier;
}

// User biasanya ngetik "0812xxxx", tapi Firebase butuh format
// internasional "+62812xxxx". Fungsi ini yang nerjemahin.
function toInternationalFormat(rawInput) {
  const digitsOnly = rawInput.replace(/\D/g, ""); // buang spasi, strip, dll
  if (digitsOnly.startsWith("62")) return `+${digitsOnly}`;
  if (digitsOnly.startsWith("0")) return `+62${digitsOnly.slice(1)}`;
  return `+${digitsOnly}`;
}

sendOtpBtn.addEventListener("click", async () => {
  hideError();
  const rawPhone = phoneNumberInput.value.trim();
  if (!rawPhone) {
    showError("Isi nomor HP dulu.");
    return;
  }

  const phoneNumber = toInternationalFormat(rawPhone);
  sendOtpBtn.disabled = true;
  sendOtpBtn.textContent = "Mengirim...";

  try {
    const verifier = getRecaptchaVerifier();
    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      verifier,
    );
    otpBox.classList.remove("hidden");
    successText.textContent = "Kode OTP terkirim. Cek SMS kamu.";
    successBox.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    showError("Gagal kirim OTP. Pastikan nomor HP benar, lalu coba lagi.");
  } finally {
    sendOtpBtn.disabled = false;
    sendOtpBtn.textContent = "Kirim kode OTP";
  }
});

verifyOtpBtn.addEventListener("click", async () => {
  hideError();
  const code = otpCodeInput.value.trim();
  if (!code || !confirmationResult) {
    showError("Masukkan kode OTP yang dikirim ke SMS kamu.");
    return;
  }

  verifyOtpBtn.disabled = true;
  verifyOtpBtn.textContent = "Memverifikasi...";

  try {
    await confirmationResult.confirm(code);
    window.location.href = "expense tracker.html";
  } catch (err) {
    console.error(err);
    showError("Kode OTP salah atau sudah kadaluarsa. Coba kirim ulang.");
  } finally {
    verifyOtpBtn.disabled = false;
    verifyOtpBtn.textContent = "Verifikasi & Masuk";
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
