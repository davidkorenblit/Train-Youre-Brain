// ============================================================================
// CodeReview Arena - Supabase Database Client Helper
// Creates an edge-compatible Supabase client for Cloudflare Workers
// ============================================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Bindings } from "../types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a standard UUID.
 */
export function isValidUuid(id?: string | null): boolean {
  return typeof id === "string" && UUID_REGEX.test(id);
}

/**
 * Returns a lightweight, stateless Supabase client scoped to the current Worker request.
 */
export function getSupabase(env: Bindings): SupabaseClient {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are not configured in environment bindings");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Unified helper to find an active challenge by either UUID or human-readable slug.
 * Eliminates duplicate query logic across challenge routes.
 */
export async function findChallengeByIdOrSlug<T = any>(
  supabase: SupabaseClient,
  identifier: string,
  selectFields: string
): Promise<{ challenge: T | null; error: any }> {
  const query = supabase
    .from("challenges")
    .select(selectFields as any)
    .eq("is_active", true);

  if (isValidUuid(identifier)) {
    query.eq("id", identifier);
  } else {
    query.eq("slug", identifier);
  }

  const { data, error } = await query.single();
  return { challenge: (data as unknown) as T, error };
}
