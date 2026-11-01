# Wish Yours — Project Context & Architectural Specification

> **Platform**: Wish Yours (formerly WishCraft AI)  
> **Repository**: [https://github.com/mdmaazraza/WishCraft-AI](https://github.com/mdmaazraza/WishCraft-AI)  
> **Deployment Target**: Render (`render.yaml` Blueprint)  
> **Local Path**: `C:\Users\mdmaa\OneDrive\Desktop\AntigravityDev\WishCraft-AI`  
> **Last Updated**: November 1, 2026  

---

## 1. Project Overview & Core Mission

**Wish Yours** is a full-stack, responsive digital greeting and celebration platform. Users can create, customize, and share interactive, emotionally resonant digital celebration experiences for birthdays, anniversaries, friendships, Valentine's Day, and other milestones.

### Key Value Proposition
- **Multi-Step Studio**: Step-by-step greeting wizard with occasion selection, relationship context, personal memories, tone tuning, visual theme selection, and typography selection.
- **AI-Powered Synthesis**: Deep integration with Google Gemini 1.5 Flash generates 3 personalized, emotional message variations in English, Hindi, and Hinglish.
- **Interactive Greeting Webpages (`/wish/:slug`)**:
  - **Birthday**: Interactive cake with blowable candles, audio whoosh, and confetti bursts.
  - **Anniversary / Romantic**: Wax-sealed love letter envelope with realistic breaking seal animation and unfolding letter.
  - **Friendship / Milestones**: Dynamic achievement badges, shared memory highlights, and polaroid photo reels.
  - **Custom Typography**: Selected font rendered consistently across headers, messages, envelopes, and emails.
  - **Audio Player**: Web Audio API ambient soundtrack with user-controlled playback and mute controls.
- **Multi-Channel Sharing**:
  - Direct WhatsApp deep-link generation.
  - Native SMS URI dispatch.
  - Native Web Share API integration.
  - Transactional HTML email delivery via Resend API.

---

## 2. Technical Stack & Architecture

Wish Yours is built with a high-performance, zero-bloat philosophy:

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18 - v24+) | Native ES features, ubiquitous support on Render |
| **Server** | Pure Native Node.js (`http`, `https`, `crypto`, `fs`) | **Zero external npm dependencies** for blazing fast build times and zero security vulnerabilities |
| **Frontend UI** | HTML5, Tailwind CSS (CDN), Custom CSS (`styles.css`) | Glassmorphism, CSS keyframe micro-animations, mobile-first responsive layout |
| **Fonts & Typography** | Google Fonts (`Playfair Display`, `Dancing Script`, `Great Vibes`, `Outfit`, `Pacifico`, `Cinzel`) | Preconnected CDNs, CSS fallback stacks, dynamic DOM binding |
| **Interactive Canvas** | HTML5 Canvas Particle Engine | Hardware-accelerated floating hearts, stars, balloons, and confetti |
| **Audio** | HTML5 Web Audio API (`public/js/audio.js`) | Synthesized melodies, candle blow whoosh, and background celebration loops |
| **Email Service** | Resend API (Primary) / Brevo (Fallback) / Local Simulator | Native HTTPS REST dispatch, sender sanitization, sandbox diagnostics |
| **AI Generation** | Google Gemini 1.5 Flash (`api/gemini.js`) | Contextual prompt weaving memories and relationship nuances |
| **Data Persistence** | Atomic JSON Storage (`data/db.js`) | Supabase-compatible data schema, local development without external DB dependencies |

---

## 3. Unified Typography System

### Curated Font Catalog
| Font Name | Category | Ideal Occasion / Mood | CSS Utility Class | Fallback Font Stack |
| :--- | :--- | :--- | :--- | :--- |
| **Playfair Display** | Classic Serif | Elegant Anniversaries, Formal Wishes | `.font-playfair` | `'Playfair Display', Georgia, 'Times New Roman', serif` |
| **Dancing Script** | Calligraphy | Heart-touching, Birthdays, Romantic | `.font-dancing` | `'Dancing Script', 'Brush Script MT', cursive` |
| **Great Vibes** | Romantic Cursive | Love Letters, Valentine's, Weddings | `.font-great-vibes` | `'Great Vibes', 'Brush Script MT', cursive` |
| **Outfit** | Modern Sans | Friendships, Casual, Youthful Celebrations | `.font-outfit` | `'Outfit', -apple-system, BlinkMacSystemFont, sans-serif` |
| **Pacifico** | Playful Brush | Funny, Comic, Whimsical Wishes | `.font-pacifico` | `'Pacifico', 'Comic Sans MS', cursive` |
| **Cinzel** | Royal Roman | Luxury Milestones, Grand Anniversaries | `.font-cinzel` | `'Cinzel', Georgia, 'Times New Roman', serif` |

