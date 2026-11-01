/**
 * Wish Yours — Email Delivery Service (Resend / Brevo with native HTTPS)
 */

const https = require('https');
const db = require('../data/db');

// Mask recipient email for safe server-side audit logs (never expose full emails in public logs)
function maskEmail(email) {
  if (!email || typeof email !== 'string') return '***';
  const parts = email.trim().split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

// Ensure the sender email complies with Resend verified sender rules
function getValidResendSender(configuredFrom) {
  const defaultSender = 'Wish Yours <onboarding@resend.dev>';
  if (!configuredFrom || typeof configuredFrom !== 'string') return defaultSender;

  const trimmed = configuredFrom.trim().replace(/^["']|["']$/g, '');
  if (!trimmed) return defaultSender;

  // Resend shared test domain ONLY allows onboarding@resend.dev
  if (trimmed.includes('@resend.dev') && !trimmed.includes('onboarding@resend.dev')) {
    console.warn(`[Email Service Warning] Resend test domain only allows "onboarding@resend.dev". Auto-correcting "${trimmed}" -> "${defaultSender}".`);
    return defaultSender;
  }
  return trimmed;
}

// Clean and validate API key
function getCleanApiKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') return '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

function sendViaResend(apiKey, fromEmail, toEmail, subject, htmlContent) {
  return new Promise((resolve, reject) => {
    const cleanFrom = getValidResendSender(fromEmail);
    const cleanTo = (toEmail || '').trim();
    const maskedTo = maskEmail(cleanTo);

    console.log(`[Email Service] 📤 Dispatching email via Resend to=${maskedTo} from=${cleanFrom} subject="${subject.slice(0, 45)}..."`);

    const payload = JSON.stringify({
      from: cleanFrom,
      to: [cleanTo],
      subject: subject,
      html: htmlContent
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = {};
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = { message: data };
        }

        if (res.statusCode >= 200 && res.statusCode < 300 && parsed.id) {
          console.log(`[Email Service] ✅ Resend successfully accepted message! Message ID: ${parsed.id}`);
          resolve({ messageId: parsed.id, provider: 'resend' });
        } else {
          console.error(`[Email Service] ❌ Resend rejected dispatch (HTTP ${res.statusCode}):`, {
            statusCode: res.statusCode,
            errorName: parsed.name || 'API_ERROR',
            errorMessage: parsed.message || data,
            recipient: maskedTo
          });

          // Translate specific Resend sandbox & domain errors into crystal-clear instructions
          let userGuidance = parsed.message || `Resend Error (${res.statusCode})`;
          if (res.statusCode === 403 && (data.includes('testing emails') || data.includes('only send testing'))) {
            userGuidance = `Resend Free Sandbox Limitation: When using the test sender (onboarding@resend.dev), Resend strictly allows sending to your own verified Resend account email address. To send to any recipient, verify your custom domain at https://resend.com/domains`;
          } else if (res.statusCode === 401) {
            userGuidance = `Resend Authentication Failed: Invalid RESEND_API_KEY. Please verify your API key at https://resend.com/api-keys`;
          } else if (res.statusCode === 403 && data.includes('domain')) {
            userGuidance = `Resend Unverified Sender Domain: The sender "${cleanFrom}" is not verified in your Resend account. Either use "Wish Yours <onboarding@resend.dev>" or verify your domain in the Resend Dashboard.`;
          }

          reject(new Error(userGuidance));
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[Email Service] ❌ Network error reaching api.resend.com:`, err.message);
      reject(new Error(`Network error contacting Resend API: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      console.error(`[Email Service] ❌ Resend API request timed out after 10s`);
      reject(new Error('Resend API request timed out after 10 seconds'));
    });

    req.write(payload);
    req.end();
  });
}

function sendViaBrevo(apiKey, fromEmail, toEmail, subject, htmlContent) {
  return new Promise((resolve, reject) => {
    const cleanFrom = fromEmail || "no-reply@wishyours.com";
    const cleanTo = (toEmail || '').trim();
    const maskedTo = maskEmail(cleanTo);

    console.log(`[Email Service] 📤 Dispatching email via Brevo to=${maskedTo} from=${cleanFrom}`);

    const payload = JSON.stringify({
      sender: { name: "Wish Yours", email: cleanFrom },
      to: [{ email: cleanTo }],
      subject: subject,
      htmlContent: htmlContent
    });

    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Email Service] ✅ Brevo successfully delivered message!`);
            resolve({ messageId: parsed.messageId, provider: 'brevo' });
          } else {
            console.error(`[Email Service] ❌ Brevo rejected dispatch (HTTP ${res.statusCode}):`, parsed);
            reject(new Error(parsed.message || `Brevo Error (${res.statusCode}): ${data}`));
          }
        } catch {
          reject(new Error(`Brevo HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error(`[Email Service] ❌ Network error reaching api.brevo.com:`, err.message);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      console.error(`[Email Service] ❌ Brevo API request timed out after 10s`);
      reject(new Error('Brevo API request timed out'));
    });

    req.write(payload);
    req.end();
  });
}

