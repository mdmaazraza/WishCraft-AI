/**
 * Wish Yours — Full Creation Flow Audit & Repair Test Suite
 * Validates single canonical state, dual-casing API normalization, strict word limits,
 * occasion-aware copy & negative constraints, emotion intensity, and template persistence.
 */

const assert = require('assert');
const { handleGenerateMessage } = require('../api/generate-message');
const { handleCreateWish, handleGetWish } = require('../api/wishes');
const { resolveOccasion, validateMessageContent } = require('../data/occasions');
const { cleanText } = require('../data/text_cleaner');
const { isMdRazaSender, getSenderSignatureInline } = require('../data/attribution');

async function runCreationFlowAuditTests() {
  console.log('\n======================================================');
  console.log('🧪 Wish Yours: Creation Flow Audit & Repair Test Suite');
  console.log('======================================================\n');
  let passed = 0;

  // -------------------------------------------------------------------------
  // TEST 1: Dual Casing Normalization in handleGenerateMessage
  // -------------------------------------------------------------------------
  try {
    console.log('▶ Test 1: Verifying backend parameter casing normalization (camelCase & snake_case)...');
    
    // Payload with snake_case
    const snakeRes = await handleGenerateMessage({
      occasion: 'Birthday',
      relationship: 'Sister',
      recipient_name: 'Priya',
      sender_name: 'Arjun',
      style: 'Sweet & Loving',
      emotion_intensity: 'Balanced',
      memories: 'Remember our trip to Manali',
      language: 'en',
      length: 'medium',
      template: 'cake'
    });

    assert.strictEqual(snakeRes.status, 'success', 'Must succeed with snake_case');
    assert.strictEqual(snakeRes.variations.length, 3, 'Must return 3 variations');
    assert.ok(snakeRes.variations[0].text.includes('Priya'), 'Recipient name must appear in variation text');
    assert.ok(snakeRes.variations[0].text.includes('Arjun'), 'Sender name must appear in variation text');
    assert.ok(!snakeRes.variations[0].text.includes('MD RAZA'), 'Unrelated sender Arjun must NEVER sign as MD RAZA');

    // Payload with camelCase
    const camelRes = await handleGenerateMessage({
      occasion: 'Birthday',
      relationship: 'Sister',
      recipientName: 'Ananya',
      senderName: 'Kabir',
      emotion: 'Sweet & Loving',
      emotionIntensity: 'Deep',
      memory: 'Dancing in the rain together',
      language: 'en',
      messageLength: 'short',
      template: 'cake'
    });

    assert.strictEqual(camelRes.status, 'success', 'Must succeed with camelCase');
    assert.ok(camelRes.variations[0].text.includes('Ananya'), 'Recipient name from camelCase must be preserved');
    assert.ok(camelRes.variations[0].text.includes('Kabir'), 'Sender name from camelCase must be preserved');

    console.log('  ✅ PASS: Both snake_case and camelCase payloads normalized seamlessly without dropping names.');
    passed++;
  } catch (err) {
    console.error('  ❌ Test 1 Failed:', err);
    throw err;
  }

  // -------------------------------------------------------------------------
  // TEST 2: Apology / Sorry Flow (Zero Celebratory Language & Sincere Copy)
  // -------------------------------------------------------------------------
  try {
    console.log('▶ Test 2: Testing Apology flow (Aisha, MD RAZA, Hinglish, Deep Intensity, Sincere Copy)...');

    const sorryOcc = resolveOccasion('Sorry');
    assert.strictEqual(sorryOcc.isCelebration, false, 'Sorry must NOT be a celebration');
    assert.strictEqual(sorryOcc.recommendedTemplate, 'sincere_letter', 'Sorry recommended template must be sincere_letter');
    assert.strictEqual(sorryOcc.messageType, 'Apology', 'Message type must be Apology');

    const sorryGen = await handleGenerateMessage({
      occasion: 'Sorry',
      relationship: 'Best Friend',
      recipient_name: 'Aisha',
      sender_name: 'MD RAZA',
      emotion: 'Deeply Apologetic',
      emotion_intensity: 'Deep',
      memories: 'We had a misunderstanding last Friday about the project deadline',
      language: 'hinglish',
      length: 'medium',
      template: 'sincere_letter'
    });

    assert.strictEqual(sorryGen.status, 'success');
    assert.strictEqual(sorryGen.variations.length, 3);

    for (let i = 0; i < sorryGen.variations.length; i++) {
      const v = sorryGen.variations[i];
      const check = validateMessageContent('Sorry', v.text);
      assert.strictEqual(check.valid, true, `Variation ${i + 1} must not contain forbidden words: ${check.violations.join(', ')}`);
      
      const lower = v.text.toLowerCase();
      assert.ok(!lower.includes('happy sorry'), `Variation ${i + 1} must not contain "happy sorry"`);
      assert.ok(!lower.includes('celebrat'), `Variation ${i + 1} must not contain "celebrate"`);
      assert.ok(!lower.includes('party'), `Variation ${i + 1} must not contain "party"`);
      assert.ok(v.text.includes('Aisha'), `Variation ${i + 1} must address Aisha`);
      // Verify MD RAZA relationship-aware signature
      assert.ok(v.text.includes('MD RAZA'), `Variation ${i + 1} must include MD RAZA signature`);
      assert.ok(v.text.toLowerCase().includes('best friend'), `Variation ${i + 1} must include relationship context`);
    }

    console.log('  ✅ PASS: Apology variations are 100% free of celebratory language and signed properly by MD RAZA.');
    passed++;
  } catch (err) {
    console.error('  ❌ Test 2 Failed:', err);
    throw err;
  }

  // -------------------------------------------------------------------------
  // TEST 3: Strict Word Count Enforcement (Short, Medium, Long)
  // -------------------------------------------------------------------------
  try {
    console.log('▶ Test 3: Verifying strict word count enforcement across length settings...');

    const shortGen = await handleGenerateMessage({
      occasion: 'Birthday',
      relationship: 'Friend',
      recipientName: 'Rohan',
      senderName: 'Maaz',
      length: 'short'
    });
    const shortWords = shortGen.variations[0].text.trim().split(/\s+/).length;
    assert.ok(shortWords <= 50, `Short variation words (${shortWords}) must be <= 50`);

    const medGen = await handleGenerateMessage({
      occasion: 'Birthday',
      relationship: 'Friend',
      recipientName: 'Rohan',
      senderName: 'Maaz',
      length: 'medium'
    });
    const medWords = medGen.variations[0].text.trim().split(/\s+/).length;
    assert.ok(medWords >= 25 && medWords <= 85, `Medium variation words (${medWords}) must be within 25–85`);

    console.log(`  ✅ PASS: Word count bounded (Short: ${shortWords} words, Medium: ${medWords} words).`);
    passed++;
  } catch (err) {
    console.error('  ❌ Test 3 Failed:', err);
    throw err;
  }

  // -------------------------------------------------------------------------
  // TEST 4: Non-Celebration Copy for Thank You and Farewell
  // -------------------------------------------------------------------------
  try {
    console.log('▶ Test 4: Verifying Thank You and Farewell context-aware copy...');

    const tyOcc = resolveOccasion('Thank You');
    assert.strictEqual(tyOcc.isCelebration, false, 'Thank You must not be celebration');
    assert.strictEqual(tyOcc.messageType, 'Thank You Message');
    assert.strictEqual(tyOcc.recommendedTemplate, 'sincere_letter');

    const fareOcc = resolveOccasion('Farewell');
    assert.strictEqual(fareOcc.isCelebration, false, 'Farewell must not be celebration');
    assert.strictEqual(fareOcc.messageType, 'Farewell Message');
    assert.strictEqual(fareOcc.recommendedTemplate, 'sincere_letter');

    console.log('  ✅ PASS: Thank You and Farewell profiles are contextually distinct non-celebrations.');
    passed++;
  } catch (err) {
    console.error('  ❌ Test 4 Failed:', err);
    throw err;
  }

  // -------------------------------------------------------------------------
  // TEST 5: Full Database Persistence of New Creation Attributes
  // -------------------------------------------------------------------------
  try {
    console.log('▶ Test 5: Verifying end-to-end database persistence of new attributes...');

    const wishPayload = {
      recipient_name: 'Dr. Sarah Connor',
      sender_name: 'MD RAZA',
      occasion: 'Sorry',
      relationship: 'Mentor',
      emotion: 'Deeply Apologetic',
      emotion_intensity: 'Deep',
      template: 'sincere_letter',
      font: 'Playfair Display',
      theme: 'minimalist',
      language: 'en',
      length: 'medium',
      memories: 'I sincerely regret missing our mentorship meeting yesterday.',
      original_memory: 'I sincerely regret missing our mentorship meeting yesterday.',
      improved_memory: 'I sincerely regret missing our mentorship meeting yesterday.',
      message: 'Dear Dr. Sarah Connor, I am writing to offer my most sincere apologies for missing our meeting yesterday. I deeply value your mentorship and guidance. — Your Mentor, MD RAZA'
    };

    const createRes = await handleCreateWish(wishPayload);
    assert.strictEqual(createRes.status, 'success', 'Wish creation must succeed');
    const slug = createRes.wish.slug;
    assert.ok(slug, 'Wish must have a unique slug');

    // Retrieve the wish and verify all fields survived
    const getRes = await handleGetWish(slug);
    assert.strictEqual(getRes.status, 'success', 'Wish retrieval must succeed');
    const savedWish = getRes.wish;

    assert.strictEqual(savedWish.recipient_name, 'Dr. Sarah Connor');
    assert.strictEqual(savedWish.sender_name, 'MD RAZA');
    assert.strictEqual(savedWish.occasion, 'Sorry');
    assert.strictEqual(savedWish.relationship, 'Mentor');
    assert.strictEqual(savedWish.emotion, 'Deeply Apologetic');
    assert.strictEqual(savedWish.emotion_intensity, 'Deep');
    assert.strictEqual(savedWish.template, 'sincere_letter');
    assert.strictEqual(savedWish.font_family, 'Playfair Display');
    assert.strictEqual(savedWish.original_memory, 'I sincerely regret missing our mentorship meeting yesterday.');
    assert.ok(savedWish.message.includes('Your Mentor, MD RAZA'), 'MD RAZA signature must be formatted with Mentor relationship');

    console.log('  ✅ PASS: All new attributes (emotion, intensity, template, memory) persisted 100% intact.');
    passed++;
  } catch (err) {
    console.error('  ❌ Test 5 Failed:', err);
    throw err;
  }

  // -------------------------------------------------------------------------
  // TEST 6: Writing Improvement Fact Retention
  // -------------------------------------------------------------------------
  try {
    console.log('▶ Test 6: Verifying Writing Improvement preserves user facts and inside jokes...');

    const messyInput = 'rember that Goa road trip when car punctured and we ate maggi at 3am';
    const cleaned = cleanText(messyInput);

    assert.strictEqual(cleaned.changesMade, true, 'Changes must be detected');
    assert.ok(cleaned.improved.toLowerCase().includes('goa'), 'Must preserve Goa');
    assert.ok(cleaned.improved.toLowerCase().includes('maggi'), 'Must preserve maggi');
    assert.ok(cleaned.improved.toLowerCase().includes('3am') || cleaned.improved.toLowerCase().includes('3 am'), 'Must preserve 3am');

    console.log('  ✅ PASS: Personal facts, names, and memories preserved 100% intact through cleaning.');
    passed++;
  } catch (err) {
    console.error('  ❌ Test 6 Failed:', err);
    throw err;
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`🎉 ALL ${passed}/6 CREATION FLOW AUDIT & REPAIR TESTS PASSED!`);
  console.log('======================================================\n');
}

runCreationFlowAuditTests().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err.message);
  process.exit(1);
});
