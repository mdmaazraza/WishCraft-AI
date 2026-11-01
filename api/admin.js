/**
 * WishCraft AI — Admin API Handlers
 */

const db = require('../data/db');

function checkAdminAuth(headers) {
  const secret = process.env.ADMIN_SECRET_KEY || 'admin_wishcraft_secret_2026';
  const provided = headers['x-admin-key'] || headers['authorization']?.replace('Bearer ', '');

  if (!provided || provided !== secret) {
    throw { statusCode: 401, message: 'Unauthorized. Invalid admin credentials.' };
  }
}

async function handleGetAdminStats(headers) {
  checkAdminAuth(headers);
  const analytics = db.getAnalytics();
  const emailLogs = db.listEmailLogs(20);

  return {
    status: 'success',
    analytics,
    recentEmailLogs: emailLogs
  };
}

async function handleModerateWish(body, headers) {
  checkAdminAuth(headers);
  const { slug, action } = body || {};

  if (!slug) {
    throw { statusCode: 400, message: 'Slug is required for moderation' };
  }

  if (action === 'delete') {
    const success = db.deleteWish(slug);
    return { status: 'success', message: 'Greeting permanently removed by administrator' };
  }

  if (action === 'toggle_visibility') {
    const wish = db.getWishBySlug(slug);
    if (!wish) throw { statusCode: 404, message: 'Wish not found' };

    const updated = db.updateWish(slug, { is_public: !wish.is_public });
    return {
      status: 'success',
      message: `Wish visibility updated to ${updated.is_public ? 'Public' : 'Hidden'}`,
      is_public: updated.is_public
    };
  }

  throw { statusCode: 400, message: `Unknown action: ${action}` };
}

module.exports = {
  checkAdminAuth,
  handleGetAdminStats,
  handleModerateWish
};
