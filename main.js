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

// The homepage stays buildless: Remotion is only used to author the MP4.
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  const source = heroVideo.querySelector('source');
  let mediaFailed = false;
  heroVideo.muted = true;
  const heroBounds = heroVideo.closest('.hero').getBoundingClientRect();
  let heroInView = heroBounds.bottom > 0 && heroBounds.top < window.innerHeight;

  const shouldPlay = () => !mediaFailed && heroInView && !document.hidden;

  function stopInteractionRetry() {
    window.removeEventListener('pointerdown', syncBackground);
    window.removeEventListener('keydown', syncBackground);
  }

  function syncBackground() {
    if (!shouldPlay()) {
      heroVideo.pause();
      return;
    }
    const attempt = heroVideo.play();
    attempt?.then(() => {
      // Visibility or preferences can change while play() is pending.
      if (!shouldPlay()) heroVideo.pause();
      else {
        heroVideo.classList.add('is-ready');
        stopInteractionRetry();
      }
    }).catch((error) => {
      // If the browser blocks autoplay, retry on the first normal interaction.
      if (error.name === 'NotAllowedError') {
        window.addEventListener('pointerdown', syncBackground, { passive: true });
        window.addEventListener('keydown', syncBackground);
      }
    });
  }

  heroVideo.addEventListener('playing', () => {
    if (!shouldPlay()) {
      heroVideo.pause();
      return;
    }
    heroVideo.classList.add('is-ready');
    stopInteractionRetry();
  });
  function usePoster() {
    mediaFailed = true;
    heroVideo.pause();
    heroVideo.classList.remove('is-ready');
    stopInteractionRetry();
  }
  heroVideo.addEventListener('error', usePoster);
  source.addEventListener('error', usePoster);
  document.addEventListener('visibilitychange', syncBackground);
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting;
      syncBackground();
    });
    heroObserver.observe(heroVideo.closest('.hero'));
  }
  syncBackground();
}

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
