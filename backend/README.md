# ⚡ CodeReview Arena - Backend

Edge-serverless API powering the CodeReview Arena simulator, built on **Cloudflare Workers**, **Hono**, and **TypeScript**.

---

## 🛠️ Tech Stack & Services

- **Runtime:** Cloudflare Workers (V8 isolates at edge, zero cold starts)
- **Framework:** [Hono](https://hono.dev/) (Lightweight, typed edge web framework)
- **Database:** Supabase (PostgreSQL Cloud)
- **AI Engine:** Google Gemini 3.5 Flash Lite with Structured Output
- **Language:** TypeScript 5.6+

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── db/              # Supabase database client & connection helpers
│   ├── middleware/      # Edge rate limiting & security middlewares
│   ├── routes/          # Hono route handlers (/challenges, /submissions)
│   ├── services/        # AI Judge evaluation engine with defense-in-depth
│   ├── types/           # Core API & database TypeScript contracts
│   └── index.ts         # Main entry point & route registration
├── wrangler.toml        # Cloudflare Workers configuration
└── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check & uptime status |
| `GET` | `/api/challenges` | Retrieve all 35 challenges (solutions sanitized) |
| `GET` | `/api/challenges/:id` | Fetch specific challenge by ID or slug with buggy code |
| `POST` | `/api/challenges/:id/submit` | Submit review findings, invoke AI evaluation, return score |
| `GET` | `/api/submissions/:id` | Fetch past review evaluation report by UUID |

---

## 🛡️ Key Features & AI Security

- **Prompt Injection Defense:** Multi-layered protection using dynamic cryptographic nonces, system prompt isolation, and regex anomaly filtering.
- **Strict JSON Contracts:** Direct enforcement of schema models for Gemini evaluations.
- **Edge Rate Limiter:** Protects AI quotas and database resources on a per-IP basis.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run local development with Wrangler
npm run dev

# Deploy to Cloudflare Workers
npm run deploy
```
