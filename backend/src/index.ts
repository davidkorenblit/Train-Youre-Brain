import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "@supabase/supabase-js";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
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