// Map font family identifiers to robust CSS font-family stacks with fallbacks
function getFontCssStack(fontFamilyName) {
  const fontMap = {
    'Playfair Display': "'Playfair Display', Georgia, 'Times New Roman', serif",
    'Dancing Script': "'Dancing Script', 'Brush Script MT', cursive",
    'Great Vibes': "'Great Vibes', 'Brush Script MT', cursive",
    'Outfit': "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    'Pacifico': "'Pacifico', 'Comic Sans MS', cursive",
    'Cinzel': "'Cinzel', Georgia, 'Times New Roman', serif"
  };

  if (!fontFamilyName) return fontMap['Playfair Display'];

  for (const [key, stack] of Object.entries(fontMap)) {
    if (fontFamilyName.toLowerCase().includes(key.toLowerCase())) {
      return stack;
    }
  }
  return fontFamilyName.includes(',') ? fontFamilyName : `'${fontFamilyName}', Georgia, serif`;
}

// Generate beautiful HTML template for the email with consistent typography
function generateEmailHTML({ senderName, recipientName, occasion, wishUrl, messageExcerpt, fontFamily }) {
  const fontStack = getFontCssStack(fontFamily);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Special Greeting for You</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Outfit:wght@400;600;700&family=Pacifico&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0e17; margin: 0; padding: 24px 12px; color: #f8fafc; }
    .card { max-width: 580px; margin: 0 auto; background: linear-gradient(145deg, #121826 0%, #0a0e17 100%); border-radius: 24px; padding: 44px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); text-align: center; }
    .badge { display: inline-block; padding: 8px 20px; border-radius: 9999px; background: linear-gradient(90deg, #ec4899, #8b5cf6); color: #ffffff !important; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 24px; }
    h1 { font-family: ${fontStack}; font-size: 30px; line-height: 1.35; margin: 0 0 16px 0; color: #fdf2f8; text-shadow: 0 2px 10px rgba(236,72,153,0.3); }
    p { font-size: 15px; line-height: 1.65; color: #cbd5e1; margin: 0 0 24px 0; }
    .excerpt-box { background: rgba(255,255,255,0.04); border-left: 4px solid #ec4899; padding: 22px 20px; border-radius: 12px; font-family: ${fontStack}; font-size: 18px; line-height: 1.7; color: #fdfbf7; margin: 0 0 32px 0; text-align: left; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); }
    .cta-btn { display: inline-block; padding: 18px 40px; font-size: 16px; font-weight: 800; color: #ffffff !important; text-decoration: none; border-radius: 14px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); box-shadow: 0 12px 30px rgba(236,72,153,0.45); margin-bottom: 24px; letter-spacing: 0.3px; }
    .footer { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 22px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✨ Special Celebration Greeting</div>
    <h1>${recipientName}, you have a heartfelt wish waiting! 🎉</h1>
    <p><strong>${senderName}</strong> has created an interactive digital ${occasion} celebration experience just for you on <strong>Wish Yours</strong>.</p>
    
    <div class="excerpt-box">
      "${messageExcerpt || 'Open the link below to experience your musical candles, memories, and animated greeting!'}"
    </div>

    <div>
      <a href="${wishUrl}" class="cta-btn" target="_blank">Open Your Celebration Webpage ✨</a>
    </div>

    <p style="font-size: 13px; color: #94a3b8; margin-top: 20px;">
      Or copy and paste this link in your browser:<br>
      <a href="${wishUrl}" style="color: #c084fc; word-break: break-all;">${wishUrl}</a>
    </p>

    <div class="footer">
      Sent with love via <a href="https://wishyours.com" style="color: #f472b6; text-decoration: none; font-weight: 600;">Wish Yours</a> — Creating unforgettable digital celebrations.
    </div>
  </div>
</body>
</html>`;
}

async function handleSendEmail(body, baseUrl = 'http://localhost:3000') {
  const { wishId, recipientEmail, senderName, recipientName, occasion, messageExcerpt, slug, fontFamily } = body || {};

  if (!recipientEmail || !recipientEmail.includes('@')) {
    throw { statusCode: 400, message: 'Valid recipient email address is required' };
  }

  // Look up wish to retrieve chosen font if not passed in body
  const wishRecord = (slug || wishId) ? db.getWishBySlug(slug || wishId) : null;
  const chosenFont = fontFamily || wishRecord?.font_family || 'Playfair Display';

  const wishUrl = `${baseUrl}/wish/${slug || wishId}`;
  const subject = `✨ ${senderName || 'Someone special'} sent you a personalized ${occasion || 'celebration'} wish!`;
  const htmlContent = generateEmailHTML({
    senderName: senderName || 'Someone special',
    recipientName: recipientName || 'Friend',
    occasion: occasion || 'Celebration',
    wishUrl,
    messageExcerpt,
    fontFamily: chosenFont
  });

  const resendKey = getCleanApiKey(process.env.RESEND_API_KEY);
  const brevoKey = getCleanApiKey(process.env.BREVO_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  // 1. Dispatch via Resend if API key is configured
  if (resendKey && resendKey.startsWith('re_')) {
    try {
      const resendRes = await sendViaResend(resendKey, fromEmail, recipientEmail, subject, htmlContent);
      db.logEmail({
        wish_id: wishId,
        recipient_email: recipientEmail,
        sender_name: senderName,
        status: 'sent',
        provider: 'resend',
        message_id: resendRes.messageId
      });
      return {
        status: 'success',
        delivered: true,
        provider: 'resend',
        messageId: resendRes.messageId,
        message: `Email successfully delivered to ${recipientEmail} via Resend.`
      };
    } catch (err) {
      db.logEmail({
        wish_id: wishId,
        recipient_email: recipientEmail,
        sender_name: senderName,
        status: 'failed',
        provider: 'resend',
        error_message: err.message
      });
      throw { statusCode: 502, message: err.message };
    }
  }

  // 2. Dispatch via Brevo if configured
  if (brevoKey && brevoKey.length > 10) {
    try {
      const brevoRes = await sendViaBrevo(brevoKey, fromEmail, recipientEmail, subject, htmlContent);
      db.logEmail({
        wish_id: wishId,
        recipient_email: recipientEmail,
        sender_name: senderName,
        status: 'sent',
        provider: 'brevo',
        message_id: brevoRes.messageId
      });
      return {
        status: 'success',
        delivered: true,
        provider: 'brevo',
        messageId: brevoRes.messageId,
        message: `Email successfully delivered to ${recipientEmail} via Brevo.`
      };
    } catch (err) {
      db.logEmail({
        wish_id: wishId,
        recipient_email: recipientEmail,
        sender_name: senderName,
        status: 'failed',
        provider: 'brevo',
        error_message: err.message
      });
      throw { statusCode: 502, message: `Failed to deliver email via Brevo: ${err.message}` };
    }
  }

  // 3. Fallback: Simulated preview with transparent diagnostic feedback
  console.log(`[Email Service Simulation] RESEND_API_KEY is not configured. Emulating dispatch for: ${maskEmail(recipientEmail)}`);
  const simulatedId = `sim_${Date.now()}`;
  db.logEmail({
    wish_id: wishId,
    recipient_email: recipientEmail,
    sender_name: senderName,
    status: 'simulated',
    provider: 'local_simulator',
    message_id: simulatedId
  });

  return {
    status: 'simulated',
    delivered: false,
    provider: 'simulator',
    messageId: simulatedId,
    message: `Preview generated for ${recipientEmail}. To dispatch real emails over the internet, add your RESEND_API_KEY in .env or Render Dashboard.`,
    emailPreview: {
      to: recipientEmail,
      subject,
      url: wishUrl
    }
  };
}

module.exports = {
  handleSendEmail,
  sendViaResend,
  generateEmailHTML,
  getFontCssStack,
  maskEmail,
  getValidResendSender
};
