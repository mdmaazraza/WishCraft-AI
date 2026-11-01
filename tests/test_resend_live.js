/**
 * Wish Yours — Resend Email Verification & Live Diagnostic Tool
 * 
 * Usage:
 *   1. Test simulated preview:
 *      node tests/test_resend_live.js
 * 
 *   2. Test live Resend dispatch (requires real API key & verified recipient on free tier):
 *      $env:RESEND_API_KEY="re_your_api_key"
 *      node tests/test_resend_live.js your-registered-email@example.com
 */

const {
  handleSendEmail,
  sendViaResend,
  generateEmailHTML,
  getFontCssStack,
  getValidResendSender
} = require('../api/email');

async function testResend() {
  console.log('====================================================');
  console.log('💌 Wish Yours — Resend Email Delivery Diagnostic');
  console.log('====================================================\n');

  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const targetEmail = process.argv[2] || 'test.recipient@example.com';

  console.log(`[Config Check]`);
  console.log(`- RESEND_API_KEY: ${apiKey ? (apiKey.startsWith('re_') ? '✅ Configured (re_***)' : '⚠️ Format unexpected (should start with re_)') : '❌ Not set (running in Simulation Mode)'}`);
  console.log(`- Configured Sender: ${process.env.RESEND_FROM_EMAIL || '(default)'}`);
  console.log(`- Validated Sender: ${getValidResendSender(process.env.RESEND_FROM_EMAIL)}`);
  console.log(`- Test Recipient: ${targetEmail}\n`);

  if (!apiKey) {
    console.log('ℹ️  No RESEND_API_KEY detected in environment.');
    console.log('   Testing development simulator pipeline...\n');

    try {
      const res = await handleSendEmail({
        recipientEmail: targetEmail,
        senderName: 'Alex',
        recipientName: 'Jordan',
        occasion: 'Birthday',
        messageExcerpt: 'Wishing you all the joy and happiness in the world!',
        fontFamily: 'Dancing Script',
        slug: 'test-diagnostic-slug'
      });

      console.log('✅ Simulator Response:');
      console.log(`   - Status: ${res.status}`);
      console.log(`   - Provider: ${res.provider}`);
      console.log(`   - Message ID: ${res.messageId}`);
      console.log(`   - Note: ${res.message}\n`);
      console.log('🎉 Email handler works cleanly in simulation mode.');
    } catch (err) {
      console.error('❌ Simulator failed:', err);
    }
    return;
  }

  console.log('🚀 Attempting LIVE dispatch to api.resend.com...\n');
  try {
    const res = await handleSendEmail({
      recipientEmail: targetEmail,
      senderName: 'Wish Yours Test Team',
      recipientName: 'Celebrant',
      occasion: 'Birthday',
      messageExcerpt: 'Testing live email delivery from Wish Yours platform!',
      fontFamily: 'Playfair Display',
      slug: 'live-test-celebration'
    });

    console.log('====================================================');
    console.log('🎉 SUCCESS! Resend Accepted the Email Dispatch');
    console.log('====================================================');
    console.log(`- Message ID: ${res.messageId}`);
    console.log(`- Provider: ${res.provider}`);
    console.log(`- Delivery Status: ${res.delivered ? 'Accepted' : 'Simulated'}`);
    console.log(`- Details: ${res.message}\n`);
  } catch (err) {
    console.error('====================================================');
    console.error('❌ Resend Live Dispatch Error');
    console.error('====================================================');
    console.error(`- Error: ${err.message || err}`);
    console.error('\n📋 Diagnostic Troubleshooting Guide:');
    console.error('1. If HTTP 403 "testing emails": Resend free accounts can ONLY send to the email address registered with that Resend account. To send to any recipient, verify your custom domain at https://resend.com/domains');
    console.error('2. If HTTP 401: Invalid RESEND_API_KEY. Verify your key at https://resend.com/api-keys');
    console.error('3. Sender: Make sure you use "Wish Yours <onboarding@resend.dev>" until your domain is verified.\n');
  }
}

testResend();
