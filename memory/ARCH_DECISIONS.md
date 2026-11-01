# Wish Yours — Architecture Decision Records (ADRs)

---

### ADR 001: Zero-Dependency Native Node.js Server
- **Context**: The server must run anywhere (Render, Vercel, Docker, local machines) with maximum speed, zero npm dependency vulnerabilities, and minimal attack surface.
- **Decision**: Built a native HTTP server in `server.js` using Node's standard modules (`http`, `crypto`, `fs`, `path`, `url`).
- **Consequences**: Instant startup (< 50ms), zero dependency maintenance overhead, compatible with Node 18+.

---

### ADR 002: Client-Side Web Audio API Synthesizer
- **Context**: Playing background music often fails due to broken external audio CDN links, browser autoplay blocking, or copyright claims on famous songs.
- **Decision**: Synthesize music notes procedurally using `window.AudioContext` in `public/js/audio.js` for "Happy Birthday", romantic chords, and celebration fanfares.
- **Consequences**: 100% royalty-free, zero network requests for audio files, instant playback on iOS and Android.

---

### ADR 003: Dynamic Open Graph Social Tag Injection
- **Context**: Shared links on WhatsApp, iMessage, and Facebook need to show the recipient's name and personal greeting in the preview card before clicking.
- **Decision**: `server.js` intercepts `/wish/:slug`, reads the greeting from the database, and injects customized `<meta property="og:title">`, `<meta property="og:description">`, and `<meta property="og:image">` tags into the HTML stream.
- **Consequences**: Rich link previews appear in chat apps without requiring heavy Next.js SSR infrastructure.

---

### ADR 004: Dual-Mode Database Storage Layer
- **Context**: Development should work immediately without mandatory external account creation, yet production needs PostgreSQL scale and Row Level Security.
- **Decision**: `data/db.js` provides atomic reads/writes to `data/wishes.json` locally, and provides `supabase_schema.sql` for production Supabase migrations.
- **Consequences**: Zero friction for local testing; cloud ready whenever user inputs Supabase credentials.

---

### ADR 005: Multi-Language AI Prompts with Rule-Based Fallback
- **Context**: Greetings should support English, Hindi (हिंदी), and conversational Hinglish. If Gemini API quotas expire or the key is not configured, the app must not crash.
- **Decision**: Implemented `api/gemini.js` with language directives for Gemini, backed by an intelligent template synthesizer that generates 3 personalized variations offline.
- **Consequences**: 100% uptime and resilience.
