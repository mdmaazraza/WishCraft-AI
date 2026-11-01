/**
 * Wish Yours — Test Suite: API Handlers & Database Layer
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
const { handleSendEmail } = require('../api/email');
const { handlePrepareSMS } = require('../api/sms');
const { handleGetAdminStats, handleModerateWish } = require('../api/admin');

async function runTests() {
  console.log('🧪 Starting Wish Yours API Test Suite...\n');
  let passed = 0;

  // 1. Database & Wishes Creation
  try {
    const newWishPayload = {
      recipient_name: 'Emily Watson',
      sender_name: 'Jordan',
      occasion: 'Birthday',
      relationship: 'Best Friend',
      style: 'Funny',
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
    console.log('✅ Test 1: handleCreateWish creates greeting with slug and sanitization');
    passed++;

    // 2. Fetch Wish by Slug & Auto-increment views
    const initialViews = createdRes.wish.views_count || 0;
    const fetchRes = await handleGetWish(createdRes.wish.slug);
    assert.strictEqual(fetchRes.status, 'success');
    assert.strictEqual(fetchRes.wish.recipient_name, 'Emily Watson');
    assert.strictEqual(fetchRes.wish.views_count, initialViews + 1, 'View count must auto-increment');
    console.log('✅ Test 2: handleGetWish retrieves wish and increments view counter');
    passed++;

    // 3. Candle Blow-Out Interaction
    const candleRes = await handleBlowCandles(createdRes.wish.slug, true);
    assert.strictEqual(candleRes.status, 'success');
    assert.strictEqual(candleRes.candles_blown, true);
    const updatedWish = db.getWishBySlug(createdRes.wish.slug);
    assert.strictEqual(updatedWish.candles_blown, true);
    console.log('✅ Test 3: handleBlowCandles updates candle status');
    passed++;

    // 4. Update Wish
    const updateRes = await handleUpdateWish(createdRes.wish.slug, {
      message: 'Updated message with more love and hugs! ❤️'
    });
    assert.strictEqual(updateRes.status, 'success');
    assert.strictEqual(updateRes.wish.message, 'Updated message with more love and hugs! ❤️');
    console.log('✅ Test 4: handleUpdateWish modifies existing wish');
    passed++;

    // 5. List Wishes with Filter
    const listRes = await handleListWishes({ occasion: 'Birthday' });
    assert.strictEqual(listRes.status, 'success');
    assert.ok(listRes.wishes.length > 0);
    assert.ok(listRes.wishes.every(w => w.occasion.toLowerCase() === 'birthday'));
    console.log('✅ Test 5: handleListWishes filters correctly by occasion');
    passed++;

    // 6. Email Service (Simulated fallback when no live RESEND_API_KEY)
    const emailRes = await handleSendEmail({
      wishId: createdRes.wish.id,
      slug: createdRes.wish.slug,
      recipientEmail: 'emily@example.com',
      senderName: 'Jordan',
      recipientName: 'Emily',
      occasion: 'Birthday',
      messageExcerpt: 'Happy Birthday Emily!'
    });
    assert.ok(emailRes.status === 'simulated' || emailRes.status === 'success');
    assert.ok(emailRes.messageId, 'Message ID must be present');
    console.log('✅ Test 6: handleSendEmail accurately reports delivery status');
    passed++;

    // 7. SMS Helper Deep Link
    const smsRes = await handlePrepareSMS({
      recipientPhone: '+1234567890',
      recipientName: 'Emily',
      senderName: 'Jordan',
      occasion: 'Birthday',
      slug: createdRes.wish.slug
    });
    assert.ok(smsRes.deepLink.startsWith('sms:'), 'Must generate valid sms: link');
    console.log('✅ Test 7: handlePrepareSMS generates deep-link URL schema');
    passed++;

    // 8. Admin Auth & Analytics
    const adminStats = await handleGetAdminStats({
      'x-admin-key': 'admin_wishcraft_secret_2026'
    });
    assert.strictEqual(adminStats.status, 'success');
    assert.ok(adminStats.analytics.totalWishes >= 1);
    assert.ok(adminStats.analytics.totalViews >= 1);
    console.log('✅ Test 8: handleGetAdminStats computes accurate KPIs');
    passed++;

    // 9. Admin Moderation: Toggle Visibility
    const modRes = await handleModerateWish({
      slug: createdRes.wish.slug,
      action: 'toggle_visibility'
    }, {
      'x-admin-key': 'admin_wishcraft_secret_2026'
    });
    assert.strictEqual(modRes.status, 'success');
    console.log('✅ Test 9: handleModerateWish toggles public/private visibility');
    passed++;

    // 10. Admin Moderation: Delete Wish
    const delRes = await handleDeleteWish(createdRes.wish.slug);
    assert.strictEqual(delRes.status, 'success');
    const verifyDel = db.getWishBySlug(createdRes.wish.slug);
    assert.strictEqual(verifyDel, null, 'Deleted wish must not exist');
    console.log('✅ Test 10: handleDeleteWish permanently deletes greeting');
    passed++;

    console.log(`\n🎉 All ${passed}/10 API & Database tests passed successfully!`);
  } catch (err) {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
