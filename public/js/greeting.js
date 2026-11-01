/**
 * WishCraft AI — Interactive Greeting Experience Controller
 * Powers dynamic occasions, cake candle blow-out, love letter unfold, and audio playback.
 */

const GreetingPage = {
  wish: null,
  slug: '',
  candlesBlown: false,
  envelopeOpened: false,

  async init() {
    this.extractSlug();
    if (!this.slug) {
      this.renderNotFound('No greeting specified');
      return;
    }

    await this.loadWishData();
    if (this.wish) {
      this.renderPage();
      this.initAmbientEffects();
      this.setupAudioPlayer();
    }
  },

  extractSlug() {
    // Check path /wish/:slug or query param ?id=... / ?slug=...
    const pathParts = window.location.pathname.split('/');
    const wishIndex = pathParts.indexOf('wish');
    if (wishIndex !== -1 && pathParts[wishIndex + 1]) {
      this.slug = decodeURIComponent(pathParts[wishIndex + 1]);
    } else {
      const params = new URLSearchParams(window.location.search);
      this.slug = params.get('id') || params.get('slug') || '';
    }
  },

  async loadWishData() {
    const loadingEl = document.getElementById('greetingLoading');
    try {
      const res = await fetch(`/api/wishes/${encodeURIComponent(this.slug)}`);
      const data = await res.json();

      if (!res.ok || !data.wish) {
        throw new Error(data.message || 'Greeting not found');
      }

      this.wish = data.wish;
      this.candlesBlown = Boolean(this.wish.candles_blown);
    } catch (err) {
      console.error('Failed to load greeting:', err);
      this.renderNotFound(err.message);
    } finally {
      if (loadingEl) loadingEl.style.display = 'none';
    }
  },

  renderNotFound(msg) {
    const mainEl = document.getElementById('greetingMainContent');
    if (mainEl) {
      mainEl.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-6 text-center">
          <div class="glass-card max-w-md p-8 rounded-2xl">
            <div class="text-6xl mb-4">✨🎁</div>
            <h1 class="text-2xl font-bold mb-2">Greeting Not Found</h1>
            <p class="text-gray-400 mb-6">${msg || 'The celebration page you are looking for does not exist or has expired.'}</p>
            <a href="/create" class="btn-gradient px-6 py-3 rounded-xl font-bold inline-block text-white">Create a New Wish</a>
          </div>
        </div>
      `;
    }
  },

  renderPage() {
    const wish = this.wish;
    const occ = (wish.occasion || 'birthday').toLowerCase();

    // Set page title
    document.title = `✨ For ${wish.recipient_name} — Happy ${wish.occasion}! | WishCraft AI`;

    // Populate recipient and sender details
    const recNameEl = document.getElementById('recipientHeaderName');
    const senderNameEl = document.getElementById('senderHeaderName');
    const badgeEl = document.getElementById('occasionHeaderBadge');

    if (recNameEl) recNameEl.innerText = wish.recipient_name;
    if (senderNameEl) senderNameEl.innerText = `With love from ${wish.sender_name}`;
    if (badgeEl) badgeEl.innerText = `${wish.occasion} Celebration`;

    // Render occasion-specific hero module
    const heroModule = document.getElementById('occasionSpecificModule');
    if (heroModule) {
      if (occ.includes('birthday')) {
        heroModule.innerHTML = this.renderBirthdayCakeModule();
      } else if (occ.includes('anniversary') || occ.includes('valentine') || wish.theme.includes('romantic')) {
        heroModule.innerHTML = this.renderWaxEnvelopeModule();
      } else {
        heroModule.innerHTML = this.renderFriendshipHeroModule();
      }
    }

    // Populate primary message
    const messageEl = document.getElementById('greetingMessageBody');
    if (messageEl) {
      messageEl.innerText = wish.message;
    }

    // Populate personal memories if present
    const memorySection = document.getElementById('personalMemorySection');
    const memoryText = document.getElementById('personalMemoryText');
    if (memorySection && memoryText) {
      if (wish.memories && wish.memories.trim()) {
        memoryText.innerText = wish.memories;
        memorySection.style.display = 'block';
      } else {
        memorySection.style.display = 'none';
      }
    }

    // Render Photo Gallery
    this.renderGallery();

    // Render Timeline / Badges
    this.renderMilestonesAndBadges();

    // Show main content container
    const mainEl = document.getElementById('greetingMainContent');
    if (mainEl) mainEl.style.display = 'block';
  },

  // 1. Birthday Cake with Interactive Candles
  renderBirthdayCakeModule() {
    const age = this.wish.age ? `<div class="mt-2 text-sm font-semibold text-pink-300">Celebrating ${this.wish.age} Fantastic Years! 🌟</div>` : '';

    return `
      <div class="text-center py-6">
        <div class="inline-block px-4 py-1.5 rounded-full bg-pink-900 bg-opacity-40 border border-pink-500 text-pink-300 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
          🎂 Tap the candles to blow them out & make a wish!
        </div>

        <div class="cake-container" onclick="GreetingPage.blowOutCandles(event)">
          <div class="candle-row">
            <div class="candle">
              <div class="wick"></div>
              <div class="flame ${this.candlesBlown ? 'blown-out' : ''}" id="flame1"></div>
              <div class="smoke"></div>
            </div>
            <div class="candle">
              <div class="wick"></div>
              <div class="flame ${this.candlesBlown ? 'blown-out' : ''}" id="flame2"></div>
              <div class="smoke"></div>
            </div>
            <div class="candle">
              <div class="wick"></div>
              <div class="flame ${this.candlesBlown ? 'blown-out' : ''}" id="flame3"></div>
              <div class="smoke"></div>
            </div>
          </div>

          <div class="cake">
            <div class="cake-frosting">
              <div class="cake-drips"></div>
            </div>
          </div>
        </div>

        <div id="candleBlowStatus" class="mt-4 text-base font-semibold transition-all">
          ${this.candlesBlown 
            ? '<span class="text-emerald-400">🎉 Candled blown out! May all your wishes come true! ✨</span>' 
            : '<span class="text-gray-300">Click or tap the cake above to blow out the candles 🕯️</span>'
          }
        </div>
        ${age}
      </div>
    `;
  },

  // 2. Romantic Wax-Sealed Envelope Module
  renderWaxEnvelopeModule() {
    return `
      <div class="envelope-wrapper">
        <div class="envelope" id="loveEnvelope">
          <div class="wax-seal" id="waxSealBtn" onclick="GreetingPage.openEnvelope()" title="Click to break wax seal">
            💌
          </div>
          <div class="p-8 text-center" id="envelopeFront">
            <span class="text-xs tracking-widest text-amber-900 uppercase font-bold">Confidential & Sealed</span>
            <h3 class="text-xl font-serif-display text-amber-950 mt-2">For My Beloved ${this.wish.recipient_name}</h3>
            <p class="text-xs text-amber-800 mt-1 italic">Click the wax seal to open your love letter</p>
          </div>
        </div>
      </div>
    `;
  },

  // 3. Friendship / Celebration Hero Module
  renderFriendshipHeroModule() {
    return `
      <div class="text-center py-6">
        <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-sm shadow-lg mb-4">
          <span>🌟</span> Official Certificate of Awesomeness
        </div>
        <h2 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-300">
          The World is Brighter With You In It!
        </h2>
      </div>
    `;
  },

  // Interaction: Blow out candles
  async blowOutCandles(event) {
    if (this.candlesBlown) return;

    this.candlesBlown = true;
    document.querySelectorAll('.flame').forEach(f => f.classList.add('blown-out'));

    // Play realistic audio whoosh & sparkle
    window.wishAudio?.playBlowOutSound();

    // Trigger explosive celebratory confetti
    const rect = event ? event.currentTarget.getBoundingClientRect() : null;
    const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    fireConfettiBurst(originX, originY);

    // Update status text
    const statusEl = document.getElementById('candleBlowStatus');
    if (statusEl) {
      statusEl.innerHTML = `<span class="text-emerald-400 text-lg font-bold animate-bounce">🎉 Woohoo! Candles blown out! May your wish come true! ✨</span>`;
    }

    // Persist status to backend
    try {
      await fetch(`/api/wishes/${encodeURIComponent(this.slug)}/candles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candles_blown: true })
      });
    } catch (e) {
      console.warn('Could not persist candle status:', e);
    }
  },

  // Interaction: Open Love Envelope
  openEnvelope() {
    const seal = document.getElementById('waxSealBtn');
    const envelope = document.getElementById('loveEnvelope');
    if (seal) seal.style.transform = 'translate(-50%, -50%) scale(0) rotate(180deg)';
    if (seal) seal.style.opacity = '0';

    setTimeout(() => {
      if (envelope) {
        envelope.style.background = 'transparent';
        envelope.style.boxShadow = 'none';
        envelope.innerHTML = `
          <div class="letter-content animate-fade-in text-left">
            <div class="text-right text-xs text-amber-800 italic mb-4 font-serif-display">Forever & Always</div>
            <div class="text-xl font-script text-rose-900 mb-2">My Dearest ${this.wish.recipient_name},</div>
            <p class="text-base text-gray-800 font-serif-display leading-relaxed mb-4">${this.wish.message}</p>
            ${this.wish.memories ? `<div class="bg-rose-50 border-l-2 border-rose-400 p-3 my-3 text-xs italic text-rose-900 font-serif-display">"${this.wish.memories}"</div>` : ''}
            <div class="text-right text-lg font-script text-rose-900 mt-4">— ${this.wish.sender_name}</div>
          </div>
        `;
      }
      fireConfettiBurst();
      window.wishAudio?.playRomanticMelody();
    }, 400);
  },

  // Render Photo Gallery
  renderGallery() {
    const gallerySection = document.getElementById('photoGallerySection');
    const galleryGrid = document.getElementById('photoGalleryGrid');
    if (!gallerySection || !galleryGrid) return;

    const images = this.wish.images || [];
    if (images.length === 0) {
      gallerySection.style.display = 'none';
      return;
    }

    gallerySection.style.display = 'block';
    const rotations = [-2, 1, -1.5, 2, -1, 1.5];

    galleryGrid.innerHTML = images.map((img, idx) => {
      const rot = rotations[idx % rotations.length];
      return `
        <div class="polaroid" style="transform: rotate(${rot}deg);" onclick="GreetingPage.openLightbox('${img.url}', '${img.caption || ''}')">
          <img src="${img.url}" alt="${img.caption || 'Memory'}" loading="lazy">
          <div class="polaroid-caption">${img.caption || 'Cherished moment'}</div>
        </div>
      `;
    }).join('');
  },

  // Render Milestones (Anniversary duration, friendship badges)
  renderMilestonesAndBadges() {
    const container = document.getElementById('milestoneBadgesContainer');
    if (!container) return;

    const occ = (this.wish.occasion || '').toLowerCase();
    const badges = [];

    if (this.wish.anniversary_years) {
      badges.push({
        title: `${this.wish.anniversary_years} Years of Togetherness`,
        desc: 'Built on love, patience, and endless memories',
        icon: '💍'
      });
    }

    if (this.wish.relationship_duration) {
      badges.push({
        title: `${this.wish.relationship_duration} of Pure Magic`,
        desc: 'And a lifetime of adventures still ahead',
        icon: '⏳'
      });
    }

    if (occ.includes('friend') || this.wish.relationship.toLowerCase().includes('friend')) {
      badges.push({
        title: 'Certified Ride-or-Die',
        desc: 'Partner in crime & human diary forever',
        icon: '🏆'
      });
      badges.push({
        title: 'Zero Filter Club',
        desc: 'Can say anything without being judged',
        icon: '☕'
      });
    }

    if (badges.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'grid';
    container.innerHTML = badges.map(b => `
      <div class="glass p-5 rounded-2xl flex items-center gap-4 border border-white border-opacity-10">
        <div class="text-3xl">${b.icon}</div>
        <div>
          <div class="font-bold text-white text-base">${b.title}</div>
          <div class="text-xs text-gray-400 mt-0.5">${b.desc}</div>
        </div>
      </div>
    `).join('');
  },

  // Lightbox for photos
  openLightbox(url, caption) {
    const modal = document.getElementById('photoLightboxModal');
    if (!modal) return;
    document.getElementById('lightboxImage').src = url;
    document.getElementById('lightboxCaption').innerText = caption;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  closeLightbox() {
    const modal = document.getElementById('photoLightboxModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  // Setup Floating Music Bar
  setupAudioPlayer() {
    const track = this.wish.music_track || (this.wish.occasion.toLowerCase().includes('birthday') ? 'birthday_celebration' : 'romantic_melody');
    const audioBtn = document.getElementById('floatingAudioToggle');
    const audioIcon = document.getElementById('audioPlayIcon');
    const musicBars = document.getElementById('musicVisualizerBars');

    if (!audioBtn) return;

    audioBtn.onclick = () => {
      window.wishAudio.toggle(track);
      if (window.wishAudio.isPlaying) {
        audioIcon.innerText = '⏸️';
        if (musicBars) musicBars.style.display = 'flex';
      } else {
        audioIcon.innerText = '▶️';
        if (musicBars) musicBars.style.display = 'none';
      }
    };

    // Auto-prompt to start music on first user click anywhere on page
    const startAudioOnce = () => {
      window.wishAudio.play(track);
      if (audioIcon) audioIcon.innerText = '⏸️';
      if (musicBars) musicBars.style.display = 'flex';
      document.removeEventListener('click', startAudioOnce);
    };
    document.addEventListener('click', startAudioOnce, { once: true });
  },

  initAmbientEffects() {
    const occ = (this.wish.occasion || '').toLowerCase();
    let effect = 'hearts';
    if (occ.includes('birthday')) effect = 'balloons';
    else if (occ.includes('friend') || this.wish.theme.includes('luxury')) effect = 'stars';

    window.ambientEngine = new AmbientParticles('ambientCanvas', effect);
  }
};

window.GreetingPage = GreetingPage;

document.addEventListener('DOMContentLoaded', () => {
  GreetingPage.init();
});
