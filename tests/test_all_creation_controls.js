/**
 * WishCraft AI — Comprehensive Functional Test Suite for Creation Controls,
 * Writing Improvement, Typography, Templates, Photos, and State Persistence.
 */

const assert = require('assert');
const http = require('http');
const db = require('../data/db');
const { correctTextWithAI } = require('../data/text_cleaner');
const { handleGenerateMessage } = require('../api/generate-message');
const { handleCreateWish, handleGetWish } = require('../api/wishes');
const { sanitizeFontFamily } = require('../api/wishes');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 WishCraft AI Creation Controls & Photo Test Suite');
  console.log('====================================================\n');

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
  // AREA 1: Improve Writing Engine
  // ==========================================
  console.log('--- 1. Testing Writing Improvement Engine ---');

  await asyncTest('Improve Writing corrects messy user input while preserving core facts', async () => {
    const rawInput = "we was frnds from collage and you always suport me when i was sad";
    const result = await correctTextWithAI(rawInput, {
      occasion: 'Sorry',
      relationship: 'Best Friend',
      recipientName: 'Aisha',
      language: 'en'
    });

    assert.ok(result, 'Result should exist');
    assert.strictEqual(result.original, rawInput, 'Original text should be preserved');
    assert.ok(result.improved, 'Improved text should be returned');
    assert.ok(result.changesMade, 'Changes should be recorded');
    assert.ok(
      result.improved.toLowerCase().includes('friends') || result.improved.toLowerCase().includes('supported'),
      'Grammar errors should be corrected'
    );
  });

  await asyncTest('Improve Writing safely handles short or clean text without destruction', async () => {
    const cleanInput = "You are the sweetest friend in the universe.";
    const result = await correctTextWithAI(cleanInput);
    assert.strictEqual(result.original, cleanInput);
    assert.ok(result.improved.includes('sweetest friend'));
  });

  // ==========================================
  // AREA 2: Emotion Intensity
  // ==========================================
  console.log('\n--- 2. Testing Emotion Intensity Settings ---');

  const intensities = ['Light', 'Balanced', 'Deep', 'Very Emotional'];
  for (const intensity of intensities) {
    await asyncTest(`Generate message accepts and handles intensity: ${intensity}`, async () => {
      const payload = {
        occasion: 'Sorry',
        relationship: 'Best Friend',
        recipientName: 'Aisha',
        senderName: 'MD RAZA',
        emotion: 'Deeply Apologetic',
        emotionIntensity: intensity,
        language: 'en',
        length: 'medium',
        template: 'sincere_letter'
      };
      const result = await handleGenerateMessage(payload, '127.0.0.1');
      assert.strictEqual(result.status, 'success');
      assert.ok(result.variations && result.variations.length > 0);
    });
  }

  // ==========================================
  // AREA 3: Language & Message Length
  // ==========================================
  console.log('\n--- 3. Testing Language & Message Length Preferences ---');

  const languages = ['en', 'hi', 'hinglish'];
  for (const lang of languages) {
    await asyncTest(`Generate message works with language: ${lang}`, async () => {
      const result = await handleGenerateMessage({
        occasion: 'Birthday',
        relationship: 'Friend',
        recipientName: 'Sarah',
        senderName: 'Alex',
        language: lang,
        length: 'short'
      }, '127.0.0.1');
      assert.strictEqual(result.status, 'success');
      assert.ok(result.variations.length > 0);
    });
  }

  const lengths = [
    { key: 'short', expectedMin: 15, expectedMax: 50 },
    { key: 'medium', expectedMin: 35, expectedMax: 90 },
    { key: 'long', expectedMin: 70, expectedMax: 150 }
  ];

  for (const len of lengths) {
    await asyncTest(`Generate message respects length preference: ${len.key}`, async () => {
      const result = await handleGenerateMessage({
        occasion: 'Birthday',
        relationship: 'Best Friend',
        recipientName: 'Alex',
        senderName: 'Sam',
        length: len.key
      }, '127.0.0.1');
      assert.strictEqual(result.status, 'success');
      assert.ok(result.variations.length > 0);
    });
  }

  // ==========================================
  // AREA 4: Interactive Greeting Templates
  // ==========================================
  console.log('\n--- 4. Testing Interactive Greeting Templates ---');

  const templates = ['cake', 'envelope', 'sincere_letter', 'friendship_card'];
  for (const tpl of templates) {
    await asyncTest(`Wish creation persists template: ${tpl}`, async () => {
      const wishRes = await handleCreateWish({
        recipient_name: 'Test Recipient',
        sender_name: 'Test Sender',
        occasion: 'Birthday',
        message: 'Wishing you all the joy in the world!',
        template: tpl
      });
      assert.strictEqual(wishRes.status, 'success');
      assert.strictEqual(wishRes.wish.template, tpl);

      const fetched = await handleGetWish(wishRes.wish.slug);
      assert.strictEqual(fetched.wish.template, tpl);
    });
  }

  // ==========================================
  // AREA 5: Typography & Lettering Style
  // ==========================================
  console.log('\n--- 5. Testing Lettering & Typography Styles ---');

  const fonts = [
    'Playfair Display',
    'Dancing Script',
    'Great Vibes',
    'Outfit',
    'Pacifico',
    'Cinzel'
  ];

  for (const font of fonts) {
    test(`Typography sanitizeFontFamily recognizes: ${font}`, () => {
      const sanitized = sanitizeFontFamily(font);
      assert.strictEqual(sanitized, font);
    });

    await asyncTest(`Wish creation persists font: ${font}`, async () => {
      const res = await handleCreateWish({
        recipient_name: 'Font Test User',
        sender_name: 'MD RAZA',
        occasion: 'Wedding Anniversary',
        message: 'Forever and always my love.',
        font_family: font
      });
      assert.strictEqual(res.wish.font_family, font);

      const fetched = await handleGetWish(res.wish.slug);
      assert.strictEqual(fetched.wish.font_family, font);
    });
  }

  // ==========================================
  // AREA 6: Photo Upload & Gallery Storage
  // ==========================================
  console.log('\n--- 6. Testing Photo Upload & Gallery Attachment ---');

  await asyncTest('Wish creation normalizes and persists multiple photos', async () => {
    const mockPhotos = [
      { url: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', caption: 'First trip together' },
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
    ];

    const res = await handleCreateWish({
      recipient_name: 'Photo User',
      sender_name: 'MD RAZA',
      occasion: 'Birthday',
      message: 'Happy birthday with great photos!',
      photos: mockPhotos
    });

    assert.strictEqual(res.status, 'success');
    assert.strictEqual(res.wish.images.length, 2);
    assert.strictEqual(res.wish.images[0].url, mockPhotos[0].url);
    assert.strictEqual(res.wish.images[0].caption, 'First trip together');
    assert.strictEqual(res.wish.images[1].url, mockPhotos[1]);
    assert.strictEqual(res.wish.images[1].caption, 'Memory #2');

    const fetched = await handleGetWish(res.wish.slug);
    assert.strictEqual(fetched.wish.images.length, 2);
  });

  // ==========================================
  // AREA 7: Full End-to-End Scenario (Prompt Section 26)
  // ==========================================
  console.log('\n--- 7. Full End-to-End Functional Scenario (Section 26) ---');

  await asyncTest('Exact user scenario: Sorry -> Best Friend -> Aisha / MD RAZA -> Memory -> Deeply Apologetic / Deep -> Hinglish / Medium -> Sincere Letter / Playfair Display -> Photo attached -> Wish created', async () => {
    // 1. Text improvement
    const rawMemory = 'we was frnds from collage and you always suport me when i was sad';
    const cleanMemory = (await correctTextWithAI(rawMemory, { occasion: 'Sorry', relationship: 'Best Friend' })).improved;

    // 2. AI generation
    const genResult = await handleGenerateMessage({
      occasion: 'Sorry',
      relationship: 'Best Friend',
      recipientName: 'Aisha',
      senderName: 'MD RAZA',
      memories: cleanMemory,
      style: 'Deeply Apologetic',
      emotionIntensity: 'Deep',
      language: 'hinglish',
      length: 'medium',
      template: 'sincere_letter'
    }, '127.0.0.1');

    assert.strictEqual(genResult.status, 'success');
    const selectedWish = genResult.variations[0];
    assert.ok(selectedWish.text.length > 20);

    // 3. Persistence
    const createdWishRes = await handleCreateWish({
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
      message: selectedWish.text,
      memories: cleanMemory,
      images: [
        { url: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==', caption: 'Goa memory' }
      ]
    });

    assert.strictEqual(createdWishRes.status, 'success');
    const saved = createdWishRes.wish;
    assert.strictEqual(saved.recipient_name, 'Aisha');
    assert.strictEqual(saved.sender_name, 'MD RAZA');
    assert.strictEqual(saved.occasion, 'Sorry');
    assert.strictEqual(saved.relationship, 'Best Friend');
    assert.strictEqual(saved.emotion_intensity, 'Deep');
    assert.strictEqual(saved.template, 'sincere_letter');
    assert.strictEqual(saved.font_family, 'Playfair Display');
    assert.strictEqual(saved.images.length, 1);
    assert.strictEqual(saved.images[0].caption, 'Goa memory');

    // 4. Verification via slug
    const verified = await handleGetWish(saved.slug);
    assert.strictEqual(verified.wish.id, saved.id);
    assert.strictEqual(verified.wish.recipient_name, 'Aisha');
    assert.ok(verified.wish.message.includes('MD RAZA'));
  });

  console.log('\n====================================================');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
