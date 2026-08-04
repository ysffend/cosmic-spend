// ---------- Starfield background (decorative canvas) ----------
// Sama persis dengan yang ada di expense tracker.js, di-extract
// biar bisa dipakai ulang di halaman login & register.
function setupStarfield() {
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.floor((canvas.width * canvas.height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() > 0.85 ? "139,124,246" : "45,226,230",
    }));
  }

  let frame = 0;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s) => {
      const twinkle = prefersReducedMotion
        ? 0.7
        : 0.4 + 0.4 * Math.sin(frame * s.twinkleSpeed + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.hue},${twinkle})`;
      ctx.fill();
    });
    frame++;
    if (!prefersReducedMotion) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
}

setupStarfield();
