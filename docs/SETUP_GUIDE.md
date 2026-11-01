# 💻 Wish Yours — Local Setup & Development Guide

> **Platform**: Wish Yours (formerly WishCraft AI)  
> **Target OS**: Windows, macOS, Linux  
> **Runtime**: Node.js v18.0.0 or higher (Tested on Node.js v24)  
> **Dependencies**: Pure Native Node.js (Zero npm install required)

---

## 1. Quick Start (1 Minute)

1. Open your terminal in the project directory:
   ```bash
   cd C:\Users\mdmaa\OneDrive\Desktop\AntigravityDev\WishCraft-AI
   ```

2. Because Wish Yours uses pure standard Node.js APIs (`http`, `https`, `crypto`, `fs`), there are **no external npm modules to install**.

3. Start the application:
   ```bash
   npm start
   # or
   node server.js
   ```

4. Open your browser to:
   [http://localhost:3000](http://localhost:3000)

---

## 2. Environment Configuration

Copy `.env.example` to `.env.local` or `.env`:

```env
PORT=3000
NODE_ENV=development

# Google Gemini Flash API Key (optional - built-in fallback active)
GEMINI_API_KEY=your_gemini_api_key_here

# Resend Email API (free tier at https://resend.com)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Wish Yours <onboarding@resend.dev>

# Cron Security Key for External Scheduler Trigger
CRON_SECRET_KEY=wishyours_cron_secret_2026

# Optional Telecom Providers (SMS & Voice)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
FAST2SMS_API_KEY=
```

---

## 3. Running Verification Tests

Run any or all of the automated test runners:

```bash
# 1. API, Database, Typography & Email Tests (15 tests)
node tests/test_api.js

# 2. AI Multi-Language Synthesis Tests (4 tests)
node tests/test_ai.js

# 3. Scheduled Wishes & Background Engine Tests (13 tests)
node tests/test_scheduler.js

# 4. End-to-End Creation Trace Test
node tests/test_flow.js
```