### Font Lifecycle Pipeline
1. **Selection (`public/create.html` & `public/js/creator.js`)**:
   - Visual cards in Step 4 allow users to choose their font.
   - Live font dropdown in Step 6 allows real-time preview on the editable message textarea.
2. **Backend Persistence (`api/wishes.js` & `data/db.js`)**:
   - `sanitizeFontFamily()` validates inputs against the whitelist and prevents XSS.
   - Saved in wish record as `font_family`.
3. **Public Celebration Page (`public/wish.html` & `public/js/greeting.js`)**:
   - Dynamic class binding applies the selected font to `#greetingMessageBody`, `#personalMemoryText`, and unfolded envelope letters.
4. **HTML Email Template (`api/email.js`)**:
   - Embedded Google Fonts stylesheet and inline CSS font stacks ensure email clients that support webfonts render the selected typography.

---

## 4. Email Delivery Architecture (Resend)

### Critical Resend Requirements
1. **Shared Test Domain Sender**:
   - When using Resend's free shared domain, the `from` email **must strictly be**:  
     `Wish Yours <onboarding@resend.dev>`
   - Any custom username (such as `wishes@resend.dev`) causes Resend to reject the request with `HTTP 403 Forbidden`.
   - `api/email.js` includes `getValidResendSender()` which automatically normalizes any invalid `resend.dev` addresses to `onboarding@resend.dev`.
