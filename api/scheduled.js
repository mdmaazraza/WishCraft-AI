/**
 * Wish Yours — Scheduled Wishes API Handlers
 */

const db = require('../data/db');
const { processDueWishes } = require('../scheduler/engine');

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  return clean.length >= 7 && /^\+?[0-9]{7,15}$/.test(clean);
}

// Create new scheduled wish
async function handleCreateScheduledWish(body, userId = null) {
  const {
    greeting_id,
    recipient_name,
    recipient_email,
    recipient_phone,
    delivery_method = 'email',
    scheduled_at,
    timezone = 'UTC',
    personal_message
  } = body || {};

  if (!greeting_id) {
    throw { statusCode: 400, message: 'greeting_id or slug is required' };
  }

  // Ensure greeting exists
  const greeting = db.getWishBySlug(greeting_id) || db.getWishById(greeting_id);
  if (!greeting) {
    throw { statusCode: 404, message: 'Referenced celebration greeting does not exist' };
  }

  if (!recipient_name || !recipient_name.trim()) {
    throw { statusCode: 400, message: 'Recipient name is required' };
  }

  const validMethods = ['email', 'sms', 'call'];
  if (!validMethods.includes(delivery_method)) {
    throw { statusCode: 400, message: `Invalid delivery method: ${delivery_method}. Choose email, sms, or call.` };
  }

  if (delivery_method === 'email' && !validateEmail(recipient_email)) {
    throw { statusCode: 400, message: 'A valid recipient email address is required for email delivery.' };
  }

  if ((delivery_method === 'sms' || delivery_method === 'call') && !validatePhone(recipient_phone)) {
    throw { statusCode: 400, message: 'A valid recipient phone number with country code is required (e.g. +91 9876543210).' };
  }

  if (!scheduled_at) {
    throw { statusCode: 400, message: 'scheduled_at timestamp is required' };
  }

  const scheduleDate = new Date(scheduled_at);
  if (isNaN(scheduleDate.getTime())) {
    throw { statusCode: 400, message: 'Invalid scheduled_at date format' };
  }

  // Prevent scheduling in the past (allow 10-second grace window for slight clock differences)
  if (scheduleDate.getTime() < Date.now() - 10000) {
    throw { statusCode: 400, message: 'Scheduled delivery time must be in the future.' };
  }

  const created = db.createScheduledWish({
    user_id: userId || body.user_id || null,
    greeting_id: greeting.slug,
    recipient_name,
    recipient_email,
    recipient_phone,
    delivery_method,
    scheduled_at: scheduleDate.toISOString(),
    timezone,
    personal_message
  });

  return {
    status: 'success',
    message: 'Celebration wish scheduled successfully',
    scheduled_wish: {
      ...created,
      greeting_occasion: greeting.occasion,
      greeting_sender: greeting.sender_name
    }
  };
}

// List scheduled wishes with greeting metadata
async function handleListScheduledWishes(queryParams = {}, userId = null) {
  const filters = {
    user_id: userId || queryParams.user_id || null,
    greeting_id: queryParams.greeting_id || null,
    status: queryParams.status || null,
    limit: queryParams.limit || 50,
    offset: queryParams.offset || 0
  };

  const result = db.listScheduledWishes(filters);

  // Enrich with greeting info for dashboard display
  const enriched = result.scheduled_wishes.map(sw => {
    const greeting = db.getWishBySlug(sw.greeting_id) || db.getWishById(sw.greeting_id);
    return {
      ...sw,
      occasion: greeting?.occasion || 'Celebration',
      sender_name: greeting?.sender_name || 'Someone special',
      greeting_slug: greeting?.slug || sw.greeting_id,
      greeting_message: greeting?.message || ''
    };
  });

  return {
    status: 'success',
    total: result.total,
    scheduled_wishes: enriched
  };
}

