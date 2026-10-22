// ============================================================================
// CodeReview Arena - Backend API Main Entry Point (Cloudflare Workers)
// Root configuration: routing, CORS, rate limiting, and integration health
// ============================================================================

import { Hono } from "hono";
import { cors } from "hono/cors";
import { Bindings } from "./types";
import { getSupabase } from "./db/client";
import { rateLimiter } from "./middleware/rate_limiter";
import challengesRouter from "./routes/challenges";
import submissionsRouter from "./routes/submissions";

const app = new Hono<{ Bindings: Bindings }>();

// 1. Enable Cross-Origin Resource Sharing (CORS) for frontend on GitHub Pages
app.use("*", cors());

// 2. Health check and discovery endpoints
app.get("/", (c) => {
  return c.json({
    app: "CodeReview Arena API",
    status: "online",
    platform: "Cloudflare Workers",
    version: "1.0.0",
    docs: {
      challenges: "GET /api/challenges",
      challenge_by_id: "GET /api/challenges/:id",
      submit_review: "POST /api/challenges/:id/submit",
      submission_by_id: "GET /api/submissions/:id",
    },
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// 3. Rate limiter middleware: protects AI submission endpoint from abuse (15 submissions / 5 min per IP)
app.use("/api/challenges/:id/submit", rateLimiter({ windowMs: 5 * 60 * 1000, max: 15 }));

// 4. Mount primary route modules
app.route("/api/challenges", challengesRouter);
app.route("/challenges", challengesRouter); // Backwards compatibility
app.route("/api/submissions", submissionsRouter);

// 5. Full 4-way integration test endpoint (Frontend -> Worker -> Supabase -> Gemini)
app.get("/api/test-integration", async (c) => {
  const startTime = Date.now();
  const geminiKey = c.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return c.json({ error: "GEMINI_API_KEY is missing in Cloudflare environment" }, 500);
  }

  // Step A: Verify database connection and fetch sample challenge
  let sampledChallenge = null;
  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("challenges")
      .select("id, title, slug, level")
      .limit(1)
      .single();

    if (error) throw new Error(`Supabase error: ${error.message}`);
    sampledChallenge = data;
  } catch (err: any) {
    return c.json({ error: `Database check failed: ${err.message}` }, 500);
  }

  // Step B: Verify Gemini AI model connectivity
  let geminiMessage = "";
  try {
    const prompt = `אתה שופט ביקורת קוד ב-CodeReview Arena. תן משפט עידוד אחד קצר (עד 7 מילים) בעברית למתכנת שמתחיל לסקור את האתגר "${sampledChallenge?.title}".`;
    const model = c.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 60, temperature: 0.7 },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API HTTP ${geminiRes.status}: ${errText}`);
    }

    const geminiData: any = await geminiRes.json();
    geminiMessage =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "בהצלחה בסקירת הקוד!";
  } catch (err: any) {
    return c.json({ error: `Gemini AI check failed: ${err.message}` }, 500);
  }

  const durationMs = Date.now() - startTime;

  return c.json({
    success: true,
    totalLatencyMs: durationMs,
    services: {
      frontend: "Connected (GitHub Pages)",
      worker: "Active (Cloudflare Workers)",
      database: {
        status: "Connected (Supabase)",
        sample: `${sampledChallenge?.title} (Level ${sampledChallenge?.level})`,
      },
      ai: {
        status: "Active (Gemini)",
        response: geminiMessage,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export default app;
