// Year in footer
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.getElementById('mainNav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
}

// Scroll progress bar
const scrollBar = document.querySelector('.scroll-progress');
if (scrollBar) {
  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    scrollBar.style.width = `${scrolled * 100}%`;
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Count up stats
function animateCount(el) {
  const target = parseFloat(el.getAttribute('data-target'));
  const isPercent = el.textContent.includes('%');
  let start = 0;
  const duration = 1200;
  const startTs = performance.now();
  const step = (ts) => {
    const p = Math.min(1, (ts - startTs) / duration);
    const val = start + (target - start) * p;
    el.textContent = (isPercent ? val.toFixed(1) : Math.round(val)).toString();
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

document.querySelectorAll('.stat-num').forEach(el => animateCount(el));

// Starfield background (lightweight)
(function starfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, stars;
  const STAR_COUNT = 180;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.7 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
    }));
  }
  window.addEventListener('resize', resize);
  resize();
  function tick() {
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      s.x += s.vx; s.y += s.vy;
      if (s.x < -5) s.x = width + 5; if (s.x > width + 5) s.x = -5;
      if (s.y < -5) s.y = height + 5; if (s.y > height + 5) s.y = -5;
      const size = s.z * 1.6;
      ctx.fillStyle = `rgba(${120 + s.z*80}, ${170 + s.z*60}, 255, ${0.35 + s.z*0.4})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  tick();
})();