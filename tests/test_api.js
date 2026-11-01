/**
 * Wish Yours — Comprehensive Test Suite: API Handlers, Typography & Resend Email System
 */

const assert = require('assert');
const db = require('../data/db');
const {
  handleGetWish,
  handleListWishes,
  handleCreateWish,
  handleUpdateWish,
  handleDeleteWish,
  handleBlowCandles
} = require('../api/wishes');
const {
  handleSendEmail,
  getValidResendSender,
  getFontCssStack,
  generateEmailHTML,
  maskEmail
} = require('../api/email');
const { handlePrepareSMS } = require('../api/sms');
const { handleGetAdminStats, handleModerateWish } = require('../api/admin');

async function runTests() {
  console.log('🧪 Starting Wish Yours API & Typography Test Suite...\n');
  let passed = 0;

  try {
    // 1. Database & Wishes Creation with Custom Font
    const newWishPayload = {
      recipient_name: 'Emily Watson',
      sender_name: 'Jordan',
      occasion: 'Birthday',
      relationship: 'Best Friend',
      style: 'Funny',
      font_family: 'Dancing Script',
      theme: 'birthday_celebration',
      message: 'Happy Birthday Emily! May your day be packed with cake and laughs!',
      age: 26,
      images: [
        { url: 'https://example.com/photo1.jpg', caption: 'Concert night' }
      ]
    };

    const createdRes = await handleCreateWish(newWishPayload);
    assert.strictEqual(createdRes.status, 'success', 'Creation should succeed');
    assert.ok(createdRes.wish.slug, 'Slug must be generated');
    assert.strictEqual(createdRes.wish.recipient_name, 'Emily Watson');
    assert.strictEqual(createdRes.wish.font_family, 'Dancing Script', 'Custom font must be saved');
    console.log('✅ Test 1: handleCreateWish creates greeting with slug and custom font_family');
    passed++;

    // 2. Fetch Wish by Slug & Auto-increment views
    const initialViews = createdRes.wish.views_count || 0;
    const fetchRes = await handleGetWish(createdRes.wish.slug);
    assert.strictEqual(fetchRes.status, 'success');
    assert.strictEqual(fetchRes.wish.recipient_name, 'Emily Watson');
    assert.strictEqual(fetchRes.wish.font_family, 'Dancing Script');
    assert.strictEqual(fetchRes.wish.views_count, initialViews + 1, 'View count must auto-increment');
    console.log('✅ Test 2: handleGetWish retrieves wish with font_family and increments view counter');
    passed++;

    // 3. Font Sanitization & Unsupported Font Fallback
    const invalidFontPayload = {
      recipient_name: 'Alex Rivera',
      sender_name: 'Sam',
      occasion: 'Wedding Anniversary',
      message: 'Happy Anniversary to the best partner in the world!',
      font_family: '<script>alert(1)</script>'
    };
    const sanitizedRes = await handleCreateWish(invalidFontPayload);
    assert.strictEqual(sanitizedRes.wish.font_family, 'Playfair Display', 'Invalid font must fallback to Playfair Display');
    console.log('✅ Test 3: Font sanitization safely falls back to Playfair Display');
    passed++;

    // 4. Candle Blow-Out Interaction
    const candleRes = await handleBlowCandles(createdRes.wish.slug, true);
    assert.strictEqual(candleRes.status, 'success');
    assert.strictEqual(candleRes.candles_blown, true);
    const updatedWish = db.getWishBySlug(createdRes.wish.slug);
    assert.strictEqual(updatedWish.candles_blown, true);
    console.log('✅ Test 4: handleBlowCandles updates candle status');
    passed++;

    // 5. Update Wish with Font Change
    const updateRes = await handleUpdateWish(createdRes.wish.slug, {
      message: 'Updated message with more love and hugs! ❤️',
      font_family: 'Great Vibes'
    });
    assert.strictEqual(updateRes.status, 'success');
    assert.strictEqual(updateRes.wish.message, 'Updated message with more love and hugs! ❤️');
    assert.strictEqual(updateRes.wish.font_family, 'Great Vibes');
    console.log('✅ Test 5: handleUpdateWish modifies message and font_family');
    passed++;

    // 6. List Wishes with Filter
    const listRes = await handleListWishes({ occasion: 'Birthday' });
    assert.strictEqual(listRes.status, 'success');
    assert.ok(listRes.wishes.length > 0);
    assert.ok(listRes.wishes.every(w => w.occasion.toLowerCase() === 'birthday'));
    console.log('✅ Test 6: handleListWishes filters correctly by occasion');
    passed++;

    // 7. Typography CSS Font Stacks
    const playfairStack = getFontCssStack('Playfair Display');
    const dancingStack = getFontCssStack('Dancing Script');
    const vibesStack = getFontCssStack('Great Vibes');
    const outfitStack = getFontCssStack('Outfit');
    const pacificoStack = getFontCssStack('Pacifico');
    const cinzelStack = getFontCssStack('Cinzel');

    assert.ok(playfairStack.includes('Playfair Display'), 'Playfair stack must contain Playfair Display');
    assert.ok(dancingStack.includes('Dancing Script'), 'Dancing stack must contain Dancing Script');
    assert.ok(vibesStack.includes('Great Vibes'), 'Vibes stack must contain Great Vibes');
    assert.ok(outfitStack.includes('Outfit'), 'Outfit stack must contain Outfit');
    assert.ok(pacificoStack.includes('Pacifico'), 'Pacifico stack must contain Pacifico');
    assert.ok(cinzelStack.includes('Cinzel'), 'Cinzel stack must contain Cinzel');
    console.log('✅ Test 7: getFontCssStack provides comprehensive CSS fallbacks for all 6 fonts');
    passed++;

    // 8. Resend Sender Sanitization
    const defaultSender = getValidResendSender('');
    const badResendSender = getValidResendSender('wishes@resend.dev');
    const customDomainSender = getValidResendSender('celebrate@myverifieddomain.com');

    assert.strictEqual(defaultSender, 'Wish Yours <onboarding@resend.dev>');
    assert.strictEqual(badResendSender, 'Wish Yours <onboarding@resend.dev>', 'Invalid resend.dev sender must be auto-corrected');
    assert.strictEqual(customDomainSender, 'celebrate@myverifieddomain.com', 'Custom domain sender must be preserved');
    console.log('✅ Test 8: getValidResendSender strictly enforces Resend domain rules');
    passed++;

    // 9. Email HTML Generator with Typography
    const htmlEmail = generateEmailHTML({
      senderName: 'Jordan',
      recipientName: 'Emily',
      occasion: 'Birthday',
      wishUrl: 'http://localhost:3000/wish/emily123',
      messageExcerpt: 'May your day be packed with cake and laughs!',
      fontFamily: 'Dancing Script'
    });

    assert.ok(htmlEmail.includes('fonts.googleapis.com'), 'Email HTML must include Google Fonts link');
    assert.ok(htmlEmail.includes('Dancing Script'), 'Email HTML must style headings with chosen font stack');
    assert.ok(htmlEmail.includes('Wish Yours'), 'Email HTML must include Wish Yours branding');
    console.log('✅ Test 9: generateEmailHTML generates responsive, font-styled celebration email');
    passed++;

    // 10. Email Address Masking for Privacy
    const masked = maskEmail('test.recipient@example.com');
    assert.strictEqual(masked, 't***t@example.com');
    const shortMasked = maskEmail('me@domain.com');
    assert.strictEqual(shortMasked, 'm***@domain.com');
    console.log('✅ Test 10: maskEmail protects user privacy in server logs');
    passed++;

    // 11. Email Service Dispatch (Simulated fallback or live Resend depending on env)
    const emailRes = await handleSendEmail({
      wishId: createdRes.wish.id,
      slug: createdRes.wish.slug,
      recipientEmail: 'emily.test@example.com',
      senderName: 'Jordan',
      recipientName: 'Emily',
      occasion: 'Birthday',
      messageExcerpt: 'Happy Birthday Emily!',
      fontFamily: 'Dancing Script'
    });
    assert.ok(emailRes.status === 'simulated' || emailRes.status === 'success');
    assert.ok(emailRes.messageId, 'Message ID must be returned');
    console.log(`✅ Test 11: handleSendEmail executed successfully (provider: ${emailRes.provider})`);
    passed++;

    // 12. SMS Helper Deep Link
    const smsRes = await handlePrepareSMS({
      recipientPhone: '+1234567890',
      recipientName: 'Emily',
      senderName: 'Jordan',
      occasion: 'Birthday',
      slug: createdRes.wish.slug
    });
    assert.ok(smsRes.deepLink.startsWith('sms:'), 'Must generate valid sms: link');
    console.log('✅ Test 12: handlePrepareSMS generates deep-link URL schema');
    passed++;

    // 13. Admin Auth & Analytics
    const adminStats = await handleGetAdminStats({
      'x-admin-key': 'admin_wishcraft_secret_2026'
    });
    assert.strictEqual(adminStats.status, 'success');
    assert.ok(adminStats.analytics.totalWishes >= 1);
    assert.ok(adminStats.analytics.totalViews >= 1);
    console.log('✅ Test 13: handleGetAdminStats computes accurate KPIs');
    passed++;

    // 14. Admin Moderation: Toggle Visibility
    const modRes = await handleModerateWish({
      slug: createdRes.wish.slug,
      action: 'toggle_visibility'
    }, {
      'x-admin-key': 'admin_wishcraft_secret_2026'
    });
    assert.strictEqual(modRes.status, 'success');
    console.log('✅ Test 14: handleModerateWish toggles public/private visibility');
    passed++;

    // 15. Admin Moderation: Delete Wish
    const delRes = await handleDeleteWish(createdRes.wish.slug);
    assert.strictEqual(delRes.status, 'success');
    const verifyDel = db.getWishBySlug(createdRes.wish.slug);
    assert.strictEqual(verifyDel, null, 'Deleted wish must not exist');
    console.log('✅ Test 15: handleDeleteWish permanently deletes greeting');
    passed++;

    // Cleanup sanitized test wish
    await handleDeleteWish(sanitizedRes.wish.slug);

    console.log(`\n🎉 All ${passed}/15 API, Typography & Resend tests passed successfully!`);
  } catch (err) {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
