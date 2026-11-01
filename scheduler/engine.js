/**
 * Wish Yours — Server-Side Background Scheduler Engine
 * Idempotent, Lock-Safe, Zero-External-Dependency Execution Engine.
 */

const db = require('../data/db');
const { deliverEmail } = require('../api/providers/email_provider');
const { deliverSMS } = require('../api/providers/sms_provider');
const { triggerVoiceCall } = require('../api/providers/voice_provider');

let schedulerTimer = null;
let isProcessing = false;

async function processDueWishes(baseUrl = 'http://localhost:3000') {
  if (isProcessing) {
    return { status: 'busy', message: 'Scheduler tick already in progress' };
  }

  isProcessing = true;
  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
    details: []
  };

  try {
    const dueWishes = db.getDueScheduledWishes(25);
    if (dueWishes.length === 0) {
      return results;
    }

    console.log(`[Scheduler Engine] ⏰ Found ${dueWishes.length} due scheduled wish(es) to process...`);

    for (const scheduledWish of dueWishes) {
      // 1. Atomic Idempotency Lock
      const locked = db.lockScheduledWish(scheduledWish.id);
      if (!locked) {
        // Already claimed by concurrent worker or processed
        continue;
      }

      results.processed++;
      const wishId = scheduledWish.id;
      const method = scheduledWish.delivery_method || 'email';

      try {
        // Fetch full greeting context
        const greeting = db.getWishBySlug(scheduledWish.greeting_id) || db.getWishById(scheduledWish.greeting_id);
        const slug = greeting?.slug || scheduledWish.greeting_id;
        const wishUrl = `${baseUrl.replace(/\/+$/, '')}/wish/${slug}`;

        let deliveryResult = null;

        if (method === 'email') {
          deliveryResult = await deliverEmail({
            recipientEmail: scheduledWish.recipient_email,
            recipientName: scheduledWish.recipient_name,
            senderName: greeting?.sender_name || 'Someone special',
            occasion: greeting?.occasion || 'Celebration',
            wishUrl,
            messageExcerpt: scheduledWish.personal_message || greeting?.message,
            fontFamily: greeting?.font_family || 'Playfair Display',
            wishId: greeting?.id,
            slug
          });
        } else if (method === 'sms') {
          deliveryResult = await deliverSMS({
            recipientPhone: scheduledWish.recipient_phone,
            recipientName: scheduledWish.recipient_name,
            senderName: greeting?.sender_name || 'Someone special',
            occasion: greeting?.occasion || 'Celebration',
            wishUrl
          });
        } else if (method === 'call') {
          deliveryResult = await triggerVoiceCall({
            recipientPhone: scheduledWish.recipient_phone,
            recipientName: scheduledWish.recipient_name,
            senderName: greeting?.sender_name || 'Someone special',
            occasion: greeting?.occasion || 'Celebration',
            personalMessage: scheduledWish.personal_message || greeting?.message
          });
        } else {
          throw new Error(`Unsupported delivery method: ${method}`);
        }

        // Mark successfully dispatched
        db.markScheduledWishSent(wishId, deliveryResult);
        results.sent++;
        results.details.push({
          id: wishId,
          method,
          status: 'sent',
          recipient: scheduledWish.recipient_email || scheduledWish.recipient_phone
        });

        console.log(`[Scheduler Engine] ✅ Successfully processed wish ${wishId} via ${method}`);

      } catch (err) {
        console.error(`[Scheduler Engine] ❌ Failed dispatching wish ${wishId}:`, err.message);
        // Temporary retry vs permanent failure
        const isTemporary = !err.message.includes('Valid recipient') && !err.message.includes('Unsupported');
        db.markScheduledWishFailed(wishId, err.message, isTemporary);
        results.failed++;
        results.details.push({
          id: wishId,
          method,
          status: 'failed',
          error: err.message
        });
      }
    }
  } catch (err) {
    console.error('[Scheduler Engine] Critical error in scheduler tick:', err);
  } finally {
    isProcessing = false;
  }

  return results;
}

function startSchedulerLoop(intervalMs = 30000, baseUrl = 'http://localhost:3000') {
  if (schedulerTimer) {
    return;
  }

  console.log(`[Scheduler Engine] 🚀 Background scheduler loop started (polling every ${intervalMs / 1000}s)`);

  // Initial tick after 3 seconds
  setTimeout(() => {
    processDueWishes(baseUrl).catch(e => console.error('[Scheduler Engine Initial Tick Error]:', e));
  }, 3000);

  schedulerTimer = setInterval(() => {
    processDueWishes(baseUrl).catch(e => console.error('[Scheduler Engine Tick Error]:', e));
  }, intervalMs);

  // Do not hold process alive if this is the only timer in tests
  if (schedulerTimer.unref) {
    schedulerTimer.unref();
  }
}

function stopSchedulerLoop() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.log('[Scheduler Engine] 🛑 Background scheduler loop stopped');
  }
}

module.exports = {
  processDueWishes,
  startSchedulerLoop,
  stopSchedulerLoop
};
