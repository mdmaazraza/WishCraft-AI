/**
 * WishCraft AI — Wishes API Endpoint Handlers
 */

const db = require('../data/db');
const { isMdRazaSender, applySignatureToMessage } = require('../data/attribution');

const ALLOWED_FONTS = [
  'Playfair Display',
  'Dancing Script',
  'Great Vibes',
  'Outfit',
  'Pacifico',
  'Cinzel'
];

function sanitizeFontFamily(font) {
  if (!font || typeof font !== 'string') return 'Playfair Display';
  const clean = font.trim().toLowerCase();
  const matched = ALLOWED_FONTS.find(f => f.toLowerCase() === clean);
  return matched || 'Playfair Display';
}

// Sanitize text against XSS attacks
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function handleGetWish(slugOrId, req) {
  if (!slugOrId) {
    throw { statusCode: 400, message: 'Slug or ID is required' };
  }

  const wish = db.getWishBySlug(slugOrId);
  if (!wish) {
    throw { statusCode: 404, message: 'Greeting not found' };
  }

  // Check if expired
  if (wish.expires_at && new Date(wish.expires_at) < new Date()) {
    throw { statusCode: 410, message: 'This greeting has expired' };
  }

  // Increment views
  db.incrementViews(wish.slug);
  wish.views_count = (wish.views_count || 0) + 1;

  return {
    status: 'success',
    wish
  };
}

async function handleListWishes(queryParams) {
  const filters = {
    sender_id: queryParams.sender_id,
    occasion: queryParams.occasion,
    search: queryParams.search,
    limit: queryParams.limit || 50,
    offset: queryParams.offset || 0
  };

  const result = db.listWishes(filters);
  return {
    status: 'success',
    ...result
  };
}

async function handleCreateWish(body, userId = null) {
  const reqData = body || {};
  const recipientName = reqData.recipient_name || reqData.recipientName;
  const messageText = reqData.message || reqData.generatedMessage;

  if (!recipientName || !messageText) {
    throw { statusCode: 400, message: 'Recipient name and greeting message are required' };
  }

  const senderRaw = reqData.sender_name || reqData.senderName || 'A loved one';
  const relRaw = reqData.relationship || 'Friend';

  const sanitizedBody = {
    ...reqData,
    sender_id: userId || reqData.sender_id || null,
    sender_name: isMdRazaSender(senderRaw) ? 'MD RAZA' : sanitize(senderRaw),
    recipient_name: sanitize(recipientName),
    occasion: sanitize(reqData.occasion || 'Birthday'),
    relationship: sanitize(relRaw),
    style: sanitize(reqData.style || reqData.emotion || 'Heartfelt'),
    emotion: sanitize(reqData.emotion || reqData.style || 'Heartfelt'),
    emotion_intensity: sanitize(reqData.emotion_intensity || reqData.emotionIntensity || 'Balanced'),
    template: sanitize(reqData.template || 'cake'),
    theme: sanitize(reqData.theme || 'birthday_celebration'),
    font_family: sanitizeFontFamily(reqData.font_family || reqData.font),
    language: sanitize(reqData.language || 'en'),
    message_length: sanitize(reqData.message_length || reqData.length || 'medium'),
    message: isMdRazaSender(senderRaw) 
      ? applySignatureToMessage(messageText.trim(), 'MD RAZA', relRaw)
      : messageText.trim(),
    memories: sanitize(reqData.memories || reqData.memory || ''),
    original_memory: sanitize(reqData.original_memory || reqData.originalMemory || ''),
    improved_memory: sanitize(reqData.improved_memory || reqData.improvedMemory || ''),
    relationship_duration: sanitize(reqData.relationship_duration || reqData.relationshipDuration || ''),
    age: reqData.age ? parseInt(reqData.age, 10) : null,
    anniversary_years: reqData.anniversary_years ? parseInt(reqData.anniversary_years, 10) : null,
    images: (() => {
      const raw = Array.isArray(reqData.images) ? reqData.images : (Array.isArray(reqData.photos) ? reqData.photos : []);
      return raw.map((img, idx) => {
        if (typeof img === 'string') {
          return { url: img, caption: `Memory #${idx + 1}` };
        }
        return {
          url: img.url || '',
          caption: sanitize(img.caption || `Memory #${idx + 1}`)
        };
      }).filter(img => Boolean(img.url));
    })(),
    music_track: sanitize(reqData.music_track || 'celebration_tune'),
    is_public: reqData.is_public !== undefined ? Boolean(reqData.is_public) : true,
    custom_settings: reqData.custom_settings || {}
  };

  const newWish = db.createWish(sanitizedBody);
  return {
    status: 'success',
    message: 'Wish created successfully',
    wish: newWish,
    shareUrl: `/wish/${newWish.slug}`
  };
}

async function handleUpdateWish(slugOrId, updates, userId = null) {
  if (!slugOrId) {
    throw { statusCode: 400, message: 'Slug or ID is required' };
  }

  const cleanUpdates = { ...updates };
  if (cleanUpdates.font_family !== undefined) {
    cleanUpdates.font_family = sanitizeFontFamily(cleanUpdates.font_family);
  }

  const updated = db.updateWish(slugOrId, cleanUpdates, userId);
  if (!updated) {
    throw { statusCode: 404, message: 'Wish not found or update failed' };
  }

  return {
    status: 'success',
    message: 'Wish updated successfully',
    wish: updated
  };
}

async function handleDeleteWish(slugOrId, userId = null) {
  if (!slugOrId) {
    throw { statusCode: 400, message: 'Slug or ID is required' };
  }

  const success = db.deleteWish(slugOrId, userId);
  if (!success) {
    throw { statusCode: 404, message: 'Wish not found or deletion failed' };
  }

  return {
    status: 'success',
    message: 'Wish deleted successfully'
  };
}

async function handleBlowCandles(slugOrId, blown = true) {
  if (!slugOrId) {
    throw { statusCode: 400, message: 'Slug is required' };
  }

  const success = db.setCandlesBlown(slugOrId, blown);
  return {
    status: 'success',
    candles_blown: blown
  };
}

module.exports = {
  handleGetWish,
  handleListWishes,
  handleCreateWish,
  handleUpdateWish,
  handleDeleteWish,
  handleBlowCandles,
  sanitizeFontFamily
};
