/**
 * WishCraft AI — Automated Regression Suite:
 * WhatsApp Context-Aware Sharing, International Phone Normalization,
 * Photo Upload Persistence & Live Preview Synchronization.
 */

const assert = require('assert');
const WishShare = require('../public/js/share');
const { deliverWhatsAppMessage, normalizePhone, maskPhone } = require('../api/providers/whatsapp_provider');
const { handleCreateWish, handleGetWish } = require('../api/wishes');

async function runTests() {
  console.log('========================================================');
  console.log('🧪 WishCraft AI: WhatsApp & Photo Regression Test Suite');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✔ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ [FAIL] ${name}:`, e.message);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✔ [PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ [FAIL] ${name}:`, e.message);
      failed++;
    }
  }

  // ==========================================
  // SECTION A: WhatsApp Context-Aware Share Text
  // ==========================================
  console.log('--- A. Testing WhatsApp Context-Aware Share Wording ---');

  test('Birthday share text uses celebratory tone and cake emoji', () => {
    const wish = {
      occasion: 'Birthday',
      recipient_name: 'Aisha',
      sender_name: 'MD RAZA'
    };
    const url = 'https://wishcraft.ai/wish/aisha-bday';
    const text = WishShare.generateShareText(wish, url);

    assert.ok(text.includes('Happy Birthday, Aisha! 🎂'), 'Must include Birthday greeting with cake emoji');
    assert.ok(text.includes('I made something special for you.'), 'Must include special intro');
    assert.ok(text.includes('https://wishcraft.ai/wish/aisha-bday'), 'Must include greeting URL');
    assert.ok(text.includes('— MD RAZA'), 'Must conclude with MD RAZA signature');
  });

  test('Sorry share text is strictly non-celebratory and apology-appropriate', () => {
    const wish = {
      occasion: 'Sorry',
      recipient_name: 'Aisha',
      sender_name: 'MD RAZA'
    };
    const url = 'https://wishcraft.ai/wish/aisha-sorry';
    const text = WishShare.generateShareText(wish, url);

    assert.ok(text.includes('Aisha, I made something I really want you to see.'), 'Must include sincere intro');
    assert.ok(text.includes(url), 'Must include greeting URL');
    assert.ok(text.includes('— MD RAZA'), 'Must conclude with MD RAZA signature');

    // Negative constraints
    const lower = text.toLowerCase();
    assert.strictEqual(lower.includes('celebrate'), false, 'Sorry must NOT contain "celebrate"');
    assert.strictEqual(lower.includes('celebration'), false, 'Sorry must NOT contain "celebration"');
    assert.strictEqual(lower.includes('happy sorry'), false, 'Sorry must NOT contain "Happy Sorry"');
    assert.strictEqual(lower.includes('congratulations'), false, 'Sorry must NOT contain "congratulations"');
  });

  test('Anniversary share text uses romantic tone with heart emoji', () => {
    const wish = {
      occasion: 'Wedding Anniversary',
      recipient_name: 'Sarah',
      sender_name: 'David'
    };
    const url = 'https://wishcraft.ai/wish/anniversary-5';
    const text = WishShare.generateShareText(wish, url);

    assert.ok(text.includes('I made something special for our anniversary ❤️'));
    assert.ok(text.includes(url));
    assert.ok(text.includes('— David'));
  });

  test('Thank You share text uses appreciative tone with prayer hands emoji', () => {
    const wish = {
      occasion: 'Thank You',
      recipient_name: 'Coach Alex',
      sender_name: 'Jordan'
    };
    const url = 'https://wishcraft.ai/wish/thank-you-alex';
    const text = WishShare.generateShareText(wish, url);

    assert.ok(text.includes('Thank you so much, Coach Alex! 🙏'));
    assert.ok(text.includes(url));
    assert.ok(text.includes('— Jordan'));
  });

  // ==========================================
  // SECTION B: Phone Number Normalization & wa.me Routing
  // ==========================================
  console.log('\n--- B. Testing Phone Number Normalization & wa.me Routing ---');

  const testPhoneNumbers = [
    { input: '+91 98765 43210', expected: '919876543210', desc: 'Indian number with +91 and spaces' },
    { input: '9876543210', expected: '919876543210', desc: '10-digit Indian number auto-prefixes 91' },
    { input: '+1 (555) 234-5678', expected: '15552345678', desc: 'US number with brackets and hyphens' },
    { input: '0044 7911 123456', expected: '447911123456', desc: 'UK number with 00 international prefix' },
    { input: '', expected: '', desc: 'Empty input returns empty string' }
  ];

  for (const item of testPhoneNumbers) {
    test(`normalizePhone handles: ${item.desc}`, () => {
      const clean = WishShare.formatWhatsAppNumber(item.input);
      assert.strictEqual(clean, item.expected);
    });
  }

  test('getWhatsAppUrl with valid recipient phone generates https://wa.me/<NUMBER>?text=...', () => {
    const wish = { occasion: 'Birthday', recipient_name: 'Aisha', sender_name: 'MD RAZA' };
    const url = 'https://wishcraft.ai/wish/aisha-bday';
    const waUrl = WishShare.getWhatsAppUrl(wish, url, '+91 98765 43210');

    assert.ok(waUrl.startsWith('https://wa.me/919876543210?text='));
    assert.ok(waUrl.includes(encodeURIComponent('Happy Birthday, Aisha! 🎂')));
    assert.ok(waUrl.includes(encodeURIComponent('https://wishcraft.ai/wish/aisha-bday')));
  });

  test('getWhatsAppUrl without phone generates generic https://api.whatsapp.com/send?text=...', () => {
    const wish = { occasion: 'Sorry', recipient_name: 'Aisha', sender_name: 'MD RAZA' };
    const url = 'https://wishcraft.ai/wish/aisha-sorry';
    const waUrl = WishShare.getWhatsAppUrl(wish, url, '');

    assert.ok(waUrl.startsWith('https://api.whatsapp.com/send?text='));
    assert.ok(waUrl.includes(encodeURIComponent('Aisha, I made something I really want you to see.')));
  });

  // ==========================================
  // SECTION C: URL Encoding & Multi-Script Integrity
  // ==========================================
  console.log('\n--- C. Testing URL Encoding & Multi-Script Integrity ---');

  test('Properly URL encodes apostrophes, quotes, Hindi, and emoji', () => {
    const wish = {
      occasion: 'Birthday',
      recipient_name: 'रिया (Riya)',
      sender_name: "MD RAZA's Team"
    };
    const url = 'https://wishcraft.ai/wish/riya-जन्मदिन';
    const waUrl = WishShare.getWhatsAppUrl(wish, url);

    assert.ok(!waUrl.includes(' '), 'Must not contain unencoded spaces');
    assert.ok(!waUrl.includes('\n'), 'Must not contain raw newlines');
    assert.ok(!waUrl.includes('रिया'), 'Hindi characters must be percent-encoded');
  });

  // ==========================================
  // SECTION D: Photo Upload & Persistence Across Reloads
  // ==========================================
  console.log('\n--- D. Testing Photo Persistence & Reload Lifecycle ---');

  await asyncTest('Saved greeting persists photos and reloads with polaroid structure', async () => {
    const samplePhotos = [
      { url: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', caption: 'Goa beach memories' },
      { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176', caption: 'Sunset together' }
    ];

    const createRes = await handleCreateWish({
      recipient_name: 'Aisha',
      sender_name: 'MD RAZA',
      occasion: 'Sorry',
      relationship: 'Best Friend',
      style: 'Deeply Apologetic',
      emotion_intensity: 'Deep',
      language: 'hinglish',
      message_length: 'medium',
      template: 'sincere_letter',
      font_family: 'Playfair Display',
      message: 'I am truly sorry Aisha. You mean the world to me.',
      photos: samplePhotos
    });

    assert.strictEqual(createRes.status, 'success');
    assert.ok(createRes.wish.slug);

    // Fetch by slug to emulate browser reload
    const fetched = await handleGetWish(createRes.wish.slug);
    assert.strictEqual(fetched.status, 'success');
    assert.strictEqual(fetched.wish.images.length, 2);
    assert.strictEqual(fetched.wish.images[0].caption, 'Goa beach memories');
    assert.strictEqual(fetched.wish.images[1].caption, 'Sunset together');
    assert.ok(!fetched.wish.images[0].url.startsWith('blob:'), 'Must NOT rely on temporary blob URLs');
  });

  // ==========================================
  // SECTION E: Official Meta WhatsApp API Cloud Architecture
  // ==========================================
  console.log('\n--- E. Testing Automated WhatsApp Architecture & Provider ---');

  await asyncTest('deliverWhatsAppMessage provides safe simulation with phone masking', async () => {
    const result = await deliverWhatsAppMessage({
      recipientPhone: '+91 98765 43210',
      recipientName: 'Aisha',
      senderName: 'MD RAZA',
      occasion: 'Sorry',
      wishUrl: 'https://wishcraft.ai/wish/aisha-sorry'
    });

    assert.strictEqual(result.status, 'simulated');
    assert.strictEqual(result.provider, 'local_whatsapp_simulator');
    assert.strictEqual(result.details.recipientPhone, '919****210');
  });

  test('maskPhone conceals private recipient numbers in logs', () => {
    assert.strictEqual(maskPhone('919876543210'), '919****210');
    assert.strictEqual(maskPhone('15551234567'), '155****567');
  });

  console.log('\n========================================================');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
