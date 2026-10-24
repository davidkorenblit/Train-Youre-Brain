# 🧠 CodeReview Arena (Train-Youre-Brain)

> **סימולטור מתקדם לאימון מפתחים בקריאת קוד וביצוע Code Review מקצועי (GitHub PR-style), עם הערכה מיידית מבוססת AI.**
> 
> *An interactive developer training simulator for reading code and conducting professional PR reviews with instant, AI-powered evaluation.*

---

## 🎯 Overview & Purpose

**CodeReview Arena** turns the critical engineering skill of code review into a gamified, hands-on training ground. Instead of writing code from scratch, developers inspect realistic pull requests, hunt for hidden logic bugs, race conditions, and security flaws, leave line-by-line inline comments, and receive rigorous automated scoring and feedback from an AI Judge.

- 🌐 **Live Frontend:** [https://davidkorenblit.github.io/Train-Youre-Brain/](https://davidkorenblit.github.io/Train-Youre-Brain/)
- ⚡ **Live Edge API:** `https://train-youre-brain.dycoren18.workers.dev`

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────┐
│     React 18 + Vite Frontend    │ (Monaco Editor, GitHub PR UI)
└───────────────┬─────────────────┘
                │ HTTPS (Sub-2s roundtrip)
                ▼
┌─────────────────────────────────┐
│  Cloudflare Workers (Edge API)  │ (Hono + TypeScript, Rate-Limiting)
└───────┬─────────────────┬───────┘
        │                 │
        ▼                 ▼
┌──────────────┐   ┌──────────────┐
│   Supabase   │   │  Gemini LLM  │
│ (PostgreSQL) │   │  (AI Judge)  │
└──────────────┘   └──────────────┘
```

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Edge Backend** | **Cloudflare Workers** + **Hono** (TypeScript) | Serverless global API running on the edge with near-zero latency and zero cold starts. |
| **Cloud Database** | **Supabase (PostgreSQL Cloud)** | Stores 35 curated multi-level challenges, reference golden bugs, and submission history. |
| **AI Evaluation Engine** | **Google Gemini 3.5 Flash Lite** | Evaluates user review findings against golden bugs with structured JSON outputs. |
| **Frontend** | **React 18**, **Vite**, **TypeScript** | Interactive web client featuring **Monaco Editor** for line-by-line review comments. |

---

## 🛡️ Security & AI Defense-in-Depth

The AI Judge engine incorporates a multi-tier defense architecture to protect against prompt injection, jailbreaking, and score manipulation:

1. **System Instruction Separation:** System evaluation criteria and golden bug references are strictly confined to `systemInstruction`.
2. **Dynamic Nonce Sandboxing:** User submissions are encapsulated within cryptographically random UUID delimiters (`<<<USER_DATA_${crypto.randomUUID()}>>>`).
3. **Backend Sanitization & Validation:** Strict character limits (up to 350 chars), line number boundary verification, and regex detection of override patterns.
4. **Structured JSON Output:** Forced JSON Schema contract via Gemini's `responseSchema`.
5. **Post-Processing Sanity Check:** Server-side score reconciliation and anomaly rejection before saving to the database.
6. **Edge Rate Limiting:** Custom sliding-window middleware (15 submissions per 5 minutes per IP).

---

## 📚 Curriculum & Challenge Levels

The platform features 35 curated challenges split across three progressive levels:

- 🟢 **Level 1: Fundamentals (15 Challenges):** Logic pitfalls, edge-case bugs, array bounds, off-by-one errors, recursion traps.
- 🟡 **Level 2: Software Engineering (10 Challenges):** OOP patterns, state leaks, resource leaks, interface contract violations, concurrency basics.
- 🔴 **Level 3: Real-World Backend (10 Challenges):** Production security (SQLi, IDOR, SSRF), race conditions, transaction rollbacks, rate-limiting bypasses.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- Cloudflare Wrangler CLI (`npm i -g wrangler`)
- Supabase account & Google Gemini API Key

### Backend Setup
```bash
cd backend
npm install
# Set up .env or Cloudflare Worker secrets:
# GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
npm run dev        # Local edge runtime simulation
npm run deploy     # Deploy to Cloudflare Workers
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev        # Run Vite dev server locally
npm run build      # Build production bundle
```

---

## 📄 License
MIT License.
