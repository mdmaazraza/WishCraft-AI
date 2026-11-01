# 🪄 Wish Yours — Master Agent Orientation & Workflow Protocol

> **Project Root**: `C:\Users\mdmaa\OneDrive\Desktop\AntigravityDev\WishCraft-AI`  
> **Status**: Production-ready, fully tested, Render-ready.

---

## 🎯 Project Overview & Mission
Wish Yours is a personalized digital celebration and greeting platform powered by Google Gemini AI. Users generate bespoke interactive celebration webpages (with interactive 3D birthday cakes with candle blow-out, vintage wax-sealed love envelopes, polaroid reels, and royalty-free Web Audio music) and share them via WhatsApp, Email, and SMS.

---

## ⚠️ Isolation & Workspace Safety Rules
1. **Strict Directory Isolation**:
   - ALL WishCraft AI code, documentation, tests, and configuration MUST reside inside `C:\Users\mdmaa\OneDrive\Desktop\AntigravityDev\WishCraft-AI`.
   - **NEVER** modify or touch `../buildwithgemini-tricoach-fitness-agent/`, its git repository, its databases (`workouts.db`), or its Render services.
2. **Accidental Modification Protocol**:
   - If any file outside `WishCraft-AI` is accidentally touched, immediately stop, report it, and revert the change using git.

---

## 📦 Git & Version Control Protocol
1. **Independent Git Repository**:
   - `WishCraft-AI/` has its own isolated `.git/` initialized.
   - Maintain clean branches and meaningful commit messages (e.g. `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`).
   - Push to remote ONLY when explicitly authorized by the user with their provided GitHub repository URL.
2. **Never commit secrets**:
   - `.env` is strictly git-ignored.
   - Commit only `.env.example`.

---

## 🚀 Deployment (Render & Vercel)
- **Render**: Configured via `render.yaml` (free Node.js web service running `node server.js`). Reads `$PORT` dynamically.
- **Vercel**: Configured via `vercel.json`.
- **Database**: Dual storage engine (`data/db.js`) supporting atomic persistent JSON out of the box and Supabase PostgreSQL via `supabase_schema.sql`.

---

## 🧪 Testing Protocol
Always verify code changes by running:
```bash
node tests/test_api.js
node tests/test_ai.js
```
All 14 tests must pass with zero failures before committing.
