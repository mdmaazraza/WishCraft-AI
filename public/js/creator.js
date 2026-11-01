/**
 * Wish Yours — Multi-Step Wish Creation Studio Controller (7-Step Wizard)
 * Single Canonical Source of Truth (WishCreator.draft), Reactive Two-Way Data Binding,
 * Occasion-Aware Copy & Negative Constraints, Live Draft Summary, and Instant Live Preview.
 */

const WishCreator = {
  currentStep: 1,

  // 1. SINGLE CANONICAL SOURCE OF TRUTH
  draft: {
    occasion: 'Birthday',
    relationship: 'Best Friend',
    recipientName: '',
    senderName: '',
    recipientGender: 'unspecified',
    age: '',
    anniversaryYears: '',
    relationshipDuration: '',
    memory: '',
    originalMemory: '',
    improvedMemory: '',
    emotion: 'Heartfelt',
    emotionIntensity: 'Balanced',
    language: 'en',
    messageLength: 'medium',
    template: 'cake',
    font: 'Playfair Display',
    theme: 'birthday_celebration',
    photos: [],
    generatedMessage: '',
    isPublic: true
  },

  // Backward compatibility proxy so legacy reads/writes to this.data seamlessly sync with this.draft
  get data() {
    return {
      occasion: this.draft.occasion,
      relationship: this.draft.relationship,
      recipient_name: this.draft.recipientName,
      sender_name: this.draft.senderName,
      recipient_gender: this.draft.recipientGender,
      memories: this.draft.memory,
      original_memory: this.draft.originalMemory,
      improved_memory: this.draft.improvedMemory,
      relationship_duration: this.draft.relationshipDuration,
      age: this.draft.age,
      anniversary_years: this.draft.anniversaryYears,
      style: this.draft.emotion,
      emotion: this.draft.emotion,
      emotion_intensity: this.draft.emotionIntensity,
      template: this.draft.template,
      font_family: this.draft.font,
      theme: this.draft.theme,
      language: this.draft.language,
      length: this.draft.messageLength,
      message_length: this.draft.messageLength,
      message: this.draft.generatedMessage,
      images: this.draft.photos,
      music_track: this.draft.template === 'cake' ? 'birthday_celebration' : 'peaceful_melody',
      is_public: this.draft.isPublic
    };
  },

  set data(newData) {
    if (!newData || typeof newData !== 'object') return;
    if (newData.occasion !== undefined) this.draft.occasion = newData.occasion;
    if (newData.relationship !== undefined) this.draft.relationship = newData.relationship;
    if (newData.recipient_name !== undefined) this.draft.recipientName = newData.recipient_name;
    if (newData.recipientName !== undefined) this.draft.recipientName = newData.recipientName;
    if (newData.sender_name !== undefined) this.draft.senderName = newData.sender_name;
    if (newData.senderName !== undefined) this.draft.senderName = newData.senderName;
    if (newData.recipient_gender !== undefined) this.draft.recipientGender = newData.recipient_gender;
    if (newData.memories !== undefined) this.draft.memory = newData.memories;
    if (newData.memory !== undefined) this.draft.memory = newData.memory;
    if (newData.original_memory !== undefined) this.draft.originalMemory = newData.original_memory;
    if (newData.improved_memory !== undefined) this.draft.improvedMemory = newData.improved_memory;
    if (newData.age !== undefined) this.draft.age = newData.age;
    if (newData.anniversary_years !== undefined) this.draft.anniversaryYears = newData.anniversary_years;
    if (newData.relationship_duration !== undefined) this.draft.relationshipDuration = newData.relationship_duration;
    if (newData.style !== undefined) this.draft.emotion = newData.style;
    if (newData.emotion !== undefined) this.draft.emotion = newData.emotion;
    if (newData.emotion_intensity !== undefined) this.draft.emotionIntensity = newData.emotion_intensity;
    if (newData.emotionIntensity !== undefined) this.draft.emotionIntensity = newData.emotionIntensity;
    if (newData.template !== undefined) this.draft.template = newData.template;
    if (newData.font_family !== undefined) this.draft.font = newData.font_family;
    if (newData.font !== undefined) this.draft.font = newData.font;
    if (newData.theme !== undefined) this.draft.theme = newData.theme;
    if (newData.language !== undefined) this.draft.language = newData.language;
    if (newData.length !== undefined) this.draft.messageLength = newData.length;
    if (newData.message_length !== undefined) this.draft.messageLength = newData.message_length;
    if (newData.message !== undefined) this.draft.generatedMessage = newData.message;
    if (newData.generatedMessage !== undefined) this.draft.generatedMessage = newData.generatedMessage;
    if (Array.isArray(newData.images)) this.draft.photos = newData.images;
    if (Array.isArray(newData.photos)) this.draft.photos = newData.photos;
    if (newData.is_public !== undefined) this.draft.isPublic = Boolean(newData.is_public);
  },

  aiVariations: [],
  selectedVariationIndex: 0,
  createdWish: null,
  correctedMemory: null,

  // Fallback occasion tones
  OCCASION_TONES: {
    birthday: ['Heartfelt', 'Cheerful', 'Funny & Playful', 'Sweet & Loving', 'Emotional', 'Inspirational'],
    anniversary: ['Deeply Romantic', 'Devoted & Loyal', 'Sweet & Playful', 'Poetic', 'Emotional'],
    sorry: ['Sincere & Apologetic', 'Deeply Apologetic', 'Regretful', 'Gentle & Healing', 'Deeply Accountable', 'Humble', 'Vulnerable'],
    thank_you: ['Deeply Grateful', 'Warm & Appreciative', 'Respectful', 'Cheerful & Sweet', 'Heartfelt', 'Invaluable Support'],
    congratulations: ['Triumphant & Proud', 'Inspiring', 'Cheerful & Hype', 'Dignified', 'Proud & Cheerful'],
    farewell: ['Bittersweet', 'Nostalgic', 'Inspiring & Hopeful', 'Warm & Connected', 'Emotional', 'Grateful'],
    sympathy: ['Gentle & Comforting', 'Heartfelt Sympathy', 'Peace & Solace', 'Warm & Supportive'],
    friendship: ['Loyal & Authentic', 'Playful & Crazy', 'Heartfelt', 'Sweet', 'Nostalgic'],
    romantic: ['Deeply Romantic', 'Deep Love', 'Passionate', 'Devoted & Loyal', 'Sweet & Playful', 'Poetic'],
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
    this.syncAll();
  },

  // 2. TWO-WAY BINDING FOR ALL FORM INPUTS
  bindFormInputs() {
    const bindField = (id, prop) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = (e) => {
        this.draft[prop] = e.target.value.trim();
        this.syncAll();
      };
      el.addEventListener('input', handler);
      el.addEventListener('change', handler);
    };

    bindField('recipientNameInput', 'recipientName');
    bindField('senderNameInput', 'senderName');
    bindField('genderSelect', 'recipientGender');
    bindField('ageInput', 'age');
    bindField('annivYearsInput', 'anniversaryYears');
    bindField('durationInput', 'relationshipDuration');
    bindField('memoriesInput', 'memory');
    bindField('finalMessageInput', 'generatedMessage');
  },

  // Synchronize values from DOM inputs into this.draft
  saveAllInputs() {
    const getVal = (id) => document.getElementById(id)?.value?.trim() || '';

    const rec = getVal('recipientNameInput');
    if (rec !== '') this.draft.recipientName = rec;

    const sender = getVal('senderNameInput');
    if (sender !== '') this.draft.senderName = sender;

    const gender = document.getElementById('genderSelect')?.value;
    if (gender) this.draft.recipientGender = gender;

    const age = getVal('ageInput');
    if (age !== '') this.draft.age = age;

    const anniv = getVal('annivYearsInput');
    if (anniv !== '') this.draft.anniversaryYears = anniv;

    const dur = getVal('durationInput');
    if (dur !== '') this.draft.relationshipDuration = dur;

    const mem = getVal('memoriesInput');
    if (mem !== '') this.draft.memory = mem;

    const msg = getVal('finalMessageInput');
    if (msg !== '') this.draft.generatedMessage = msg;

    this.persistDraft();
  },

  // Check URL query parameters (e.g. from homepage cards)
  checkUrlPreload() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('occasion')) this.draft.occasion = params.get('occasion');
    if (params.get('relationship')) this.draft.relationship = params.get('relationship');
    if (params.get('theme')) this.draft.theme = params.get('theme');
    if (params.get('style')) this.draft.emotion = params.get('style');
    if (params.get('emotion')) this.draft.emotion = params.get('emotion');
    if (params.get('intensity')) this.draft.emotionIntensity = params.get('intensity');
    if (params.get('template')) this.draft.template = params.get('template');
    if (params.get('font')) this.draft.font = params.get('font');
    if (params.get('message')) this.draft.generatedMessage = params.get('message');
    if (params.get('step')) this.currentStep = parseInt(params.get('step'), 10) || 1;
  },

  // Draft Autosave to localStorage
  persistDraft() {
    try {
      localStorage.setItem('wishcraft_draft_v4', JSON.stringify(this.draft));
    } catch (e) {
      // Ignore storage quota/private mode restrictions
    }
  },

  // Restore draft from localStorage
  restoreDraft() {
    try {
      const saved = localStorage.getItem('wishcraft_draft_v4') || localStorage.getItem('wishcraft_draft_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Handle migration from snake_case v3 schema if necessary
        this.draft = {
          ...this.draft,
          occasion: parsed.occasion || this.draft.occasion,
          relationship: parsed.relationship || this.draft.relationship,
          recipientName: parsed.recipientName || parsed.recipient_name || this.draft.recipientName,
          senderName: parsed.senderName || parsed.sender_name || this.draft.senderName,
          recipientGender: parsed.recipientGender || parsed.recipient_gender || this.draft.recipientGender,
          age: parsed.age || this.draft.age,
          anniversaryYears: parsed.anniversaryYears || parsed.anniversary_years || this.draft.anniversaryYears,
          relationshipDuration: parsed.relationshipDuration || parsed.relationship_duration || this.draft.relationshipDuration,
          memory: parsed.memory || parsed.memories || this.draft.memory,
          originalMemory: parsed.originalMemory || parsed.original_memory || this.draft.originalMemory,
          improvedMemory: parsed.improvedMemory || parsed.improved_memory || this.draft.improvedMemory,
          emotion: parsed.emotion || parsed.style || this.draft.emotion,
          emotionIntensity: parsed.emotionIntensity || parsed.emotion_intensity || this.draft.emotionIntensity,
          template: parsed.template || this.draft.template,
          font: parsed.font || parsed.font_family || this.draft.font,
          theme: parsed.theme || this.draft.theme,
          language: parsed.language || this.draft.language,
          messageLength: parsed.messageLength || parsed.length || parsed.message_length || this.draft.messageLength,
          generatedMessage: parsed.generatedMessage || parsed.message || this.draft.generatedMessage,
          photos: Array.isArray(parsed.photos) ? parsed.photos : (Array.isArray(parsed.images) ? parsed.images : []),
          isPublic: parsed.isPublic !== undefined ? parsed.isPublic : (parsed.is_public !== undefined ? parsed.is_public : true)
        };

        // Populate DOM inputs
        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el && val !== undefined && val !== null) el.value = val;
        };

        setVal('recipientNameInput', this.draft.recipientName);
        setVal('senderNameInput', this.draft.senderName);
        setVal('genderSelect', this.draft.recipientGender);
        setVal('ageInput', this.draft.age);
        setVal('annivYearsInput', this.draft.anniversaryYears);
        setVal('durationInput', this.draft.relationshipDuration);
        setVal('memoriesInput', this.draft.memory);
        setVal('finalMessageInput', this.draft.generatedMessage);

        this.highlightAllSelectors();
      }
    } catch (e) {
      console.warn('Could not restore draft:', e);
    }
  },

  highlightAllSelectors() {
    // 1. Occasion (Step 1)
    document.querySelectorAll('.occasion-btn').forEach(btn => {
      const match = btn.dataset.occasion === this.draft.occasion;
      btn.className = `occasion-btn p-4 rounded-2xl border text-left transition flex flex-col justify-between h-28 ${
        match ? 'ring-4 ring-pink-500 bg-slate-800 border-pink-500' : 'bg-slate-900 border-slate-700 hover:border-pink-500'
      }`;
    });

    // 2. Relationship (Step 2)
    document.querySelectorAll('.relationship-btn').forEach(btn => {
      const match = btn.dataset.relationship === this.draft.relationship;
      btn.className = `relationship-btn p-4 rounded-2xl border text-left transition flex flex-col justify-between h-24 ${
        match ? 'ring-4 ring-purple-500 bg-slate-800 border-purple-500' : 'bg-slate-900 border-slate-700 hover:border-purple-400'
      }`;
    });

    // 3. Dynamic Emotion / Tone (Step 4)
    document.querySelectorAll('#dynamicTonesContainer .tone-btn').forEach(btn => {
      const match = btn.dataset.tone === this.draft.emotion;
      btn.className = `tone-btn p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 h-22 ${
        match ? 'ring-4 ring-indigo-500 bg-slate-800 border-indigo-500' : 'bg-slate-900 border-slate-700 hover:border-indigo-400'
      }`;
    });

    // 4. Emotion Intensity (Step 4)
    document.querySelectorAll('.intensity-btn').forEach(btn => {
      const match = btn.dataset.intensity === this.draft.emotionIntensity;
      btn.className = `intensity-btn p-3.5 rounded-xl border text-center transition flex flex-col items-center justify-between h-20 ${
        match ? 'ring-4 ring-indigo-500 bg-slate-800 border-indigo-500' : 'bg-slate-900 border-slate-700 hover:border-indigo-400'
      }`;
    });
    const intBadge = document.getElementById('selectedIntensityBadge');
    if (intBadge) intBadge.innerText = this.draft.emotionIntensity;

    // 5. Language (Step 5)
    document.querySelectorAll('.language-card').forEach(btn => {
      const match = btn.dataset.language === this.draft.language;
      btn.className = `language-card p-5 rounded-2xl border text-left transition flex flex-col justify-between h-32 ${
        match ? 'ring-4 ring-emerald-500 bg-slate-800 border-emerald-500' : 'bg-slate-900 border-slate-700 hover:border-emerald-500'
      }`;
    });

    // 6. Length (Step 5)
    document.querySelectorAll('.length-btn').forEach(btn => {
      const match = btn.dataset.length === this.draft.messageLength;
      btn.className = `length-btn p-3 rounded-xl border text-center transition ${
        match ? 'ring-4 ring-pink-500 bg-slate-800 border-pink-500' : 'bg-slate-900 border-slate-700 hover:border-pink-500'
      }`;
    });

    // 7. Template (Step 6)
    document.querySelectorAll('.template-btn').forEach(btn => {
      const match = btn.dataset.template === this.draft.template;
      btn.className = `template-btn p-4 rounded-2xl border text-left transition flex flex-col justify-between h-28 ${
        match ? 'ring-4 ring-pink-500 bg-slate-800 border-pink-500' : 'bg-slate-900 border-slate-700 hover:border-pink-500'
      }`;
    });
    const tplBadge = document.getElementById('selectedTemplateBadge');
    if (tplBadge) tplBadge.innerText = this.getTemplateLabel(this.draft.template);

    // 8. Font (Step 6)
    document.querySelectorAll('.font-btn').forEach(btn => {
      const match = btn.dataset.font === this.draft.font;
      btn.className = `font-btn p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
        match ? 'ring-4 ring-pink-500 bg-slate-800 border-pink-500' : 'bg-slate-900 border-slate-700 hover:border-pink-500'
      }`;
    });
    const fontBadge = document.getElementById('selectedFontBadge');
    if (fontBadge) fontBadge.innerText = this.draft.font;
    const fontDropdown = document.getElementById('step6FontSelector');
    if (fontDropdown && fontDropdown.value !== this.draft.font) {
      fontDropdown.value = this.draft.font;
    }
    const messageInput = document.getElementById('finalMessageInput');
    if (messageInput) {
      messageInput.style.fontFamily = this.getFontStack(this.draft.font);
    }

    // 9. Theme (Step 6)
    document.querySelectorAll('.theme-btn').forEach(btn => {
      const match = btn.dataset.theme === this.draft.theme;
      btn.className = `theme-btn p-3.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 h-24 ${
        match ? 'ring-4 ring-pink-500 bg-slate-800 border-pink-500' : 'bg-slate-900 border-slate-700'
      }`;
    });

    // 10. Photos (Step 6)
    this.renderPhotoReel();
  },

  selectOccasion(val) {
    if (!val) return;
    this.draft.occasion = val;

    const occMeta = typeof OccasionManager !== 'undefined' ? OccasionManager.resolve(val) : null;
    if (occMeta && occMeta.recommendedTemplate) {
      this.draft.template = occMeta.recommendedTemplate;
    }
    if (occMeta && occMeta.defaultEmotion) {
      this.draft.emotion = occMeta.defaultEmotion;
    }

    this.renderDynamicTones();
    this.highlightAllSelectors();
    this.adjustContextualFields();
    this.syncAll();
  },

  selectRelationship(val) {
    if (!val) return;
    this.draft.relationship = val;
    this.highlightAllSelectors();
    this.syncAll();
  },

  selectTone(val) {
    if (!val) return;
    this.draft.emotion = val;
    this.highlightAllSelectors();
    this.syncAll();
  },

  selectIntensity(val) {
    if (!val) return;
    this.draft.emotionIntensity = val;
    this.highlightAllSelectors();
    this.syncAll();
  },

  selectLanguage(val) {
    if (!val) return;
    this.draft.language = val;
    this.highlightAllSelectors();
    this.syncAll();
  },

  selectLength(val) {
    if (!val) return;
    this.draft.messageLength = val;
    this.highlightAllSelectors();
    this.syncAll();
  },

  selectTemplate(val) {
    if (!val) return;
    this.draft.template = val;
    this.highlightAllSelectors();
    this.syncAll();
  },

  selectTheme(val) {
    if (!val) return;
    this.draft.theme = val;
    this.highlightAllSelectors();
    this.syncAll();
  },

  clearDraftAndReset() {
    if (!confirm('Are you sure you want to reset your greeting draft? All entered details will be cleared.')) return;
    try {
      localStorage.removeItem('wishcraft_draft_v4');
      localStorage.removeItem('wishcraft_draft_v3');
    } catch (e) {}

    this.draft = {
      occasion: 'Birthday',
      relationship: 'Best Friend',
      recipientName: '',
      senderName: '',
      recipientGender: 'unspecified',
      age: '',
      anniversaryYears: '',
      relationshipDuration: '',
      memory: '',
      originalMemory: '',
      improvedMemory: '',
      emotion: 'Heartfelt',
      emotionIntensity: 'Balanced',
      language: 'en',
      messageLength: 'medium',
      template: 'cake',
      font: 'Playfair Display',
      theme: 'birthday_celebration',
      photos: [],
      generatedMessage: '',
      isPublic: true
    };

    ['recipientNameInput', 'senderNameInput', 'ageInput', 'annivYearsInput', 'durationInput', 'memoriesInput', 'finalMessageInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    this.goToStep(1);
    this.renderDynamicTones();
    this.highlightAllSelectors();
    this.syncAll();
    if (typeof showToast === 'function') showToast('Draft cleared! Starting fresh.', 'info');
  },

  // 3. MASTER EVENT BINDINGS
  bindEvents() {
    // Step 1: Occasion selectors (Direct + Delegation)
    document.querySelectorAll('.occasion-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectOccasion(btn.dataset.occasion);
      });
    });

    // Step 2: Relationship selectors (Direct + Delegation)
    document.querySelectorAll('.relationship-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectRelationship(btn.dataset.relationship);
      });
    });

    // Step 4: Dynamic Tones Container delegation
    const dynContainer = document.getElementById('dynamicTonesContainer');
    if (dynContainer) {
      dynContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.tone-btn');
        if (btn && btn.dataset.tone) {
          e.preventDefault();
          this.selectTone(btn.dataset.tone);
        }
      });
    }

    // Step 4: Emotion Intensity buttons (Direct + Delegation)
    document.querySelectorAll('.intensity-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectIntensity(btn.dataset.intensity);
      });
    });
    const intContainer = document.getElementById('emotionIntensityContainer');
    if (intContainer) {
      intContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.intensity-btn');
        if (btn && btn.dataset.intensity) {
          e.preventDefault();
          this.selectIntensity(btn.dataset.intensity);
        }
      });
    }

    // Step 5: Language cards (Direct + Delegation)
    document.querySelectorAll('.language-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectLanguage(card.dataset.language);
      });
    });

    // Step 5: Length selector (Direct + Delegation)
    document.querySelectorAll('.length-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectLength(btn.dataset.length);
      });
    });
    const step5 = document.getElementById('stepSection5');
    if (step5) {
      step5.addEventListener('click', (e) => {
        const langCard = e.target.closest('.language-card');
        if (langCard && langCard.dataset.language) {
          e.preventDefault();
          this.selectLanguage(langCard.dataset.language);
          return;
        }
        const lenBtn = e.target.closest('.length-btn');
        if (lenBtn && lenBtn.dataset.length) {
          e.preventDefault();
          this.selectLength(lenBtn.dataset.length);
          return;
        }
      });
    }

    // Step 6: Template selector (Direct + Delegation)
    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectTemplate(btn.dataset.template);
      });
    });

    // Step 6: Font selector (Direct + Delegation)
    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.setFontFamily(btn.dataset.font);
      });
    });

    // Step 6: Theme selector (Direct + Delegation)
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectTheme(btn.dataset.theme);
      });
    });
    const step6 = document.getElementById('stepSection6');
    if (step6) {
      step6.addEventListener('click', (e) => {
        const tplBtn = e.target.closest('.template-btn');
        if (tplBtn && tplBtn.dataset.template) {
          e.preventDefault();
          this.selectTemplate(tplBtn.dataset.template);
          return;
        }
        const fontBtn = e.target.closest('.font-btn');
        if (fontBtn && fontBtn.dataset.font) {
          e.preventDefault();
          this.setFontFamily(fontBtn.dataset.font);
          return;
        }
        const themeBtn = e.target.closest('.theme-btn');
        if (themeBtn && themeBtn.dataset.theme) {
          e.preventDefault();
          this.selectTheme(themeBtn.dataset.theme);
          return;
        }
      });
    }

    // Step 6: Photo file input listener
    const photoInput = document.getElementById('photoUploadInput');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
    }

    // Backdrop click-to-close listeners for all modals
    ['previewModal', 'shareModal', 'scheduleWishModal', 'scheduleSuccessModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          if (e.target === el) {
            if (id === 'previewModal') this.closePreviewModal();
            else if (id === 'shareModal') this.closeShareModal();
            else if (id === 'scheduleWishModal') this.closeScheduleModal();
            else if (id === 'scheduleSuccessModal') this.closeScheduleSuccessModal();
          }
        });
      }
    });
  },

  // 4. OCCASION-AWARE TONES RENDERING FOR STEP 4
  renderDynamicTones() {
    const container = document.getElementById('dynamicTonesContainer');
    if (!container) return;

    const occMeta = typeof OccasionManager !== 'undefined' ? OccasionManager.resolve(this.draft.occasion) : null;
    const occId = occMeta?.id || 'birthday';
    const tones = occMeta?.allowedEmotions || occMeta?.tones || this.OCCASION_TONES[occId] || this.OCCASION_TONES.custom;

    const toneEmojis = {
      'Heartfelt': '💖',
      'Cheerful': '☀️',
      'Funny & Playful': '😂',
      'Sweet & Loving': '🥰',
      'Emotional': '🥺',
      'Inspirational': '⭐',
      'Playful': '🥳',
      'Nostalgic': '📻',
      'Deeply Romantic': '🌹',
      'Deep Love': '💖',
      'Passionate': '🔥',
      'Devoted & Loyal': '💍',
      'Sweet & Playful': '✨',
      'Poetic': '📜',
      'Sincere & Apologetic': '🕊️',
      'Deeply Apologetic': '🥺',
      'Regretful': '🌧️',
      'Gentle & Healing': '🌿',
      'Deeply Accountable': '🤝',
      'Humble': '🙏',
      'Vulnerable': '🤍',
      'Asking Forgiveness': '🕊️',
      'I Miss You': '💭',
      'I Want to Fix Things': '✨',
      'Deep & Meaningful': '🌟',
      'Deeply Grateful': '🙏',
      'Warm & Appreciative': '🌸',
      'Respectful': '👔',
      'Cheerful & Sweet': '🌻',
      'Invaluable Support': '🤝',
      'Triumphant & Proud': '🏆',
      'Inspiring & Hopeful': '🚀',
      'Cheerful & Hype': '🎉',
      'Dignified': '👑',
      'Proud & Cheerful': '🌟',
      'Bittersweet': '🌅',
      'Warm & Connected': '🤝',
      'Grateful': '🙏',
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
      'Thoughtful': '💡'
    };

    if (!tones.includes(this.draft.emotion)) {
      this.draft.emotion = occMeta?.defaultEmotion || tones[0];
    }

    container.innerHTML = tones.map(tone => {
      const isSelected = tone === this.draft.emotion;
      const emoji = toneEmojis[tone] || '✨';
      const activeClasses = isSelected ? 'ring-4 ring-indigo-500 bg-slate-800 border-indigo-500' : 'bg-slate-900 border-slate-700 hover:border-indigo-400';
      return `
        <button type="button" data-tone="${tone}" class="tone-btn p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 h-22 ${activeClasses}">
          <span class="text-2xl pointer-events-none">${emoji}</span>
          <span class="font-bold text-xs text-white pointer-events-none">${tone}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.tone-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectTone(btn.dataset.tone);
      });
    });

    const sub = document.getElementById('step4Subtitle');
    if (sub) {
      if (occMeta && !occMeta.isCelebration) {
        sub.innerText = 'Choose the emotional tone that best reflects your sincere intentions.';
      } else {
        sub.innerText = 'How do you want your loved one to feel?';
      }
    }
  },

  adjustContextualFields() {
    const occ = this.draft.occasion.toLowerCase();
    const ageWrapper = document.getElementById('ageFieldWrapper');
    const annivWrapper = document.getElementById('annivFieldWrapper');

    if (ageWrapper) {
      ageWrapper.style.display = occ.includes('birth') ? 'block' : 'none';
    }
    if (annivWrapper) {
      annivWrapper.style.display = occ.includes('anniv') ? 'block' : 'none';
    }
  },

  setFontFamily(fontName) {
    if (!fontName) return;
    this.draft.font = fontName;

    document.querySelectorAll('.font-btn').forEach(btn => {
      const match = btn.dataset.font === fontName;
      btn.className = `font-btn p-3.5 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
        match ? 'ring-4 ring-pink-500 bg-slate-800 border-pink-500' : 'bg-slate-900 border-slate-700 hover:border-pink-500'
      }`;
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

    this.syncAll();
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

  getTemplateLabel(tpl) {
    const map = {
      cake: 'Interactive Cake 🎂',
      envelope: 'Wax-Sealed Letter 💌',
      sincere_letter: 'Sincere Letter 🕊️',
      friendship_card: 'Shield & Card 🌟'
    };
    return map[tpl] || 'Interactive Card ✨';
  },

  // 5. MASTER SYNCHRONIZATION FUNCTION (Called immediately on every state/input change)
  syncAll() {
    this.persistDraft();
    this.updateStickySummary();
    this.updateLivePreview();
    this.updateDynamicHeadings();
  },

  updateDynamicHeadings() {
    const occMeta = typeof OccasionManager !== 'undefined' ? OccasionManager.resolve(this.draft.occasion) : null;
    const msgType = occMeta?.messageType || 'greeting';

    // Step 2 title
    const step2Title = document.getElementById('step2Title');
    if (step2Title) {
      step2Title.innerText = `Who is this ${msgType} for? 👥`;
    }

    // Step 7 generate button
    const genBtnText = document.getElementById('triggerGenerateBtnText');
    if (genBtnText) {
      genBtnText.innerText = occMeta?.generateButtonLabel || `Create ${msgType} ✨`;
    }
  },

  // Update Sticky Summary Bar with comprehensive, real-time pills
  updateStickySummary() {
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.innerText = txt;
    };

    setTxt('sumValOccasion', this.draft.occasion || 'Birthday');
    setTxt('sumValRelationship', this.draft.relationship || 'Best Friend');
    setTxt('sumValRecipient', this.draft.recipientName || 'Friend');
    setTxt('sumValSender', this.draft.senderName || 'You');
    setTxt('sumValTone', this.draft.emotion || 'Heartfelt');
    setTxt('sumValIntensity', this.draft.emotionIntensity || 'Balanced');

    const langLabels = { en: 'English', hi: 'हिंदी', hinglish: 'Hinglish' };
    setTxt('sumValLanguage', langLabels[this.draft.language] || 'English');

    const lenLabels = { short: 'Short', medium: 'Medium', long: 'Long' };
    setTxt('sumValLength', lenLabels[this.draft.messageLength] || 'Medium');

    const tplNames = {
      cake: 'Cake',
      envelope: 'Envelope',
      sincere_letter: 'Sincere',
      friendship_card: 'Shield'
    };
    setTxt('sumValTemplate', tplNames[this.draft.template] || 'Card');
    setTxt('sumValFont', this.draft.font || 'Playfair');

    // Memory pill visibility
    const memPill = document.getElementById('sumPillMemory');
    const memVal = document.getElementById('sumValMemory');
    if (memPill && memVal) {
      if (this.draft.memory && this.draft.memory.trim().length > 0) {
        memPill.classList.remove('hidden');
        memPill.classList.add('flex');
        const snippet = this.draft.memory.trim().slice(0, 14);
        memVal.innerText = `${snippet}…`;
      } else {
        memPill.classList.add('hidden');
        memPill.classList.remove('flex');
      }
    }
  },

  // 6. UPDATE LIVE INTERACTIVE WEBPAGE PREVIEW (Occasion-Aware & Contextual)
  updateLivePreview() {
    const occMeta = typeof OccasionManager !== 'undefined' ? OccasionManager.resolve(this.draft.occasion) : null;
    const recipient = this.draft.recipientName || 'Friend';
    const sender = this.draft.senderName || 'Someone special';

    // Determine Occasion-Aware Heading: strictly non-celebratory for Sorry/Sympathy
    let greetingHeading = `Dearest ${recipient}`;
    if (occMeta) {
      if (occMeta.previewHeading) {
        greetingHeading = occMeta.previewHeading.replace('{name}', recipient);
      } else if (!occMeta.isCelebration) {
        greetingHeading = `A Heartfelt Message for ${recipient}`;
      } else {
        greetingHeading = `Happy ${occMeta.displayName || occMeta.name}, ${recipient}!`;
      }
    }

    // Determine Relationship-Aware Sender Signature
    let senderSignature = `With love from ${sender}`;
    if (typeof WishAttribution !== 'undefined' && WishAttribution.isMdRazaSender(sender)) {
      senderSignature = WishAttribution.getSenderSignatureInline(sender, this.draft.relationship);
    } else if (occMeta && !occMeta.isCelebration) {
      senderSignature = `Sincerely from ${sender}`;
    }

    // Determine Message Text
    const defaultPlaceholder = occMeta?.emptyPreviewText || (occMeta && !occMeta.isCelebration
      ? 'Your personalized sincere message will appear here...'
      : 'Your personalized celebration message will appear here...');
    const messageContent = this.draft.generatedMessage || defaultPlaceholder;
    const fontStack = this.getFontStack(this.draft.font);

    // Template and Occasion Badges
    const tplLabel = this.getTemplateLabel(this.draft.template);
    const occLabel = occMeta?.cardBadge || this.draft.occasion;

    // Helper to apply preview data to an element set
    const applyPreview = (prefix) => {
      const headingEl = document.getElementById(`${prefix}HeadingTitle`);
      const recEl = document.getElementById(`${prefix}RecipientName`);
      const senderEl = document.getElementById(`${prefix}SenderName`);
      const msgEl = document.getElementById(`${prefix}MessageText`);
      const occBadge = document.getElementById(`${prefix}OccasionBadge`);
      const tplBadge = document.getElementById(`${prefix}TemplateBadge`);
      const memBlock = document.getElementById(`${prefix}MemoriesBlock`);
      const memText = document.getElementById(`${prefix}MemoriesText`);

      if (headingEl) {
        headingEl.innerHTML = greetingHeading;
      } else if (recEl) {
        recEl.innerText = recipient;
      }

      if (senderEl) senderEl.innerText = senderSignature;

      if (msgEl) {
        msgEl.innerText = messageContent;
        msgEl.style.fontFamily = fontStack;
      }

      if (occBadge) {
        occBadge.innerText = occLabel;
        if (occMeta && !occMeta.isCelebration) {
          occBadge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60';
        } else {
          occBadge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-pink-900 bg-opacity-40 text-pink-300 border border-pink-700';
        }
      }

      if (tplBadge) {
        tplBadge.innerText = tplLabel;
      }

      if (memBlock && memText) {
        if (this.draft.memory && this.draft.memory.trim()) {
          memText.innerText = this.draft.memory.trim();
          memBlock.classList.remove('hidden');
          memBlock.style.display = 'block';
        } else {
          memBlock.classList.add('hidden');
          memBlock.style.display = 'none';
        }
      }
    };

    // Apply to Step 7 inline card
    applyPreview('preview');
    // Apply to Preview Modal
    applyPreview('modalPreview');
  },

  // Instant Live Preview Modal
  openPreviewModal() {
    this.saveAllInputs();
    this.updateLivePreview();
    const modal = document.getElementById('previewModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex', 'active-modal');
      modal.style.setProperty('display', 'flex', 'important');
      modal.style.setProperty('pointer-events', 'auto', 'important');
    }
  },

  closePreviewModal() {
    const modal = document.getElementById('previewModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex', 'active-modal');
      modal.style.setProperty('display', 'none', 'important');
      modal.style.setProperty('pointer-events', 'none', 'important');
    }
  },

  // 7. WRITING IMPROVEMENT ENGINE (Side-by-Side Comparison)
  async improveMemoryWriting() {
    this.saveAllInputs();
    const rawText = this.draft.memory;
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
            occasion: this.draft.occasion,
            relationship: this.draft.relationship,
            recipientName: this.draft.recipientName,
            language: this.draft.language
          }
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Could not improve writing');

      if (json.improved) {
        this.draft.originalMemory = rawText;
        this.draft.improvedMemory = json.improved;
        this.correctedMemory = json.improved;

        const diffBox = document.getElementById('memoryComparisonBox');
        const diffOrig = document.getElementById('memoryDiffOriginal');
        const diffImp = document.getElementById('memoryDiffImproved');
        const badge = document.getElementById('memoryExplanationBadge');

        if (diffOrig) diffOrig.innerText = json.original || rawText;
        if (diffImp) diffImp.innerText = json.improved;
        if (badge) badge.innerText = json.explanation || 'Polished grammar and clarity while preserving your voice';
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
    this.draft.memory = this.correctedMemory;
    const input = document.getElementById('memoriesInput');
    if (input) input.value = this.correctedMemory;

    const diffBox = document.getElementById('memoryComparisonBox');
    if (diffBox) diffBox.classList.add('hidden');

    this.syncAll();
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
    const raw = this.draft.generatedMessage;
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
            occasion: this.draft.occasion,
            relationship: this.draft.relationship,
            recipientName: this.draft.recipientName,
            language: this.draft.language
          }
        })
      });

      const json = await res.json();
      if (json.improved) {
        this.draft.generatedMessage = json.improved;
        const msgInput = document.getElementById('finalMessageInput');
        if (msgInput) msgInput.value = json.improved;
        this.syncAll();
        if (typeof showToast === 'function') showToast('✨ Message polished!', 'success');
      }
    } catch (e) {
      if (typeof showToast === 'function') showToast('Could not polish text.', 'error');
    }
  },

  // 8. MULTI-STAGE AI GENERATION
  async generateAIWishes() {
    this.saveAllInputs();

    if (!this.draft.recipientName || !this.draft.recipientName.trim()) {
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

    if (titleEl) titleEl.innerText = 'Stage 1 of 3: Analyzing personal context...';
    if (subEl) subEl.innerText = `Weaving ${this.draft.recipientName}'s memories and ${this.draft.relationship} relationship...`;
    if (barEl) barEl.style.width = '33%';

    const stageTimer1 = setTimeout(() => {
      if (titleEl) titleEl.innerText = 'Stage 2 of 3: Synthesizing resonant message...';
      if (subEl) subEl.innerText = `Crafting ${this.draft.emotionIntensity} ${this.draft.emotion} variations in ${this.draft.language}...`;
      if (barEl) barEl.style.width = '66%';
    }, 900);

    const stageTimer2 = setTimeout(() => {
      if (titleEl) titleEl.innerText = 'Stage 3 of 3: Perfecting interactive greeting...';
      if (subEl) subEl.innerText = 'Applying typography, ambient soundscapes, and visual template...';
      if (barEl) barEl.style.width = '95%';
    }, 1800);

    try {
      const payload = {
        occasion: this.draft.occasion,
        relationship: this.draft.relationship,
        recipientName: this.draft.recipientName,
        recipient_name: this.draft.recipientName,
        senderName: this.draft.senderName,
        sender_name: this.draft.senderName,
        recipient_gender: this.draft.recipientGender,
        age: this.draft.age,
        anniversary_years: this.draft.anniversaryYears,
        relationship_duration: this.draft.relationshipDuration,
        memories: this.draft.memory,
        original_memory: this.draft.originalMemory,
        improved_memory: this.draft.improvedMemory,
        style: this.draft.emotion,
        emotion: this.draft.emotion,
        emotionIntensity: this.draft.emotionIntensity,
        emotion_intensity: this.draft.emotionIntensity,
        language: this.draft.language,
        length: this.draft.messageLength,
        message_length: this.draft.messageLength,
        template: this.draft.template
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
      const wordCount = v.estimatedWords || v.text.trim().split(/\s+/).length;
      return `
        <div onclick="WishCreator.selectVariation(${idx})" class="variation-card p-4 rounded-xl border transition cursor-pointer ${borderClass}">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-pink-300 border border-slate-700">Option ${idx + 1}: ${v.tone || this.draft.emotion} (${wordCount}w)</span>
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

    // Special MD RAZA relationship-aware signature handling
    if (typeof WishAttribution !== 'undefined' && WishAttribution.isMdRazaSender(this.draft.senderName)) {
      const sig = WishAttribution.getSenderSignatureInline(this.draft.senderName, this.draft.relationship);
      if (!varText.includes(sig)) {
        varText = varText.replace(/—\s*(?:with love,\s*)?(?:your\s+[\w\s]+,\s*)?md\s+raza\s*$/i, `— ${sig}`);
      }
    }

    this.draft.generatedMessage = varText;

    document.querySelectorAll('.variation-card').forEach((c, idx) => {
      if (idx === index) {
        c.className = 'variation-card p-4 rounded-xl border transition cursor-pointer bg-pink-950/30 border-pink-500 ring-2 ring-pink-500';
      } else {
        c.className = 'variation-card p-4 rounded-xl border transition cursor-pointer bg-slate-900 border-slate-700 hover:border-slate-500';
      }
    });

    const messageInput = document.getElementById('finalMessageInput');
    if (messageInput) {
      messageInput.value = varText;
    }

    this.syncAll();
  },

  // 9. NAVIGATION BETWEEN 7 STEPS
  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > 7) return;

    this.saveAllInputs();

    // Validation when navigating past Step 3
    if (stepNumber > 3 && this.currentStep <= 3) {
      if (!this.draft.recipientName || !this.draft.recipientName.trim()) {
        if (typeof showToast === 'function') showToast("Please enter the recipient's name to continue.", 'error');
        const input = document.getElementById('recipientNameInput');
        if (input) {
          input.focus();
          input.classList.add('ring-2', 'ring-rose-500');
          setTimeout(() => input.classList.remove('ring-2', 'ring-rose-500'), 2500);
        }
        return;
      }
    }

    this.currentStep = stepNumber;
    this.updateStepView();

    // Refresh occasion-specific tones whenever stepping into Step 4
    if (stepNumber === 4) {
      this.renderDynamicTones();
    }

    // Re-highlight all selectors to guarantee state reflects in DOM visual rings
    this.highlightAllSelectors();
    this.adjustContextualFields();
    this.syncAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  nextStep() {
    this.goToStep(this.currentStep + 1);
  },

  prevStep() {
    this.goToStep(this.currentStep - 1);
  },

  updateStepView() {
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

    // Auto-generate on step 7 if message is empty
    if (this.currentStep === 7 && !this.draft.generatedMessage && this.aiVariations.length === 0) {
      this.generateAIWishes();
    }
  },

  // 10. PHOTO UPLOADS (Up to 6)
  handlePhotoUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const remainingSlots = 6 - (this.draft.photos?.length || 0);
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!this.draft.photos) this.draft.photos = [];
        this.draft.photos.push(e.target.result);
        this.renderPhotoReel();
        this.persistDraft();
      };
      reader.readAsDataURL(file);
    });
  },

  renderPhotoReel() {
    const reel = document.getElementById('photoPreviewReel');
    if (!reel) return;

    reel.innerHTML = (this.draft.photos || []).map((img, idx) => `
      <div class="relative group rounded-xl overflow-hidden aspect-square border border-slate-700 shadow">
        <img src="${img}" class="w-full h-full object-cover">
        <button type="button" onclick="WishCreator.removePhoto(${idx})" class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
      </div>
    `).join('');
  },

  removePhoto(index) {
    if (this.draft.photos) {
      this.draft.photos.splice(index, 1);
      this.renderPhotoReel();
      this.persistDraft();
    }
  },

  // 11. PUBLISH & SEND NOW
  async publishGreeting() {
    this.saveAllInputs();

    if (!this.draft.recipientName || !this.draft.recipientName.trim()) {
      if (typeof showToast === 'function') showToast("Please enter the recipient's name.", 'error');
      this.goToStep(3);
      return;
    }

    if (!this.draft.generatedMessage || !this.draft.generatedMessage.trim()) {
      if (typeof showToast === 'function') showToast('Please enter or select a greeting message.', 'error');
      document.getElementById('finalMessageInput')?.focus();
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
        sender_id: user?.id || null,
        sender_name: this.draft.senderName,
        recipient_name: this.draft.recipientName,
        recipient_gender: this.draft.recipientGender,
        occasion: this.draft.occasion,
        relationship: this.draft.relationship,
        style: this.draft.emotion,
        emotion: this.draft.emotion,
        emotion_intensity: this.draft.emotionIntensity,
        template: this.draft.template,
        theme: this.draft.theme,
        font_family: this.draft.font,
        language: this.draft.language,
        message_length: this.draft.messageLength,
        message: this.draft.generatedMessage,
        memories: this.draft.memory,
        original_memory: this.draft.originalMemory,
        improved_memory: this.draft.improvedMemory,
        relationship_duration: this.draft.relationshipDuration,
        age: this.draft.age,
        anniversary_years: this.draft.anniversaryYears,
        images: this.draft.photos,
        is_public: this.draft.isPublic
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

      try {
        localStorage.removeItem('wishcraft_draft_v4');
        localStorage.removeItem('wishcraft_draft_v3');
      } catch (e) {}

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
    modal.classList.add('flex', 'active-modal');
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.setProperty('pointer-events', 'auto', 'important');
  },

  closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex', 'active-modal');
      modal.style.setProperty('display', 'none', 'important');
      modal.style.setProperty('pointer-events', 'none', 'important');
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

  // 12. SCHEDULE FOR LATER
  async openScheduleModal() {
    this.saveAllInputs();

    if (!this.draft.generatedMessage || !this.draft.generatedMessage.trim()) {
      if (typeof showToast === 'function') showToast('Please select or write a message first.', 'error');
      return;
    }

    try {
      if (!this.createdWish) {
        const user = typeof AuthManager !== 'undefined' ? AuthManager.getUser() : null;
        const res = await fetch('/api/wishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_id: user?.id || null,
            sender_name: this.draft.senderName,
            recipient_name: this.draft.recipientName,
            recipient_gender: this.draft.recipientGender,
            occasion: this.draft.occasion,
            relationship: this.draft.relationship,
            style: this.draft.emotion,
            emotion: this.draft.emotion,
            emotion_intensity: this.draft.emotionIntensity,
            template: this.draft.template,
            theme: this.draft.theme,
            font_family: this.draft.font,
            language: this.draft.language,
            message_length: this.draft.messageLength,
            message: this.draft.generatedMessage,
            memories: this.draft.memory,
            original_memory: this.draft.originalMemory,
            improved_memory: this.draft.improvedMemory,
            relationship_duration: this.draft.relationshipDuration,
            age: this.draft.age,
            anniversary_years: this.draft.anniversaryYears,
            images: this.draft.photos,
            is_public: this.draft.isPublic
          })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Could not save greeting');
        this.createdWish = json.wish;
      }

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
        modal.classList.add('flex', 'active-modal');
        modal.style.setProperty('display', 'flex', 'important');
        modal.style.setProperty('pointer-events', 'auto', 'important');
      }
    } catch (e) {
      if (typeof showToast === 'function') showToast(e.message || 'Could not prepare schedule', 'error');
    }
  },

  closeScheduleModal() {
    const modal = document.getElementById('scheduleWishModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex', 'active-modal');
      modal.style.setProperty('display', 'none', 'important');
      modal.style.setProperty('pointer-events', 'none', 'important');
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
    const recip = this.draft.recipientName || 'Friend';

    if (!dateVal || !timeVal) {
      sumEl.innerText = `Your wish for ${recip} will be dispatched via ${channel.toUpperCase()} at your scheduled time.`;
      return;
    }

    sumEl.innerText = `Your ${this.draft.occasion} greeting for ${recip} will be automatically sent via ${channel.toUpperCase()} on ${dateVal} at ${timeVal} (${tzVal}).`;
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
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
        recipient_name: this.createdWish.recipient_name || this.draft.recipientName,
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

      const sched = json.scheduled_wish;
      document.getElementById('successRecipientName').innerText = sched.recipient_name;
      document.getElementById('successDeliveryChannel').innerText = sched.delivery_method === 'email' ? 'Email 💌' : 'SMS 📱';
      document.getElementById('successDeliverTo').innerText = sched.recipient_email || sched.recipient_phone || 'Recipient';
      document.getElementById('successScheduledTime').innerText = `${dateVal} ${timeVal} (${tzVal})`;
      document.getElementById('successViewWishLink').href = `/wish/${this.createdWish.slug}`;

      const successModal = document.getElementById('scheduleSuccessModal');
      if (successModal) {
        successModal.classList.remove('hidden');
        successModal.classList.add('flex', 'active-modal');
        successModal.style.setProperty('display', 'flex', 'important');
        successModal.style.setProperty('pointer-events', 'auto', 'important');
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
