# Wish Yours — Testing Guide & Verification Procedures

This guide provides step-by-step instructions for running automated test suites, testing Resend email delivery, and verifying typography rendering across desktop and mobile browsers.

---

## 1. Automated Test Suites

The repository includes three automated test runners requiring **no external npm packages**:

### A. Core API, Database & Typography Test Suite
Tests wish creation, slug generation, view counters, candle blow persistence, font sanitization, CSS font stacks, Resend sender sanitization, email HTML templating, email masking, and admin analytics.

```bash
cd C:\Users\mdmaa\OneDrive\Desktop\AntigravityDev\WishCraft-AI
node tests/test_api.js
```

**Expected Result**:
```
🧪 Starting Wish Yours API & Typography Test Suite...

✅ Test 1: handleCreateWish creates greeting with slug and custom font_family
✅ Test 2: handleGetWish retrieves wish with font_family and increments view counter
✅ Test 3: Font sanitization safely falls back to Playfair Display
✅ Test 4: handleBlowCandles updates candle status
✅ Test 5: handleUpdateWish modifies message and font_family
✅ Test 6: handleListWishes filters correctly by occasion
✅ Test 7: getFontCssStack provides comprehensive CSS fallbacks for all 6 fonts
✅ Test 8: getValidResendSender strictly enforces Resend domain rules
✅ Test 9: generateEmailHTML generates responsive, font-styled celebration email
✅ Test 10: maskEmail protects user privacy in server logs
✅ Test 11: handleSendEmail executed successfully (provider: simulator)
✅ Test 12: handlePrepareSMS generates deep-link URL schema
✅ Test 13: handleGetAdminStats computes accurate KPIs
✅ Test 14: handleModerateWish toggles public/private visibility
✅ Test 15: handleDeleteWish permanently deletes greeting

🎉 All 15/15 API, Typography & Resend tests passed successfully!
```

---

### B. AI & Multi-Language Generation Test Suite
Tests the Google Gemini integration and fallback synthesizer for English, Hindi, and Hinglish.

```bash
cd C:\Users\mdmaa\OneDrive\Desktop\AntigravityDev\WishCraft-AI
node tests/test_ai.js
```

**Expected Result**:
```
🧪 Starting Wish Yours Message Generation Tests...

✅ Test 1: Generated 3 diverse English variations with recipient name & memories
✅ Test 2: Generated 3 poetic Hindi variations
✅ Test 3: Generated 3 natural Hinglish variations
✅ Test 4: Direct fallback synthesizer produces 3 fully structured variations

🎉 All 4/4 AI & Multi-Language tests passed successfully!
```

---

### C. Resend Live Diagnostic & Verification Tool
Use this diagnostic script to test Resend configuration and email dispatch.

#### 1. Test in Simulation Mode (No API key needed)
```bash
node tests/test_resend_live.js
```

#### 2. Test Live Delivery to Your Verified Resend Account Email
```powershell
# In PowerShell:
$env:RESEND_API_KEY = "re_your_actual_key"
node tests/test_resend_live.js your-account-email@example.com
```

**Expected Success Output**:
```
====================================================
💌 Wish Yours — Resend Email Delivery Diagnostic
====================================================
[Config Check]
- RESEND_API_KEY: ✅ Configured (re_***)
- Configured Sender: (default)
- Validated Sender: Wish Yours <onboarding@resend.dev>
- Test Recipient: your-account-email@example.com

🚀 Attempting LIVE dispatch to api.resend.com...
[Email Service] 📤 Dispatching email via Resend to=y***l@example.com from=Wish Yours <onboarding@resend.dev>
[Email Service] ✅ Resend successfully accepted message! Message ID: 12345678-xxxx-xxxx-xxxx-xxxxxxxxxxxx
====================================================
🎉 SUCCESS! Resend Accepted the Email Dispatch
====================================================
- Message ID: 12345678-xxxx-xxxx-xxxx-xxxxxxxxxxxx
- Provider: resend
- Delivery Status: Accepted
```

---

### D. Scheduled Wishes & Scheduler Engine Test Suite
Tests past date rejection, email/phone format validation, future scheduling in UTC, list enrichment, reschedule updates, cancellation, scheduler engine execution, idempotency locking, cron authentication, and deletion.

```bash
cd C:\Users\mdmaa\OneDrive\Desktop\AntigravityDev\WishCraft-AI
node tests/test_scheduler.js
```

