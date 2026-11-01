/**
 * Wish Yours — Interactive Greeting Experience Controller
 * Powers dynamic occasions, cake candle blow-out, love letter unfold, and audio playback.
 */

const GreetingPage = {

  // Scheduling handlers on Greeting Page
  getIsoUtcForTimezone(dateStr, timeStr, timeZone) {
    try {
      const localGuess = new Date(dateStr + 'T' + timeStr + ':00Z');
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone || 'UTC',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      });
      const parts = {};
      formatter.formatToParts(localGuess).forEach(p => { parts[p.type] = p.value; });
      let th = parseInt(parts.hour, 10);
      if (th === 24) th = 0;
      const formattedAsUtcMs = Date.UTC(parseInt(parts.year, 10), parseInt(parts.month, 10) - 1, parseInt(parts.day, 10), th, parseInt(parts.minute, 10));
      const diffMs = formattedAsUtcMs - localGuess.getTime();
      const [y, m, d] = dateStr.split('-').map(Number);
      const [h, min] = timeStr.split(':').map(Number);
      const desiredUtcMs = Date.UTC(y, m - 1, d, h, min) - diffMs;
      return new Date(desiredUtcMs).toISOString();
    } catch (e) {
      return new Date(dateStr + 'T' + timeStr).toISOString();
    }
  },

  openScheduleModal() {
    if (!this.wish) return;

    const recipDisplay = document.getElementById('schedModalRecipientDisplay');
    if (recipDisplay) recipDisplay.innerText = this.wish.recipient_name;

    const occBadge = document.getElementById('schedModalOccasionBadge');
    if (occBadge) occBadge.innerText = this.wish.occasion;

    const tzSelect = document.getElementById('schedTimezoneSelect');
    const tzBadge = document.getElementById('schedTimezoneBadge');
    const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

    if (tzSelect) {
      let hasOption = false;
      for (let i = 0; i < tzSelect.options.length; i++) {
        if (tzSelect.options[i].value === detectedTz) {
          tzSelect.selectedIndex = i;
          hasOption = true;
          break;
        }
      }
      if (!hasOption) {
        const opt = document.createElement('option');
        opt.value = detectedTz;
        opt.text = `${detectedTz} (Detected)`;
        opt.selected = true;
        tzSelect.prepend(opt);
      }
    }
    if (tzBadge) tzBadge.innerText = detectedTz;

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');

    const dateInput = document.getElementById('schedDateInput');
    const timeInput = document.getElementById('schedTimeInput');

    if (dateInput) {
      dateInput.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (!dateInput.value) dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
    if (timeInput && !timeInput.value) timeInput.value = '09:00';

    ['schedDateInput', 'schedTimeInput', 'schedTimezoneSelect'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.oninput = () => GreetingPage.updateScheduleSummary();
        el.onchange = () => GreetingPage.updateScheduleSummary();
      }
    });

    this.updateScheduleSummary();

    const modal = document.getElementById('scheduleModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  closeScheduleModal() {
    const modal = document.getElementById('scheduleModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  onScheduleMethodChange(method) {
    const emailGroup = document.getElementById('schedEmailGroup');
    const phoneGroup = document.getElementById('schedPhoneGroup');
    if (method === 'email') {
      if (emailGroup) emailGroup.style.display = 'block';
      if (phoneGroup) phoneGroup.style.display = 'none';
    } else {
      if (emailGroup) emailGroup.style.display = 'none';
      if (phoneGroup) phoneGroup.style.display = 'block';
    }
    this.updateScheduleSummary();
  },

  updateScheduleSummary() {
    const summaryEl = document.getElementById('schedConfirmationSummary');
    if (!summaryEl || !this.wish) return;

    const recip = this.wish.recipient_name || 'Friend';
    const occ = this.wish.occasion || 'Celebration';

    const methodRadio = document.querySelector('input[name="schedDeliveryMethod"]:checked');
    const method = methodRadio ? methodRadio.value : 'email';
    const methodLabel = method === 'email' ? 'Email 💌' : (method === 'sms' ? 'SMS 📱' : 'Voice Call 📞');

    const dateVal = document.getElementById('schedDateInput')?.value;
    const timeVal = document.getElementById('schedTimeInput')?.value;
    const tzVal = document.getElementById('schedTimezoneSelect')?.value || 'UTC';

    if (!dateVal || !timeVal) {
      summaryEl.innerText = `Your ${occ} wish for ${recip} will be sent via ${methodLabel}.`;
      return;
    }

    try {
      const [y, m, d] = dateVal.split('-').map(Number);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const readableDate = `${d} ${monthNames[m - 1]} ${y}`;
      const [h, min] = timeVal.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const readableTime = `${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`;
      const tzShort = tzVal.split('/').pop().replace(/_/g, ' ');

      summaryEl.innerText = `Your ${occ} wish for ${recip} will be sent via ${methodLabel} on ${readableDate} at ${readableTime} (${tzShort}).`;
    } catch (e) {
      summaryEl.innerText = `Your ${occ} wish for ${recip} will be sent via ${methodLabel} on ${dateVal} at ${timeVal}.`;
    }
  },

  async confirmSchedule() {
    if (!this.wish) return;

    const methodRadio = document.querySelector('input[name="schedDeliveryMethod"]:checked');
    const deliveryMethod = methodRadio ? methodRadio.value : 'email';

    const email = document.getElementById('schedRecipientEmail')?.value.trim();
    const phone = document.getElementById('schedRecipientPhone')?.value.trim();
    const dateVal = document.getElementById('schedDateInput')?.value;
    const timeVal = document.getElementById('schedTimeInput')?.value;
    const tzVal = document.getElementById('schedTimezoneSelect')?.value || 'UTC';
    const personalNote = document.getElementById('schedPersonalMessage')?.value.trim();

    if (deliveryMethod === 'email') {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid recipient email address.', 'error');
        return;
      }
    } else {
      if (!phone || phone.replace(/[\s\-\(\)]/g, '').length < 7) {
        showToast('Please enter a valid recipient phone number with country code (e.g. +91 9876543210).', 'error');
        return;
      }
    }

    if (!dateVal || !timeVal) {
      showToast('Please choose both a delivery date and time.', 'error');
      return;
    }

    const scheduledAtUtc = this.getIsoUtcForTimezone(dateVal, timeVal, tzVal);
    const scheduleDate = new Date(scheduledAtUtc);

    if (scheduleDate.getTime() < Date.now() - 10000) {
      showToast('Scheduled delivery time must be in the future.', 'error');
      return;
    }

    const confirmBtn = document.getElementById('confirmScheduleBtn');
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span>⏳ Scheduling...</span>';
    }

    try {
      const user = typeof AuthManager !== 'undefined' ? AuthManager.getUser() : null;

      const payload = {
        greeting_id: this.wish.slug,
        recipient_name: this.wish.recipient_name,
        recipient_email: deliveryMethod === 'email' ? email : undefined,
        recipient_phone: deliveryMethod !== 'email' ? phone : undefined,
        delivery_method: deliveryMethod,
        scheduled_at: scheduledAtUtc,
        timezone: tzVal,
        personal_message: personalNote || undefined,
        user_id: user?.id || null
      };

      const res = await fetch('/api/scheduled-wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Scheduling failed');

      this.closeScheduleModal();

      const sched = json.scheduled_wish;
      document.getElementById('successRecipientName').innerText = sched.recipient_name;
      document.getElementById('successDeliveryChannel').innerText = 
        sched.delivery_method === 'email' ? 'Email 💌' : (sched.delivery_method === 'sms' ? 'SMS 📱' : 'Voice Call 📞');
      document.getElementById('successDeliverTo').innerText = 
        sched.recipient_email || sched.recipient_phone || 'Recipient';

      try {
        const localFormatted = new Date(sched.scheduled_at).toLocaleString('en-US', {
          timeZone: sched.timezone,
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        document.getElementById('successScheduledTime').innerText = `${localFormatted} (${sched.timezone.split('/').pop()})`;
      } catch (e) {
        document.getElementById('successScheduledTime').innerText = sched.scheduled_at;
      }

      const successModal = document.getElementById('scheduleSuccessModal');
      if (successModal) {
        successModal.classList.remove('hidden');
        successModal.classList.add('flex');
      }

      showToast('🎉 Celebration wish scheduled successfully!', 'success');

    } catch (err) {
      console.error('Schedule error:', err);
      showToast(err.message || 'Could not schedule greeting', 'error');
    } finally {
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<span>Confirm & Schedule Wish ⏰</span>';
      }
    }
  },

  wish: null,
  slug: '',
  candlesBlown: false,
  envelopeOpened: false,

  getFontStack(fontName) {
    const fontMap = {
      'Playfair Display': "'Playfair Display', Georgia, 'Times New Roman', serif",
      'Dancing Script': "'Dancing Script', 'Brush Script MT', cursive",
      'Great Vibes': "'Great Vibes', 'Brush Script MT', cursive",
      'Outfit': "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      'Pacifico': "'Pacifico', 'Comic Sans MS', cursive",
      'Cinzel': "'Cinzel', Georgia, 'Times New Roman', serif"
    };
    return fontMap[fontName] || fontMap['Playfair Display'];
  },

  getFontClass(fontName) {
    if (!fontName) return 'font-playfair';
    const f = fontName.toLowerCase();
    if (f.includes('dancing')) return 'font-dancing';
    if (f.includes('vibes')) return 'font-great-vibes';
    if (f.includes('outfit')) return 'font-outfit';
    if (f.includes('pacifico')) return 'font-pacifico';
    if (f.includes('cinzel')) return 'font-cinzel';
    return 'font-playfair';
  },

  async init() {
    this.extractSlug();
    if (!this.slug) {
      this.renderNotFound('No celebration greeting specified in the link.');
      return;
    }

    await this.loadWishData();
    if (this.wish) {
      try {
        this.renderPage();
        this.initAmbientEffects();
        this.setupAudioPlayer();
      } catch (err) {
        console.error('Error rendering greeting page:', err);
        // Ensure main content is displayed even if a non-fatal feature fails
        const mainEl = document.getElementById('greetingMainContent');
        if (mainEl) mainEl.style.display = 'block';
      }
    }
  },

  extractSlug() {
    // Check path /wish/:slug or query param ?id=... / ?slug=...
    const pathParts = window.location.pathname.split('/').filter(Boolean);
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
        throw new Error(data.message || 'Greeting not found or has expired.');
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
    const loadingEl = document.getElementById('greetingLoading');
    if (loadingEl) loadingEl.style.display = 'none';

    const mainEl = document.getElementById('greetingMainContent');
    if (mainEl) {
      mainEl.style.display = 'block';
      mainEl.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-6 text-center">
          <div class="glass-card max-w-md p-8 rounded-2xl border border-white border-opacity-10 shadow-2xl">
            <div class="text-6xl mb-4 animate-bounce">✨🎁</div>
            <h1 class="text-2xl font-bold mb-2 text-white">Greeting Not Found</h1>
            <p class="text-gray-400 mb-6 text-sm">${msg || 'The celebration page you are looking for does not exist or has expired.'}</p>
            <a href="/create" class="btn-gradient px-6 py-3 rounded-xl font-bold inline-block text-white shadow-lg">Create a New Wish</a>
          </div>
        </div>
      `;
    }
  },

  renderCreatedBanner(recipientName) {
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    const banner = document.createElement('div');
    banner.id = 'creatorSuccessBanner';
    banner.className = 'glass-card border border-pink-500 rounded-2xl p-4 sm:p-5 mb-8 shadow-2xl animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4';
    banner.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-3xl">🎉</span>
        <div>
          <h3 class="text-sm sm:text-base font-extrabold text-white">Your Greeting for <span class="text-pink-400">${recipientName}</span> is Live!</h3>
          <p class="text-xs text-gray-300 mt-0.5">Share this celebration page using the quick actions below.</p>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button onclick="WishShare.copyLink(window.location.href.split('?')[0])" class="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-bold text-white shadow hover:opacity-90">
          📋 Copy Link
        </button>
        <button onclick="WishShare.openWhatsApp(GreetingPage.wish, window.location.href.split('?')[0])" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white shadow">
          💬 WhatsApp
        </button>
      </div>
    `;
    mainEl.insertBefore(banner, mainEl.firstChild);
  },

  renderPage() {
    const wish = this.wish || {};
    const occ = (wish.occasion || 'birthday').toLowerCase();
    const theme = (wish.theme || 'birthday_celebration').toLowerCase();
    const rel = (wish.relationship || 'friend').toLowerCase();
    const recipientName = wish.recipient_name || 'Friend';
    const senderName = wish.sender_name || 'Someone special';
    const message = wish.message || '';

    // Always make main content visible
    const mainEl = document.getElementById('greetingMainContent');
    if (mainEl) mainEl.style.display = 'block';

    // Set page title
    document.title = `✨ For ${recipientName} — Happy ${wish.occasion || 'Celebration'}! | Wish Yours`;

    // Check if user just published this wish (?created=1)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('created')) {
      this.renderCreatedBanner(recipientName);
    }

    // Populate recipient and sender details
    const recNameEl = document.getElementById('recipientHeaderName');
    const senderNameEl = document.getElementById('senderHeaderName');
    const badgeEl = document.getElementById('occasionHeaderBadge');

    if (recNameEl) recNameEl.innerText = recipientName;
    if (senderNameEl) senderNameEl.innerText = `With love from ${senderName}`;
    if (badgeEl) badgeEl.innerText = `${wish.occasion || 'Celebration'} Celebration`;

    // Render occasion-specific hero module
    const heroModule = document.getElementById('occasionSpecificModule');
    if (heroModule) {
      if (occ.includes('birthday')) {
        heroModule.innerHTML = this.renderBirthdayCakeModule();
      } else if (occ.includes('anniversary') || occ.includes('valentine') || theme.includes('romantic')) {
        heroModule.innerHTML = this.renderWaxEnvelopeModule();
      } else {
        heroModule.innerHTML = this.renderFriendshipHeroModule();
      }
    }

    const chosenFont = wish.font_family || 'Playfair Display';
    const fontClass = this.getFontClass(chosenFont);
    const fontStack = this.getFontStack(chosenFont);

    // Populate primary message with active typography styling
    const messageEl = document.getElementById('greetingMessageBody');
    if (messageEl) {
      messageEl.innerText = message;
      messageEl.classList.remove('font-serif-display', 'font-playfair', 'font-dancing', 'font-great-vibes', 'font-outfit', 'font-pacifico', 'font-cinzel');
      messageEl.classList.add(fontClass);
      messageEl.style.fontFamily = fontStack;
    }

    // Populate personal memories if present with matching font
    const memorySection = document.getElementById('personalMemorySection');
    const memoryText = document.getElementById('personalMemoryText');
    if (memorySection && memoryText) {
      if (wish.memories && wish.memories.trim()) {
        memoryText.innerText = wish.memories;
        memoryText.classList.remove('font-serif-display', 'font-playfair', 'font-dancing', 'font-great-vibes', 'font-outfit', 'font-pacifico', 'font-cinzel');
        memoryText.classList.add(fontClass);
        memoryText.style.fontFamily = fontStack;
        memorySection.style.display = 'block';
      } else {
        memorySection.style.display = 'none';
      }
    }

    // Render Photo Gallery
    this.renderGallery();

    // Render Timeline / Badges
    this.renderMilestonesAndBadges();
  },

  // 1. Birthday Cake with Interactive Candles
  renderBirthdayCakeModule() {
    const age = this.wish?.age ? `<div class="mt-2 text-sm font-semibold text-pink-300">Celebrating ${this.wish.age} Fantastic Years! 🌟</div>` : '';

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
            ? '<span class="text-emerald-400">🎉 Candles blown out! May all your wishes come true! ✨</span>' 
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
            <h3 class="text-xl font-serif-display text-amber-950 mt-2">For My Beloved ${this.wish?.recipient_name || 'Loved One'}</h3>
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

    // Trigger celebratory confetti
    const rect = event ? event.currentTarget.getBoundingClientRect() : null;
    const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    if (typeof fireConfettiBurst === 'function') {
      fireConfettiBurst(originX, originY);
    }

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
        const chosenFont = this.wish?.font_family || 'Playfair Display';
        const fontClass = this.getFontClass(chosenFont);
        const fontStack = this.getFontStack(chosenFont);

        envelope.innerHTML = `
          <div class="letter-content animate-fade-in text-left">
            <div class="text-right text-xs text-amber-800 italic mb-4 ${fontClass}" style="font-family: ${fontStack};">Forever & Always</div>
            <div class="text-xl font-script text-rose-900 mb-2">My Dearest ${this.wish?.recipient_name || 'Loved One'},</div>
            <p class="text-base text-gray-800 ${fontClass} leading-relaxed mb-4" style="font-family: ${fontStack};">${this.wish?.message || ''}</p>
            ${this.wish?.memories ? `<div class="bg-rose-50 border-l-2 border-rose-400 p-3 my-3 text-xs italic text-rose-900 ${fontClass}" style="font-family: ${fontStack};">"${this.wish.memories}"</div>` : ''}
            <div class="text-right text-lg ${fontClass} text-rose-900 mt-4" style="font-family: ${fontStack};">— ${this.wish?.sender_name || 'Someone special'}</div>
          </div>
        `;
      }
      if (typeof fireConfettiBurst === 'function') {
        fireConfettiBurst();
      }
      window.wishAudio?.playRomanticMelody();
    }, 400);
  },

  // Render Photo Gallery
  renderGallery() {
    const gallerySection = document.getElementById('photoGallerySection');
    const galleryGrid = document.getElementById('photoGalleryGrid');
    if (!gallerySection || !galleryGrid) return;

    const images = this.wish?.images || [];
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

    const occ = (this.wish?.occasion || '').toLowerCase();
    const rel = (this.wish?.relationship || '').toLowerCase();
    const badges = [];

    if (this.wish?.anniversary_years) {
      badges.push({
        title: `${this.wish.anniversary_years} Years of Togetherness`,
        desc: 'Built on love, patience, and endless memories',
        icon: '💍'
      });
    }

    if (this.wish?.relationship_duration) {
      badges.push({
        title: `${this.wish.relationship_duration} of Pure Magic`,
        desc: 'And a lifetime of adventures still ahead',
        icon: '⏳'
      });
    }

    if (occ.includes('friend') || rel.includes('friend')) {
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
    const occ = (this.wish?.occasion || '').toLowerCase();
    const track = this.wish?.music_track || (occ.includes('birthday') ? 'birthday_celebration' : 'romantic_melody');
    const audioBtn = document.getElementById('floatingAudioToggle');
    const audioIcon = document.getElementById('audioPlayIcon');
    const musicBars = document.getElementById('musicVisualizerBars');

    if (!audioBtn || !window.wishAudio) return;

    audioBtn.onclick = () => {
      window.wishAudio.toggle(track);
      if (window.wishAudio.isPlaying) {
        if (audioIcon) audioIcon.innerText = '⏸️';
        if (musicBars) musicBars.style.display = 'flex';
      } else {
        if (audioIcon) audioIcon.innerText = '▶️';
        if (musicBars) musicBars.style.display = 'none';
      }
    };

    // Auto-prompt to start music on first user click anywhere on page
    const startAudioOnce = () => {
      if (window.wishAudio) {
        window.wishAudio.play(track);
        if (audioIcon) audioIcon.innerText = '⏸️';
        if (musicBars) musicBars.style.display = 'flex';
      }
      document.removeEventListener('click', startAudioOnce);
    };
    document.addEventListener('click', startAudioOnce, { once: true });
  },

  initAmbientEffects() {
    const occ = (this.wish?.occasion || '').toLowerCase();
    const theme = (this.wish?.theme || '').toLowerCase();
    let effect = 'hearts';
    if (occ.includes('birthday')) effect = 'balloons';
    else if (occ.includes('friend') || theme.includes('luxury')) effect = 'stars';

    if (typeof AmbientParticles === 'function' && document.getElementById('ambientCanvas')) {
      try {
        window.ambientEngine = new AmbientParticles('ambientCanvas', effect);
      } catch (e) {
        console.warn('Ambient engine init note:', e);
      }
    }
  }
};

window.GreetingPage = GreetingPage;

document.addEventListener('DOMContentLoaded', () => {
  GreetingPage.init();
});
