# 🚀 Wish Yours — Render Deployment & Scheduler Production Guide

> **Platform**: Wish Yours (formerly WishCraft AI)  
> **Deployment Target**: Render Web Service (`render.yaml`)  
> **Last Updated**: March 2026

---

## 1. Quick Deploy via Render Blueprint

Wish Yours is designed with **zero external npm dependencies** and uses pure native Node.js (`http`, `https`, `crypto`, `fs`). It builds in under 10 seconds and boots instantly on Render.

1. Connect your GitHub repository `https://github.com/mdmaazraza/WishCraft-AI` to Render.
2. In the Render Dashboard, click **New +** -> **Blueprint**.
3. Select your repository. Render will automatically detect and parse `render.yaml`.
4. Configure the environment variables (detailed below) and click **Apply**.

---

## 2. Environment Variables Configuration

| Variable | Required? | Recommended Default / Description |
| :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Render sets this automatically (usually `10000`). |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI message synthesis. (If absent, built-in template synthesizer activates). |
| `RESEND_API_KEY` | Recommended | Your Resend API key (`re_...`) for automated email delivery. |
| `RESEND_FROM_EMAIL` | Recommended | `Wish Yours <onboarding@resend.dev>` (or your verified domain sender, e.g. `wishes@yourdomain.com`). |
| `CRON_SECRET_KEY` | Recommended | Secret token to authorize external cron triggers to execute scheduled dispatches (e.g. `wishyours_cron_secret_2026`). |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio account SID if automated cellular SMS or Voice calls are desired. |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio auth token. |
| `TWILIO_PHONE_NUMBER`| Optional | Twilio provisioned phone number. |
| `FAST2SMS_API_KEY` | Optional | Fast2SMS Indian gateway API key. |
| `SUPABASE_URL` | Optional | Supabase project URL for PostgreSQL cloud synchronization. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase service role key. |

---

## 3. High-Reliability Scheduler on Render Free Tier

### The Problem
Render Free Web Services spin down (enter sleep mode) after 15 minutes of zero inbound traffic. If an instance is asleep, an in-process `setInterval` ticker in `scheduler/engine.js` will pause, delaying scheduled deliveries until someone visits the website.

### The Zero-Cost Solution: External Cron Webhook
Wish Yours includes a secured webhook endpoint specifically designed to keep the scheduler running on time for free:
`GET /api/cron/process-scheduled`

#### Setting Up Free Cron Execution (via cron-job.org)
1. Go to [https://cron-job.org](https://cron-job.org) (100% free cron service).
2. Create a new cron job:
   - **URL**: `https://<your-app-name>.onrender.com/api/cron/process-scheduled`
   - **Schedule**: Every 5 minutes or 10 minutes (`*/5 * * * *`).
   - **HTTP Headers**: Add header:
     - `x-cron-key`: `your_cron_secret_key_here`
3. Save the job.

**Result**:
- Every 5 minutes, cron-job.org pings your Render endpoint.
- If the Render instance is asleep, the HTTP ping **wakes it immediately**.
- `handleTriggerCron` verifies the `x-cron-key` header and calls `processDueWishes()`.
- All due celebration wishes are dispatched immediately.
- This gives you enterprise-grade, on-time scheduled delivery on Render's free tier without paying $7/month for a background worker.


---

## 4. Troubleshooting Render Auto-Deploy & GitHub Synchronization

If Render is not picking up or deploying your latest commits from GitHub, perform the following verification checklist:

### Checklist 1: Monitored Branch Setting
- Render Web Services are attached to a single specific branch (typically `main` or `master`).
- If you push commits to a feature branch (e.g. `feature/creation-controls-and-photos-debug`), Render will **NOT** build or deploy until those commits are merged into the monitored branch (`main`).
- **How to verify**:
  1. Open [Render Dashboard](https://dashboard.render.com).
  2. Click on your `wish-yours` Web Service.
  3. Navigate to **Settings** → **Branch**.
  4. Ensure it is set to `main` (matching GitHub default).

### Checklist 2: Auto-Deploy Toggle
- If Auto-Deploy was toggled off manually in the dashboard, new pushes to GitHub will not trigger deployments.
- **How to verify**:
  1. In Render Dashboard → `wish-yours` → **Settings**.
  2. Locate **Auto-Deploy**.
  3. Ensure it is set to **Yes**.

### Checklist 3: Root Directory Configuration
- Because the repository root contains `server.js` and `package.json`, the **Root Directory** field in Render must be left **blank** (or set to `.`).
- Setting it to `WishCraft-AI` will cause Render to look for `WishCraft-AI/package.json` inside the already cloned repo, which fails.
- **How to verify**:
  1. In Render Dashboard → `wish-yours` → **Settings**.
  2. Check **Root Directory**.
  3. Clear any value; leave it blank.

### Checklist 4: Build & Start Commands
- **Build Command**: `npm install` (or leave empty).
- **Start Command**: `node server.js`.

### Checklist 5: Free Tier Cold Boot (Spin-Down)
- On Render's Free Tier, instances spin down after 15 minutes of inactivity.
- The first visitor request can take 50–90 seconds to cold boot.
- Check the **Events** and **Logs** tabs in the Render Dashboard to confirm whether a deployment was triggered and is actively building.

### Checklist 6: GitHub App Permissions
- If GitHub webhooks are not reaching Render, visit your GitHub account:
  1. Go to **GitHub Settings** → **Applications** → **Render**.
  2. Ensure "Repository access" includes `WishCraft-AI` (or "All repositories").
