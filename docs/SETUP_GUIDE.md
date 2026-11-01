# 💻 Wish Yours — Local Setup & Development Guide

> **Platform**: Wish Yours (formerly WishCraft AI)  
> **Target OS**: Windows, macOS, Linux  
> **Runtime**: Node.js v18.0.0 or higher (Tested on Node.js v24)  
> **Dependencies**: Pure Native Node.js (Zero npm install required)

---

## 1. Quick Start (1 Minute)

1. Open your terminal in the project directory:
   ```bash
   cd WishCraft-AI
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
GEMINI_MODEL=gemini-1.5-flash

# Resend Email API (free tier at https://resend.com)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Wish Yours <onboarding@resend.dev>

# Cron Security Key for External Scheduler Trigger
CRON_SECRET_KEY=wishyours_cron_secret_2026

# Optional Supabase Database & Storage Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Optional Telecom Providers (SMS & Voice)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
FAST2SMS_API_KEY=

# Optional Official Meta WhatsApp Business Cloud API
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_TEMPLATE_NAME=wishcraft_greeting_notification
```

---

## 3. Running Verification Tests

Run any or all of the automated test runners:

```bash
# Run complete test suite (63 tests)
npm test

# Or run individual runners:
node tests/test_api.js                    # 15 tests: Core API, DB, Fonts, Resend
node tests/test_step4_controls.js         # 3 tests: Modal overlay protection & Section 24 flow
node tests/test_all_creation_controls.js  # 30 tests: Controls, writing polish, templates, photos
node tests/test_whatsapp_and_photos.js    # 15 tests: WhatsApp wording, wa.me phone normalization, photo reload
```
