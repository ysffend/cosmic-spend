// Daftarin service worker biar browser mau nawarin "Install app".
// Dicek dulu browser-nya support (Safari lama/browser jadul mungkin nggak).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => console.error("Gagal daftarin service worker:", err));
  });
}
