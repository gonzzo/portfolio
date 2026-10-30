const year = document.getElementById('y');
if (year) year.textContent = new Date().getFullYear();

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = document.querySelectorAll('[data-reveal]');
let revealObserver;

function revealAll() {
  revealObserver?.disconnect();
  revealElements.forEach((element) => {
    element.classList.remove('reveal-pending');
    element.classList.add('is-visible');
  });
}

if (!motionPreference.matches && 'IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      entry.target.classList.remove('reveal-pending');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  revealElements.forEach((element) => {
    // Keep content above a restored scroll position visible on reload.
    if (element.getBoundingClientRect().bottom < 0) return;
    element.classList.add('reveal-pending');
    revealObserver.observe(element);
  });
}
motionPreference.addEventListener('change', revealAll);

const progress = document.querySelector('.reading-progress');
let scrollFramePending = false;
function updateProgress() {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const fraction = scrollRange > 0 ? window.scrollY / scrollRange : 0;
  if (progress) progress.style.transform = `scaleX(${Math.max(0, Math.min(1, fraction))})`;
  scrollFramePending = false;
}
function scheduleProgress() {
  if (scrollFramePending) return;
  scrollFramePending = true;
  window.requestAnimationFrame(updateProgress);
}
window.addEventListener('scroll', scheduleProgress, { passive: true });
window.addEventListener('resize', scheduleProgress);
window.addEventListener('load', scheduleProgress);
updateProgress();
