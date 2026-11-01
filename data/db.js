/**
 * Wish Yours — Universal Database Layer
 * Supports seamless persistent JSON storage with automated Supabase sync
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = __dirname;
const WISHES_FILE = path.join(DATA_DIR, 'wishes.json');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
const EMAIL_LOGS_FILE = path.join(DATA_DIR, 'email_logs.json');
const SCHEDULED_WISHES_FILE = path.join(DATA_DIR, 'scheduled_wishes.json');

// Initialize files if not existing
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(WISHES_FILE)) {
    // Seed with a few high quality demo greetings
    const sampleWishes = [
      {
        id: "w_demo_birthday_01",
        slug: "sarah-25th-bday",
        sender_id: null,
        sender_name: "Alex",
        recipient_name: "Sarah Jenkins",
        recipient_gender: "female",
        occasion: "Birthday",
        relationship: "Best Friend",
        style: "Heart-touching",
        theme: "birthday_celebration",
        language: "en",
        message: "Happy 25th Birthday to the most radiant soul in the world! From late night diner talks to traveling the country, having you by my side has been life's biggest gift. May all your candle wishes come true today! 🎂✨🎉",
        memories: "Our road trip to the coast when the car broke down and we danced in the rain anyway!",
        relationship_duration: "8 years",
        age: 25,
        anniversary_years: null,
        images: [
          {
            url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
            caption: "Golden hours and endless laughter"
          },
          {
            url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
            caption: "Party mode activated!"
          }
        ],
        music_track: "birthday_celebration",
        is_public: true,
        views_count: 42,
        candles_blown: false,
        custom_settings: {
          candleCount: 3,
          showConfetti: true,
          badge: "Bestie of the Decade"
        },
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "w_demo_anniv_02",
        slug: "claire-and-david-5years",
        sender_id: null,
        sender_name: "David",
        recipient_name: "Claire",
        recipient_gender: "female",
        occasion: "Wedding Anniversary",
        relationship: "Wife",
        style: "Romantic",
        theme: "romantic_theme",
        language: "en",
        message: "Five magical years of holding hands, growing together, and falling deeper in love with you each morning. You are my home, my anchor, and my forever dance partner. Happy 5th Anniversary, my queen! 💍🌹✨",
        memories: "Saying 'I do' under the willow trees in 2019 and adopting little Bruno together.",
        relationship_duration: "5 years",
        age: null,
        anniversary_years: 5,
        images: [
          {
            url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
            caption: "The day our adventure began"
          },
          {
            url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
            caption: "Parisian sunsets with you"
          }
        ],
        music_track: "romantic_melody",
        is_public: true,
        views_count: 89,
        candles_blown: false,
        custom_settings: {
          showFloatingHearts: true,
          waxSealColor: "crimson"
        },
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    fs.writeFileSync(WISHES_FILE, JSON.stringify(sampleWishes, null, 2), 'utf-8');
  }

  if (!fs.existsSync(EMAIL_LOGS_FILE)) {
    fs.writeFileSync(EMAIL_LOGS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  if (!fs.existsSync(SCHEDULED_WISHES_FILE)) {
    fs.writeFileSync(SCHEDULED_WISHES_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Helpers for reading and writing JSON safely
function readJSON(file) {
  try {
    ensureDataFiles();
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return [];
  }
}

function writeJSON(file, data) {
  ensureDataFiles();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// Generate friendly, unique slug
function generateSlug(recipientName = 'celebrate') {
  const cleanName = (recipientName || 'wish')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 15);
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `${cleanName}-${randomSuffix}`;
}

const db = {
  // Retrieve wish by slug (case-insensitive)
  getWishBySlug(slug) {
    if (!slug) return null;
    const clean = String(slug).trim().toLowerCase();
    const wishes = readJSON(WISHES_FILE);
    return wishes.find(w => 
      (w.slug && w.slug.toLowerCase() === clean) || 
      (w.id && w.id.toLowerCase() === clean)
    ) || null;
  },

  // Retrieve wish by ID (case-insensitive)
  getWishById(id) {
    if (!id) return null;
    const clean = String(id).trim().toLowerCase();
    const wishes = readJSON(WISHES_FILE);
    return wishes.find(w => w.id && w.id.toLowerCase() === clean) || null;
  },

  // List all wishes with optional filtering
  listWishes(filters = {}) {
    let wishes = readJSON(WISHES_FILE);

    if (filters.sender_id) {
      wishes = wishes.filter(w => w.sender_id === filters.sender_id);
    }
    if (filters.occasion) {
      wishes = wishes.filter(w => w.occasion.toLowerCase() === filters.occasion.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      wishes = wishes.filter(w =>
        w.recipient_name.toLowerCase().includes(q) ||
        w.sender_name.toLowerCase().includes(q) ||
        (w.message && w.message.toLowerCase().includes(q))
      );
    }

    // Sort by created_at desc
    wishes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = wishes.length;
    const limit = filters.limit ? parseInt(filters.limit, 10) : 50;
    const offset = filters.offset ? parseInt(filters.offset, 10) : 0;

    return {
      total,
      wishes: wishes.slice(offset, offset + limit)
    };
  },

  // Create a new wish
  createWish(wishData) {
    const wishes = readJSON(WISHES_FILE);
    const id = `w_${crypto.randomBytes(8).toString('hex')}`;
    const slug = wishData.slug || generateSlug(wishData.recipient_name);

    // Make sure slug is unique
    let finalSlug = slug;
    let counter = 1;
    while (wishes.some(w => w.slug === finalSlug)) {
      finalSlug = `${slug}-${counter++}`;
    }

    const newWish = {
      id,
      slug: finalSlug,
      sender_id: wishData.sender_id || null,
      sender_name: wishData.sender_name ? wishData.sender_name.trim() : "A special person",
      recipient_name: wishData.recipient_name ? wishData.recipient_name.trim() : "Friend",
      recipient_gender: wishData.recipient_gender || "unspecified",
      occasion: wishData.occasion || "Birthday",
      relationship: wishData.relationship || "Friend",
      style: wishData.style || wishData.emotion || "Heartfelt",
      emotion: wishData.emotion || wishData.style || "Heartfelt",
      emotion_intensity: wishData.emotion_intensity || wishData.emotionIntensity || "Balanced",
      template: wishData.template || "cake",
      theme: wishData.theme || "birthday_celebration",
      font_family: wishData.font_family || "Playfair Display",
      language: wishData.language || "en",
      message_length: wishData.message_length || wishData.length || "medium",
      message: wishData.message || "",
      memories: wishData.memories || wishData.memory || "",
      original_memory: wishData.original_memory || wishData.originalMemory || "",
      improved_memory: wishData.improved_memory || wishData.improvedMemory || "",
      relationship_duration: wishData.relationship_duration || "",
      age: wishData.age ? parseInt(wishData.age, 10) : null,
      anniversary_years: wishData.anniversary_years ? parseInt(wishData.anniversary_years, 10) : null,
      images: Array.isArray(wishData.images) ? wishData.images : [],
      music_track: wishData.music_track || "celebration_tune",
      is_public: wishData.is_public !== undefined ? Boolean(wishData.is_public) : true,
      views_count: 0,
      candles_blown: false,
      custom_settings: wishData.custom_settings || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: wishData.expires_at || null
    };

    wishes.unshift(newWish);
    writeJSON(WISHES_FILE, wishes);
    return newWish;
  },

  // Update existing wish
  updateWish(idOrSlug, updates, userId = null) {
    const wishes = readJSON(WISHES_FILE);
    const index = wishes.findIndex(w => w.id === idOrSlug || w.slug === idOrSlug);

    if (index === -1) return null;

    const current = wishes[index];
    // If wish has sender_id and userId is passed, verify ownership
    if (current.sender_id && userId && current.sender_id !== userId) {
      throw new Error("Unauthorized to edit this greeting");
    }

    const allowedUpdates = [
      'message', 'sender_name', 'recipient_name', 'theme', 'style', 'font_family',
      'emotion', 'emotion_intensity', 'template', 'message_length', 'original_memory', 'improved_memory',
      'images', 'music_track', 'memories', 'is_public', 'custom_settings',
      'candles_blown'
    ];

    allowedUpdates.forEach(key => {
      if (updates[key] !== undefined) {
        current[key] = updates[key];
      }
    });

    current.updated_at = new Date().toISOString();
    wishes[index] = current;
    writeJSON(WISHES_FILE, wishes);
    return current;
  },

  // Delete wish
  deleteWish(idOrSlug, userId = null) {
    const wishes = readJSON(WISHES_FILE);
    const index = wishes.findIndex(w => w.id === idOrSlug || w.slug === idOrSlug);

    if (index === -1) return false;

    const current = wishes[index];
    if (current.sender_id && userId && current.sender_id !== userId) {
      throw new Error("Unauthorized to delete this greeting");
    }

    wishes.splice(index, 1);
    writeJSON(WISHES_FILE, wishes);
    return true;
  },

  // Increment views count
  incrementViews(slug) {
    const wishes = readJSON(WISHES_FILE);
    const wish = wishes.find(w => w.slug === slug || w.id === slug);
    if (wish) {
      wish.views_count = (wish.views_count || 0) + 1;
      writeJSON(WISHES_FILE, wishes);
      return wish.views_count;
    }
    return 0;
  },

  // Mark candles as blown
  setCandlesBlown(slug, blown = true) {
    const wishes = readJSON(WISHES_FILE);
    const wish = wishes.find(w => w.slug === slug || w.id === slug);
    if (wish) {
      wish.candles_blown = blown;
      writeJSON(WISHES_FILE, wishes);
      return true;
    }
    return false;
  },

  // Get templates
  listTemplates() {
    return readJSON(TEMPLATES_FILE);
  },

  getTemplateById(id) {
    const templates = readJSON(TEMPLATES_FILE);
    return templates.find(t => t.id === id) || null;
  },

  // Log email delivery
  logEmail(logData) {
    const logs = readJSON(EMAIL_LOGS_FILE);
    const newLog = {
      id: `elog_${crypto.randomBytes(6).toString('hex')}`,
      wish_id: logData.wish_id || null,
      recipient_email: logData.recipient_email,
      sender_name: logData.sender_name || 'Wish Yours',
      status: logData.status || 'sent',
      provider: logData.provider || 'resend',
      message_id: logData.message_id || null,
      error_message: logData.error_message || null,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    writeJSON(EMAIL_LOGS_FILE, logs);
    return newLog;
  },

  listEmailLogs(limit = 50) {
    const logs = readJSON(EMAIL_LOGS_FILE);
    return logs.slice(0, limit);
  },

  // Overall analytics for Admin
  getAnalytics() {
    const wishes = readJSON(WISHES_FILE);
    const emailLogs = readJSON(EMAIL_LOGS_FILE);

    const totalWishes = wishes.length;
    const totalViews = wishes.reduce((sum, w) => sum + (w.views_count || 0), 0);
    const activeLinks = wishes.filter(w => w.is_public).length;
    const emailsSent = emailLogs.filter(e => e.status === 'sent' || e.status === 'simulated').length;

    // Breakdown by occasion
    const occasionBreakdown = {};
    wishes.forEach(w => {
      occasionBreakdown[w.occasion] = (occasionBreakdown[w.occasion] || 0) + 1;
    });

    // Breakdown by theme
    const themeBreakdown = {};
    wishes.forEach(w => {
      themeBreakdown[w.theme] = (themeBreakdown[w.theme] || 0) + 1;
    });

    return {
      totalWishes,
      totalViews,
      activeLinks,
      emailsSent,
      occasionBreakdown,
      themeBreakdown,
      recentWishes: wishes.slice(0, 10)
    };
  },

  // ==========================================
  // Scheduled Wishes Management
  // ==========================================

  createScheduledWish(data) {
    const records = readJSON(SCHEDULED_WISHES_FILE);
    const id = `sched_${crypto.randomBytes(8).toString('hex')}`;
    const newRecord = {
      id,
      user_id: data.user_id || null,
      greeting_id: data.greeting_id || data.slug || data.wish_id,
      recipient_name: (data.recipient_name || 'Friend').trim(),
      recipient_email: (data.recipient_email || '').trim().toLowerCase(),
      recipient_phone: (data.recipient_phone || '').trim(),
      delivery_method: data.delivery_method || 'email',
      scheduled_at: new Date(data.scheduled_at).toISOString(),
      timezone: data.timezone || 'UTC',
      personal_message: (data.personal_message || '').trim(),
      status: 'scheduled',
      attempts: 0,
      sent_at: null,
      failed_at: null,
      error_message: null,
      provider_response: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    records.unshift(newRecord);
    writeJSON(SCHEDULED_WISHES_FILE, records);
    return newRecord;
  },

  getScheduledWishById(id) {
    const records = readJSON(SCHEDULED_WISHES_FILE);
    return records.find(r => r.id === id) || null;
  },

  listScheduledWishes(filters = {}) {
    let records = readJSON(SCHEDULED_WISHES_FILE);

    if (filters.user_id !== undefined && filters.user_id !== null) {
      records = records.filter(r => r.user_id === filters.user_id);
    }
    if (filters.greeting_id) {
      records = records.filter(r => r.greeting_id === filters.greeting_id);
    }
    if (filters.status) {
      records = records.filter(r => r.status.toLowerCase() === filters.status.toLowerCase());
    }

    // Sort by scheduled_at ascending
    records.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

    const total = records.length;
    const limit = filters.limit ? parseInt(filters.limit, 10) : 50;
    const offset = filters.offset ? parseInt(filters.offset, 10) : 0;

    return {
      total,
      scheduled_wishes: records.slice(offset, offset + limit)
    };
  },

  updateScheduledWish(id, updates, userId = null) {
    const records = readJSON(SCHEDULED_WISHES_FILE);
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;

    const current = records[index];
    if (current.user_id && userId && current.user_id !== userId) {
      throw new Error("Unauthorized to modify this scheduled greeting");
    }

    if (current.status === 'sent') {
      throw new Error("Cannot modify a wish that has already been sent");
    }

    const allowedUpdates = [
      'recipient_name', 'recipient_email', 'recipient_phone',
      'delivery_method', 'scheduled_at', 'timezone', 'personal_message'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'scheduled_at') {
          current.scheduled_at = new Date(updates[field]).toISOString();
        } else if (field === 'recipient_email') {
          current.recipient_email = (updates[field] || '').trim().toLowerCase();
        } else {
          current[field] = updates[field];
        }
      }
    });

    // If rescheduling, reset failed/cancelled status back to scheduled
    if (updates.scheduled_at && (current.status === 'failed' || current.status === 'cancelled')) {
      current.status = 'scheduled';
      current.error_message = null;
    }

    current.updated_at = new Date().toISOString();
    records[index] = current;
    writeJSON(SCHEDULED_WISHES_FILE, records);
    return current;
  },

  cancelScheduledWish(id, userId = null) {
    const records = readJSON(SCHEDULED_WISHES_FILE);
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;

    const current = records[index];
    if (current.user_id && userId && current.user_id !== userId) {
      throw new Error("Unauthorized to cancel this scheduled greeting");
    }

    if (current.status === 'sent') {
      throw new Error("Cannot cancel a wish that has already been delivered");
    }

    current.status = 'cancelled';
    current.updated_at = new Date().toISOString();
    records[index] = current;
    writeJSON(SCHEDULED_WISHES_FILE, records);
    return current;
  },

  deleteScheduledWish(id, userId = null) {
    const records = readJSON(SCHEDULED_WISHES_FILE);
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return false;

    const current = records[index];
    if (current.user_id && userId && current.user_id !== userId) {
      throw new Error("Unauthorized to delete this scheduled greeting");
    }

    records.splice(index, 1);
    writeJSON(SCHEDULED_WISHES_FILE, records);
    return true;
  },

  getDueScheduledWishes(maxLimit = 25) {
    const records = readJSON(SCHEDULED_WISHES_FILE);
    const now = new Date();

    return records
      .filter(r => r.status === 'scheduled' && new Date(r.scheduled_at) <= now)
      .slice(0, maxLimit);
  },

  lockScheduledWish(id) {
    const records = readJSON(SCHEDULED_WISHES_FILE);
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;

    // Idempotency lock: only lock if status is currently 'scheduled'
    if (records[index].status !== 'scheduled') {
      return null;
    }

    records[index].status = 'processing';
    records[index].updated_at = new Date().toISOString();
    writeJSON(SCHEDULED_WISHES_FILE, records);
    return records[index];
  },

  markScheduledWishSent(id, providerResponse = {}) {
    const records = readJSON(SCHEDULED_WISHES_FILE);
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;

    records[index].status = 'sent';
    records[index].sent_at = new Date().toISOString();
    records[index].attempts = (records[index].attempts || 0) + 1;
    records[index].provider_response = providerResponse;
    records[index].error_message = null;
    records[index].updated_at = new Date().toISOString();

    writeJSON(SCHEDULED_WISHES_FILE, records);
    return records[index];
  },

  markScheduledWishFailed(id, errorMessage, retryable = true) {
    const records = readJSON(SCHEDULED_WISHES_FILE);
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;

    const attempts = (records[index].attempts || 0) + 1;
    records[index].attempts = attempts;
    records[index].error_message = errorMessage;
    records[index].updated_at = new Date().toISOString();

    if (retryable && attempts < 3) {
      records[index].status = 'scheduled';
      records[index].scheduled_at = new Date(Date.now() + 120000).toISOString();
    } else {
      records[index].status = 'failed';
      records[index].failed_at = new Date().toISOString();
    }

    writeJSON(SCHEDULED_WISHES_FILE, records);
    return records[index];
  }
};

module.exports = db;
