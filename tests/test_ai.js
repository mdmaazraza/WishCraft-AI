/**
 * Wish Yours — Test Suite: AI Message Generation & Multi-Language Variations
 */

const assert = require('assert');
const { handleGenerateMessage } = require('../api/generate-message');
const { generateFallbackVariations } = require('../api/gemini');

async function runAITests() {
  console.log('🧪 Starting Wish Yours Message Generation Tests...\n');
  let passed = 0;

  // 1. English Variations Test
  try {
    const enRes = await handleGenerateMessage({
      occasion: 'Birthday',
      relationship: 'Best Friend',
      recipientName: 'Michael',
      senderName: 'Chloe',
      style: 'Funny',
      memories: 'When we got lost in NYC at 2 AM',
      language: 'en',
      length: 'medium'
    });

    assert.strictEqual(enRes.status, 'success');
    assert.ok(Array.isArray(enRes.variations));
    assert.ok(enRes.variations.length >= 3, 'Must generate at least 3 variations');
    assert.ok(enRes.variations[0].text.includes('Michael'), 'Variation must include recipient name');
    console.log('✅ Test 1: Generated 3 diverse English variations with recipient name & memories');
    passed++;

    // 2. Hindi Variations Test
    const hiRes = await handleGenerateMessage({
      occasion: 'Birthday',
      relationship: 'Mother',
      recipientName: 'Maa',
      senderName: 'Rohan',
      style: 'Heart-touching',
      language: 'hi'
    });

    assert.strictEqual(hiRes.status, 'success');
    assert.ok(hiRes.variations.length >= 3);
    assert.ok(hiRes.variations[0].text.includes('शुभकामनाएं') || hiRes.variations[0].text.includes('बधाइयाँ'), 'Must generate Hindi phrasing');
    console.log('✅ Test 2: Generated 3 poetic Hindi variations');
    passed++;

    // 3. Hinglish Variations Test
    const hinglishRes = await handleGenerateMessage({
      occasion: 'Wedding Anniversary',
      relationship: 'Wife',
      recipientName: 'Priya',
      senderName: 'Sameer',
      style: 'Romantic',
      language: 'hinglish'
    });

    assert.strictEqual(hinglishRes.status, 'success');
    assert.ok(hinglishRes.variations.length >= 3);
    assert.ok(hinglishRes.variations[0].text.includes('Priya'));
    console.log('✅ Test 3: Generated 3 natural Hinglish variations');
    passed++;

    // 4. Fallback Synthesizer Direct Test
    const fallbackVars = generateFallbackVariations({
      occasion: 'Valentine\'s Day',
      relationship: 'Girlfriend',
      recipientName: 'Sophia',
      senderName: 'Liam',
      style: 'Romantic',
      memories: 'Our first date under the Eiffel tower',
      language: 'en'
    });

    assert.strictEqual(fallbackVars.length, 3);
    assert.ok(fallbackVars.every(v => v.title && v.text && v.tone));
    console.log('✅ Test 4: Direct fallback synthesizer produces 3 fully structured variations');
    passed++;

    console.log(`\n🎉 All ${passed}/4 AI & Multi-Language tests passed successfully!`);
  } catch (err) {
    console.error('\n❌ AI Test failed:', err);
    process.exit(1);
  }
}

runAITests();
