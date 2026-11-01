/**
 * Wish Yours — Multi-Step Wish Creation Studio Controller (7-Step Flow)
 * Full reactive data binding, draft autosave, occasion-aware tones,
 * intelligent writing improvement, and robust data persistence.
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
    style: 'Heartfelt',
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
  correctedMemory: null,

  // Fallback tones dictionary by occasion ID
  OCCASION_TONES: {
    birthday: ['Heartfelt', 'Funny & Playful', 'Sweet & Loving', 'Emotional'],
    anniversary: ['Deeply Romantic', 'Devoted & Loyal', 'Sweet & Playful', 'Poetic'],
    sorry: ['Sincere & Apologetic', 'Gentle & Healing', 'Deeply Accountable', 'Humble'],
    thank_you: ['Deeply Grateful', 'Warm & Appreciative', 'Respectful', 'Cheerful & Sweet'],
    congratulations: ['Triumphant & Proud', 'Inspiring', 'Cheerful & Hype', 'Dignified'],
    farewell: ['Bittersweet', 'Nostalgic', 'Inspiring & Hopeful', 'Warm & Connected'],
    sympathy: ['Gentle & Comforting', 'Heartfelt Sympathy', 'Peace & Solace', 'Warm & Supportive'],
    friendship: ['Loyal & Authentic', 'Playful & Crazy', 'Heartfelt', 'Sweet'],
    romantic: ['Deeply Romantic', 'Devoted & Loyal', 'Sweet & Playful', 'Poetic'],
    festival: ['Warm Blessings', 'Joyful & Festive', 'Heartfelt Family Love', 'Peace & Light'],
    good_morning: ['Cheerful & Energizing', 'Warm & Loving', 'Inspirational', 'Gentle'],
    good_night: ['Sweet & Tender', 'Peaceful & Calming', 'Romantic', 'Warm'],
    custom: ['Heartfelt', 'Thoughtful', 'Cheerful', 'Inspiring']
  },

  init() {
    this.bindEvents();
    this.bindFormInputs();
    this.checkUrlPreload();
    this.restoreDraft();
    this.renderDynamicTones();
    this.updateStepView();
    this.updateStickySummary();
    this.updateLivePreview();
  },

  // 1. Two-Way Data Binding for ALL Form Inputs
  bindFormInputs() {
    const bindField = (id, prop) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = (e) => {
        this.data[prop] = e.target.value.trim();
        this.persistDraft();
        this.updateStickySummary();
        this.updateLivePreview();
      };
      el.addEventListener('input', handler);
      el.addEventListener('change', handler);
    };

    bindField('recipientNameInput', 'recipient_name');
    bindField('senderNameInput', 'sender_name');
    bindField('genderSelect', 'recipient_gender');
    bindField('ageInput', 'age');
    bindField('annivYearsInput', 'anniversary_years');
    bindField('durationInput', 'relationship_duration');
    bindField('memoriesInput', 'memories');
    bindField('finalMessageInput', 'message');
  },

  // Save all DOM input values into this.data synchronously
  saveAllInputs() {
    const getVal = (id) => document.getElementById(id)?.value?.trim() || '';

    const rec = getVal('recipientNameInput');
    if (rec) this.data.recipient_name = rec;

    const sender = getVal('senderNameInput');
    if (sender) this.data.sender_name = sender;

    const gender = document.getElementById('genderSelect')?.value;
    if (gender) this.data.recipient_gender = gender;

    const age = getVal('ageInput');
    if (age) this.data.age = age;

    const anniv = getVal('annivYearsInput');
    if (anniv) this.data.anniversary_years = anniv;

    const dur = getVal('durationInput');
    if (dur) this.data.relationship_duration = dur;

    const mem = getVal('memoriesInput');
    if (mem) this.data.memories = mem;

    const msg = getVal('finalMessageInput');
    if (msg) this.data.message = msg;

    this.persistDraft();
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

  // Draft Autosave to localStorage
  persistDraft() {
    try {
      localStorage.setItem('wishcraft_draft_v3', JSON.stringify(this.data));
    } catch (e) {
      // Ignore quota/private mode errors
    }
  },

  // Restore draft from localStorage
  restoreDraft() {
    try {
      const saved = localStorage.getItem('wishcraft_draft_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.data = { ...this.data, ...parsed };

        // Restore DOM inputs
        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el && val !== undefined) el.value = val;
        };

        setVal('recipientNameInput', this.data.recipient_name);
        setVal('senderNameInput', this.data.sender_name);
        setVal('genderSelect', this.data.recipient_gender);
        setVal('ageInput', this.data.age);
        setVal('annivYearsInput', this.data.anniversary_years);
        setVal('durationInput', this.data.relationship_duration);
        setVal('memoriesInput', this.data.memories);
        setVal('finalMessageInput', this.data.message);

        // Highlight active occasion
        document.querySelectorAll('.occasion-btn').forEach(btn => {
          if (btn.dataset.occasion === this.data.occasion) {
            btn.classList.add('ring-4', 'ring-pink-500', 'bg-slate-800');
            btn.classList.remove('bg-slate-900');
          } else {
            btn.classList.remove('ring-4', 'ring-pink-500', 'bg-slate-800');
            btn.classList.add('bg-slate-900');
          }
        });

        // Highlight active relationship
        document.querySelectorAll('.relationship-btn').forEach(btn => {
          if (btn.dataset.relationship === this.data.relationship) {
            btn.classList.add('ring-4', 'ring-purple-500', 'bg-slate-800');
            btn.classList.remove('bg-slate-900');
          } else {
            btn.classList.remove('ring-4', 'ring-purple-500', 'bg-slate-800');
            btn.classList.add('bg-slate-900');
          }
        });

        // Highlight language
        document.querySelectorAll('.language-card').forEach(btn => {
          if (btn.dataset.language === this.data.language) {
            btn.classList.add('ring-4', 'ring-emerald-500', 'bg-slate-800');
            btn.classList.remove('bg-slate-900');
          } else {
            btn.classList.remove('ring-4', 'ring-emerald-500', 'bg-slate-800');
            btn.classList.add('bg-slate-900');
          }
        });

        // Highlight length
        document.querySelectorAll('.length-btn').forEach(btn => {
          if (btn.dataset.length === this.data.length) {
            btn.classList.add('ring-4', 'ring-pink-500', 'bg-slate-800');
            btn.classList.remove('bg-slate-900');
          } else {
            btn.classList.remove('ring-4', 'ring-pink-500', 'bg-slate-800');
            btn.classList.add('bg-slate-900');
          }
        });

        // Highlight font
        this.setFontFamily(this.data.font_family);

        // Highlight theme
        document.querySelectorAll('.theme-btn').forEach(btn => {
          if (btn.dataset.theme === this.data.theme) {
            btn.classList.add('ring-4', 'ring-pink-500');
          } else {
            btn.classList.remove('ring-4', 'ring-pink-500');
          }
        });
      }
    } catch (e) {
      console.warn('Could not restore draft:', e);
    }
  },

  clearDraftAndReset() {
    if (!confirm('Are you sure you want to reset your wish draft? All entered fields will be cleared.')) return;
    try {
      localStorage.removeItem('wishcraft_draft_v3');
    } catch (e) {}

    this.data = {
      occasion: 'Birthday',
      relationship: 'Best Friend',
      recipient_name: '',
      sender_name: '',
      recipient_gender: 'female',
      memories: '',
      relationship_duration: '',
      age: '',
      anniversary_years: '',
      style: 'Heartfelt',
      font_family: 'Playfair Display',
      theme: 'birthday_celebration',
      language: 'en',
      length: 'medium',
      message: '',
      images: [],
      music_track: 'birthday_celebration',
      is_public: true
    };

    ['recipientNameInput', 'senderNameInput', 'ageInput', 'annivYearsInput', 'durationInput', 'memoriesInput', 'finalMessageInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    this.goToStep(1);
    this.renderDynamicTones();
    this.updateStickySummary();
    this.updateLivePreview();
    if (typeof showToast === 'function') showToast('Draft cleared! Starting fresh.', 'info');
  },

  bindEvents() {
    // Step 1: Occasion selector
    document.querySelectorAll('.occasion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.occasion;
        this.data.occasion = val;
        document.querySelectorAll('.occasion-btn').forEach(b => {
          b.classList.remove('ring-4', 'ring-pink-500', 'bg-slate-800');
          b.classList.add('bg-slate-900');
        });
        btn.classList.add('ring-4', 'ring-pink-500', 'bg-slate-800');
        btn.classList.remove('bg-slate-900');
        this.adjustContextualFields();
        this.renderDynamicTones();
        this.persistDraft();
        this.updateStickySummary();
        this.updateLivePreview();
      });
    });

    // Step 2: Relationship selector
    document.querySelectorAll('.relationship-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.data.relationship = btn.dataset.relationship;
        document.querySelectorAll('.relationship-btn').forEach(b => {
          b.classList.remove('ring-4', 'ring-purple-500', 'bg-slate-800');
          b.classList.add('bg-slate-900');
        });
        btn.classList.add('ring-4', 'ring-purple-500', 'bg-slate-800');
        btn.classList.remove('bg-slate-900');
        this.persistDraft();
        this.updateStickySummary();
        this.updateLivePreview();
      });
    });

    // Step 5: Language selector
    document.querySelectorAll('.language-card').forEach(card => {
      card.addEventListener('click', () => {
        this.data.language = card.dataset.language;
        document.querySelectorAll('.language-card').forEach(c => {
          c.classList.remove('ring-4', 'ring-emerald-500', 'bg-slate-800');
          c.classList.add('bg-slate-900');
        });
        card.classList.add('ring-4', 'ring-emerald-500', 'bg-slate-800');
        card.classList.remove('bg-slate-900');
        this.persistDraft();
        this.updateStickySummary();
      });
    });

    // Step 5: Length selector
    document.querySelectorAll('.length-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.data.length = btn.dataset.length;
        document.querySelectorAll('.length-btn').forEach(b => {
          b.classList.remove('ring-4', 'ring-pink-500', 'bg-slate-800');
          b.classList.add('bg-slate-900');
        });
        btn.classList.add('ring-4', 'ring-pink-500', 'bg-slate-800');
        btn.classList.remove('bg-slate-900');
        this.persistDraft();
      });
    });

    // Step 6: Font selector
    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setFontFamily(btn.dataset.font);
      });
    });

    // Step 6: Theme selector
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.data.theme = btn.dataset.theme;
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('ring-4', 'ring-pink-500'));
        btn.classList.add('ring-4', 'ring-pink-500');
        this.persistDraft();
      });
    });

    // Step 6: Photo file input listener
    const photoInput = document.getElementById('photoUploadInput');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
    }
  },

  // 2. Dynamic Occasion-Aware Tone Rendering for Step 4
  renderDynamicTones() {
    const container = document.getElementById('dynamicTonesContainer');
    if (!container) return;

    // Resolve occasion ID
    const occMeta = typeof OccasionManager !== 'undefined' ? OccasionManager.resolve(this.data.occasion) : null;
    const occId = occMeta?.id || 'birthday';
    const tones = occMeta?.tones || this.OCCASION_TONES[occId] || this.OCCASION_TONES.custom;

    // Default tone emojis
    const toneEmojis = {
      'Heartfelt': '💖',
      'Funny & Playful': '😂',
      'Sweet & Loving': '🥰',
      'Emotional': '🥺',
      'Deeply Romantic': '🌹',
      'Devoted & Loyal': '💍',
      'Sweet & Playful': '✨',
      'Poetic': '📜',
      'Sincere & Apologetic': '🕊️',
      'Gentle & Healing': '🌿',
      'Deeply Accountable': '🤝',
      'Humble': '🙏',
      'Deeply Grateful': '🙏',
      'Warm & Appreciative': '🌸',
      'Respectful': '👔',
      'Cheerful & Sweet': '🌻',
      'Triumphant & Proud': '🏆',
      'Inspiring': '⭐',
      'Cheerful & Hype': '🎉',
      'Dignified': '👑',
      'Bittersweet': '🌅',
      'Nostalgic': '📻',
      'Inspiring & Hopeful': '🚀',
      'Warm & Connected': '🤝',
      'Warm Blessings': '🪔',
      'Joyful & Festive': '🎆',
      'Heartfelt Family Love': '🏡',
      'Peace & Light': '✨',
      'Loyal & Authentic': '⚡',
      'Playful & Crazy': '🥳',
      'Sweet': '🍬',
      'Gentle & Comforting': '🕊️',
      'Heartfelt Sympathy': '🕯️',
      'Peace & Solace': '🌿',
      'Warm & Supportive': '🤝',
      'Thoughtful': '💡',
      'Cheerful': '☀️'
    };

    // If current style is not in available tones, default to the first one
    if (!tones.includes(this.data.style)) {
      this.data.style = tones[0];
    }

    container.innerHTML = tones.map(tone => {
      const isSelected = tone === this.data.style;
      const emoji = toneEmojis[tone] || '✨';
      const activeClasses = isSelected ? 'ring-4 ring-indigo-500 bg-slate-800' : 'bg-slate-900';
      return `
        <button type="button" data-tone="${tone}" class="tone-btn p-4 rounded-2xl border border-slate-700 text-center transition flex flex-col items-center justify-center gap-2 h-24 hover:border-indigo-400 ${activeClasses}">
          <span class="text-2xl">${emoji}</span>
          <span class="font-bold text-xs text-white">${tone}</span>
        </button>
      `;
    }).join('');

    // Bind click events on dynamic tone buttons
    container.querySelectorAll('.tone-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedTone = btn.dataset.tone;
        this.data.style = selectedTone;
        container.querySelectorAll('.tone-btn').forEach(b => {
          b.classList.remove('ring-4', 'ring-indigo-500', 'bg-slate-800');
          b.classList.add('bg-slate-900');
        });
        btn.classList.add('ring-4', 'ring-indigo-500', 'bg-slate-800');
        btn.classList.remove('bg-slate-900');
        this.persistDraft();
        this.updateStickySummary();
      });
    });

    // Update Step 4 subtitle
    const sub = document.getElementById('step4Subtitle');
    if (sub) {
      if (occMeta && !occMeta.isCelebration) {
        sub.innerText = 'Choose the emotional resonance for your sincere note.';
      } else {
        sub.innerText = 'How do you want your loved one to feel?';
      }
    }
  },

  // Adjust numeric fields based on occasion
  adjustContextualFields() {
    const occ = this.data.occasion.toLowerCase();
    const ageWrapper = document.getElementById('ageFieldWrapper');
    const annivWrapper = document.getElementById('annivFieldWrapper');

    if (ageWrapper) {
      ageWrapper.style.display = occ.includes('birth') ? 'block' : 'none';
    }
    if (annivWrapper) {
      annivWrapper.style.display = occ.includes('anniv') ? 'block' : 'none';
    }
  },

  // Set font family and update UI badges
  setFontFamily(fontName) {
    if (!fontName) return;
    this.data.font_family = fontName;

    document.querySelectorAll('.font-btn').forEach(btn => {
      if (btn.dataset.font === fontName) {
        btn.classList.add('ring-4', 'ring-pink-500', 'bg-slate-800');
        btn.classList.remove('bg-slate-900');
      } else {
        btn.classList.remove('ring-4', 'ring-pink-500', 'bg-slate-800');
        btn.classList.add('bg-slate-900');
      }
    });

    const badge = document.getElementById('selectedFontBadge');
    if (badge) badge.innerText = fontName;

    const dropdown = document.getElementById('step6FontSelector');
    if (dropdown && dropdown.value !== fontName) {
      dropdown.value = fontName;
    }

    const messageInput = document.getElementById('finalMessageInput');
    if (messageInput) {
      messageInput.style.fontFamily = this.getFontStack(fontName);
    }

    this.persistDraft();
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

  // Update Compact Live Sticky Summary Bar
  updateStickySummary() {
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.innerText = txt;
    };

    setTxt('sumValOccasion', this.data.occasion || 'Birthday');
    setTxt('sumValRelationship', this.data.relationship || 'Best Friend');
    setTxt('sumValRecipient', this.data.recipient_name || 'Friend');
    setTxt('sumValSender', this.data.sender_name || 'You');
    setTxt('sumValTone', this.data.style || 'Heartfelt');

    const langLabels = { en: 'English', hi: 'हिंदी', hinglish: 'Hinglish' };
    setTxt('sumValLanguage', langLabels[this.data.language] || 'English');
  },

  // 3. Update Live Interactive Webpage Preview
  updateLivePreview() {
    const recEl = document.getElementById('previewRecipientName');
    const senderEl = document.getElementById('previewSenderName');
    const badgeEl = document.getElementById('previewOccasionBadge');
    const messageEl = document.getElementById('previewMessageText');
    const memoriesBlock = document.getElementById('previewMemoriesBlock');
    const memoriesText = document.getElementById('previewMemoriesText');

    const occMeta = typeof OccasionManager !== 'undefined' ? OccasionManager.resolve(this.data.occasion) : null;
    const recipient = this.data.recipient_name || 'Friend';
    const sender = this.data.sender_name || 'Someone special';

    if (recEl) recEl.innerText = recipient;

    if (senderEl) {
      if (typeof WishAttribution !== 'undefined' && WishAttribution.isMdRazaSender(sender)) {
        senderEl.innerText = WishAttribution.getSenderSignatureInline(sender, this.data.relationship);
      } else {
        const prefix = occMeta?.senderPrefix || 'With love from';
        senderEl.innerText = `${prefix} ${sender}`;
      }
    }

    if (badgeEl) {
      badgeEl.innerText = occMeta?.cardBadge || `${this.data.occasion || 'Celebration'}`;
      if (occMeta && !occMeta.isCelebration) {
        badgeEl.className = 'text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60';
      } else {
        badgeEl.className = 'text-xs px-2.5 py-0.5 rounded-full bg-pink-900 bg-opacity-40 text-pink-300 border border-pink-700';
      }
    }

    if (messageEl) {
      messageEl.innerText = this.data.message || (occMeta && !occMeta.isCelebration 
        ? 'Select or write a thoughtful note above to preview it here...' 
        : 'Select or write a greeting message above to preview it here...');
      messageEl.style.fontFamily = this.getFontStack(this.data.font_family);
    }

    // Display personal memory section if provided
    if (memoriesBlock && memoriesText) {
      if (this.data.memories && this.data.memories.trim()) {
        memoriesText.innerText = this.data.memories.trim();
        memoriesBlock.style.display = 'block';
      } else {
        memoriesBlock.style.display = 'none';
      }
    }
  },

  // 4. Writing Improvement Engine with Side-by-Side Comparison
  async improveMemoryWriting() {
    this.saveAllInputs();
    const rawText = this.data.memories;
    if (!rawText || rawText.trim().length < 3) {
      if (typeof showToast === 'function') showToast('Please enter a memory or personal note first to improve.', 'info');
      document.getElementById('memoriesInput')?.focus();
      return;
    }

    const btn = document.getElementById('polishMemoryBtn');
    const spinner = document.getElementById('polishMemorySpinner');
    if (btn) btn.disabled = true;
    if (spinner) spinner.classList.remove('hidden');

    try {
      const res = await fetch('/api/correct-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawText,
          context: {
            occasion: this.data.occasion,
            relationship: this.data.relationship,
            recipientName: this.data.recipient_name,
            language: this.data.language
          }
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not improve writing');

      if (json.improved) {
        this.correctedMemory = json.improved;
        const diffBox = document.getElementById('memoryComparisonBox');
        const diffOrig = document.getElementById('memoryDiffOriginal');
        const diffImp = document.getElementById('memoryDiffImproved');
        const badge = document.getElementById('memoryExplanationBadge');

        if (diffOrig) diffOrig.innerText = json.original || rawText;
        if (diffImp) diffImp.innerText = json.improved;
        if (badge) badge.innerText = json.explanation || 'Cleaned grammar and typos while preserving your voice';
        if (diffBox) diffBox.classList.remove('hidden');

        if (typeof showToast === 'function') {
          showToast('✨ Writing improved! Review comparison below.', 'success');
        }
      }
    } catch (err) {
      console.error('Improve text error:', err);
      if (typeof showToast === 'function') showToast('Could not improve writing right now. Your text is safe!', 'error');
    } finally {
      if (btn) btn.disabled = false;
      if (spinner) spinner.classList.add('hidden');
    }
  },

  applyImprovedMemory() {
    if (!this.correctedMemory) return;
    this.data.memories = this.correctedMemory;
    const input = document.getElementById('memoriesInput');
    if (input) input.value = this.correctedMemory;

    const diffBox = document.getElementById('memoryComparisonBox');
    if (diffBox) diffBox.classList.add('hidden');

    this.persistDraft();
    this.updateLivePreview();
    if (typeof showToast === 'function') showToast('Improved version applied! ✓', 'success');
  },

  keepOriginalMemory() {
    const diffBox = document.getElementById('memoryComparisonBox');
    if (diffBox) diffBox.classList.add('hidden');
    if (typeof showToast === 'function') showToast('Kept your original text.', 'info');
  },

  // Polish final generated message in Step 7
  async polishFinalMessage() {
    this.saveAllInputs();
    const raw = this.data.message;
    if (!raw || raw.trim().length < 5) {
      if (typeof showToast === 'function') showToast('Please enter a message to polish.', 'info');
      return;
    }

    try {
      const res = await fetch('/api/correct-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: raw,
          context: {
            occasion: this.data.occasion,
            relationship: this.data.relationship,
            recipientName: this.data.recipient_name,
            language: this.data.language
          }
        })
      });

      const json = await res.json();
      if (json.improved) {
        this.data.message = json.improved;
        const msgInput = document.getElementById('finalMessageInput');
        if (msgInput) msgInput.value = json.improved;
        this.updateLivePreview();
        if (typeof showToast === 'function') showToast('✨ Message polished!', 'success');
      }
    } catch (e) {
      if (typeof showToast === 'function') showToast('Could not polish text.', 'error');
    }
  },

  // 5. Multi-Stage AI Generation
  async generateAIWishes() {
    this.saveAllInputs();

    if (!this.data.recipient_name || !this.data.recipient_name.trim()) {
      if (typeof showToast === 'function') showToast("Please enter the recipient's name in Step 3 first.", 'error');
      this.goToStep(3);
      document.getElementById('recipientNameInput')?.focus();
      return;
    }

    const loadBox = document.getElementById('aiLoadingState');
    const resultsBox = document.getElementById('aiResultsContainer');
    const triggerBtn = document.getElementById('triggerGenerateBtn');
    const titleEl = document.getElementById('aiProgressTitle');
    const subEl = document.getElementById('aiProgressSubtitle');
    const barEl = document.getElementById('aiProgressBar');

    if (loadBox) loadBox.style.display = 'block';
    if (resultsBox) resultsBox.style.display = 'none';
    if (triggerBtn) {
      triggerBtn.disabled = true;
      triggerBtn.classList.add('opacity-50');
    }

    // Animated multi-stage progress
    if (titleEl) titleEl.innerText = 'Stage 1 of 3: Analyzing personal context...';
    if (subEl) subEl.innerText = `Weaving ${this.data.recipient_name}'s memories and ${this.data.relationship} relationship...`;
    if (barEl) barEl.style.width = '33%';

    const stageTimer1 = setTimeout(() => {
      if (titleEl) titleEl.innerText = 'Stage 2 of 3: Gemini AI synthesizing message...';
      if (subEl) subEl.innerText = `Drafting emotionally resonant ${this.data.style} variations in ${this.data.language}...`;
      if (barEl) barEl.style.width = '66%';
    }, 900);

    const stageTimer2 = setTimeout(() => {
      if (titleEl) titleEl.innerText = 'Stage 3 of 3: Perfecting interactive greeting...';
      if (subEl) subEl.innerText = 'Applying typography, ambient soundscapes, and visual theme...';
      if (barEl) barEl.style.width = '95%';
    }, 1800);

    try {
      const payload = {
        occasion: this.data.occasion,
        relationship: this.data.relationship,
        recipient_name: this.data.recipient_name,
        sender_name: this.data.sender_name,
        recipient_gender: this.data.recipient_gender,
        age: this.data.age,
        anniversary_years: this.data.anniversary_years,
        relationship_duration: this.data.relationship_duration,
        memories: this.data.memories,
        style: this.data.style,
        language: this.data.language,
        length: this.data.length
      };

      const res = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      if (!res.ok) throw new Error(json.message || 'Generation failed');

      this.aiVariations = json.variations || [];
      this.renderVariationsList();

      // Automatically select the first variation
      if (this.aiVariations.length > 0) {
        this.selectVariation(0);
      }

      if (resultsBox) resultsBox.style.display = 'block';
      if (typeof showToast === 'function') showToast('✨ Generated 3 custom variations!', 'success');

    } catch (err) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      console.error('Generation error:', err);
      if (typeof showToast === 'function') showToast(err.message || 'Failed to generate messages.', 'error');
    } finally {
      if (loadBox) loadBox.style.display = 'none';
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.classList.remove('opacity-50');
      }
    }
  },

  renderVariationsList() {
    const list = document.getElementById('variationsList');
    if (!list) return;

    list.innerHTML = this.aiVariations.map((v, idx) => {
      const isSelected = idx === this.selectedVariationIndex;
      const borderClass = isSelected ? 'border-pink-500 ring-2 ring-pink-500 bg-pink-950/30' : 'border-slate-700 bg-slate-900 hover:border-slate-500';
      return `
        <div onclick="WishCreator.selectVariation(${idx})" class="variation-card p-4 rounded-xl border transition cursor-pointer ${borderClass}">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-pink-300 border border-slate-700">Option ${idx + 1}: ${v.tone || this.data.style}</span>
            <span class="text-xs text-gray-400 font-semibold">${isSelected ? 'Selected ✓' : 'Click to Use'}</span>
          </div>
          <p class="text-sm text-gray-200 leading-relaxed font-playfair whitespace-pre-line">${v.text}</p>
        </div>
      `;
    }).join('');
  },

  selectVariation(index) {
    this.selectedVariationIndex = index;
    const selected = this.aiVariations[index];
    if (!selected) return;

    let varText = selected.text;

    // Special MD RAZA developer relationship-aware signature handling
    if (typeof WishAttribution !== 'undefined' && WishAttribution.isMdRazaSender(this.data.sender_name)) {
      const sig = WishAttribution.getSenderSignatureInline(this.data.sender_name, this.data.relationship);
      if (!varText.includes(sig)) {
        varText = varText.replace(/—\s*(?:with love,\s*)?(?:your\s+[\w\s]+,\s*)?md\s+raza\s*$/i, `— ${sig}`);
      }
    }

    this.data.message = varText;

    // Update active highlight on variation cards
    document.querySelectorAll('.variation-card').forEach((c, idx) => {
      if (idx === index) {
        c.className = 'variation-card p-4 rounded-xl border transition cursor-pointer bg-pink-950/30 border-pink-500 ring-2 ring-pink-500';
      } else {
        c.className = 'variation-card p-4 rounded-xl border transition cursor-pointer bg-slate-900 border-slate-700 hover:border-slate-500';
      }
    });

    // Populate active editable textarea
    const messageInput = document.getElementById('finalMessageInput');
    if (messageInput) {
      messageInput.value = varText;
    }

    this.persistDraft();
    this.updateLivePreview();
  },

  // 6. Navigation Between 7 Steps
  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > 7) return;

    // Save inputs before moving away from current step
    this.saveAllInputs();

    // Validation before moving past Step 3
    if (stepNumber > 3 && this.currentStep <= 3) {
      if (!this.data.recipient_name || !this.data.recipient_name.trim()) {
        if (typeof showToast === 'function') showToast("Please enter the recipient's name to continue.", 'error');
        document.getElementById('recipientNameInput')?.focus();
        return;
      }
    }

    this.currentStep = stepNumber;
    this.updateStepView();
    this.updateStickySummary();
    this.updateLivePreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  nextStep() {
    this.goToStep(this.currentStep + 1);
  },

  prevStep() {
    this.goToStep(this.currentStep - 1);
  },

  updateStepView() {
    // Show active section, hide others
    for (let i = 1; i <= 7; i++) {
      const section = document.getElementById(`stepSection${i}`);
      if (section) {
        section.style.display = i === this.currentStep ? 'block' : 'none';
      }

      const indicator = document.getElementById(`stepIndicator${i}`);
      if (indicator) {
        if (i === this.currentStep) {
          indicator.className = 'w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow ring-4 ring-pink-500/20';
        } else if (i < this.currentStep) {
          indicator.className = 'w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs';
          indicator.innerHTML = '✓';
        } else {
          indicator.className = 'w-8 h-8 rounded-full bg-slate-800 text-gray-400 flex items-center justify-center font-bold text-xs';
          indicator.innerHTML = `${i}`;
        }
      }
    }

    // Step 7 auto-generate trigger if message is still empty
    if (this.currentStep === 7 && !this.data.message && this.aiVariations.length === 0) {
      this.generateAIWishes();
    }
  },

  // 7. Photo Uploads (up to 6)
  handlePhotoUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const remainingSlots = 6 - (this.data.images?.length || 0);
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!this.data.images) this.data.images = [];
        this.data.images.push(e.target.result);
        this.renderPhotoReel();
        this.persistDraft();
      };
      reader.readAsDataURL(file);
    });
  },

  renderPhotoReel() {
    const reel = document.getElementById('photoPreviewReel');
    if (!reel) return;

    reel.innerHTML = (this.data.images || []).map((img, idx) => `
      <div class="relative group rounded-xl overflow-hidden aspect-square border border-slate-700 shadow">
        <img src="${img}" class="w-full h-full object-cover">
        <button type="button" onclick="WishCreator.removePhoto(${idx})" class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
      </div>
    `).join('');
  },

  removePhoto(index) {
    if (this.data.images) {
      this.data.images.splice(index, 1);
      this.renderPhotoReel();
      this.persistDraft();
    }
  },

  // 8. Publish & Send Now
  async publishGreeting() {
    this.saveAllInputs();

    if (!this.data.message || !this.data.message.trim()) {
      if (typeof showToast === 'function') showToast('Please enter or select a greeting message.', 'error');
      return;
    }

    const publishBtn = document.getElementById('publishGreetingBtn');
    if (publishBtn) {
      publishBtn.disabled = true;
      publishBtn.innerHTML = '<span>⏳ Publishing Greeting...</span>';
    }

    try {
      const user = typeof AuthManager !== 'undefined' ? AuthManager.getUser() : null;

      const payload = {
        ...this.data,
        sender_id: user?.id || null
      };

      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Creation failed');

      this.createdWish = json.wish;
      if (typeof showToast === 'function') showToast('🎉 Your greeting is live!', 'success');

      // Clear draft after successful creation
      try { localStorage.removeItem('wishcraft_draft_v3'); } catch (e) {}

      // Open Share modal or redirect
      this.showShareModal(json.wish);

    } catch (err) {
      console.error('Publish error:', err);
      if (typeof showToast === 'function') showToast(err.message || 'Could not create greeting', 'error');
    } finally {
      if (publishBtn) {
        publishBtn.disabled = false;
        publishBtn.innerHTML = '<span>Send Now 🚀</span>';
      }
    }
  },

  showShareModal(wish) {
    const modal = document.getElementById('shareModal');
    if (!modal) {
      window.location.href = `/wish/${wish.slug}`;
      return;
    }

    const currentUrl = `${window.location.origin}/wish/${wish.slug}`;
    document.getElementById('shareModalRecipientName').innerText = wish.recipient_name;
    document.getElementById('shareUrlText').innerText = currentUrl;
    document.getElementById('viewLiveWishBtn').href = `/wish/${wish.slug}`;

    // Email dispatch inside modal
    const emailForm = document.getElementById('sendEmailForm');
    if (emailForm) {
      emailForm.onsubmit = async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('recipientEmailInput');
        const emailBtn = document.getElementById('sendEmailBtn');
        const email = emailInput.value.trim();

        if (!email) return;
        emailBtn.disabled = true;
        emailBtn.innerText = 'Sending...';

        try {
          const res = await fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wishId: wish.id,
              slug: wish.slug,
              recipientEmail: email,
              senderName: wish.sender_name,
              recipientName: wish.recipient_name,
              occasion: wish.occasion,
              messageExcerpt: wish.message.slice(0, 120) + '...',
              fontFamily: wish.font_family || 'Playfair Display'
            })
          });

          const resJson = await res.json();
          if (resJson.status === 'success' || resJson.delivered) {
            if (typeof showToast === 'function') showToast(`✨ Email sent to ${email}!`, 'success');
            document.getElementById('emailStatusMsg').innerText = `Sent successfully to ${email}`;
          } else {
            if (typeof showToast === 'function') showToast(resJson.message || 'Email dispatched.', 'info');
          }
          emailInput.value = '';
        } catch (err) {
          if (typeof showToast === 'function') showToast('Could not send email.', 'error');
        } finally {
          emailBtn.disabled = false;
          emailBtn.innerText = 'Send Email';
        }
      };
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  copyShareLink() {
    if (!this.createdWish) return;
    const url = `${window.location.origin}/wish/${this.createdWish.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      if (typeof showToast === 'function') showToast('Link copied to clipboard! 📋', 'success');
    }).catch(() => {
      prompt('Copy your greeting link:', url);
    });
  },

  shareToWhatsApp() {
    if (!this.createdWish) return;
    const url = `${window.location.origin}/wish/${this.createdWish.slug}`;
    const text = encodeURIComponent(`✨ I created a personalized ${this.createdWish.occasion || 'greeting'} for you: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  },

  shareViaSMS() {
    if (!this.createdWish) return;
    const url = `${window.location.origin}/wish/${this.createdWish.slug}`;
    const text = encodeURIComponent(`✨ Here is a personalized celebration webpage I made for you: ${url}`);
    window.location.href = `sms:?&body=${text}`;
  },

  // 9. Schedule for Later
  async openScheduleModal() {
    this.saveAllInputs();

    if (!this.data.message || !this.data.message.trim()) {
      if (typeof showToast === 'function') showToast('Please select or write a message first.', 'error');
      return;
    }

    try {
      // Ensure wish exists
      if (!this.createdWish) {
        const user = typeof AuthManager !== 'undefined' ? AuthManager.getUser() : null;
        const res = await fetch('/api/wishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...this.data, sender_id: user?.id || null })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Could not save greeting');
        this.createdWish = json.wish;
      }

      // Populate schedule modal defaults
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');

      const dateEl = document.getElementById('schedDeliveryDate');
      const timeEl = document.getElementById('schedDeliveryTime');
      if (dateEl && !dateEl.value) dateEl.value = `${yyyy}-${mm}-${dd}`;
      if (timeEl && !timeEl.value) timeEl.value = '09:00';

      this.updateScheduleSummary();

      const modal = document.getElementById('scheduleWishModal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    } catch (e) {
      if (typeof showToast === 'function') showToast(e.message || 'Could not prepare schedule', 'error');
    }
  },

  closeScheduleModal() {
    const modal = document.getElementById('scheduleWishModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  toggleScheduleFields() {
    const channel = document.querySelector('input[name="schedChannel"]:checked')?.value || 'email';
    const emailWrapper = document.getElementById('schedEmailWrapper');
    const phoneWrapper = document.getElementById('schedPhoneWrapper');

    if (channel === 'email') {
      if (emailWrapper) emailWrapper.style.display = 'block';
      if (phoneWrapper) phoneWrapper.style.display = 'none';
    } else {
      if (emailWrapper) emailWrapper.style.display = 'none';
      if (phoneWrapper) phoneWrapper.style.display = 'block';
    }
    this.updateScheduleSummary();
  },

  updateScheduleSummary() {
    const sumEl = document.getElementById('schedConfirmationSummary');
    if (!sumEl) return;

    const channel = document.querySelector('input[name="schedChannel"]:checked')?.value || 'email';
    const dateVal = document.getElementById('schedDeliveryDate')?.value;
    const timeVal = document.getElementById('schedDeliveryTime')?.value;
    const tzVal = document.getElementById('schedTimezoneSelect')?.value || 'UTC';
    const recip = this.data.recipient_name || 'Friend';

    if (!dateVal || !timeVal) {
      sumEl.innerText = `Your wish for ${recip} will be dispatched via ${channel.toUpperCase()} at your scheduled time.`;
      return;
    }

    sumEl.innerText = `Your ${this.data.occasion} wish for ${recip} will be automatically sent via ${channel.toUpperCase()} on ${dateVal} at ${timeVal} (${tzVal}).`;
  },

  async submitScheduledWish(event) {
    if (event) event.preventDefault();
    if (!this.createdWish) return;

    const channel = document.querySelector('input[name="schedChannel"]:checked')?.value || 'email';
    const email = document.getElementById('schedRecipientEmail')?.value.trim();
    const phone = document.getElementById('schedRecipientPhone')?.value.trim();
    const dateVal = document.getElementById('schedDeliveryDate')?.value;
    const timeVal = document.getElementById('schedDeliveryTime')?.value;
    const tzVal = document.getElementById('schedTimezoneSelect')?.value || 'UTC';
    const personalNote = document.getElementById('schedPersonalMessage')?.value.trim();

    if (channel === 'email') {
      if (!email || !/^[^s@]+@[^s@]+.[^s@]+$/.test(email)) {
        if (typeof showToast === 'function') showToast('Please enter a valid recipient email address.', 'error');
        return;
      }
    } else {
      if (!phone || phone.length < 7) {
        if (typeof showToast === 'function') showToast('Please enter a valid recipient phone number.', 'error');
        return;
      }
    }

    const scheduledAtUtc = new Date(`${dateVal}T${timeVal}`).toISOString();

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
        recipient_email: channel === 'email' ? email : undefined,
        recipient_phone: channel !== 'email' ? phone : undefined,
        delivery_method: channel,
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

      // Show success modal
      const sched = json.scheduled_wish;
      document.getElementById('successRecipientName').innerText = sched.recipient_name;
      document.getElementById('successDeliveryChannel').innerText = sched.delivery_method === 'email' ? 'Email 💌' : 'SMS 📱';
      document.getElementById('successDeliverTo').innerText = sched.recipient_email || sched.recipient_phone || 'Recipient';
      document.getElementById('successScheduledTime').innerText = `${dateVal} ${timeVal} (${tzVal})`;
      document.getElementById('successViewWishLink').href = `/wish/${this.createdWish.slug}`;

      const successModal = document.getElementById('scheduleSuccessModal');
      if (successModal) {
        successModal.classList.remove('hidden');
        successModal.classList.add('flex');
      }

      if (typeof showToast === 'function') showToast('🎉 Wish scheduled successfully!', 'success');

    } catch (err) {
      console.error('Schedule submission error:', err);
      if (typeof showToast === 'function') showToast(err.message || 'Could not schedule wish', 'error');
    } finally {
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<span>Confirm & Schedule Wish ⏰</span>';
      }
    }
  }
};

window.WishCreator = WishCreator;

document.addEventListener('DOMContentLoaded', () => {
  WishCreator.init();
});
