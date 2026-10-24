// ============================================================================
// CodeReview Arena - Supabase / GitHub Authentication Helper & Middleware
// Verifies Bearer JWTs and synchronizes user profiles with public.users
// ============================================================================

import { Context } from "hono";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { isValidUuid } from "../db/client";
import { encryptPii } from "../services/crypto";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
}

/**
 * Extracts and verifies the Supabase JWT token from the Authorization header.
 * Returns the authenticated user or null if no token / invalid token (optional auth).
 */
export async function getAuthenticatedUser(
  c: Context,
  supabase: SupabaseClient
): Promise<AuthenticatedUser | null> {
  const authHeader = c.req.header("Authorization") || c.req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return null;
    }

    const u: User = data.user;
    const metadata = u.user_metadata || {};
    const username =
      metadata.user_name ||
      metadata.preferred_username ||
      metadata.full_name ||
      (u.email ? u.email.split("@")[0] : "Developer");

    const avatarUrl = metadata.avatar_url || "";

    // Sync/Upsert user record into public.users table with maximum AES-256-GCM encryption
    if (isValidUuid(u.id)) {
      try {
        const encryptionSecret =
          (c.env as any)?.PII_ENCRYPTION_KEY ||
          (c.env as any)?.SUPABASE_SECRET_KEY ||
          (c.env as any)?.GEMINI_API_KEY;

        const encryptedUsername = await encryptPii(username, encryptionSecret);
        const encryptedEmail = await encryptPii(u.email || null, encryptionSecret);

        await supabase
          .from("users")
          .upsert(
            {
              id: u.id,
              email: encryptedEmail,
              username: encryptedUsername,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
      } catch (upsertErr: any) {
        console.warn("Non-fatal warning: failed to upsert encrypted user record:", upsertErr?.message);
      }
    }

    return {
      id: u.id,
      email: u.email,
      username,
      avatarUrl,
    };
  } catch (err: any) {
    console.warn("Non-fatal: Error during token verification:", err.message);
    return null;
  }
}
