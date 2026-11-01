# ✨ WishCraft AI — Personalized Birthday & Anniversary Wishes Website

> **Make Every Special Moment Unforgettable.**  
> A complete, production-ready web application where users generate beautiful, interactive, personalized celebration greeting experiences powered by **Google Gemini AI**.

---

## 🌟 Overview & Key Features

WishCraft AI allows anyone to craft bespoke digital celebrations for birthdays, anniversaries, friendships, romantic milestones, and special moments in minutes.

### 🎂 Interactive Personalized Greeting Webpages
When the recipient opens their unique URL (e.g. `wishcraft.com/wish/sarah-25th-bday`):
- **Birthday Cake with Interactive Candle Blow-Out**: Tap or click the candles to blow them out. Realistic flickering flames vanish, smoke particles rise, joyful chimes ring out, and an explosive confetti shower rains down!
- **Wax-Sealed Romantic Love Letters**: Tap a vintage 3D wax seal to break the seal, unfold the handwritten letterhead, and reveal romantic messages surrounded by floating heart particles.
- **Photo Polaroid Reel & Lightbox**: Interactive polaroids with captions and full-screen lightbox preview.
- **Royalty-Free Melodic Synthesizer**: Built using client-side **Web Audio API**—plays cheerful acoustic birthday songs, romantic harp melodies, and celebration fanfares with zero copyright restrictions and zero external audio file dependencies.
- **Relationship Milestones**: Celebrates years/months together and awards fun friendship badges (*"Partner in Crime"*, *"Certified Ride-or-Die"*).

### 🤖 Gemini AI Message Generation
- Generates **3 distinct personalized variations** matching the occasion, relationship, tone, personal memories, and target length.
- Supports **English**, **Hindi** (हिंदी), and conversational **Hinglish**.
- **Backend security**: `GEMINI_API_KEY` stays strictly on the server and is never exposed to the frontend.
- **Smart Fallback Engine**: If no API key is configured or during offline development, an intelligent template synthesis engine produces rich greetings so the app runs flawlessly out of the box.

### 📤 Multi-Channel Sharing & Accurate Delivery
- **WhatsApp**: Direct web/mobile deep-link with pre-filled personalized message and unique greeting link.
- **Email Delivery**: Integrated backend delivery via **Resend** or **Brevo** with responsive HTML celebration cards and honest delivery status feedback.
- **SMS**: Native mobile `sms:?body=...` deep linking + Twilio backend integration.
- **Copy Link**: One-click clipboard copy with animated toast notifications.
- **Dynamic Open Graph & Social Cards**: Automatically injects rich Open Graph metadata (`og:title`, `og:description`, `og:image`, `og:url`) into the HTML stream for cards in WhatsApp, iMessage, and Facebook.

### 🛡️ User & Admin Dashboards
- **Guest Mode**: Anyone can create and share greetings without mandatory registration.
- **User Dashboard**: Save greetings, view visitor analytics & view counters, edit or delete wishes, and reuse templates.
- **Admin Portal (`/admin`)**: Protected by `ADMIN_SECRET_KEY`, providing real-time KPI metrics, occasion distribution charts, email delivery logs, and moderation tools (toggle visibility / delete inappropriate content).

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js (v18 or higher)

### 1. Clone or Navigate to the Project
```bash
cd wishcraft-ai
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` to supply your credentials:
```env
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# Google Gemini API Key (Get free key at https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Email Delivery (Get free key at https://resend.com)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=WishCraft <wishes@resend.dev>

# Supabase (Optional for local dev, persistent JSON storage is used if left blank)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Admin Portal Password
ADMIN_SECRET_KEY=admin_wishcraft_secret_2026
```

