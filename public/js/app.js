/**
 * WishCraft AI — Core Frontend Utilities & Ambient Visual Effects
 */

// Global Toast Notification Helper
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const colors = {
    success: 'bg-emerald-600 text-white border-emerald-400',
    error: 'bg-rose-600 text-white border-rose-400',
    info: 'bg-slate-800 text-white border-slate-600'
  };

  const icons = {
    success: '🎉',
    error: '⚠️',
    info: '✨'
  };

  toast.className = `${colors[type] || colors.info} border px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto`;
  toast.innerHTML = `
    <span class="text-lg">${icons[type] || '✨'}</span>
    <span class="flex-1">${message}</span>
    <button class="text-xs opacity-70 hover:opacity-100 ml-2 font-bold" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// User Authentication State Manager (Local + Supabase ready)
const AuthManager = {
  getUser() {
    try {
      const stored = localStorage.getItem('wishcraft_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('wishcraft_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wishcraft_user');
    }
    this.updateNavUI();
  },

  logout() {
    localStorage.removeItem('wishcraft_user');
    showToast('Logged out successfully', 'info');
    this.updateNavUI();
    if (window.location.pathname.includes('/dashboard')) {
      window.location.href = '/';
    }
  },

  isLoggedIn() {
    return Boolean(this.getUser());
  },

  updateNavUI() {
    const user = this.getUser();
    const authContainer = document.getElementById('navAuthSection');
    if (!authContainer) return;

    if (user) {
      authContainer.innerHTML = `
        <a href="/dashboard" class="text-sm font-medium hover:text-pink-400 transition flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-xs font-bold">${(user.name || user.email || 'U')[0].toUpperCase()}</span>
          <span>${user.name || user.email.split('@')[0]}</span>
        </a>
        <button onclick="AuthManager.logout()" class="text-xs text-gray-400 hover:text-white transition">Sign Out</button>
      `;
    } else {
      authContainer.innerHTML = `
        <a href="/create" class="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl hover:opacity-90 shadow-md transition">Create Wish</a>
      `;
    }
  }
};

// Ambient Canvas Particle Engine (Floating hearts, balloons, stars, confetti)
class AmbientParticles {
  constructor(canvasId = 'ambientCanvas', effectType = 'hearts') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.effectType = effectType;
    this.animationFrame = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initParticles();
    this.animate();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    const count = window.innerWidth < 768 ? 25 : 55;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height + this.canvas.height,
        size: Math.random() * 14 + 10,
        speedY: Math.random() * 1.5 + 0.8,
        speedX: (Math.random() - 0.5) * 1.2,
        opacity: Math.random() * 0.7 + 0.3,
        color: this.getRandomColor(),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2
      });
    }
  }

  getRandomColor() {
    if (this.effectType === 'hearts' || this.effectType === 'romantic') {
      const colors = ['#f43f5e', '#ec4899', '#fb7185', '#fda4af', '#e11d48'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    if (this.effectType === 'balloons' || this.effectType === 'birthday') {
      const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
    // stars / luxury
    const colors = ['#fbbf24', '#f59e0b', '#fde047', '#e0e7ff', '#c084fc'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  drawHeart(x, y, size, color, opacity) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    const topCurveHeight = size * 0.3;
    this.ctx.moveTo(x, y + topCurveHeight);
    this.ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    this.ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
    this.ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    this.ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  drawBalloon(x, y, size, color, opacity) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, size * 0.7, size, 0, 0, Math.PI * 2);
    this.ctx.fill();
    // String
    this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + size);
    this.ctx.quadraticCurveTo(x + 5, y + size + 15, x, y + size + 30);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawStar(x, y, size, color, opacity) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      this.ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * size + x, -Math.sin((18 + i * 72) * Math.PI / 180) * size + y);
      this.ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (size / 2) + x, -Math.sin((54 + i * 72) * Math.PI / 180) * (size / 2) + y);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  animate() {
    if (!this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      p.y -= p.speedY;
      p.x += Math.sin(p.y * 0.02) * p.speedX;

      if (this.effectType === 'hearts' || this.effectType === 'romantic') {
        this.drawHeart(p.x, p.y, p.size, p.color, p.opacity);
      } else if (this.effectType === 'balloons' || this.effectType === 'birthday') {
        this.drawBalloon(p.x, p.y, p.size, p.color, p.opacity);
      } else {
        this.drawStar(p.x, p.y, p.size * 0.6, p.color, p.opacity);
      }

      // Reset when floating off top
      if (p.y < -50) {
        p.y = this.canvas.height + 40;
        p.x = Math.random() * this.canvas.width;
      }
    });

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

// Confetti burst helper (built-in 2D canvas explosion)
function fireConfettiBurst(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
  let canvas = document.getElementById('confettiBurstCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confettiBurstCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999';
    document.body.appendChild(canvas);
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const pieces = [];
  const colors = ['#f43f5e', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#eab308'];

  for (let i = 0; i < 120; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 6;
    pieces.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20
    });
  }

  let frames = 0;
  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frames++;

    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // drag
      p.opacity -= 0.012;
      p.rotation += p.rotationSpeed;

      if (p.opacity > 0) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (frames < 90) {
      requestAnimationFrame(step);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  step();
}

window.showToast = showToast;
window.AuthManager = AuthManager;
window.AmbientParticles = AmbientParticles;
window.fireConfettiBurst = fireConfettiBurst;

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  AuthManager.updateNavUI();
});
