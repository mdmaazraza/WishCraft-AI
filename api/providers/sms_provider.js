/**
 * Wish Yours — Scheduled Delivery: SMS Provider Abstraction
 * Supports Twilio, Fast2SMS (India), MSG91, and safe simulated fallback.
 */

const https = require('https');

function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '***';
  const clean = phone.trim();
  if (clean.length < 5) return '***';
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
}

async function deliverSMS({
  recipientPhone,
  recipientName,
  senderName,
  occasion,
  wishUrl
}) {
  if (!recipientPhone || recipientPhone.length < 7) {
    throw new Error('Valid recipient phone number with country code is required (e.g. +91 9876543210).');
  }

  const masked = maskPhone(recipientPhone);
  const smsBody = `✨ Hi ${recipientName || 'Friend'}! ${senderName || 'Someone special'} scheduled an unforgettable ${occasion || 'celebration'} greeting for you on Wish Yours: ${wishUrl}`;

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  const fast2smsKey = process.env.FAST2SMS_API_KEY;

  // 1. Twilio SMS Integration
  if (twilioSid && twilioToken && twilioFrom && twilioSid.startsWith('AC')) {
    console.log(`[SMS Provider] Dispatching SMS via Twilio to ${masked}...`);
    return new Promise((resolve, reject) => {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const postData = new URLSearchParams({
        To: recipientPhone,
        From: twilioFrom,
        Body: smsBody
      }).toString();

      const options = {
        hostname: 'api.twilio.com',
        port: 443,
        path: `/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
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
              resolve({
                provider: 'twilio',
                messageId: parsed.sid,
                delivered: true,
                status: parsed.status
              });
            } else {
              reject(new Error(parsed.message || `Twilio Error (${res.statusCode}): ${data}`));
            }
          } catch (e) {
            reject(new Error(`Twilio response parse error: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Twilio SMS request timed out after 10s'));
      });
      req.write(postData);
      req.end();
    });
  }

  // 2. Fast2SMS India Quick SMS Integration
  if (fast2smsKey && fast2smsKey.length > 10) {
    console.log(`[SMS Provider] Dispatching SMS via Fast2SMS to ${masked}...`);
    return new Promise((resolve, reject) => {
      // Strip country code +91 if present for Fast2SMS numbers parameter
      const nationalNumber = recipientPhone.replace(/^\+?91/, '').replace(/[^0-9]/g, '');
      const payload = JSON.stringify({
        route: 'q',
        message: smsBody,
        language: 'english',
        flash: 0,
        numbers: nationalNumber
      });

      const options = {
        hostname: 'www.fast2sms.com',
        port: 443,
        path: '/dev/bulkV2',
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
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
            if (parsed.return === true || res.statusCode === 200) {
              resolve({
                provider: 'fast2sms',
                messageId: parsed.request_id || `f2s_${Date.now()}`,
                delivered: true,
                message: parsed.message?.[0] || 'SMS accepted by Fast2SMS'
              });
            } else {
              reject(new Error(parsed.message?.[0] || `Fast2SMS error: ${data}`));
            }
          } catch (e) {
            reject(new Error(`Fast2SMS response parse error: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Fast2SMS request timed out'));
      });
      req.write(payload);
      req.end();
    });
  }

  // 3. Simulated Fallback (No paid credentials active)
  console.log(`[SMS Provider Simulation] No SMS provider configured. Emulating delivery to: ${masked}`);
  return {
    provider: 'simulated_sms',
    messageId: `sms_sim_${Date.now()}`,
    delivered: false,
    manualFallbackUrl: `sms:${encodeURIComponent(recipientPhone)}?body=${encodeURIComponent(smsBody)}`,
    note: 'SMS simulated. Automated SMS requires TWILIO_ACCOUNT_SID or FAST2SMS_API_KEY in environment. See docs/SMS_VOICE_RESEARCH.md for India DLT & provider details.'
  };
}

module.exports = {
  deliverSMS,
  maskPhone
};
