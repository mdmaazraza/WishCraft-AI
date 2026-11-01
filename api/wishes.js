/**
 * WishCraft AI — Wishes API Endpoint Handlers
 */

const db = require('../data/db');

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
  if (!body.recipient_name || !body.message) {
    throw { statusCode: 400, message: 'Recipient name and greeting message are required' };
  }

  const sanitizedBody = {
    ...body,
    sender_id: userId || body.sender_id || null,
    sender_name: sanitize(body.sender_name || 'A loved one'),
    recipient_name: sanitize(body.recipient_name),
    occasion: sanitize(body.occasion || 'Birthday'),
    relationship: sanitize(body.relationship || 'Friend'),
    style: sanitize(body.style || 'Heart-touching'),
    theme: sanitize(body.theme || 'birthday_celebration'),
    language: sanitize(body.language || 'en'),
    message: body.message.trim(), // Keep formatting intact but clean
    memories: sanitize(body.memories || ''),
    relationship_duration: sanitize(body.relationship_duration || ''),
    age: body.age ? parseInt(body.age, 10) : null,
    anniversary_years: body.anniversary_years ? parseInt(body.anniversary_years, 10) : null,
    images: Array.isArray(body.images) ? body.images : [],
    music_track: sanitize(body.music_track || 'celebration_tune'),
    is_public: body.is_public !== undefined ? Boolean(body.is_public) : true,
    custom_settings: body.custom_settings || {}
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

  const updated = db.updateWish(slugOrId, updates, userId);
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
  handleBlowCandles
};
