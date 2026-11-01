/**
 * Wish Yours — Scheduled Delivery: Email Provider (Resend Native)
 */

const { handleSendEmail } = require('../email');

async function deliverEmail({
  recipientEmail,
  recipientName,
  senderName,
  occasion,
  wishUrl,
  messageExcerpt,
  fontFamily,
  wishId,
  slug
}) {
  if (!recipientEmail || !recipientEmail.includes('@')) {
    throw new Error('Valid recipient email is required for scheduled email delivery.');
  }

  const result = await handleSendEmail({
    recipientEmail,
    recipientName: recipientName || 'Friend',
    senderName: senderName || 'Someone special',
    occasion: occasion || 'Celebration',
    wishUrl,
    messageExcerpt: messageExcerpt || 'Open your personalized celebration page to experience candles, music, and memories!',
    fontFamily: fontFamily || 'Playfair Display',
    wishId,
    slug
  });

  return {
    provider: result.provider || 'resend',
    messageId: result.messageId,
    delivered: result.delivered !== false,
    raw: result
  };
}

module.exports = {
  deliverEmail
};
