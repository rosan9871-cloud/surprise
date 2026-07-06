// ---------- Elements ----------
const landingScreen = document.getElementById('landing-screen');
const loadingScreen = document.getElementById('loading-screen');
const jumpscareScreen = document.getElementById('jumpscare-screen');
const endScreen = document.getElementById('end-screen');

const revealBtn = document.getElementById('reveal-btn');
const replayBtn = document.getElementById('replay-btn');

const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');

const flash = document.getElementById('flash');
const screamAudio = document.getElementById('scream-audio');

// ---------- Particles ----------
function createParticles() {
  const container = document.getElementById('particles');
  container.innerHTML = '';
  const count = window.innerWidth < 600 ? 25 : 45;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');

    const size = Math.random() * 4 + 2;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;

    const duration = Math.random() * 10 + 8;
    p.style.animationDuration = `${duration}s`;
    p.style.animationDelay = `${Math.random() * duration}s`;

    container.appendChild(p);
  }
}
createParticles();
window.addEventListener('resize', createParticles);

// ---------- Fullscreen helper ----------
function requestFullscreen() {
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (req) {
    req.call(el).catch(() => {
      // Fullscreen may be blocked without a direct user gesture context; ignore silently.
    });
  }
}

function exitFullscreen() {
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
  if (exit && (document.fullscreenElement || document.webkitFullscreenElement)) {
    exit.call(document).catch(() => {});
  }
}

// ---------- Flow control ----------
function showScreen(screen) {
  [landingScreen, loadingScreen, jumpscareScreen, endScreen].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

revealBtn.addEventListener('click', () => {
  requestFullscreen();
  startLoading();
});

replayBtn.addEventListener('click', () => {
  exitFullscreen();
  resetPrank();
});

function startLoading() {
  showScreen(loadingScreen);
  progressBar.style.width = '0%';
  progressPercent.textContent = '0%';

  const duration = 2500; // ms
  const stepTime = 30;
  const steps = duration / stepTime;
  let current = 0;

  const interval = setInterval(() => {
    current++;
    // Ease toward 100 with a bit of randomness for a natural feel
    const pct = Math.min(100, Math.round((current / steps) * 100));
    progressBar.style.width = `${pct}%`;
    progressPercent.textContent = `${pct}%`;

    if (current >= steps || pct >= 100) {
      clearInterval(interval);
      progressBar.style.width = '100%';
      progressPercent.textContent = '100%';
      setTimeout(triggerJumpscare, 150);
    }
  }, stepTime);
}

function triggerJumpscare() {
  document.body.style.overflow = 'hidden';
  showScreen(jumpscareScreen);
  jumpscareScreen.classList.add('shake');

  // Flash red
  flash.classList.remove('active');
  void flash.offsetWidth; // restart animation
  flash.classList.add('active');

  // Play scream sound at max volume if available
  screamAudio.volume = 1.0;
  screamAudio.currentTime = 0;
  const playPromise = screamAudio.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // File may not exist or autoplay blocked; fail silently.
    });
  }

  // Stop shaking after ~2 seconds
  setTimeout(() => {
    jumpscareScreen.classList.remove('shake');
  }, 2000);

  // Move to end screen after ~3 seconds
  setTimeout(() => {
    showScreen(endScreen);
    document.body.style.overflow = 'hidden';
  }, 3000);
}

function resetPrank() {
  screamAudio.pause();
  screamAudio.currentTime = 0;
  jumpscareScreen.classList.remove('shake');
  flash.classList.remove('active');
  progressBar.style.width = '0%';
  progressPercent.textContent = '0%';
  showScreen(landingScreen);
}