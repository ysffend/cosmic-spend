// =========================================================
// COSMIC SPEND — Service Worker
// Tugasnya cuma 2: (1) nyimpen file-file penting ke cache
// device pas pertama kali di-install, (2) nyuruh browser
// nampilin file dari cache dulu (lebih cepet), baru minta
// versi baru ke server di background.
//
// Naikin CACHE_NAME tiap kali file di app diubah/di-deploy,
// biar browser tau harus buang cache lama & simpen yang baru.
// =========================================================

const CACHE_NAME = "cosmic-spend-v1";

const APP_SHELL = [
  "login.html",
  "register.html",
  "expense tracker.html",
  "index.html",
  "expense tracker.css",
  "auth.css",
  "expense tracker.js",
  "login.js",
  "register.js",
  "authguard.js",
  "firebase-config.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
];

// INSTALL: browser lagi masang service worker ini pertama kali.
// Kita download & simpen semua file "app shell" di atas ke cache.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting(); // langsung aktif, nggak nunggu tab lama ketutup
});

// ACTIVATE: bersih-bersih cache versi lama (kalau CACHE_NAME berubah).
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// FETCH: tiap kali app minta file (HTML/CSS/JS/gambar), strategi kita
// "cache first, fallback ke network" — cepet & tetep bisa jalan offline.
// Firestore & Firebase Auth (request ke domain lain) TIDAK kena cache
// ini, jadi data tetap realtime seperti biasa selama online.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Cuma cache-in request yang ke domain sendiri (app shell).
  // Request ke Firebase/Firestore/Google biar langsung ke network.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {
        // Offline & file nggak ada di cache -> nggak ada fallback khusus.
        // (Opsional: bisa ditambahin halaman "offline.html" nanti.)
      });
    }),
  );
});
