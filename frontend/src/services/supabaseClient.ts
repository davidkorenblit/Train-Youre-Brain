// ============================================================================
// CodeReview Arena - Supabase Client for Frontend (Browser)
// Explicit Logging: Never silences configuration errors
// ============================================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isAuthAvailable = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isAuthAvailable) {
  console.warn(
    "[CodeReview Arena] ⚠️ Auth is disabled: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from environment.\n" +
    "To enable GitHub OAuth in production, define these secrets in GitHub Repo Settings -> Secrets -> Actions."
  );
} else {
  console.info("[CodeReview Arena] ✅ Supabase Auth client initialized successfully.");
}

export const supabase: SupabaseClient | null = isAuthAvailable
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
