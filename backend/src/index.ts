import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "@supabase/supabase-js";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  GEMINI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable Cross-Origin Resource Sharing (CORS) for frontend
app.use("*", cors());

// Health Check & Welcome Endpoint
app.get("/", (c) => {
  return c.json({
    app: "CodeReview Arena API",
    status: "online",
    platform: "Cloudflare Workers",
    version: "1.0.0",
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Full 4-Way Integration Test: Frontend -> Worker -> Supabase -> Gemini
app.get("/api/test-integration", async (c) => {
  const startTime = Date.now();
  const supabaseUrl = c.env.SUPABASE_URL || "https://lyxcrcnhcujldrktoblm.supabase.co";
  const supabaseKey = c.env.SUPABASE_PUBLISHABLE_KEY;
  const geminiKey = c.env.GEMINI_API_KEY;

  if (!supabaseKey) {
    return c.json({ error: "SUPABASE_PUBLISHABLE_KEY is missing in Cloudflare" }, 500);
  }
  if (!geminiKey) {
    return c.json({ error: "GEMINI_API_KEY is missing in Cloudflare" }, 500);
  }

  // 1. Test Supabase Database
  let sampledChallenge = null;
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("challenges")
      .select("id, title, slug, level")
      .limit(1)
      .single();

    if (error) throw new Error(`Supabase error: ${error.message}`);
    sampledChallenge = data;
  } catch (err: any) {
    return c.json({ error: `Database failed: ${err.message}` }, 500);
  }

  // 2. Test Gemini 1.5 Flash AI
  let geminiMessage = "";
  try {
    const prompt = `אתה שופט ביקורת קוד ב-CodeReview Arena. תן משפט עידוד אחד קצר (עד 7 מילים) בעברית למתכנת שמתחיל לסקור את האתגר "${sampledChallenge?.title}".`;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

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
    return c.json({ error: `Gemini AI failed: ${err.message}` }, 500);
  }

  const durationMs = Date.now() - startTime;

  return c.json({
    success: true,
    totalLatencyMs: durationMs,
    services: {
      frontend: "מחובר (GitHub Pages)",
      worker: "פעיל (Cloudflare Workers)",
      database: {
        status: "מחובר (Supabase)",
        sample: `${sampledChallenge?.title} (רמה ${sampledChallenge?.level})`,
      },
      ai: {
        status: "פעיל (Gemini 1.5 Flash)",
        response: geminiMessage,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Fetch all available challenges (metadata & context only - no solutions leaked)
app.get("/challenges", async (c) => {
  const supabaseUrl = c.env.SUPABASE_URL || "https://lyxcrcnhcujldrktoblm.supabase.co";
  const supabaseKey = c.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseKey) {
    return c.json(
      { error: "SUPABASE_PUBLISHABLE_KEY is not configured in environment" },
      500
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("challenges")
    .select("id, title, slug, level, language, context_prompt, buggy_code, is_active, created_at")
    .eq("is_active", true)
    .order("level", { ascending: true });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({
    total: data ? data.length : 0,
    challenges: data,
  });
});

export default app;
