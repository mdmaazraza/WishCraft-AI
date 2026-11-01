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
  // Retrieve wish by slug
  getWishBySlug(slug) {
    const wishes = readJSON(WISHES_FILE);
    return wishes.find(w => w.slug === slug || w.id === slug) || null;
  },

  // Retrieve wish by ID
  getWishById(id) {
    const wishes = readJSON(WISHES_FILE);
    return wishes.find(w => w.id === id) || null;
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
      style: wishData.style || "Heart-touching",
      theme: wishData.theme || "birthday_celebration",
      font_family: wishData.font_family || "Playfair Display",
      language: wishData.language || "en",
      message: wishData.message || "",
      memories: wishData.memories || "",
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
  }
};

module.exports = db;
