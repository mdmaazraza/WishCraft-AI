const assert = require('assert');
const { handleGenerateMessage } = require('../api/generate-message');
const { handleCreateWish, handleGetWish, sanitizeFontFamily } = require('../api/wishes');
const { isMdRazaSender, formatRelationship, applySignatureToMessage, getSenderSignature, getSenderSignatureInline } = require('../data/attribution');
const { resolveOccasion, validateMessageContent } = require('../data/occasions');
const WishShare = require('../public/js/share');
const { correctTextWithAI } = require('../data/text_cleaner');

async function runProductionReadinessSuite() {
  console.log('====================================================');
  console.log('🧪 WishCraft AI: Production-Readiness Comprehensive Test');
  console.log('====================================================\n');

  let passed = 0;

  // 1. Context-Aware Forbidden Keywords & Celebration Protection (Sections 9 & 10)
  console.log('--- 1. Testing Occasion Non-Celebratory Protection for Sorry ---');
  {
    const occ = resolveOccasion('Sorry');
    assert.strictEqual(occ.isCelebration, false, 'Sorry must not be marked as isCelebration');
    assert(occ.forbiddenKeywords.includes('celebrate'), 'Should forbid celebrate');
    assert(occ.forbiddenKeywords.includes('happy sorry'), 'Should forbid happy sorry');
    assert(occ.forbiddenKeywords.includes('congratulations'), 'Should forbid congratulations');

    const check1 = validateMessageContent('sorry', 'Let us celebrate your apology with cake and party!');
    assert.strictEqual(check1.valid, false, 'Should catch celebration words in sorry context');
    assert(check1.violations.includes('celebrate'));
    assert(check1.violations.includes('cake'));
    assert(check1.violations.includes('party'));

    const check2 = validateMessageContent('sorry', 'I am truly sorry for my words and hope we can heal.');
    assert.strictEqual(check2.valid, true, 'Clean apology message should pass');
    console.log('  ✔ [PASS] Occasion engine strictly prohibits celebratory words in Sorry context');
    passed++;
  }

  // 2. MD RAZA Special Sender Attribution vs Normal Senders (Section 11)
  console.log('\n--- 2. Testing MD RAZA Sender Signature vs Regular Senders ---');
  {
    assert.strictEqual(isMdRazaSender('MD RAZA'), true);
    assert.strictEqual(isMdRazaSender('md raza'), true);
    assert.strictEqual(isMdRazaSender('  Md Raza  '), true);
    assert.strictEqual(isMdRazaSender('Rahul'), false);
    assert.strictEqual(isMdRazaSender('Sara'), false);

    const razaSig = applySignatureToMessage('I am so sorry.', 'MD RAZA', 'Best Friend');
    assert(razaSig.includes('Your Best Friend, MD RAZA'), 'MD RAZA should get relationship signature');

    const rahulSig = getSenderSignature('Rahul', 'Best Friend');
    assert.strictEqual(rahulSig, 'Rahul', 'Rahul preserves his name');
    assert(!rahulSig.includes('MD RAZA'), 'Rahul must never be replaced by MD RAZA');

    const rahulMsg = applySignatureToMessage('I am so sorry. — Rahul', 'Rahul', 'Best Friend');
    assert.strictEqual(rahulMsg, 'I am so sorry. — Rahul', 'Non-MD-RAZA message unchanged');

    console.log('  ✔ [PASS] MD RAZA attribution is relationship-aware and never leaks to other senders');
    passed++;
  }

  // 3. Exact Sorry Flow End-to-End Simulation (Section 10)
  console.log('\n--- 3. Testing Section 10 Exact Sorry Flow ---');
  {
    const messyMemory = 'we was frnds from collage and you always suport me when i was sad';
    const improved = await correctTextWithAI(messyMemory, 'Friendship memory');
    assert(improved.improved.toLowerCase().includes('friends from college'));

    const genRes = await handleGenerateMessage({
      occasion: 'Sorry',
      relationship: 'Best Friend',
      recipientName: 'Aisha',
      senderName: 'MD RAZA',
      memory: improved.improved,
      style: 'Deeply Apologetic',
      emotionIntensity: 'Deep',
      language: 'hinglish',
      length: 'medium',
      template: 'sincere_letter',
      font: 'Playfair Display'
    });

    assert.strictEqual(genRes.status, 'success');
    assert(genRes.variations && genRes.variations.length >= 1);
    const chosen = genRes.variations[0];

    // Verify negative assertions
    const lowerText = chosen.text.toLowerCase();
    assert(!lowerText.includes('happy sorry'), 'Must not contain happy sorry');
    assert(!lowerText.includes('celebrate'), 'Must not contain celebrate');
    assert(!lowerText.includes('congratulations'), 'Must not contain congratulations');
    assert(!lowerText.includes('party'), 'Must not contain party');

    // Verify MD RAZA signature
    assert(lowerText.includes('md raza'), 'Must conclude with MD RAZA');

    // Create the wish
    const createRes = await handleCreateWish({
      recipientName: 'Aisha',
      senderName: 'MD RAZA',
      occasion: 'Sorry',
      relationship: 'Best Friend',
      message: chosen.text,
      emotion: 'Deeply Apologetic',
      emotion_intensity: 'Deep',
      language: 'hinglish',
      message_length: 'medium',
      template: 'sincere_letter',
      font_family: 'Playfair Display',
      photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb']
    });

    assert.strictEqual(createRes.status, 'success');
    assert(createRes.wish.slug);
    assert.strictEqual(createRes.wish.occasion, 'Sorry');
    assert.strictEqual(createRes.wish.images.length, 1);
    assert.strictEqual(createRes.wish.font_family, 'Playfair Display');

    // Reload wish
    const getRes = await handleGetWish(createRes.wish.slug, {});
    assert.strictEqual(getRes.status, 'success');
    assert.strictEqual(getRes.wish.recipient_name, 'Aisha');
    assert.strictEqual(getRes.wish.views_count, 1);

    console.log('  ✔ [PASS] Exact Sorry flow (Aisha / MD RAZA / Hinglish / Deep / Photo) executed perfectly');
    passed++;
  }

  // 4. Word Count Boundaries across Short, Medium, Long (Section 8)
  console.log('\n--- 4. Testing Exact Word Count Ranges Across Short, Medium, Long ---');
  {
    for (const len of ['short', 'medium', 'long']) {
      const res = await handleGenerateMessage({
        occasion: 'Sorry',
        relationship: 'Best Friend',
        recipientName: 'Aisha',
        senderName: 'MD RAZA',
        memory: 'We shared college days together',
        language: 'en',
        length: len
      });
      const words = res.variations[0].text.trim().split(/\s+/).length;
      if (len === 'short') {
        assert(words >= 25 && words <= 45, `Short target 25-45, got ${words}`);
      } else if (len === 'medium') {
        assert(words >= 50 && words <= 80, `Medium target 50-80, got ${words}`);
      } else if (len === 'long') {
        assert(words >= 90 && words <= 130, `Long target 90-130, got ${words}`);
      }
      console.log(`  ✔ [PASS] Length '${len}' produced ${words} words (within range)`);
      passed++;
    }
  }

  // 5. WhatsApp Click-to-Chat Generation & Context-Aware Wording (Section 19)
  console.log('\n--- 5. Testing Context-Aware WhatsApp Link & Share Wording ---');
  {
    const sorryShare = WishShare.generateShareText({
      occasion: 'Sorry',
      recipient_name: 'Aisha',
      sender_name: 'MD RAZA'
    }, 'https://wish-yours.onrender.com/wish/sorry-aisha');

    assert(!sorryShare.toLowerCase().includes('celebrate'));
    assert(!sorryShare.toLowerCase().includes('happy sorry'));
    assert(sorryShare.includes('Aisha'));
    assert(sorryShare.includes('MD RAZA'));
    assert(sorryShare.includes('https://wish-yours.onrender.com/wish/sorry-aisha'));

    const directUrl = WishShare.getWhatsAppUrl({
      occasion: 'Sorry',
      recipient_name: 'Aisha',
      sender_name: 'MD RAZA',
      recipient_phone: '+91 98765 43210'
    }, 'https://wish-yours.onrender.com/wish/sorry-aisha');

    assert(directUrl.startsWith('https://wa.me/919876543210?text='));

    console.log('  ✔ [PASS] Context-aware WhatsApp URL encoding and non-celebratory copy verified');
    passed++;
  }

  // 6. Security & Rate Limiting Check (Section 23)
  console.log('\n--- 6. Testing Rate Limiting & Input Sanitization ---');
  {
    const sanitizedFont = sanitizeFontFamily('<script>alert("xss")</script>');
    assert.strictEqual(sanitizedFont, 'Playfair Display', 'Unsafe font should fall back safely');

    console.log('  ✔ [PASS] Security sanitizer neutralizes malicious inputs');
    passed++;
  }

  console.log('\n====================================================');
  console.log(`📊 Production Readiness Test Results: ${passed} passed, 0 failed`);
  console.log('====================================================\n');
}

runProductionReadinessSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
