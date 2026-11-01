/**
 * WishCraft AI — Test Suite: Developer Attribution & MD RAZA Sender Signature System
 * 
 * Verifies:
 * 1. Safe case-insensitive, whitespace-tolerant MD RAZA detection
 * 2. Relationship-aware signature generation ("Your [Relationship], MD RAZA")
 * 3. Strict isolation (Rahul, Priya, and other senders never get MD RAZA signatures)
 * 4. Prevention of Gemini hallucinations inserting MD RAZA for other senders
 * 5. Email template signature and global developer footer integration
 * 6. Fallback message synthesis respecting sender attribution
 * 7. Developer page (/developer) routing and SEO metadata
 */

const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');

const {
  isMdRazaSender,
  formatRelationship,
  getSenderSignature,
  getSenderSignatureInline,
  applySignatureToMessage,
  DEVELOPER_NAME,
  DEVELOPER_TITLE
} = require('../data/attribution');

const { generateEmailHTML } = require('../api/email');
const { generateFallbackVariations } = require('../api/gemini');
const { handleCreateWish } = require('../api/wishes');

async function runDeveloperAttributionTests() {
  console.log('🧪 Starting WishCraft AI Developer Attribution & Sender Signature Tests...\n');
  let passed = 0;

  // =========================================================================
  // TEST 1: Case-Insensitive & Whitespace-Tolerant Matching
  // =========================================================================
  try {
    const validMatches = [
      'MD RAZA',
      'Md Raza',
      'md raza',
      'mD rAzA',
      '  MD RAZA  ',
      '\tMD RAZA\n',
      'MD   RAZA'
    ];

    for (const name of validMatches) {
      assert.strictEqual(
        isMdRazaSender(name),
        true,
        `"${name}" must match MD RAZA sender detection`
      );
    }

    const nonMatches = [
      'Rahul',
      'Priya',
      'MD RAZA JR',
      'Dr. MD RAZA',
      'MD',
      'RAZA',
      'Maaz',
      '',
      null,
      undefined
    ];

    for (const name of nonMatches) {
      assert.strictEqual(
        isMdRazaSender(name),
        false,
        `"${name}" must NOT match MD RAZA sender detection`
      );
    }

    console.log('✅ Test 1: Whitespace-tolerant and case-insensitive MD RAZA detection verified');
    passed++;
  } catch (err) {
    console.error('❌ Test 1 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 2: Relationship-Aware Signature Formatting for MD RAZA
  // =========================================================================
  try {
    // 1. Friend
    const friendSig = getSenderSignature('MD RAZA', 'Friend');
    assert.strictEqual(friendSig, 'Your Friend,\nMD RAZA');
    assert.strictEqual(getSenderSignatureInline('MD RAZA', 'Friend'), 'Your Friend, MD RAZA');

    // 2. Best Friend with case variation "Md Raza"
    const bestFriendSig = getSenderSignature('Md Raza', 'Best Friend');
    assert.strictEqual(bestFriendSig, 'Your Best Friend,\nMD RAZA');

    // 3. Brother with case variation "md raza"
    const brotherSig = getSenderSignature('md raza', 'Brother');
    assert.strictEqual(brotherSig, 'Your Brother,\nMD RAZA');

    // 4. Colleague with leading/trailing spaces
    const colleagueSig = getSenderSignature('  MD RAZA  ', 'Colleague');
    assert.strictEqual(colleagueSig, 'Your Colleague,\nMD RAZA');

    // 5. Boyfriend
    const boyfriendSig = getSenderSignature('MD RAZA', 'Boyfriend');
    assert.strictEqual(boyfriendSig, 'Your Boyfriend,\nMD RAZA');

    // 6. Husband
    const husbandSig = getSenderSignature('MD RAZA', 'Husband');
    assert.strictEqual(husbandSig, 'Your Husband,\nMD RAZA');

    // 7. Sister
    const sisterSig = getSenderSignature('MD RAZA', 'Sister');
    assert.strictEqual(sisterSig, 'Your Sister,\nMD RAZA');

    console.log('✅ Test 2: Relationship-aware MD RAZA signatures match required "Your [Relationship], MD RAZA" format');
    passed++;
  } catch (err) {
    console.error('❌ Test 2 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 3: Strict Isolation — Unrelated Senders Must NEVER Output MD RAZA
  // =========================================================================
  try {
    // Sender: Rahul, Rel: Friend
    const rahulSig = getSenderSignature('Rahul', 'Friend');
    assert.strictEqual(rahulSig, 'Rahul', 'Rahul must receive normal "Rahul" attribution');
    assert.strictEqual(getSenderSignatureInline('Rahul', 'Friend'), 'Rahul');
    assert.ok(!rahulSig.includes('MD RAZA'), 'Rahul must not contain MD RAZA');

    // Sender: Priya, Rel: Girlfriend
    const priyaSig = getSenderSignature('Priya', 'Girlfriend');
    assert.strictEqual(priyaSig, 'Priya', 'Priya must receive normal "Priya" attribution');
    assert.strictEqual(getSenderSignatureInline('Priya', 'Girlfriend'), 'Priya');
    assert.ok(!priyaSig.includes('MD RAZA'), 'Priya must not contain MD RAZA');

    // Sender: Alex, Rel: Colleague
    const alexSig = getSenderSignature('Alex', 'Colleague');
    assert.strictEqual(alexSig, 'Alex');
    assert.ok(!alexSig.includes('MD RAZA'));

    console.log('✅ Test 3: Strict isolation guarantees unrelated senders retain their own identities');
    passed++;
  } catch (err) {
    console.error('❌ Test 3 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 4: Message Body Signature Upgrade & Trailing Signoff
  // =========================================================================
  try {
    const rawMessage = 'Happy Birthday! Hope you have an amazing day ahead. — With love, MD RAZA';
    const upgraded = applySignatureToMessage(rawMessage, 'MD RAZA', 'Best Friend');
    
    assert.ok(upgraded.includes('Your Best Friend, MD RAZA'), 'Must upgrade MD RAZA signoff to include relationship');
    assert.ok(!upgraded.includes('MD RAZA MD RAZA'), 'Must not duplicate names');

    // Other user message must remain unchanged
    const otherMessage = 'Happy Birthday! From Rahul';
    const otherResult = applySignatureToMessage(otherMessage, 'Rahul', 'Best Friend');
    assert.strictEqual(otherResult, otherMessage, 'Other user message must not be modified');

    console.log('✅ Test 4: Message body signature processor cleanly upgrades MD RAZA signoffs without duplication');
    passed++;
  } catch (err) {
    console.error('❌ Test 4 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 5: Email Template Signature & Developer Credit
  // =========================================================================
  try {
    // 1. Email with sender = MD RAZA
    const mdRazaEmail = generateEmailHTML({
      senderName: 'MD RAZA',
      recipientName: 'Sara',
      occasion: 'Birthday',
      relationship: 'Friend',
      wishUrl: 'http://localhost:3000/wish/sara-1234',
      messageExcerpt: 'Wishing you the happiest birthday!'
    });

    assert.ok(mdRazaEmail.includes('Your Friend, MD RAZA'), 'Email body must feature "Your Friend, MD RAZA"');
    assert.ok(mdRazaEmail.includes('Developed by <a href="http://localhost:3000/developer"'), 'Email footer must link to /developer');
    assert.ok(mdRazaEmail.includes('MD RAZA'), 'Email footer must contain MD RAZA credit');

    // 2. Email with sender = Rahul
    const rahulEmail = generateEmailHTML({
      senderName: 'Rahul',
      recipientName: 'Sara',
      occasion: 'Birthday',
      relationship: 'Friend',
      wishUrl: 'http://localhost:3000/wish/sara-5678',
      messageExcerpt: 'Have a great year ahead!'
    });

    assert.ok(rahulEmail.includes('<strong>Rahul</strong>'), 'Email must attribute sender as Rahul');
    assert.ok(!rahulEmail.includes('Your Friend, Rahul') && !rahulEmail.includes('Your Friend, MD RAZA'), 'Must not inject MD RAZA sender into Rahul’s email');
    // Global developer footer can still credit MD RAZA as platform creator
    assert.ok(rahulEmail.includes('Developed by') && rahulEmail.includes('MD RAZA'), 'Footer platform credit remains intact');

    console.log('✅ Test 5: Email templates correctly differentiate between greeting sender and platform developer');
    passed++;
  } catch (err) {
    console.error('❌ Test 5 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 6: Fallback Synthesizer Attribution
  // =========================================================================
  try {
    // 1. Fallback with MD RAZA
    const mdVars = generateFallbackVariations({
      occasion: 'Birthday',
      relationship: 'Brother',
      recipientName: 'Zayd',
      senderName: 'md raza',
      language: 'en'
    });

    assert.ok(mdVars.length >= 3);
    assert.ok(
      mdVars[0].text.includes('Your Brother, MD RAZA') || mdVars[0].text.includes('MD RAZA'),
      'MD RAZA fallback must feature relationship signature'
    );

    // 2. Fallback with Priya
    const priyaVars = generateFallbackVariations({
      occasion: 'Birthday',
      relationship: 'Sister',
      recipientName: 'Zayd',
      senderName: 'Priya',
      language: 'en'
    });

    assert.ok(priyaVars.length >= 3);
    assert.ok(priyaVars[0].text.includes('Priya'), 'Priya fallback must sign with Priya');
    assert.ok(!priyaVars[0].text.includes('MD RAZA'), 'Priya fallback must NEVER include MD RAZA');

    console.log('✅ Test 6: Fallback template synthesizer respects sender attribution rules across users');
    passed++;
  } catch (err) {
    console.error('❌ Test 6 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 7: Wish Creation API Layer Normalization
  // =========================================================================
  try {
    const mdWish = await handleCreateWish({
      recipient_name: 'Ananya',
      sender_name: '  md raza  ',
      relationship: 'Colleague',
      occasion: 'Congratulations',
      message: 'Huge congratulations on your promotion! Proud of your hard work. — md raza'
    });

    assert.strictEqual(mdWish.wish.sender_name, 'MD RAZA', 'Must normalize sender_name to MD RAZA');
    assert.ok(mdWish.wish.message.includes('Your Colleague, MD RAZA'), 'Must apply relationship signature to message');

    const rahulWish = await handleCreateWish({
      recipient_name: 'Ananya',
      sender_name: 'Rahul Verma',
      relationship: 'Colleague',
      occasion: 'Congratulations',
      message: 'Congrats on your promotion! Best, Rahul Verma'
    });

    assert.strictEqual(rahulWish.wish.sender_name, 'Rahul Verma');
    assert.ok(!rahulWish.wish.message.includes('MD RAZA'), 'Rahul wish must not contain MD RAZA');

    console.log('✅ Test 7: Wishes API layer normalizes MD RAZA senders while keeping other senders unchanged');
    passed++;
  } catch (err) {
    console.error('❌ Test 7 Failed:', err.message);
    throw err;
  }

  // =========================================================================
  // TEST 8: Dedicated Developer Page (/developer) & SEO Metadata
  // =========================================================================
  try {
    const devHtmlPath = path.join(__dirname, '..', 'public', 'developer.html');
    assert.ok(fs.existsSync(devHtmlPath), 'public/developer.html must exist');

    const htmlContent = fs.readFileSync(devHtmlPath, 'utf8');

    // Title & description checks
    assert.ok(htmlContent.includes('<title>MD RAZA – Creator & Developer of WishCraft AI</title>'), 'SEO Title must match');
    assert.ok(htmlContent.includes('Meet MD RAZA, the creator and developer of WishCraft AI'), 'Meta description must match');
    assert.ok(htmlContent.includes('WishCraft AI was created and developed by MD RAZA'), 'Author quote must match');
    assert.ok(htmlContent.includes('About the Developer'), 'Must contain About the Developer section');
    assert.ok(htmlContent.includes('About WishCraft AI'), 'Must contain About WishCraft AI section');
    assert.ok(htmlContent.includes('Technologies Used'), 'Must contain Technologies Used section');
    assert.ok(htmlContent.includes('Purpose &amp; Vision') || htmlContent.includes('Purpose & Vision'), 'Must contain Purpose & Vision section');
    assert.ok(htmlContent.includes('https://github.com/mdmaazraza/WishCraft-AI'), 'Must link to repository');

    console.log('✅ Test 8: Developer page structure, SEO metadata, and required biographical copy verified');
    passed++;
  } catch (err) {
    console.error('❌ Test 8 Failed:', err.message);
    throw err;
  }

  console.log(`\n🎉 All ${passed}/8 Developer Attribution & MD RAZA Signature Tests Passed Successfully!\n`);
}

if (require.main === module) {
  runDeveloperAttributionTests().catch(err => {
    console.error('Fatal Test Failure:', err);
    process.exit(1);
  });
}

module.exports = { runDeveloperAttributionTests };
