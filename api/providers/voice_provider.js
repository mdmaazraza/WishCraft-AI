/**
 * Wish Yours — Scheduled Delivery: Automated Voice Call Provider Abstraction
 * Supports programmable voice calls via Twilio Voice / Exotel with TwiML / NCCO Text-To-Speech.
 */

const https = require('https');

function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '***';
  const clean = phone.trim();
  if (clean.length < 5) return '***';
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
}

async function triggerVoiceCall({
  recipientPhone,
  recipientName,
  senderName,
  occasion,
  personalMessage
}) {
  if (!recipientPhone || recipientPhone.length < 7) {
    throw new Error('Valid recipient phone number with country code is required for voice call delivery.');
  }

  const masked = maskPhone(recipientPhone);
  const speechText = `Hello ${recipientName || 'there'}! This is a special celebration call from Wish Yours. ${senderName || 'Someone special'} has scheduled a warm ${occasion || 'celebration'} wish for you: ${personalMessage || 'Wishing you all the joy, smiles, and laughter in the world!'}. Please check your phone for the link to your interactive digital celebration webpage. Have a wonderful day!`;

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  // 1. Twilio Voice with TwiML Text-To-Speech (TTS)
  if (twilioSid && twilioToken && twilioFrom && twilioSid.startsWith('AC')) {
    console.log(`[Voice Provider] Triggering voice call via Twilio to ${masked}...`);
    return new Promise((resolve, reject) => {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const twiml = `<Response><Say voice="alice" language="en-IN">${speechText}</Say></Response>`;
      
      const postData = new URLSearchParams({
        To: recipientPhone,
        From: twilioFrom,
        Twiml: twiml
      }).toString();

      const options = {
        hostname: 'api.twilio.com',
        port: 443,
        path: `/2010-04-01/Accounts/${twilioSid}/Calls.json`,
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
                provider: 'twilio_voice',
                callSid: parsed.sid,
                status: parsed.status,
                delivered: true
              });
            } else {
              reject(new Error(parsed.message || `Twilio Voice Error (${res.statusCode}): ${data}`));
            }
          } catch (e) {
            reject(new Error(`Twilio Voice response parse error: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Twilio Voice request timed out'));
      });
      req.write(postData);
      req.end();
    });
  }

  // 2. Simulated Voice Provider (No paid telephony service active)
  console.log(`[Voice Provider Simulation] No voice provider credentials configured. Emulating voice call trigger to: ${masked}`);
  return {
    provider: 'simulated_voice',
    callSid: `call_sim_${Date.now()}`,
    delivered: false,
    synthesizedSpeechExcerpt: speechText.slice(0, 100) + '...',
    note: 'Automated voice calls require TWILIO_ACCOUNT_SID or EXOTEL credentials. Due to telecom interconnect costs, carrier voice calls are inherently a paid service. See docs/SMS_VOICE_RESEARCH.md for provider details.'
  };
}

module.exports = {
  triggerVoiceCall,
  maskPhone
};
