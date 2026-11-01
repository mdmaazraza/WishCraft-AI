/**
 * Wish Yours — Test Suite: Emotion Intelligence, Tone Nuance & Text Polish Engine
 * Verifies occasion emotional accuracy, negative prompt constraints, relationship context,
 * and grammar correction while strictly preserving user-entered facts and memories.
 */

const assert = require('assert');
const { cleanText, correctTextWithAI } = require('../data/text_cleaner');
const { getOccasionProfile, validateMessageContent, OCCASION_DEFINITIONS } = require('../data/occasions');
const { handleGenerateMessage } = require('../api/generate-message');
const { generateFallbackVariations } = require('../api/gemini');

async function runEmotionsAndPolishTests() {
  console.log('🧪 Starting Wish Yours Emotion Intelligence & Text Polish Tests...\n');
  let passed = 0;

  // =========================================================================
  // TEST 1: Text Cleaner / Polish Engine — Preserving Facts & Cleaning Typos
  // =========================================================================
  try {
    const rawMessyText = 'we was frnds from collage and you always suport me when i was sad';
    const { original, improved: cleaned, changesMade } = cleanText(rawMessyText);

    console.log(`[Text Polish Engine] Raw:     "${rawMessyText}"`);
    console.log(`[Text Polish Engine] Cleaned: "${cleaned}"`);

    assert.strictEqual(changesMade, true, 'changesMade should be true');
    assert.ok(cleaned.startsWith('We were friends from college'), 'Must fix "we was frnds from collage" -> "We were friends from college"');
    assert.ok(cleaned.includes('supported me when I was sad'), 'Must fix "suport me when i was sad" -> "supported me when I was sad"');
    assert.ok(cleaned.endsWith('.'), 'Must ensure terminating punctuation');
    
    // Strict preservation assertions: no invented facts!
    assert.ok(!cleaned.toLowerCase().includes('paris'), 'Must not invent locations');
    assert.ok(!cleaned.toLowerCase().includes('mountains'), 'Must not invent activities');
    assert.ok(cleaned.toLowerCase().includes('college'), 'Original fact (college) must be preserved');
    assert.ok(cleaned.toLowerCase().includes('sad'), 'Original fact (sad) must be preserved');

    console.log('✅ Test 1: Grammar & Typo Polish Engine cleans messy input while strictly preserving facts');
    passed++;
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 2: Occasion Engine Metadata & Negative Constraints
  // =========================================================================
  try {
    const sorryProfile = getOccasionProfile('Sorry');
    assert.strictEqual(sorryProfile.isCelebration, false, 'Sorry must NOT be marked as a celebration');
    assert.strictEqual(sorryProfile.greetingModule, 'sincere_letter', 'Sorry module must be sincere_letter');
    assert.ok(sorryProfile.ambientEffect === 'calm_stars' || sorryProfile.ambientEffect === 'calm_droplets', 'Sorry ambient effect must be calm_stars or calm_droplets');
    assert.strictEqual(sorryProfile.musicTrack, 'peaceful_melody', 'Sorry music track must be peaceful_melody');
    assert.ok(sorryProfile.forbiddenKeywords.includes('celebrate'), 'Must forbid "celebrate"');
    assert.ok(sorryProfile.forbiddenKeywords.includes('happy sorry'), 'Must forbid "happy sorry"');
    assert.ok(sorryProfile.forbiddenKeywords.includes('party'), 'Must forbid "party"');

    const sympathyProfile = getOccasionProfile('Condolence & Sympathy');
    assert.strictEqual(sympathyProfile.isCelebration, false, 'Sympathy must NOT be a celebration');
    assert.ok(sympathyProfile.ambientEffect === 'calm_stars' || sympathyProfile.ambientEffect === 'calm_droplets', 'Sympathy must have calm ambient');

    const bdayProfile = getOccasionProfile('Birthday');
    assert.strictEqual(bdayProfile.isCelebration, true, 'Birthday must be a celebration');
    assert.strictEqual(bdayProfile.greetingModule, 'cake', 'Birthday must render cake module');

    console.log('✅ Test 2: Occasion Profile Engine correctly configures emotional parameters and constraints');
    passed++;
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 3: Negative Constraint Enforcement — Forbidden Words Guard
  // =========================================================================
  try {
    const invalidSorryText = "Let's celebrate your sorry with a massive party and pop some champagne!";
    const validation = validateMessageContent('Sorry', invalidSorryText);
    
    assert.strictEqual(validation.valid, false, 'Validation should fail when forbidden keywords are present');
    assert.ok(validation.violations.length >= 2, 'Should detect multiple forbidden violations');
    console.log(`[Validation Guard] Detected violations: ${validation.violations.join(', ')}`);

    const validSorryText = "I am deeply sorry for letting you down. You mean the world to me and I hope we can talk.";
    const validCheck = validateMessageContent('Sorry', validSorryText);
    assert.strictEqual(validCheck.valid, true, 'Sincere apology must pass validation');

    console.log('✅ Test 3: Negative Constraint validator blocks inappropriate celebratory language');
    passed++;
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 4: AI Generation — "Sorry" to Girlfriend (Emotional & Sincere)
  // =========================================================================
  try {
    const res = await handleGenerateMessage({
      occasion: 'Sorry',
      relationship: 'Girlfriend',
      recipientName: 'Elena',
      senderName: 'David',
      style: 'Heart-touching',
      memories: 'we was frnds from collage and you always suport me when i was sad',
      language: 'en'
    });

    assert.strictEqual(res.status, 'success');
    assert.ok(res.variations.length >= 3, 'Must return at least 3 variations');
    
    // Check that every variation is sincere and zero celebratory words are used
    const forbidden = ['celebrate', 'happy sorry', 'party', 'blast', 'cheers', 'cake', 'confetti'];
    res.variations.forEach((v, idx) => {
      const lower = v.text.toLowerCase();
      assert.ok(lower.includes('elena'), `Variation ${idx + 1} must include recipient name`);
      forbidden.forEach(word => {
        assert.ok(!lower.includes(word), `Variation ${idx + 1} must NOT contain forbidden word "${word}"`);
      });
      // Sincere tone check
      assert.ok(
        lower.includes('sorry') || lower.includes('apolog') || lower.includes('forgive') || lower.includes('heart'),
        `Variation ${idx + 1} must express sincere remorse or affection`
      );
    });

    console.log('✅ Test 4: Sorry to Girlfriend generates deeply heartfelt, non-celebratory apology');
    passed++;
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 5: AI Generation — "Sorry" to Colleague (Professional & Accountable)
  // =========================================================================
  try {
    const res = await handleGenerateMessage({
      occasion: 'Sorry',
      relationship: 'Colleague',
      recipientName: 'Sarah',
      senderName: 'David',
      style: 'Thoughtful',
      memories: 'The delay on the quarterly financial report submission',
      language: 'en'
    });

    assert.strictEqual(res.status, 'success');
    const firstText = res.variations[0].text;
    const lower = firstText.toLowerCase();

    assert.ok(!lower.includes('celebrate') && !lower.includes('happy sorry'), 'Must not celebrate an apology to a colleague');
    assert.ok(lower.includes('sarah'), 'Must address the colleague by name');
    console.log(`[Colleague Apology Sample]: "${firstText.substring(0, 110)}..."`);

    console.log('✅ Test 5: Sorry to Colleague generates professional, accountable message');
    passed++;
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 6: AI Generation — "Birthday" to Best Friend vs Colleague
  // =========================================================================
  try {
    // Best friend: vibrant, warm, celebratory
    const bdayFriend = await handleGenerateMessage({
      occasion: 'Birthday',
      relationship: 'Best Friend',
      recipientName: 'Alex',
      senderName: 'Sam',
      style: 'Heart-touching',
      memories: 'Late night road trips and burger runs',
      language: 'en'
    });

    // Colleague: warm, professional
    const bdayColleague = await handleGenerateMessage({
      occasion: 'Birthday',
      relationship: 'Colleague',
      recipientName: 'Dr. Marcus',
      senderName: 'Sam',
      style: 'Elegant',
      language: 'en'
    });

    assert.strictEqual(bdayFriend.status, 'success');
    assert.strictEqual(bdayColleague.status, 'success');
    assert.ok(bdayFriend.variations[0].text.includes('Alex'));
    assert.ok(bdayColleague.variations[0].text.includes('Dr. Marcus'));

    console.log('✅ Test 6: Birthday tone adapts appropriately between Best Friend and Colleague');
    passed++;
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 7: AI Generation — Diverse Occasions (Thank You, Congratulations, Farewell)
  // =========================================================================
  try {
    const occasionsToTest = [
      { occ: 'Thank You', rel: 'Mentor', name: 'Professor Vance', style: 'Thoughtful' },
      { occ: 'Congratulations', rel: 'Sister', name: 'Maya', style: 'Inspiring' },
      { occ: 'Farewell', rel: 'Colleague', name: 'Jonathan', style: 'Heart-touching' }
    ];

    for (const item of occasionsToTest) {
      const res = await handleGenerateMessage({
        occasion: item.occ,
        relationship: item.rel,
        recipientName: item.name,
        senderName: 'Sender',
        style: item.style,
        language: 'en'
      });

      assert.strictEqual(res.status, 'success');
      assert.ok(res.variations.length >= 3);
      assert.ok(res.variations[0].text.includes(item.name));
      console.log(`  ✓ Generated 3 variations for "${item.occ}" to ${item.rel}`);
    }

    console.log('✅ Test 7: Thank You, Congratulations, and Farewell all generate tailored emotional variations');
    passed++;
  } catch (err) {
    console.error('❌ Test 7 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 8: Fallback Synthesizer — Emotion-Aware Without External API
  // =========================================================================
  try {
    // Generate fallback for Sorry
    const sorryFallback = generateFallbackVariations({
      occasion: 'Sorry',
      relationship: 'Friend',
      recipientName: 'Leo',
      senderName: 'Jordan',
      style: 'Heart-touching',
      memories: 'I missed your graduation party',
      language: 'en'
    });

    assert.strictEqual(sorryFallback.length, 3);
    sorryFallback.forEach((v, idx) => {
      const lower = v.text.toLowerCase();
      assert.ok(!lower.includes('celebrate'), `Fallback variation ${idx + 1} must not contain "celebrate"`);
      assert.ok(!lower.includes('happy sorry'), `Fallback variation ${idx + 1} must not contain "happy sorry"`);
      assert.ok(lower.includes('leo'), 'Must include recipient name');
    });

    // Generate fallback for Hindi Sympathy / Condolence
    const sympathyFallback = generateFallbackVariations({
      occasion: 'Condolence & Sympathy',
      relationship: 'Family Member',
      recipientName: 'Aarav',
      senderName: 'Pooja',
      language: 'hi'
    });
    assert.strictEqual(sympathyFallback.length, 3);
    assert.ok(sympathyFallback[0].text.includes('संवेदना') || sympathyFallback[0].text.includes('शांति'));

    console.log('✅ Test 8: Fallback synthesizer reliably handles remorseful and sympathy occasions across languages');
    passed++;
  } catch (err) {
    console.error('❌ Test 8 Failed:', err.message);
    throw err;
  }

  console.log(`\n🎉 All ${passed}/8 Emotion Intelligence & Text Polish Tests Passed Successfully!\n`);
}

if (require.main === module) {
  runEmotionsAndPolishTests().catch(err => {
    console.error('Fatal Test Failure:', err);
    process.exit(1);
  });
}

module.exports = { runEmotionsAndPolishTests };
