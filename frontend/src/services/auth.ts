// ============================================================================
// CodeReview Arena - GitHub Authentication Service
// Manages OAuth sign-in, token retrieval, and reactive session state
// ============================================================================

import { supabase, isAuthAvailable } from "./supabaseClient";
import { AuthUser } from "../types";
import { User } from "@supabase/supabase-js";

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    username:
      metadata.user_name ||
      metadata.preferred_username ||
      metadata.full_name ||
      (user.email ? user.email.split("@")[0] : "Developer"),
    avatar_url: metadata.avatar_url || metadata.picture,
  };
}

/**
 * Triggers GitHub OAuth sign-in with 1-click redirect
 */
export async function signInWithGithub(): Promise<void> {
  if (!supabase || !isAuthAvailable) {
    alert("אימות GitHub מצריך הגדרת משתני סביבה מתאימים.");
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  if (error) {
    throw error;
  }
}

/**
 * Signs the user out of their Supabase session
 */
export async function signOut(): Promise<void> {
  if (!supabase || !isAuthAvailable) return;
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Retrieves the current authenticated user, or null if unauthenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase || !isAuthAvailable) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return mapUser(user);
  } catch {
    return null;
  }
}

/**
 * Retrieves the active JWT access token to attach to API requests
 */
export async function getAuthToken(): Promise<string | null> {
  if (!supabase || !isAuthAvailable) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Listens for auth state changes (login, logout, token refresh)
 */
export function onAuthStateChange(
  callback: (user: AuthUser | null) => void
): () => void {
  if (!supabase || !isAuthAvailable) return () => {};
  try {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(mapUser(session?.user || null));
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  } catch {
    return () => {};
  }
}
