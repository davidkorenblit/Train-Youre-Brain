// ============================================================================
// CodeReview Arena - Supabase Client for Frontend (Browser)
// ============================================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://lyxcrcnhcujldrktoblm.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_ANON_KEY) {
  console.info(
    "CodeReview Arena: VITE_SUPABASE_ANON_KEY is not defined. Set it in .env for GitHub OAuth."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
