/**
 * Wish Yours — Scheduled Delivery: Official Meta WhatsApp Business Cloud API Provider
 * Supports official Graph API v21.0 template dispatch with safe simulation fallback.
 *
 * NOTE: Unofficial automation (Selenium, Puppeteer, web scraping) is strictly forbidden.
 * Official Meta WhatsApp Cloud API requires:
 * 1. Meta Developer App & WhatsApp Business Account (WABA)
 * 2. Dedicated Phone Number ID & Access Token
 * 3. Pre-approved Meta Message Templates for business-initiated conversations
 */

const https = require('https');

function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '***';
  const clean = phone.trim();
  if (clean.length < 5) return '***';
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
}

function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  let clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('+')) clean = clean.substring(1);
  if (clean.startsWith('00')) clean = clean.substring(2);
  if (/^[6-9]\d{9}$/.test(clean)) {
    clean = '91' + clean;
  }
  return clean;
}

/**
 * Deliver Automated WhatsApp Message via Official Meta WhatsApp Cloud API
 */
async function deliverWhatsAppMessage({
  recipientPhone,
  recipientName,
  senderName,
  occasion,
  wishUrl
}) {
  const cleanNumber = normalizePhone(recipientPhone);
  if (!cleanNumber || cleanNumber.length < 7) {
    throw new Error('Valid recipient phone number with country code is required (e.g. +91 9876543210).');
  }

  const masked = maskPhone(cleanNumber);
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'wishcraft_greeting_notification';
  const langCode = process.env.WHATSAPP_TEMPLATE_LANG || 'en';

  // 1. Official Meta WhatsApp Cloud API Integration
  if (token && phoneNumberId && !token.includes('your_') && !phoneNumberId.includes('your_')) {
    console.log(`[WhatsApp Provider] Dispatching official WhatsApp template message to ${masked}...`);

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanNumber,
        type: 'template',
        template: {
          name: templateName,
          language: { code: langCode },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: recipientName || 'Friend' },
                { type: 'text', text: senderName || 'Someone special' },
                { type: 'text', text: occasion || 'Celebration' },
                { type: 'text', text: wishUrl }
              ]
            }
          ]
        }
      });

      const options = {
        hostname: 'graph.facebook.com',
        port: 443,
        path: `/v21.0/${phoneNumberId}/messages`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const msgId = parsed.messages?.[0]?.id || 'unknown';
              console.log(`[WhatsApp Provider] Successfully queued WhatsApp message via Meta Cloud API to ${masked} (Message ID: ${msgId})`);
              resolve({
                status: 'delivered',
                provider: 'meta_cloud_api',
                messageId: msgId,
                raw: parsed
              });
            } else {
              const errMsg = parsed.error?.message || `Meta API returned status ${res.statusCode}`;
              console.error(`[WhatsApp Provider Error] Meta Cloud API rejection for ${masked}:`, errMsg);
              reject(new Error(`Meta WhatsApp API error: ${errMsg}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse Meta WhatsApp response: ${e.message}`));
          }
        });
      });

      req.on('error', err => {
        console.error(`[WhatsApp Provider Network Error] Failed to reach Meta Graph API:`, err.message);
        reject(err);
      });

      req.write(payload);
      req.end();
    });
  }

  // 2. Safe Local / Free Simulator Mode
  console.log(`[WhatsApp Provider Simulation] WHATSAPP_ACCESS_TOKEN is not configured. Emulating dispatch for: ${masked}`);
  const simulatedMsgId = `sim_wa_${Date.now()}`;

  return Promise.resolve({
    status: 'simulated',
    provider: 'local_whatsapp_simulator',
    messageId: simulatedMsgId,
    details: {
      recipientPhone: masked,
      recipientName,
      senderName,
      occasion,
      wishUrl,
      simulatedAt: new Date().toISOString()
    }
  });
}

module.exports = {
  deliverWhatsAppMessage,
  normalizePhone,
  maskPhone
};
