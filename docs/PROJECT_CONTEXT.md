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
│   ├── sms.js               # SMS deep-link generator
│   └── wishes.js            # Wish CRUD, sanitization, and candle persistence
├── data/
│   ├── db.js                # Atomic JSON database manager
│   ├── email_logs.json      # Audit trail for email deliveries
│   ├── users.json           # User database
│   └── wishes.json          # Wishes and greeting records
├── docs/
│   ├── DEVELOPMENT_LOG.md   # Chronological log of fixes and enhancements
│   ├── NEXT_STEPS.md        # Deployment and domain verification guide
│   ├── PROJECT_CONTEXT.md   # Architecture, data flows, and specifications
│   └── TESTING_GUIDE.md     # Verification procedures and test runner docs
├── public/
│   ├── admin.html           # Admin dashboard
│   ├── create.html          # 6-step Wish Creation Studio with typography selector
│   ├── dashboard.html       # User dashboard
│   ├── index.html           # Homepage & landing showcase
│   ├── login.html           # Authentication portal
│   ├── wish.html            # Interactive recipient celebration webpage
│   ├── css/
│   │   └── styles.css       # Unified stylesheet, font classes & animations
│   └── js/
│       ├── app.js           # Core UI helpers, toasts, particles & confetti
│       ├── audio.js         # Web Audio API sound effects and music
│       ├── creator.js       # Studio wizard & live typography preview controller
│       ├── greeting.js      # Interactive candle, envelope & font renderer
│       └── share.js         # WhatsApp, SMS, Web Share & email dispatch
├── tests/
│   ├── test_ai.js           # AI prompt synthesis test suite
│   ├── test_api.js          # API, typography & database test suite (15 tests)
│   └── test_resend_live.js  # Live Resend diagnostic and connectivity tool
├── .env                     # Local environment variables
├── .env.example             # Environment template with documented requirements
├── package.json             # Project metadata and npm scripts
├── render.yaml              # Render blueprint deployment specification
└── server.js                # Zero-dependency native Node.js HTTP server & router
```
