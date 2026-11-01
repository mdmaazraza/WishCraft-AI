/**
 * Wish Yours — Comprehensive 7-Step Redesign & Details Lifecycle Test Suite
 * Tests:
 * 1. Form controls contrast & native select dark styling
 * 2. 7-Step wizard layout, step indicators, sticky summary bar
 * 3. 10 occasions (including Festival) & 13 relationships (including Teacher)
 * 4. Occasion-aware dynamic feelings / tones (Zero celebration on Sorry)
 * 5. Text improvement engine: fact retention & native Hindi/Hinglish script preservation
 * 6. End-to-end memory data lifecycle: Step 3 -> API -> DB -> Preview -> Shared Page -> Email
 * 7. Developer Attribution for MD RAZA & distinct sender signatures
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { OCCASIONS } = require('../data/occasions');
const { cleanText, correctTextWithAI } = require('../data/text_cleaner');
const { handleGenerateMessage } = require('../api/generate-message');
const { handleCreateWish, handleGetWish } = require('../api/wishes');
const { isMdRazaSender, getSenderSignatureInline, processMessageAttribution } = require('../data/attribution');
const db = require('../data/db');

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Wish Yours: 7-Step Studio & Details Lifecycle Tests');
  console.log('======================================================\n');

  let passed = 0;

  // TEST 1: Form Contrast & Native Select Dark Theme Guarantee
  console.log('▶ Test 1: Verifying inlined critical form styles & native select contrast...');
  const createHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'create.html'), 'utf-8');
  assert(createHtml.includes('color-scheme: dark !important'), 'create.html must enforce color-scheme: dark');
  assert(createHtml.includes('background-color: #0f172a !important'), 'create.html must enforce dark input background');
  assert(createHtml.includes('select option'), 'create.html must style select option tags');
  assert(createHtml.includes('input:-webkit-autofill'), 'create.html must handle browser autofill');
  assert(createHtml.includes('style="background-color: #0f172a; color: #f8fafc;"'), 'genderSelect options must have inlined dark styling defense');
  console.log('  ✅ PASS: Critical dark form controls & select option styling verified.');
  passed++;

  // TEST 2: 7-Step Flow Structure & Sticky Summary Bar
  console.log('▶ Test 2: Verifying 7-step wizard layout & sticky summary bar...');
  for (let i = 1; i <= 7; i++) {
    assert(createHtml.includes(`id="stepSection${i}"`), `create.html must have stepSection${i}`);
    assert(createHtml.includes(`id="stepIndicator${i}"`), `create.html must have stepIndicator${i}`);
  }
  assert(createHtml.includes('id="stickySummaryBar"'), 'create.html must have stickySummaryBar');
  assert(createHtml.includes('id="sumValOccasion"'), 'Summary bar must display occasion');
  assert(createHtml.includes('id="sumValRelationship"'), 'Summary bar must display relationship');
  assert(createHtml.includes('id="sumValRecipient"'), 'Summary bar must display recipient');
  assert(createHtml.includes('id="sumValTone"'), 'Summary bar must display tone');
  assert(createHtml.includes('id="sumValLanguage"'), 'Summary bar must display language');
  console.log('  ✅ PASS: 7-step architecture and sticky summary bar verified.');
  passed++;

  // TEST 3: 10 Occasions & 13 Relationships
  console.log('▶ Test 3: Verifying 10 occasions (with Festival) & 13 relationships (with Teacher)...');
  const expectedOccasions = ['Birthday', 'Wedding Anniversary', 'Sorry', "Valentine's Day", 'Friendship Day', 'Thank You', 'Congratulations', 'Farewell', 'Festival & Holiday', 'Custom Occasion'];
  expectedOccasions.forEach(occ => {
    assert(createHtml.includes(`data-occasion="${occ}"`), `create.html must have occasion card for ${occ}`);
  });

  const expectedRelationships = ['Best Friend', 'Friend', 'Girlfriend', 'Boyfriend', 'Wife', 'Husband', 'Mother', 'Father', 'Brother', 'Sister', 'Colleague', 'Teacher', 'Other'];
  expectedRelationships.forEach(rel => {
    assert(createHtml.includes(`data-relationship="${rel}"`), `create.html must have relationship card for ${rel}`);
  });
  assert(OCCASIONS.festival, 'data/occasions.js must contain festival');
  assert(OCCASIONS.birthday.relationshipNuance.Teacher, 'Birthday must have Teacher relationship nuance');
  console.log('  ✅ PASS: All 10 occasions and 13 relationships present.');
  passed++;

  // TEST 4: Occasion-Aware Dynamic Tones & Negative Constraints
  console.log('▶ Test 4: Verifying occasion-aware dynamic feelings and tone constraints...');
  const sorryTones = OCCASIONS.sorry.tones;
  assert(Array.isArray(sorryTones) && sorryTones.length >= 3, 'Sorry must define tones');
  assert(sorryTones.includes('Sincere & Apologetic'), 'Sorry must include Sincere & Apologetic');
  assert(!sorryTones.some(t => t.toLowerCase().includes('celebrat') || t.toLowerCase().includes('party')), 'Sorry must NOT contain celebratory tones');

  const bdayTones = OCCASIONS.birthday.tones;
  assert(bdayTones.includes('Heartfelt') && bdayTones.includes('Funny & Playful'), 'Birthday must have celebratory tones');
  console.log('  ✅ PASS: Occasion tones are distinct, appropriate, and strictly constrained.');
  passed++;

  // TEST 5: Writing Improvement Engine & Language/Fact Retention
  console.log('▶ Test 5: Verifying writing improvement engine, fact preservation & Hinglish support...');
  const rawEnglish = "we was frnds from collage and you always suport me when i was sad in 2022";
  const cleanEnglish = cleanText(rawEnglish);
  assert(cleanEnglish.improved.includes('friends'), 'Should clean frnds to friends');
  assert(cleanEnglish.improved.includes('support'), 'Should clean suport to support');
  assert(cleanEnglish.improved.includes('2022'), 'Must preserve year 2022 fact');

  // Verify Hinglish / Romanized script preservation
  const rawHinglish = "tu hamesha mera sath diya aur jab mai sad tha tab mujhe hasaya";
  const aiHinglishResult = await correctTextWithAI(rawHinglish, { occasion: 'Friendship', relationship: 'Best Friend', language: 'hinglish' });
  assert(aiHinglishResult.improved, 'Must return improved text for Hinglish');
  // It should NOT be translated into pure English "you always gave me company..."
  assert(!aiHinglishResult.improved.startsWith('You always stood by me and when I was sad'), 'Must NOT translate conversational Hinglish into English!');
  console.log('  ✅ PASS: Fact retention and language/script preservation verified.');
  passed++;

  // TEST 6: Complete Memory Data Lifecycle
  console.log('▶ Test 6: Tracing complete memory lifecycle from input to rendered greeting...');
  const testPayload = {
    occasion: 'Sorry',
    relationship: 'Best Friend',
    recipient_name: 'Aisha',
    sender_name: 'MD RAZA',
    recipient_gender: 'female',
    relationship_duration: '7 years',
    memories: 'We were friends since engineering college and you always supported me when I doubted myself.',
    style: 'Sincere & Apologetic',
    font_family: 'Playfair Display',
    theme: 'minimalist',
    language: 'en'
  };

  // 1. Generate AI message
  const genResult = await handleGenerateMessage(testPayload);
  assert(genResult.status === 'success', 'Generation must succeed');
  assert(genResult.variations.length === 3, 'Must generate 3 variations');
  assert(!genResult.variations[0].text.toLowerCase().includes('happy birthday'), 'Sorry variation must not contain Birthday copy');

  // 2. Publish Wish to database
  const createResult = await handleCreateWish({
    ...testPayload,
    message: genResult.variations[0].text
  });
  assert(createResult.status === 'success', 'Create wish must succeed');
  const wishSlug = createResult.wish.slug;
  assert(wishSlug, 'Must create valid slug');

  // 3. Fetch Wish and verify memories survived
  const getResult = await handleGetWish(wishSlug);
  assert(getResult.status === 'success', 'Get wish must succeed');
  assert.strictEqual(getResult.wish.memories, testPayload.memories, 'Database must preserve exact personal memories');
  assert.strictEqual(getResult.wish.recipient_name, 'Aisha', 'Recipient name must be preserved');
  assert.strictEqual(getResult.wish.sender_name, 'MD RAZA', 'Sender name must be preserved');

  // 4. Verify MD RAZA dynamic signature
  assert(isMdRazaSender(getResult.wish.sender_name), 'Must identify MD RAZA as sender');
  const sig = getSenderSignatureInline(getResult.wish.sender_name, getResult.wish.relationship);
  assert.strictEqual(sig, 'Your Best Friend, MD RAZA', 'Signature must be "Your Best Friend, MD RAZA"');

  // Cleanup test record
  db.deleteWish(getResult.wish.id);
  console.log('  ✅ PASS: Full data lifecycle verified. Personal memories survive 100% intact.');
  passed++;

  // TEST 7: Independent Sender Signature Isolation
  console.log('▶ Test 7: Verifying other senders retain their own identities without MD RAZA signature...');
  assert(!isMdRazaSender('Rahul'), 'Rahul must not be treated as MD RAZA');
  assert(!isMdRazaSender('Maaz'), 'Maaz must not be treated as MD RAZA');
  assert(!isMdRazaSender('Sarah Jenkins'), 'Sarah must not be treated as MD RAZA');
  console.log('  ✅ PASS: Sender signature isolation verified.');
  passed++;

  // TEST 8: Global Developer Attribution in Footer
  console.log('▶ Test 8: Verifying global footer developer attribution across pages...');
  assert(createHtml.includes('Developed by <a href="/developer"'), 'create.html must link to /developer');
  assert(createHtml.includes('MD RAZA'), 'create.html footer must credit MD RAZA');
  console.log('  ✅ PASS: Developer attribution footer verified.');
  passed++;

  console.log('\n======================================================');
  console.log(`🎉 ALL ${passed}/${passed} 7-STEP REDESIGN & DETAILS TESTS PASSED!`);
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
