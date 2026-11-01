# Wish Yours — Next Steps & Production Deployment Guide

This document outlines the exact manual configurations required in **Resend** and **Render** to transition Wish Yours from development to a live production application.

---

## 1. Resend Email Configuration (Mandatory for Live Delivery)

### A. Testing on the Free Sandbox Tier (Immediate)
If you want to test email sending right now without purchasing a domain:
1. Log in to [Resend Dashboard](https://resend.com).
2. Go to **API Keys** → **Create API Key** (Permissions: `Sending access`).
3. Copy your key (starts with `re_...`).
4. In your `.env` file (or Render dashboard):
   ```env
   RESEND_API_KEY=re_your_copied_key_here
   RESEND_FROM_EMAIL=Wish Yours <onboarding@resend.dev>
   ```
5. **CRITICAL RESEND RULE**: On the free tier, Resend **only permits sending to the email address you registered your Resend account with**.
   - Test by entering *your own email address* as the recipient in the Wish Yours share modal.
   - It will deliver immediately.

---

### B. Sending to ANY Recipient (Custom Domain Verification)
To allow visitors to send celebration emails to any friend or family member:
1. Go to [Resend Domains](https://resend.com/domains).
2. Click **Add Domain** (e.g. `wishyours.com` or `mail.wishyours.com`).
3. Resend will provide 3 DNS records:
   - **DKIM** (TXT / CNAME)
   - **SPF** (TXT)
   - **MX** (for deliverability)
4. Add these DNS records to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.).
5. Wait for verification (typically 5 to 15 minutes).
6. Once verified, update your environment variable:
   ```env
   RESEND_FROM_EMAIL=Wish Yours <celebrate@yourdomain.com>
   ```
   Now emails will dispatch from your branded domain to any email address worldwide with top-tier inbox deliverability.

---

## 2. Render Deployment Workflow

The application includes a `render.yaml` Blueprint specification for 1-click deployment.

### Step 1: Connect GitHub Repository
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Select your GitHub repository: `https://github.com/mdmaazraza/WishCraft-AI`.
4. Render will parse `render.yaml` and configure the web service automatically.

### Step 2: Set Environment Variables on Render
Under **Environment Variables** in the Render service settings, configure:

| Key | Recommended Value | Notes |
| :--- | :--- | :--- |
| `NODE_VERSION` | `20.18.0` | Node.js LTS |
| `NODE_ENV` | `production` | Optimizes server handling |
| `BASE_URL` | `https://your-service-name.onrender.com` | Your live Render URL (used for links in emails & WhatsApp) |
| `RESEND_API_KEY` | `re_...` | Your secret API key from Resend |
| `RESEND_FROM_EMAIL` | `Wish Yours <onboarding@resend.dev>` | Or your custom domain if verified |
| `CRON_SECRET_KEY` | `wishyours_cron_secret_2026` | Protects `/api/cron/process-scheduled` |
| `GEMINI_API_KEY` | `AIzaSy...` | From [Google AI Studio](https://aistudio.google.com) |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Ultra-fast, cost-effective multimodal model |
| `ADMIN_SECRET_KEY` | `(auto-generated secret)` | Used to protect `/admin` dashboard |

---

## 3. Post-Deployment Verification Checklist

- [ ] Open the live Render URL.
- [ ] Confirm typography loads without lag or fallback flicker.
- [ ] Create a test birthday greeting using "Dancing Script" or "Cinzel".
- [ ] Tap the cake candles and confirm audio + confetti play on mobile devices.
- [ ] Create a test anniversary greeting and test breaking the wax seal.
- [ ] Schedule a test greeting 3 minutes in the future; verify automated dispatch via Resend or simulator.
- [ ] Ping `/api/cron/process-scheduled` with `x-cron-key` and verify HTTP 200 response.
- [ ] Open `/dashboard.html#scheduled` and verify view, reschedule, and cancel actions.
- [ ] Dispatch a test email to your registered account email and verify receipt.
- [ ] Test the WhatsApp share button on a mobile smartphone.
- [ ] Log in to `/admin` with `ADMIN_SECRET_KEY` and verify KPI charts and moderation controls.

---

## 4. Future Roadmap & Enhancements

1. **User Voice Notes**:
   - Allow senders to record a 30-second audio note directly in the browser via MediaRecorder API and embed it in the greeting page.
2. **Scheduled Delivery Extensions**:
   - Automated Indian SMS via Fast2SMS DLT registration when user procures DLT Principal Entity ID.
   - Outbound IVR telephone call wishes using Twilio Voice or Exotel when paid credits are configured.
3. **Database Migration to Supabase**:
   - Run `data/supabase_schema.sql` on Supabase to enable PostgreSQL cloud persistence with Row Level Security (RLS).


---

## 5. Photo Storage & Render Verification Checklist

### Photo Upload & Supabase Storage
1. **Local & Inline Fallback**:
   - Photos upload immediately and compress via canvas without needing external cloud storage.
2. **Supabase Storage Bucket Setup (Optional for cloud hosting)**:
   - If using Supabase Storage, ensure the bucket `wish-photos` is created in Supabase Dashboard → Storage → New Bucket (`wish-photos`, Public: ON).
   - The policies from `supabase_schema.sql` allow public read and write access to `wish-photos`.
   - Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Render environment variables.

### Render Deployment Verification Checklist
- [ ] Confirm Git commits are pushed to `main` before checking Render.
- [ ] In Render Dashboard → Settings, confirm **Branch** is set to `main`.
- [ ] In Render Dashboard → Settings, confirm **Auto-Deploy** is set to `Yes`.
- [ ] In Render Dashboard → Settings, confirm **Root Directory** is empty.
- [ ] Confirm first request wakes the free-tier service if dormant for >15 minutes.

## Production Release Status — November 1, 2026
- All 71 automated regression tests passing across 5 test suites.
- Production build clean, zero runtime dependencies.
- Git branch `main` synchronized with GitHub origin.
- Render auto-deploy triggered upon push to `main`.
