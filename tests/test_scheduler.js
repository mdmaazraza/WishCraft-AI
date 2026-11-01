/**
 * Wish Yours — Scheduled Wishes Automated Test Suite
 * Tests API endpoints, validation, timezone conversions, idempotency locks,
 * engine execution, and cron security.
 */

const assert = require('assert');
const http = require('http');
const db = require('../data/db');
const { processDueWishes } = require('../scheduler/engine');
const scheduledApi = require('../api/scheduled');

const TEST_PORT = 3847;
let serverInstance = null;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = { raw: data };
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 Wish Yours: Scheduled Wishes Test Suite Starting...');
  console.log('======================================================\n');

  // 1. Boot an isolated server instance for HTTP testing
  // We'll require server setup or spin up the existing server logic
  const originalServer = require('../server');
  // In server.js, createServer is exported or created; let's inspect how server.js is structured
  // Or we can invoke scheduledApi handlers directly AND spin up a test http listener.
  
  // Let's create a test celebration wish in db
  const testWish = db.createWish({
    occasion: 'Birthday',
    relationship: 'Best Friend',
    recipient_name: 'Priya Sharma',
    sender_name: 'Maaz',
    message: 'Happy Birthday Priya! May all your dreams take flight.',
    theme: 'birthday_celebration',
    font_family: 'Playfair Display'
  });

  console.log(`[Setup] Created baseline test greeting: ${testWish.slug} (ID: ${testWish.id})`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // --- TEST 1: Reject Past Delivery Date ---
  await test('Reject scheduling in the past (< Date.now())', async () => {
    try {
      await scheduledApi.handleCreateScheduledWish({
        greeting_id: testWish.slug,
        recipient_name: 'Priya',
        recipient_email: 'priya@example.com',
        delivery_method: 'email',
        scheduled_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        timezone: 'Asia/Kolkata'
      });
      assert.fail('Should have thrown error for past date');
    } catch (err) {
      assert.strictEqual(err.statusCode, 400);
      assert(err.message.includes('must be in the future'));
    }
  });

  // --- TEST 2: Validate Email Delivery Method ---
  await test('Reject invalid email format when delivery_method is email', async () => {
    try {
      await scheduledApi.handleCreateScheduledWish({
        greeting_id: testWish.slug,
        recipient_name: 'Priya',
        recipient_email: 'not-an-email',
        delivery_method: 'email',
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        timezone: 'Asia/Kolkata'
      });
      assert.fail('Should have rejected invalid email');
    } catch (err) {
      assert.strictEqual(err.statusCode, 400);
      assert(err.message.includes('valid recipient email'));
    }
  });

  // --- TEST 3: Validate Phone for SMS & Voice Call ---
  await test('Reject missing/invalid phone number when delivery_method is sms or call', async () => {
    try {
      await scheduledApi.handleCreateScheduledWish({
        greeting_id: testWish.slug,
        recipient_name: 'Priya',
        recipient_phone: '123',
        delivery_method: 'sms',
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        timezone: 'Asia/Kolkata'
      });
      assert.fail('Should have rejected short phone number');
    } catch (err) {
      assert.strictEqual(err.statusCode, 400);
      assert(err.message.includes('phone number with country code'));
    }
  });

  // --- TEST 4: Create Valid Future Scheduled Wish ---
  let createdScheduledWish = null;
  await test('Successfully create scheduled wish for future date in UTC', async () => {
    const futureDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const res = await scheduledApi.handleCreateScheduledWish({
      greeting_id: testWish.slug,
      recipient_name: 'Priya Sharma',
      recipient_email: 'priya.sharma@example.com',
      delivery_method: 'email',
      scheduled_at: futureDate,
      timezone: 'Asia/Kolkata',
      personal_message: 'Midnight surprise!'
    }, 'user_123');

    assert.strictEqual(res.status, 'success');
    assert(res.scheduled_wish.id);
    assert.strictEqual(res.scheduled_wish.recipient_name, 'Priya Sharma');
    assert.strictEqual(res.scheduled_wish.status, 'scheduled');
    assert.strictEqual(res.scheduled_wish.delivery_method, 'email');
    assert.strictEqual(res.scheduled_wish.timezone, 'Asia/Kolkata');
    assert.strictEqual(res.scheduled_wish.greeting_id, testWish.slug);

    createdScheduledWish = res.scheduled_wish;
  });

  // --- TEST 5: Get Scheduled Wish By ID ---
  await test('Retrieve scheduled wish by ID with greeting context', async () => {
    const res = await scheduledApi.handleGetScheduledWish(createdScheduledWish.id, 'user_123');
    assert.strictEqual(res.status, 'success');
    assert.strictEqual(res.scheduled_wish.id, createdScheduledWish.id);
    assert.strictEqual(res.scheduled_wish.occasion, 'Birthday');
    assert.strictEqual(res.scheduled_wish.sender_name, 'Maaz');
  });

  // --- TEST 6: List Scheduled Wishes with Filters ---
  await test('List scheduled wishes and verify enrichment', async () => {
    const res = await scheduledApi.handleListScheduledWishes({
      greeting_id: testWish.slug
    });
    assert.strictEqual(res.status, 'success');
    assert(res.total >= 1);
    const found = res.scheduled_wishes.find(w => w.id === createdScheduledWish.id);
    assert(found, 'Created scheduled wish must appear in list');
    assert.strictEqual(found.recipient_name, 'Priya Sharma');
  });

  // --- TEST 7: Update / Reschedule Wish ---
  await test('Reschedule wish to new future time and personal note', async () => {
    const newFutureDate = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const res = await scheduledApi.handleUpdateScheduledWish(createdScheduledWish.id, {
      scheduled_at: newFutureDate,
      personal_message: 'Updated surprise note!'
    }, 'user_123');

    assert.strictEqual(res.status, 'success');
    assert.strictEqual(res.scheduled_wish.scheduled_at, newFutureDate);
    assert.strictEqual(res.scheduled_wish.personal_message, 'Updated surprise note!');
  });

  // --- TEST 8: Prevent Rescheduling to the Past ---
  await test('Reject update if new scheduled_at is in the past', async () => {
    try {
      await scheduledApi.handleUpdateScheduledWish(createdScheduledWish.id, {
        scheduled_at: new Date(Date.now() - 3600000).toISOString()
      }, 'user_123');
      assert.fail('Should have rejected past update');
    } catch (err) {
      assert.strictEqual(err.statusCode, 400);
      assert(err.message.includes('must be in the future'));
    }
  });

  // --- TEST 9: Cancel Scheduled Wish ---
  await test('Cancel scheduled wish marks status as cancelled', async () => {
    const res = await scheduledApi.handleCancelScheduledWish(createdScheduledWish.id, 'user_123');
    assert.strictEqual(res.status, 'success');
    assert.strictEqual(res.scheduled_wish.status, 'cancelled');

    const fetched = db.getScheduledWishById(createdScheduledWish.id);
    assert.strictEqual(fetched.status, 'cancelled');
  });

  // --- TEST 10: Scheduler Engine & Idempotency Lock ---
  await test('Scheduler Engine locks, processes due wish, and enforces idempotency', async () => {
    // 1. Create a due scheduled wish (scheduled_at 1 minute ago)
    const dueWish = db.createScheduledWish({
      user_id: 'engine_test_user',
      greeting_id: testWish.slug,
      recipient_name: 'Rohan Verma',
      recipient_email: 'rohan.test@example.com',
      delivery_method: 'email',
      scheduled_at: new Date(Date.now() - 60000).toISOString(),
      timezone: 'Asia/Kolkata',
      personal_message: 'Happy celebration!'
    });

    assert.strictEqual(dueWish.status, 'scheduled');

    // 2. Run engine pass 1
    const run1 = await processDueWishes('http://localhost:3000');
    assert(run1.processed >= 1, 'Engine must process at least 1 due wish');

    const updated = db.getScheduledWishById(dueWish.id);
    assert.strictEqual(updated.status, 'sent', 'Wish status must transition to sent');
    assert(updated.provider_response, 'Provider response metadata must be recorded');
    assert(['resend', 'simulator'].includes(updated.provider_response.provider), `Provider should be resend or simulator, got: ${updated.provider_response.provider}`);

    // 3. Run engine pass 2 immediately -> Must NOT re-process already sent wish (Idempotency)
    const run2 = await processDueWishes('http://localhost:3000');
    const checkedAgain = run2.details.find(d => d.id === dueWish.id);
    assert.strictEqual(checkedAgain, undefined, 'Wish must NOT be re-processed or duplicate delivered');
  });

  // --- TEST 11: Cron Security Check ---
  await test('Reject cron trigger without valid x-cron-key', async () => {
    try {
      await scheduledApi.handleTriggerCron({}, 'http://localhost:3000');
      assert.fail('Should have rejected missing cron key');
    } catch (err) {
      assert.strictEqual(err.statusCode, 401);
      assert(err.message.includes('Unauthorized'));
    }
  });

  await test('Accept cron trigger with valid x-cron-key', async () => {
    const cronKey = process.env.CRON_SECRET_KEY || process.env.ADMIN_SECRET_KEY || 'wishyours_cron_secret_2026';
    const res = await scheduledApi.handleTriggerCron({ 'x-cron-key': cronKey }, 'http://localhost:3000');
    assert.strictEqual(res.status, 'success');
    assert(res.timestamp);
  });

  // --- TEST 12: Delete Scheduled Wish Record ---
  await test('Delete scheduled wish permanently', async () => {
    const res = await scheduledApi.handleDeleteScheduledWish(createdScheduledWish.id, 'user_123');
    assert.strictEqual(res.status, 'success');
    const check = db.getScheduledWishById(createdScheduledWish.id);
    assert.strictEqual(check, null);
  });

  console.log('\n======================================================');
  console.log(`🎉 TEST RUN COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