**Expected Result**:
```
======================================================
🧪 Wish Yours: Scheduled Wishes Test Suite Starting...
======================================================

  ✅ PASS: Reject scheduling in the past (< Date.now())
  ✅ PASS: Reject invalid email format when delivery_method is email
  ✅ PASS: Reject missing/invalid phone number when delivery_method is sms or call
  ✅ PASS: Successfully create scheduled wish for future date in UTC
  ✅ PASS: Retrieve scheduled wish by ID with greeting context
  ✅ PASS: List scheduled wishes and verify enrichment
  ✅ PASS: Reschedule wish to new future time and personal note
  ✅ PASS: Reject update if new scheduled_at is in the past
  ✅ PASS: Cancel scheduled wish marks status as cancelled
  ✅ PASS: Scheduler Engine locks, processes due wish, and enforces idempotency
  ✅ PASS: Reject cron trigger without valid x-cron-key
  ✅ PASS: Accept cron trigger with valid x-cron-key
  ✅ PASS: Delete scheduled wish permanently

======================================================
🎉 TEST RUN COMPLETE: 13 Passed, 0 Failed
======================================================
```

---

### E. End-to-End Creation Trace Test (`test_flow.js`)
Validates the full pipeline from form entry, to AI message generation, storage, slug creation, and public webpage retrieval.

```bash
node tests/test_flow.js
```

---

## 2. End-to-End Manual Testing Workflow

### Step 1: Start the Local Development Server
```bash
cd C:\Users\mdmaa\OneDrive\Desktop\AntigravityDev\WishCraft-AI
node server.js
```
Open your browser to [http://localhost:3000](http://localhost:3000).

---

### Step 2: Test Typography in the Creation Studio (`/create`)
1. Navigate to [http://localhost:3000/create](http://localhost:3000/create).
2. **Step 1 (Occasion)**: Choose "Wedding Anniversary" or "Birthday".
3. **Step 2 (Relationship)**: Choose "Girlfriend" or "Best Friend".
4. **Step 3 (Details)**: Enter Recipient's Name (e.g. `Sophia`) and Sender's Name (`Liam`).
5. **Step 4 (Tone & Typography)**:
   - Select a style (e.g. `Romantic`).
   - Under **Lettering & Typography Style**, click each font button:
     - **Dancing Script** (Calligraphy)
     - **Great Vibes** (Romantic Cursive)
     - **Outfit** (Modern Sans)
     - **Pacifico** (Playful Brush)
     - **Cinzel** (Royal Roman)
     - **Playfair Display** (Classic Serif)
   - Verify that the card highlights with a pink ring and the selected font badge updates.
6. **Step 5 (Theme)**: Choose a visual theme (e.g. `Romantic Love`).
7. **Step 6 (Generate & Edit)**:
   - Notice the **Font dropdown** next to "Edit & Finalize Message".
   - Notice how the font inside the textarea dynamically renders in the chosen font.
   - Switch the font in the dropdown and confirm the textarea font updates immediately.
8. Click **Generate & Share Greeting ✨**.

---

### Step 3: Test Shared Celebration Page (`/wish/:slug`)
1. After publishing, click **Open Webpage ↗** in the share modal (or open the generated link).
2. **Verify Typography**:
   - Inspect `#greetingMessageBody`: it renders in the font selected during creation.
   - If memories were provided, verify `#personalMemoryText` renders in the matching font.
3. **Test Interactive Elements**:
   - **For Birthday**: Click the candles on the cake. Verify:
     - Flames extinguish with a smoke effect.
     - Web Audio plays candle blow-out sound effect.
     - Celebratory confetti burst triggers across the screen.
     - Status updates to "🎉 Candled blown out!".
     - Refreshing the page preserves candle state (`candles_blown: true`).
   - **For Romantic / Anniversary**:
     - Click the wax seal `💌`.
     - The wax seal rotates and disappears.
     - The envelope opens into an unfolded love letter with confetti.
     - Love letter body, greeting, and signature render in the selected font.
   - **Audio Player**:
     - Click the play button (`▶️`) in the floating header.
     - Visualizer bars animate as the synthesized celebration melody plays.
     - Click mute (`🔊`) to test audio control.

---

### Step 4: Test Email Sharing Modal
1. In the share modal (or from the creation studio), enter a recipient email address in **Deliver Directly via Email 💌**.
2. Click **Send Email**.
3. **Behavior**:
   - If `RESEND_API_KEY` is not set: toast indicates a preview was simulated and logs a link to the dashboard.
   - If `RESEND_API_KEY` is set and recipient matches the Resend account owner: toast displays `✨ Email sent to ...!`.
   - If recipient is external on free tier: toast displays the exact guidance explaining how to verify a custom domain.
4. Check the server terminal to confirm masked email logging (e.g. `to=s***a@example.com`).

---

### Step 5: Responsive & Cross-Device Layout Testing
- Open Developer Tools in Chrome / Firefox (`F12`).
- Toggle Device Toolbar (`Ctrl + Shift + M`).
- Test common screen viewports:
  - **iPhone SE / 12 / 14** (375px - 390px)
  - **Pixel 7** (412px)
  - **iPad Mini / Air** (768px - 820px)
  - **Desktop** (1280px+)
- Confirm:
  - Font sizes scale cleanly without text overflowing cards.
  - Multi-step progress tracker fits mobile screens.
  - Interactive cakes and wax envelopes are touch-friendly.