2. **Free Sandbox Recipient Restriction**:
   - On the Resend free tier (without a verified custom domain), **Resend strictly allows sending to the email address registered with that Resend account**.
   - Attempting to send to an arbitrary third-party email returns `HTTP 403: You can only send testing emails to your own email address`.
   - To send to external recipients in production, a custom domain must be verified at [https://resend.com/domains](https://resend.com/domains).
3. **Environment Security**:
   - `RESEND_API_KEY` is loaded securely on the server via `server.js` and `api/email.js`.
   - Keys are **never exposed to the frontend client**.
   - Server-side audit logs mask recipient emails (e.g. `e***n@example.com`) to protect user privacy.
4. **Resilient Fallback Mode**:
   - When `RESEND_API_KEY` is absent in local development, `api/email.js` executes in simulation mode, generating full preview payloads so the UI and testing workflows remain completely functional.

---

## 5. File & Directory Layout

```
WishCraft-AI/
├── api/
│   ├── admin.js             # Admin analytics and moderation handlers
│   ├── auth.js              # User session and authentication handlers
│   ├── email.js             # Resend & Brevo native HTTPS delivery service
│   ├── gemini.js            # Google Gemini 1.5 Flash AI synthesis
│   ├── generate-message.js  # Multi-language variation generator endpoint
│   ├── scheduled.js         # Scheduled wishes CRUD & cron trigger handlers
│   ├── sms.js               # SMS deep-link generator
│   ├── wishes.js            # Wish CRUD, sanitization, and candle persistence
│   └── providers/
│       ├── email_provider.js # Resend automated email delivery with template styling
│       ├── sms_provider.js   # Twilio, Fast2SMS & simulated SMS abstraction
│       └── voice_provider.js # Twilio Voice / TwiML AI spoken call abstraction
├── data/
│   ├── db.js                # Atomic JSON database manager (wishes & scheduled wishes)
│   ├── email_logs.json      # Audit trail for email deliveries
│   ├── scheduled_wishes.json# Persistent store for scheduled deliveries
│   ├── supabase_schema.sql  # Supabase PostgreSQL schema with RLS policies
│   ├── users.json           # User database
│   └── wishes.json          # Wishes and greeting records
├── docs/
│   ├── DEPLOYMENT_GUIDE.md  # Render deployment & environment variable instructions
│   ├── DEVELOPMENT_LOG.md   # Chronological log of fixes and enhancements
│   ├── NEXT_STEPS.md        # Deployment and domain verification guide
│   ├── PROJECT_CONTEXT.md   # Architecture, data flows, and specifications
│   ├── SETUP_GUIDE.md       # Local installation and configuration guide
│   ├── SMS_VOICE_RESEARCH.md# TRAI DLT regulations & Indian telecom evaluation
│   └── TESTING_GUIDE.md     # Verification procedures and test runner docs
├── public/
│   ├── admin.html           # Admin dashboard
│   ├── create.html          # 6-step Wish Studio with Schedule Modal & Live Preview
│   ├── dashboard.html       # User dashboard with Celebrations & Scheduled Wishes tabs
│   ├── index.html           # Homepage & landing showcase
│   ├── login.html           # Authentication portal
│   ├── wish.html            # Interactive recipient celebration webpage
│   ├── css/
│   │   └── styles.css       # Unified stylesheet, dark inputs, font classes & animations
│   └── js/
│       ├── app.js           # Core UI helpers, toasts, particles & confetti
│       ├── audio.js         # Web Audio API sound effects and music
│       ├── creator.js       # Studio wizard, live preview & scheduling controller
│       ├── dashboard.js     # Multi-tab dashboard controller (reschedule/cancel/delete)
│       ├── greeting.js      # Interactive candle, envelope & font renderer
│       └── share.js         # WhatsApp, SMS, Web Share & email dispatch
├── scheduler/
│   └── engine.js            # In-process idempotent background scheduler & atomic lock
├── tests/
│   ├── test_ai.js           # AI prompt synthesis test suite
│   ├── test_api.js          # API, typography & database test suite (15 tests)
│   ├── test_flow.js         # End-to-end creation to rendering verification test
│   ├── test_resend_live.js  # Live Resend diagnostic and connectivity tool
│   └── test_scheduler.js    # Comprehensive scheduled wishes test suite (13 tests)
├── .env                     # Local environment variables
├── .env.example             # Environment template with documented requirements
├── package.json             # Project metadata and npm scripts
├── render.yaml              # Render blueprint deployment specification
└── server.js                # Zero-dependency native Node.js HTTP server & router
```

---

## 6. Scheduled Wishes Architecture & Render Deployment

### A. Lifecycle of a Scheduled Wish
1. **Creation**:
   - In `public/create.html` (Step 6) or on `/wish/:slug`, user clicks **"⏰ Schedule for Later"**.
   - Client automatically detects user's local timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone`.
   - User selects delivery channel (Email 💌, SMS 📱, Voice Call 📞), date, and time.
   - Form renders a live confirmation preview banner:  
     `"Your Birthday wish for Priya will be sent via Email on 15 March 2026 at 09:00 AM IST"`
   - Submits `POST /api/scheduled-wishes` with date converted to UTC ISO (`scheduled_at`).
2. **Persistence & Idempotency Locking**:
   - Saved with status `'scheduled'` and attempts count `0`.
   - `scheduler/engine.js` runs every 30 seconds while the Node.js server is active.
   - For every due wish (`scheduled_at <= now` and status `scheduled`), `engine.js` performs an **atomic lock**:
     - Transitions status to `'processing'` and increments `attempts`.
     - Concurrent ticks or external cron triggers cannot claim the same record.
3. **Dispatch & Provider Resolution**:
   - **Email**: Dispatches beautiful HTML email via Resend (`api/providers/email_provider.js`).
   - **SMS**: Dispatches via Twilio or Fast2SMS if configured, or simulates safely if in development.
   - **Voice Call**: Initiates outbound call with TwiML spoken greeting if Twilio Voice is configured.
   - On success: transitions to `'sent'`, records `provider_response`.
   - On failure: increments attempts; if retries < 3, backs off by 2 minutes; otherwise marks `'failed'`.

### B. Render Free Web Service Limitations & Zero-Cost Solution
- **The Challenge**: Render's free tier web services spin down after 15 minutes of inactivity (sleep mode). An internal `setInterval` timer would pause while the instance is sleeping.
- **The Solution**: Dual-Mode Hybrid Scheduling:
  1. **Internal Engine (`scheduler/engine.js`)**: Runs whenever the server is awake, processing due wishes every 30 seconds.
  2. **External Cron Webhook (`GET /api/cron/process-scheduled`)**:
     - Secured with `x-cron-key` header (backed by `CRON_SECRET_KEY` in Render environment).
     - Allows free cron providers (such as [cron-job.org](https://cron-job.org) or GitHub Actions scheduled workflows) to ping `/api/cron/process-scheduled` every 5-10 minutes.
     - Pinging this endpoint wakes the Render free service and triggers immediate batch processing of all due wishes with zero server cost!

---

## 7. Occasion Emotion Intelligence & Text Grammar Polish Engine

### A. Occasion-Emotion Categorization
The platform organizes all greeting experiences into emotional categories, each enforcing dedicated styling, tone guidance, forbidden vocabulary, audio tracks, and interactive modules:

| Occasion | Category | Is Celebration? | Visual Module | Ambient Particles | Music Track | Tone Guidance |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Birthday** | `celebration` | Yes | Cake with Candles | Balloons | Birthday Celebration | Joyful milestone, excitement, health & happiness |
| **Anniversary** | `romantic` | Yes | Wax Love Letter | Hearts | Romantic Melody | Devotion, shared journey, eternal commitment |
| **Valentine's** | `romantic` | Yes | Wax Love Letter | Hearts | Romantic Melody | Passionate affection, intimate romance |
| **Friendship** | `celebration` | Yes | Friendship Card | Confetti | Upbeat Melody | Loyalty, inside jokes, shared adventures |
| **Congratulations** | `achievement` | Yes | Achievement Card | Stars | Triumphant Melody | Pride, cheering success, recognition |
| **Thank You** | `gratitude` | No | Sincere Letter | Petals | Peaceful Melody | Profound appreciation, acknowledging kindness |
| **Sorry** | `apology` | No | Sincere Letter | Calm Droplets | Peaceful Melody | Sincere remorse, accountability, rebuilding trust |
| **Farewell** | `nostalgia` | No | Sincere Letter | Calm Stars | Peaceful Melody | Bittersweet memories, wishing best on next journey |
| **Sympathy** | `sympathy` | No | Sincere Letter | Calm Droplets | Peaceful Melody | Comfort, quiet presence, gentle solace in grief |

### B. Negative Constraint Guard & Prompt Engineering
- Strict negative constraints (`forbiddenKeywords`) prevent inappropriate celebration terminology from ever surfacing on apologies or condolences (e.g. banning `"Let's celebrate your sorry"`, `"Happy Sorry"`, `"party"`, `"cake"`, or `"candles"`).
- Relationship nuances adapt tone:
  - **Sorry to Girlfriend**: Vulnerable, tender, emotionally intimate.
  - **Sorry to Colleague**: Dignified, professional, focused on workplace accountability and moving forward smoothly.
  - **Birthday to Best Friend**: Vibrant, playful, weaving inside jokes.
  - **Birthday to Colleague**: Warm, respectful, cheering career success.

### C. Text Grammar & Typo Polish Engine
- **Engine**: Rule-based dictionary + Gemini AI-assisted grammar engine (`data/text_cleaner.js`).
- **Core Principle**: Strictly cleans spelling errors, texting shorthands (`frnds` -> `friends`, `collage` -> `college`, `suport` -> `supported`), and broken syntax (`we was` -> `We were`), while **strictly preserving all user-entered facts, dates, names, locations, and personal memories**.
- **Interactive Studio UI**:
  - Step 3 (Personal Details) features a **"✨ Polish Grammar & Typos"** button.
  - Displays a side-by-side **Original vs Improved** comparison box allowing the user to preview changes and click **"Apply Improved Version ✓"** or keep their original text.
  - Step 6 (Final Message Editor) provides a **"✨ Polish Text"** tool for quick message refinement.
- **Form Readability Polyfill**:
  - Global `color-scheme: dark !important;` with `#0f172a` backgrounds and `#f8fafc` text.
  - Browser `-webkit-autofill` dark overrides.
  - Custom SVG arrow indicator and dark dropdown option styling for native `<select>`.
  - Date and time picker icon inversion filters for crisp contrast.


---

## 8. Developer Attribution & MD RAZA Sender Signature System

### A. Developer Attribution Architecture
- **Creator & Developer**: **MD RAZA**
- **Dedicated Profile Route**: `/developer` (served via `public/developer.html`)
- **Global Developer Credit Component**:
  - Reusable module: `public/js/attribution.js` and `data/attribution.js`
  - Format: `WishCraft AI • Developed by MD RAZA` with `MD RAZA` linking to `/developer`.
  - Mounted automatically across all public pages: Homepage, Creation Studio, Dashboard, Admin, and Greeting pages.
  - Subtle, accessible, and designed to never dominate or distract from the recipient's greeting experience.

### B. Special Relationship-Aware MD RAZA Sender Signatures
When a user creates a greeting and enters **MD RAZA** as the sender/from name:
1. **Normalization & Case-Insensitive Matching**:
   - Trims whitespace and normalizes case: `"MD RAZA"`, `"Md Raza"`, `"md raza"`, `"  MD RAZA  "`.
2. **Dynamic Relationship Signatures**:
   - Friend $\rightarrow$ `Your Friend, MD RAZA`
   - Best Friend $\rightarrow$ `Your Best Friend, MD RAZA`
   - Brother $\rightarrow$ `Your Brother, MD RAZA`
   - Colleague $\rightarrow$ `Your Colleague, MD RAZA`
   - Boyfriend $\rightarrow$ `Your Boyfriend, MD RAZA`
   - Husband $\rightarrow$ `Your Husband, MD RAZA`
   - Dynamic formula: `Your [Relationship], MD RAZA`.
3. **Strict Attribution Isolation**:
   - The special signature triggers **ONLY** when the sender is verified as MD RAZA.
   - For all other senders (e.g. Rahul, Priya, Alex), their raw names are preserved without modification.
4. **Gemini AI Hallucination Guard**:
   - Gemini prompts explicitly restrict sender attribution so that AI never hallucinates `MD RAZA` into greetings created by other individuals.
   - The application layer deterministically controls signature rendering across previews, wax-sealed letters, emails, and shared links.
