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
    if (this.currentStep === 6 && !this.data.message) {
      this.generateAIWishes();
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

      showToast('🎉 Your celebration greeting is live!', 'success');
      this.showShareModal(json.wish);

    } catch (err) {
      console.error('Publish error:', err);
      showToast(err.message || 'Could not create greeting', 'error');
      if (publishBtn) {
        publishBtn.disabled = false;
        publishBtn.innerHTML = `Generate & Share Greeting ✨`;
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
