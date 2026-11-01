/**
 * Wish Yours — Email Delivery Service (Resend / Brevo with native HTTPS)
 */

const https = require('https');
const db = require('../data/db');

function sendViaResend(apiKey, fromEmail, toEmail, subject, htmlContent) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from: fromEmail || 'Wish Yours <wishes@resend.dev>',
      to: [toEmail],
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
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ messageId: parsed.id, provider: 'resend' });
          } else {
            reject(new Error(parsed.message || `Resend Error (${res.statusCode}): ${data}`));
          }
        } catch {
          reject(new Error(`Resend HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Resend API request timed out'));
    });

    req.write(payload);
    req.end();
  });
}

function sendViaBrevo(apiKey, fromEmail, toEmail, subject, htmlContent) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      sender: { name: "Wish Yours", email: fromEmail || "no-reply@wishyours.com" },
      to: [{ email: toEmail }],
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
            resolve({ messageId: parsed.messageId, provider: 'brevo' });
          } else {
            reject(new Error(parsed.message || `Brevo Error (${res.statusCode}): ${data}`));
          }
        } catch {
          reject(new Error(`Brevo HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Brevo API request timed out'));
    });

    req.write(payload);
    req.end();
  });
}

// Generate beautiful HTML template for the email
function generateEmailHTML({ senderName, recipientName, occasion, wishUrl, messageExcerpt }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Special Greeting for You</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #f8fafc; }
    .card { max-width: 580px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 20px; padding: 40px 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); text-align: center; }
    .badge { display: inline-block; padding: 8px 18px; border-radius: 9999px; background: linear-gradient(90deg, #ec4899, #8b5cf6); color: white; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
    h1 { font-size: 28px; line-height: 1.3; margin: 0 0 16px 0; background: linear-gradient(90deg, #f472b6, #c084fc, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { font-size: 16px; line-height: 1.6; color: #cbd5e1; margin: 0 0 24px 0; }
    .excerpt-box { background: rgba(255,255,255,0.04); border-left: 4px solid #ec4899; padding: 18px; border-radius: 8px; font-style: italic; color: #e2e8f0; margin-bottom: 30px; text-align: left; }
    .cta-btn { display: inline-block; padding: 16px 36px; font-size: 16px; font-weight: bold; color: #ffffff !important; text-decoration: none; border-radius: 12px; background: linear-gradient(90deg, #ec4899, #8b5cf6); box-shadow: 0 10px 25px rgba(236,72,153,0.4); margin-bottom: 24px; }
    .footer { font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Special Greeting</div>
    <h1>${recipientName}, you have a heartfelt wish waiting! ✨</h1>
    <p><strong>${senderName}</strong> has created a personalized digital ${occasion} celebration experience just for you on Wish Yours.</p>
    
    <div class="excerpt-box">
      "${messageExcerpt || 'Open the link below to experience your musical candles, memories, and animated greeting!'}"
    </div>

    <a href="${wishUrl}" class="cta-btn" target="_blank">Open Your Celebration Experience 🎉</a>

    <p style="font-size: 13px; color: #94a3b8;">
      Or copy and paste this link in your browser:<br>
      <a href="${wishUrl}" style="color: #c084fc; word-break: break-all;">${wishUrl}</a>
    </p>

    <div class="footer">
      Sent with love via <a href="https://wishyours.com" style="color: #cbd5e1; text-decoration: none;">Wish Yours</a> — Creating unforgettable digital celebrations.
    </div>
  </div>
</body>
</html>
  `;
}

async function handleSendEmail(body, baseUrl = 'http://localhost:3000') {
  const { wishId, recipientEmail, senderName, recipientName, occasion, messageExcerpt, slug } = body || {};

  if (!recipientEmail || !recipientEmail.includes('@')) {
    throw { statusCode: 400, message: 'Valid recipient email address is required' };
  }

  const wishUrl = `${baseUrl}/wish/${slug || wishId}`;
  const subject = `✨ ${senderName || 'Someone special'} sent you a personalized ${occasion || 'celebration'} wish!`;
  const htmlContent = generateEmailHTML({
    senderName: senderName || 'Someone special',
    recipientName: recipientName || 'Friend',
    occasion: occasion || 'Celebration',
    wishUrl,
    messageExcerpt
  });

  const resendKey = process.env.RESEND_API_KEY;
  const brevoKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  // 1. Try Resend if configured
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
      console.error('Resend delivery failed:', err.message);
      db.logEmail({
        wish_id: wishId,
        recipient_email: recipientEmail,
        sender_name: senderName,
        status: 'failed',
        provider: 'resend',
        error_message: err.message
      });
      throw { statusCode: 502, message: `Failed to deliver email via Resend: ${err.message}` };
    }
  }

  // 2. Try Brevo if configured
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
      console.error('Brevo delivery failed:', err.message);
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

  // 3. Simulated delivery with transparent feedback (Never pretend real delivery occurred without credentials!)
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
    message: `Preview generated for ${recipientEmail}. To dispatch real emails over the internet, add your free RESEND_API_KEY in .env.`,
    emailPreview: {
      to: recipientEmail,
      subject,
      url: wishUrl
    }
  };
}

module.exports = {
  handleSendEmail
};