### 3. Run the Server
```bash
npm start
# or
node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your browser!

### 4. Run the Automated Test Suite
```bash
npm test
# or
node tests/test_api.js
node tests/test_ai.js
```

---

## 🗄️ Database & Supabase Setup

WishCraft AI is equipped with a dual storage engine:
1. **Zero-Config Persistent Storage**: Uses atomic JSON transactions in `data/wishes.json` out of the box.
2. **Supabase Database & Storage**: Ready for cloud scale with PostgreSQL, Row Level Security, and Storage Buckets.

### Applying the Supabase Schema
1. Open your [Supabase Dashboard](https://app.supabase.com).
2. Go to **SQL Editor** -> **New query**.
3. Copy the contents of [`supabase_schema.sql`](./supabase_schema.sql) and execute.
4. Tables created:
   - `wishes`: Stores greetings, unique slugs, view counts, candle state, and images.
   - `users`: User profiles with role-based access (`user`, `admin`).
   - `email_logs`: Tracks every email dispatched.
   - `templates`: Ready-to-use celebration templates.
   - `storage.buckets`: Public `wish-photos` bucket for photo uploads.

---

## 🌐 Deployment Guide

### Deploying to Vercel (Recommended)
1. Push this repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select the repository and set the root directory to `wishcraft-ai` (if in a monorepo).
4. Add the environment variables from your `.env` file in the Vercel Dashboard (**Settings** -> **Environment Variables**):
   - `GEMINI_API_KEY`
   - `RESEND_API_KEY`
   - `BASE_URL` (set to your Vercel URL, e.g. `https://wishcraft-ai.vercel.app`)
   - `ADMIN_SECRET_KEY`
5. Click **Deploy**. Vercel will automatically read [`vercel.json`](./vercel.json) and serve both the static frontend and serverless API endpoints.

---

## 📁 Project Architecture

```
wishcraft-ai/
├── package.json               # Node project configuration & test runner
├── vercel.json                # Vercel deployment configuration
├── .env.example               # Environment variable specification
├── supabase_schema.sql        # Supabase PostgreSQL tables, RLS policies & buckets
├── README.md                  # Complete documentation
├── server.js                  # Ultra-fast production HTTP server with Open Graph injection
├── api/
│   ├── gemini.js              # Google Gemini API client & intelligent fallback generator
│   ├── generate-message.js    # AI message generation route handler & rate limiter
│   ├── generate-image.js      # Visual presets & sticker generator
│   ├── wishes.js              # Wishes CRUD & candle blow-out logic
│   ├── email.js               # Resend / Brevo email dispatcher
│   ├── sms.js                 # SMS deep link & Twilio sender
│   └── admin.js               # Admin analytics & content moderation
├── data/
│   ├── db.js                  # Universal database layer (atomic JSON + Supabase ready)
│   ├── wishes.json            # Persistent greetings database
│   └── templates.json         # Curated trending celebration templates
├── public/
│   ├── index.html             # Modern Landing Page (Hero, Shelves, How it Works)
│   ├── create.html            # 6-Step Wish Creation Studio
│   ├── wish.html              # Interactive Greeting Webpage (Cake, Candles, Wax Seal)
│   ├── dashboard.html         # User Dashboard (My Wishes, View Analytics)
│   ├── admin.html             # Admin Center (KPIs, Moderation, Logs)
│   ├── css/
│   │   └── styles.css         # Custom animations, cake perspective, wax seals, polaroids
│   └── js/
│       ├── app.js             # Toasts, AuthManager, AmbientParticles engine, confetti burst
│       ├── creator.js         # Multi-step creator logic & AI message customization
│       ├── greeting.js        # Candle blow-out, love letter unfolding, audio sync
│       ├── audio.js           # Royalty-free Web Audio API music synthesizer
│       ├── share.js           # WhatsApp, Email, SMS, Web Share & Clipboard handlers
│       ├── dashboard.js       # User dashboard controller
│       └── admin.js           # Admin portal controller
└── tests/
    ├── test_api.js            # 10 integration tests for API handlers & DB
    └── test_ai.js             # 4 tests for AI prompt construction & multi-language
```

---

## 🛡️ Security & Performance

- **Zero-Secret Client Exposure**: API keys (`GEMINI_API_KEY`, `RESEND_API_KEY`, `ADMIN_SECRET_KEY`) reside exclusively in backend environment variables.
- **Input Sanitization**: User inputs are HTML-entity encoded to protect against XSS injections.
- **Rate Limiting**: AI generation endpoints enforce an in-memory window to guard against spam and quota exhaustion.
- **Open Graph Metadata**: Fully dynamic per-greeting social previews so links unfurl attractively across WhatsApp, iMessage, Slack, and Facebook.
- **Resilient Audio**: Royalty-free client-side Web Audio API synthesizer guarantees music playback on all devices without external CDN audio failures or licensing restrictions.

---

## 📄 License
This project is licensed under the MIT License.
