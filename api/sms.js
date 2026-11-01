/**
 * Wish Yours — SMS Share & Delivery Service
 */

const https = require('https');

async function handlePrepareSMS(body, baseUrl = 'http://localhost:3000') {
  const { recipientPhone, recipientName, senderName, occasion, slug } = body || {};

  const wishUrl = `${baseUrl}/wish/${slug}`;
  const smsBody = `Hi ${recipientName || 'there'}! ✨ ${senderName || 'A friend'} sent you a personalized ${occasion || 'celebration'} greeting on Wish Yours: ${wishUrl}`;

  // Build clean sms: URI for mobile browsers
  // On iOS: sms:1234567890&body=... or sms:?&body=...
  // On Android: sms:1234567890?body=...
  const encodedBody = encodeURIComponent(smsBody);
  const cleanPhone = (recipientPhone || '').replace(/[^0-9+]/g, '');
  const deepLink = cleanPhone ? `sms:${cleanPhone}?body=${encodedBody}` : `sms:?body=${encodedBody}`;

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  // If Twilio is configured and phone number provided, send direct SMS
  if (twilioSid && twilioToken && twilioFrom && cleanPhone) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const payload = new URLSearchParams({
        To: cleanPhone,
        From: twilioFrom,
        Body: smsBody
      }).toString();

      const twilioRes = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.twilio.com',
          port: 443,
          path: `/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
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
                resolve(parsed);
              } else {
                reject(new Error(parsed.message || data));
              }
            } catch {
              reject(new Error(data));
            }
          });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
      });

      return {
        status: 'success',
        delivered: true,
        provider: 'twilio',
        messageId: twilioRes.sid,
        message: `Direct SMS sent to ${cleanPhone} via Twilio.`,
        deepLink
      };
    } catch (err) {
      console.warn('Twilio delivery failed, falling back to deep link:', err.message);
      return {
        status: 'fallback',
        delivered: false,
        error: err.message,
        deepLink,
        message: 'Could not send direct SMS via Twilio. Open default SMS app instead.'
      };
    }
  }

  return {
    status: 'ready',
    delivered: false,
    deepLink,
    smsBody,
    message: 'Open your messaging app to send this greeting.'
  };
}

module.exports = {
  handlePrepareSMS
};
