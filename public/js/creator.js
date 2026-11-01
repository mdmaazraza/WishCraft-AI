/**
 * WishCraft AI — Multi-Step Wish Creation Studio Controller
 */

const WishCreator = {
  currentStep: 1,
  data: {
    occasion: 'Birthday',
    relationship: 'Best Friend',
    recipient_name: '',
    sender_name: '',
    recipient_gender: 'female',
    memories: '',
    relationship_duration: '',
    age: '',
    anniversary_years: '',
    style: 'Heart-touching',
    font_family: 'Playfair Display',
    theme: 'birthday_celebration',
    language: 'en',
    length: 'medium',
    message: '',
    images: [],
    music_track: 'birthday_celebration',
    is_public: true
  },
  aiVariations: [],
  selectedVariationIndex: 0,
  createdWish: null,

  init() {
    this.bindEvents();
    this.checkUrlPreload();
    this.updateStepView();
  },

  // Check URL query parameters (e.g. from template click on homepage)
  checkUrlPreload() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('occasion')) this.data.occasion = params.get('occasion');
    if (params.get('relationship')) this.data.relationship = params.get('relationship');
    if (params.get('theme')) this.data.theme = params.get('theme');
    if (params.get('style')) this.data.style = params.get('style');
    if (params.get('font')) this.data.font_family = params.get('font');
    if (params.get('message')) this.data.message = params.get('message');
    if (params.get('step')) this.currentStep = parseInt(params.get('step'), 10) || 1;
  },

  bindEvents() {
    // Occasion selector
    document.querySelectorAll('.occasion-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const val = btn.dataset.occasion;
        this.data.occasion = val;
        document.querySelectorAll('.occasion-btn').forEach(b => b.classList.remove('ring-4', 'ring-pink-500', 'bg-slate-800'));
        btn.classList.add('ring-4', 'ring-pink-500', 'bg-slate-800');
        this.adjustContextualFields();
      });
    });

    // Relationship selector
    document.querySelectorAll('.relationship-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.data.relationship = btn.dataset.relationship;
        document.querySelectorAll('.relationship-btn').forEach(b => b.classList.remove('ring-4', 'ring-purple-500', 'bg-slate-800'));
        btn.classList.add('ring-4', 'ring-purple-500', 'bg-slate-800');
      });
    });

    // Style selector
    document.querySelectorAll('.style-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.data.style = btn.dataset.style;
        document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('ring-4', 'ring-indigo-500', 'bg-slate-800'));
        btn.classList.add('ring-4', 'ring-indigo-500', 'bg-slate-800');
      });
    });

    // Font selector
    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const font = btn.dataset.font;
        this.setFontFamily(font);
      });
    });

    // Theme selector
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.data.theme = btn.dataset.theme;
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('ring-4', 'ring-pink-500'));
        btn.classList.add('ring-4', 'ring-pink-500');
      });
    });

    // Live message input listener
    const finalInput = document.getElementById('finalMessageInput');
    if (finalInput) {
      finalInput.addEventListener('input', (e) => {
        this.data.message = e.target.value;
        this.updateLivePreview();
      });
    }

    // Photo file input listener
    const photoInput = document.getElementById('photoUploadInput');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
    }
  },

  setFontFamily(fontName) {
    if (!fontName) return;
    this.data.font_family = fontName;

    // Update Step 4 font buttons highlight
    document.querySelectorAll('.font-btn').forEach(btn => {
      if (btn.dataset.font === fontName) {
        btn.classList.add('ring-4', 'ring-pink-500', 'bg-slate-800');
        btn.classList.remove('bg-slate-900');
      } else {
        btn.classList.remove('ring-4', 'ring-pink-500', 'bg-slate-800');
        btn.classList.add('bg-slate-900');
      }
    });

    // Update Step 4 badge
    const badge = document.getElementById('selectedFontBadge');
    if (badge) badge.innerText = fontName;

    // Update Step 6 dropdown if present
    const dropdown = document.getElementById('step6FontSelector');
    if (dropdown && dropdown.value !== fontName) {
      dropdown.value = fontName;
    }

    // Apply live font to final message textarea
    const messageInput = document.getElementById('finalMessageInput');
    if (messageInput) {
      messageInput.style.fontFamily = this.getFontStack(fontName);
    }
    this.updateLivePreview();
  },

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

  updateLivePreview() {
    const recEl = document.getElementById('previewRecipientName');
    const senderEl = document.getElementById('previewSenderName');
    const badgeEl = document.getElementById('previewOccasionBadge');
    const messageEl = document.getElementById('previewMessageText');
    const memoriesBlock = document.getElementById('previewMemoriesBlock');
    const memoriesText = document.getElementById('previewMemoriesText');

    if (recEl) recEl.innerText = this.data.recipient_name || 'Friend';
    if (senderEl) senderEl.innerText = `With love from ${this.data.sender_name || 'Someone special'}`;
    if (badgeEl) badgeEl.innerText = `${this.data.occasion || 'Celebration'}`;

    if (messageEl) {
      messageEl.innerText = this.data.message || 'Select or write a greeting message above to preview it here...';
      messageEl.classList.remove('font-serif-display', 'font-playfair', 'font-dancing', 'font-great-vibes', 'font-outfit', 'font-pacifico', 'font-cinzel');
      messageEl.classList.add(this.getFontClass(this.data.font_family));
      messageEl.style.fontFamily = this.getFontStack(this.data.font_family);
    }

    if (memoriesBlock && memoriesText) {
      if (this.data.memories && this.data.memories.trim()) {
        memoriesText.innerText = `"${this.data.memories}"`;
        memoriesBlock.style.display = 'block';
      } else {
        memoriesBlock.style.display = 'none';
      }
    }
  },

  adjustContextualFields() {
    const ageWrapper = document.getElementById('ageFieldWrapper');
    const annivWrapper = document.getElementById('annivFieldWrapper');
    const occ = this.data.occasion.toLowerCase();

    if (ageWrapper) {
      ageWrapper.style.display = occ.includes('birthday') ? 'block' : 'none';
    }
    if (annivWrapper) {
      annivWrapper.style.display = occ.includes('anniversary') ? 'block' : 'none';
    }

    // Auto-suggest optimal theme based on occasion
    if (occ.includes('birthday')) this.data.theme = 'birthday_celebration';
    else if (occ.includes('anniversary') || occ.includes('valentine')) this.data.theme = 'romantic_theme';
    else if (occ.includes('friend')) this.data.theme = 'friendship_theme';
  },

  goToStep(stepNumber) {
    // Validation before moving forward
    if (stepNumber > this.currentStep) {
      if (this.currentStep === 3) {
        const nameInput = document.getElementById('recipientNameInput');
        if (!nameInput || !nameInput.value.trim()) {
          showToast('Please enter the recipient’s name to continue.', 'error');
          nameInput?.focus();
          return;
        }
        this.saveStep3Inputs();
      }
    }

    this.currentStep = stepNumber;
    this.updateStepView();

    // If entering Step 6, generate AI wishes automatically if message is empty
    if (this.currentStep === 6) {
      this.updateLivePreview();
      if (!this.data.message) {
        this.generateAIWishes();
      }
    }
  },

  nextStep() {
    if (this.currentStep < 6) {
      this.goToStep(this.currentStep + 1);
    }
  },

  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  },

  saveStep3Inputs() {
    this.data.recipient_name = document.getElementById('recipientNameInput')?.value.trim() || '';
    this.data.sender_name = document.getElementById('senderNameInput')?.value.trim() || '';
    this.data.memories = document.getElementById('memoriesInput')?.value.trim() || '';
    this.data.relationship_duration = document.getElementById('durationInput')?.value.trim() || '';
    this.data.age = document.getElementById('ageInput')?.value || '';
    this.data.anniversary_years = document.getElementById('annivYearsInput')?.value || '';
    this.data.recipient_gender = document.getElementById('genderSelect')?.value || 'unspecified';
  },

  updateStepView() {
    // Hide all step sections
    for (let i = 1; i <= 6; i++) {
      const stepEl = document.getElementById(`stepSection${i}`);
      const indicator = document.getElementById(`stepIndicator${i}`);
      if (stepEl) {
        stepEl.style.display = i === this.currentStep ? 'block' : 'none';
      }
      if (indicator) {
        if (i < this.currentStep) {
          indicator.className = 'w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow';
          indicator.innerHTML = '✓';
        } else if (i === this.currentStep) {
          indicator.className = 'w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm ring-4 ring-pink-500 ring-opacity-40 shadow-lg';
          indicator.innerHTML = i;
        } else {
          indicator.className = 'w-9 h-9 rounded-full bg-slate-800 text-gray-400 flex items-center justify-center font-bold text-sm';
          indicator.innerHTML = i;
        }
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Photo Upload Handler (supports multiple images, converts to base64 for persistent preview)
  handlePhotoUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      if (this.data.images.length >= 6) {
        showToast('Maximum 6 photos allowed per greeting.', 'info');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast(`Photo "${file.name}" is over 5MB. Please choose a smaller image.`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.data.images.push({
          url: e.target.result,
          caption: `Memory #${this.data.images.length + 1}`
        });
        this.renderPhotoThumbnails();
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  },

  removePhoto(index) {
    this.data.images.splice(index, 1);
    this.renderPhotoThumbnails();
  },

  updatePhotoCaption(index, newCaption) {
    if (this.data.images[index]) {
      this.data.images[index].caption = newCaption;
    }
  },

  renderPhotoThumbnails() {
    const container = document.getElementById('uploadedPhotosList');
    if (!container) return;

    if (this.data.images.length === 0) {
      container.innerHTML = `<p class="text-xs text-gray-500 italic col-span-full">No photos added yet. Upload your favorite moments above!</p>`;
      return;
    }

    container.innerHTML = this.data.images.map((img, idx) => `
      <div class="relative bg-slate-800 p-2 rounded-xl border border-slate-700 flex flex-col gap-2">
        <img src="${img.url}" class="w-full h-24 object-cover rounded-lg">
        <input type="text" value="${img.caption}" onchange="WishCreator.updatePhotoCaption(${idx}, this.value)" 
          class="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-gray-300 w-full" placeholder="Add caption...">
        <button onclick="WishCreator.removePhoto(${idx})" class="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow font-bold">✕</button>
      </div>
    `).join('');
  },

  // AI Message Generation using backend Gemini integration
  async generateAIWishes() {
    this.saveStep3Inputs();

    const loadingEl = document.getElementById('aiLoadingState');
    const resultsEl = document.getElementById('aiResultsContainer');
    const genBtn = document.getElementById('regenerateBtn');

    if (loadingEl) loadingEl.style.display = 'block';
    if (resultsEl) resultsEl.style.display = 'none';
    if (genBtn) genBtn.disabled = true;

    try {
      const language = document.getElementById('languageSelect')?.value || this.data.language || 'en';
      const length = document.getElementById('lengthSelect')?.value || 'medium';

      const res = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion: this.data.occasion,
          relationship: this.data.relationship,
          recipientName: this.data.recipient_name,
          senderName: this.data.sender_name,
          style: this.data.style,
          memories: this.data.memories,
          language: language,
          length: length
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Generation failed');
      }

      this.aiVariations = json.variations || [];
      this.renderAIVariations(json.source);

      // Select first variation by default
      if (this.aiVariations.length > 0) {
        this.selectVariation(0);
      }
    } catch (err) {
      console.error('AI generation error:', err);
      showToast(err.message || 'Error generating wishes', 'error');
    } finally {
      if (loadingEl) loadingEl.style.display = 'none';
      if (resultsEl) resultsEl.style.display = 'block';
      if (genBtn) genBtn.disabled = false;
    }
  },

  renderAIVariations(source = 'gemini') {
    const listEl = document.getElementById('variationsList');
    if (!listEl) return;

    listEl.innerHTML = this.aiVariations.map((v, i) => `
      <div id="variationCard_${i}" onclick="WishCreator.selectVariation(${i})" 
        class="variation-card p-4 rounded-xl border transition cursor-pointer ${i === 0 ? 'bg-pink-950 bg-opacity-30 border-pink-500 ring-2 ring-pink-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-pink-400">Option ${i + 1}: ${v.title}</span>
          <span class="text-xs bg-slate-800 text-gray-400 px-2 py-0.5 rounded-full">${v.tone || 'Heartfelt'}</span>
        </div>
        <p class="text-sm text-gray-200 line-clamp-3 italic">"${v.text}"</p>
      </div>
    `).join('');

    const sourceBadge = document.getElementById('aiSourceBadge');
    if (sourceBadge) {
      sourceBadge.innerHTML = source === 'gemini' 
        ? `<span class="bg-indigo-900 text-indigo-300 text-xs px-2.5 py-1 rounded-full font-medium">✨ Powered by Gemini AI</span>`
        : `<span class="bg-slate-800 text-gray-300 text-xs px-2.5 py-1 rounded-full font-medium">⚡ Instant Template Synthesizer</span>`;
    }
  },

  selectVariation(index) {
    this.selectedVariationIndex = index;
    const selected = this.aiVariations[index];
    if (!selected) return;

    this.data.message = selected.text;

    // Highlight active card
    document.querySelectorAll('.variation-card').forEach((c, idx) => {
      if (idx === index) {
        c.className = 'variation-card p-4 rounded-xl border transition cursor-pointer bg-pink-950 bg-opacity-30 border-pink-500 ring-2 ring-pink-500';
      } else {
        c.className = 'variation-card p-4 rounded-xl border transition cursor-pointer bg-slate-900 border-slate-700 hover:border-slate-500';
      }
    });

    // Populate active editable textarea
    const messageInput = document.getElementById('finalMessageInput');
    if (messageInput) {
      messageInput.value = selected.text;
    }
  },

  // Final Publish & Share Creation
  async publishGreeting() {
    const messageInput = document.getElementById('finalMessageInput');
    if (messageInput) {
      this.data.message = messageInput.value.trim();
    }

    if (!this.data.message) {
      showToast('Please enter or select a greeting message.', 'error');
      return;
    }

    const publishBtn = document.getElementById('publishWishBtn');
    if (publishBtn) {
      publishBtn.disabled = true;
      publishBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg> Generating Celebration Page...
      `;
    }

    try {
      const user = AuthManager.getUser();

      const payload = {
        ...this.data,
        sender_id: user?.id || null,
        language: document.getElementById('languageSelect')?.value || this.data.language || 'en'
      };

      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Creation failed');
      }

      this.createdWish = json.wish;
      showToast('🎉 Your celebration greeting is live!', 'success');
      setTimeout(() => {
        window.location.href = `/wish/${json.wish.slug}?created=1`;
      }, 600);

    } catch (err) {
      console.error('Publish error:', err);
      showToast(err.message || 'Could not create greeting', 'error');
      if (publishBtn) {
        publishBtn.disabled = false;
        publishBtn.innerHTML = `Generate & Share Greeting ✨`;
      }
    }
  },


  // Convert local date + time in given timezone to UTC ISO string
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
      // Fallback
      return new Date(dateStr + 'T' + timeStr).toISOString();
    }
  },

  // Ensure greeting is persisted on the backend before scheduling
  async ensureWishSaved() {
    if (this.createdWish && this.createdWish.slug) {
      return this.createdWish;
    }

    this.saveStep3Inputs();
    const messageInput = document.getElementById('finalMessageInput');
    if (messageInput) {
      this.data.message = messageInput.value.trim();
    }

    if (!this.data.message) {
      throw new Error('Please enter or select a greeting message first.');
    }

    if (!this.data.recipient_name) {
      throw new Error("Please enter the recipient's name in Step 3.");
    }

    const user = typeof AuthManager !== 'undefined' ? AuthManager.getUser() : null;
    const payload = {
      ...this.data,
      sender_id: user?.id || null,
      language: document.getElementById('languageSelect')?.value || this.data.language || 'en'
    };

    const res = await fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Could not save greeting');
    }

    this.createdWish = json.wish;
    return this.createdWish;
  },

  // Open the scheduling modal
  async openScheduleModal() {
    try {
      const schedBtn = document.getElementById('scheduleWishBtn');
      if (schedBtn) {
        schedBtn.disabled = true;
        schedBtn.innerHTML = '<span>⏳ Preparing...</span>';
      }

      const wish = await this.ensureWishSaved();

      if (schedBtn) {
        schedBtn.disabled = false;
        schedBtn.innerHTML = '<span>⏰ Schedule for Later</span>';
      }

      // Populate recipient & occasion displays
      const recipDisplay = document.getElementById('schedModalRecipientDisplay');
      if (recipDisplay) recipDisplay.innerText = wish.recipient_name || this.data.recipient_name;

      const occBadge = document.getElementById('schedModalOccasionBadge');
      if (occBadge) occBadge.innerText = wish.occasion || this.data.occasion;

      // Auto-detect timezone
      const tzSelect = document.getElementById('schedTimezoneSelect');
      const tzBadge = document.getElementById('schedTimezoneBadge');
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

      if (tzSelect) {
        // Ensure option exists or add it
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

      if (tzBadge) {
        tzBadge.innerText = detectedTz;
      }

      // Set default Date and Time
      const now = new Date();
      // Default to tomorrow at 09:00 AM
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      const defaultDateStr = `${yyyy}-${mm}-${dd}`;

      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const dateInput = document.getElementById('schedDateInput');
      const timeInput = document.getElementById('schedTimeInput');

      if (dateInput) {
        dateInput.min = todayStr;
        if (!dateInput.value) dateInput.value = defaultDateStr;
      }

      if (timeInput && !timeInput.value) {
        timeInput.value = '09:00';
      }

      // Attach live summary listeners
      ['schedDateInput', 'schedTimeInput', 'schedTimezoneSelect', 'schedRecipientEmail', 'schedRecipientPhone'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.oninput = () => WishCreator.updateScheduleSummary();
          el.onchange = () => WishCreator.updateScheduleSummary();
        }
      });

      this.updateScheduleSummary();

      // Show modal
      const modal = document.getElementById('scheduleModal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }

    } catch (err) {
      console.error('Schedule open error:', err);
      showToast(err.message || 'Error preparing schedule', 'error');
      const schedBtn = document.getElementById('scheduleWishBtn');
      if (schedBtn) {
        schedBtn.disabled = false;
        schedBtn.innerHTML = '<span>⏰ Schedule for Later</span>';
      }
    }
  },

  openScheduleModalFromShare() {
    const shareModal = document.getElementById('shareModal');
    if (shareModal) {
      shareModal.classList.add('hidden');
      shareModal.classList.remove('flex');
    }
    this.openScheduleModal();
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
    const phoneHint = document.getElementById('schedPhoneHint');

    if (method === 'email') {
      if (emailGroup) emailGroup.style.display = 'block';
      if (phoneGroup) phoneGroup.style.display = 'none';
    } else {
      if (emailGroup) emailGroup.style.display = 'none';
      if (phoneGroup) phoneGroup.style.display = 'block';
      if (phoneHint) {
        phoneHint.innerText = method === 'sms' 
          ? 'Includes country code (e.g. +91 for India, +1 for US). Automated SMS provider abstraction ready.'
          : 'Includes country code (e.g. +91). Outbound voice call with spoken greeting will be initiated.';
      }
    }

    this.updateScheduleSummary();
  },

  updateScheduleSummary() {
    const summaryEl = document.getElementById('schedConfirmationSummary');
    if (!summaryEl) return;

    const recip = this.createdWish?.recipient_name || this.data.recipient_name || 'Friend';
    const occ = this.createdWish?.occasion || this.data.occasion || 'Celebration';

    const methodRadio = document.querySelector('input[name="schedDeliveryMethod"]:checked');
    const method = methodRadio ? methodRadio.value : 'email';
    const methodLabel = method === 'email' ? 'Email 💌' : (method === 'sms' ? 'SMS 📱' : 'Voice Call 📞');

    const dateVal = document.getElementById('schedDateInput')?.value;
    const timeVal = document.getElementById('schedTimeInput')?.value;
    const tzVal = document.getElementById('schedTimezoneSelect')?.value || 'UTC';

    if (!dateVal || !timeVal) {
      summaryEl.innerText = `Your ${occ} wish for ${recip} will be sent via ${methodLabel} at your chosen date and time.`;
      return;
    }

    try {
      // Format readable date
      const [y, m, d] = dateVal.split('-').map(Number);
      const dateObj = new Date(Date.UTC(y, m - 1, d));
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const readableDate = `${d} ${monthNames[m - 1]} ${y}`;

      // Format readable 12-hour time
      const [h, min] = timeVal.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const readableTime = `${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`;

      // Extract short timezone code
      const tzShort = tzVal.split('/').pop().replace(/_/g, ' ');

      summaryEl.innerText = `Your ${occ} wish for ${recip} will be sent via ${methodLabel} on ${readableDate} at ${readableTime} (${tzShort}).`;
    } catch (e) {
      summaryEl.innerText = `Your ${occ} wish for ${recip} will be sent via ${methodLabel} on ${dateVal} at ${timeVal}.`;
    }
  },

  async confirmSchedule() {
    if (!this.createdWish) {
      showToast('Please wait, saving your greeting...', 'info');
      await this.ensureWishSaved();
    }

    const methodRadio = document.querySelector('input[name="schedDeliveryMethod"]:checked');
    const deliveryMethod = methodRadio ? methodRadio.value : 'email';

    const email = document.getElementById('schedRecipientEmail')?.value.trim();
    const phone = document.getElementById('schedRecipientPhone')?.value.trim();
    const dateVal = document.getElementById('schedDateInput')?.value;
    const timeVal = document.getElementById('schedTimeInput')?.value;
    const tzVal = document.getElementById('schedTimezoneSelect')?.value || 'UTC';
    const personalNote = document.getElementById('schedPersonalMessage')?.value.trim();

    // Validation
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

    // Prevent past scheduling
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
        greeting_id: this.createdWish.slug,
        recipient_name: this.createdWish.recipient_name || this.data.recipient_name,
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
      if (!res.ok) {
        throw new Error(json.message || 'Scheduling failed');
      }

      // Close schedule modal
      this.closeScheduleModal();

      // Populate success confirmation modal
      const sched = json.scheduled_wish;
      document.getElementById('successRecipientName').innerText = sched.recipient_name;
      document.getElementById('successDeliveryChannel').innerText = 
        sched.delivery_method === 'email' ? 'Email 💌' : (sched.delivery_method === 'sms' ? 'SMS 📱' : 'Voice Call 📞');
      document.getElementById('successDeliverTo').innerText = 
        sched.recipient_email || sched.recipient_phone || 'Recipient';

      // Format local time display
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

      document.getElementById('successViewWishLink').href = `/wish/${this.createdWish.slug}`;

      // Show success modal
      const successModal = document.getElementById('scheduleSuccessModal');
      if (successModal) {
        successModal.classList.remove('hidden');
        successModal.classList.add('flex');
      }

      showToast('🎉 Celebration wish scheduled successfully!', 'success');

    } catch (err) {
      console.error('Schedule submission error:', err);
      showToast(err.message || 'Could not schedule greeting', 'error');
    } finally {
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<span>Confirm & Schedule Wish ⏰</span>';
      }
    }
  },

  // Open sharing modal after wish creation
  showShareModal(wish) {
    const modal = document.getElementById('shareModal');
    if (!modal) {
      window.location.href = `/wish/${wish.slug}`;
      return;
    }

    const currentUrl = `${window.location.origin}/wish/${wish.slug}`;

    document.getElementById('shareModalRecipientName').innerText = wish.recipient_name;
    document.getElementById('shareLinkInput').value = currentUrl;
    document.getElementById('viewWishDirectLink').href = `/wish/${wish.slug}`;

    // Setup action button listeners
    document.getElementById('shareWhatsAppBtn').onclick = () => WishShare.openWhatsApp(wish, currentUrl);
    document.getElementById('shareSmsBtn').onclick = () => WishShare.openSMS(wish, currentUrl);
    document.getElementById('shareNativeBtn').onclick = () => WishShare.nativeShare(wish, currentUrl);
    document.getElementById('copyShareLinkBtn').onclick = () => WishShare.copyLink(currentUrl);

    // Setup email dispatch form
    document.getElementById('sendEmailForm').onsubmit = async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('recipientEmailInput');
      const emailBtn = document.getElementById('sendEmailBtn');
      const email = emailInput.value.trim();

      if (!email) return;

      emailBtn.disabled = true;
      emailBtn.innerHTML = `Sending...`;

      try {
        const result = await WishShare.sendEmail({
          wishId: wish.id,
          slug: wish.slug,
          recipientEmail: email,
          senderName: wish.sender_name,
          recipientName: wish.recipient_name,
          occasion: wish.occasion,
          messageExcerpt: wish.message.slice(0, 120) + '...',
          fontFamily: wish.font_family || this.data.font_family || 'Playfair Display'
        });

        if (result.delivered) {
          showToast(`✨ Email sent to ${email}!`, 'success');
        } else {
          showToast(result.message, 'info', 6000);
        }
        emailInput.value = '';
      } catch (err) {
        showToast(err.message || 'Could not send email', 'error');
      } finally {
        emailBtn.disabled = false;
        emailBtn.innerHTML = `Send Email 💌`;
      }
    };

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.WishCreator = WishCreator;

document.addEventListener('DOMContentLoaded', () => {
  WishCreator.init();
});