// Get single scheduled wish
async function handleGetScheduledWish(id, userId = null) {
  if (!id) {
    throw { statusCode: 400, message: 'Scheduled wish ID is required' };
  }

  const scheduled = db.getScheduledWishById(id);
  if (!scheduled) {
    throw { statusCode: 404, message: 'Scheduled wish not found' };
  }

  if (scheduled.user_id && userId && scheduled.user_id !== userId) {
    throw { statusCode: 403, message: 'Unauthorized to view this scheduled greeting' };
  }

  const greeting = db.getWishBySlug(scheduled.greeting_id) || db.getWishById(scheduled.greeting_id);

  return {
    status: 'success',
    scheduled_wish: {
      ...scheduled,
      occasion: greeting?.occasion || 'Celebration',
      sender_name: greeting?.sender_name || 'Someone special',
      greeting_slug: greeting?.slug || scheduled.greeting_id,
      greeting_message: greeting?.message || ''
    }
  };
}

// Update / Reschedule
async function handleUpdateScheduledWish(id, updates = {}, userId = null) {
  if (!id) {
    throw { statusCode: 400, message: 'Scheduled wish ID is required' };
  }

  // Validate date if rescheduling
  if (updates.scheduled_at) {
    const newDate = new Date(updates.scheduled_at);
    if (isNaN(newDate.getTime())) {
      throw { statusCode: 400, message: 'Invalid scheduled_at date' };
    }
    if (newDate.getTime() < Date.now() - 10000) {
      throw { statusCode: 400, message: 'Rescheduled delivery time must be in the future.' };
    }
  }

  if (updates.recipient_email && !validateEmail(updates.recipient_email)) {
    throw { statusCode: 400, message: 'Invalid recipient email format' };
  }

  if (updates.recipient_phone && !validatePhone(updates.recipient_phone)) {
    throw { statusCode: 400, message: 'Invalid recipient phone number format' };
  }

  try {
    const updated = db.updateScheduledWish(id, updates, userId);
    if (!updated) {
      throw { statusCode: 404, message: 'Scheduled wish not found' };
    }

    return {
      status: 'success',
      message: 'Scheduled greeting updated successfully',
      scheduled_wish: updated
    };
  } catch (err) {
    throw { statusCode: 400, message: err.message };
  }
}

// Cancel
async function handleCancelScheduledWish(id, userId = null) {
  if (!id) {
    throw { statusCode: 400, message: 'Scheduled wish ID is required' };
  }

  try {
    const cancelled = db.cancelScheduledWish(id, userId);
    if (!cancelled) {
      throw { statusCode: 404, message: 'Scheduled wish not found' };
    }

    return {
      status: 'success',
      message: 'Scheduled greeting cancelled successfully',
      scheduled_wish: cancelled
    };
  } catch (err) {
    throw { statusCode: 400, message: err.message };
  }
}

// Delete
async function handleDeleteScheduledWish(id, userId = null) {
  if (!id) {
    throw { statusCode: 400, message: 'Scheduled wish ID is required' };
  }

  const success = db.deleteScheduledWish(id, userId);
  if (!success) {
    throw { statusCode: 404, message: 'Scheduled wish not found or unauthorized' };
  }

  return {
    status: 'success',
    message: 'Scheduled greeting deleted successfully'
  };
}

// Cron Trigger Handler
async function handleTriggerCron(headers = {}, baseUrl = 'http://localhost:3000') {
  const cronKey = headers['x-cron-key'] || headers['X-Cron-Key'] || headers['x_cron_key'];
  const expectedKey = process.env.CRON_SECRET_KEY || process.env.ADMIN_SECRET_KEY || 'wishyours_cron_secret_2026';

  if (!cronKey || cronKey !== expectedKey) {
    throw { statusCode: 401, message: 'Unauthorized: Invalid or missing x-cron-key header' };
  }

  const result = await processDueWishes(baseUrl);
  return {
    status: 'success',
    timestamp: new Date().toISOString(),
    ...result
  };
}

module.exports = {
  handleCreateScheduledWish,
  handleListScheduledWishes,
  handleGetScheduledWish,
  handleUpdateScheduledWish,
  handleCancelScheduledWish,
  handleDeleteScheduledWish,
  handleTriggerCron,
  validateEmail,
  validatePhone
};
