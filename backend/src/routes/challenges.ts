// ============================================================================
// CodeReview Arena - Challenges Routes
// Handles listing exercises, loading challenge details, and evaluating reviews
// ============================================================================

import { Hono } from "hono";
import { Bindings, SubmitReviewPayload } from "../types";
import { getSupabase, findChallengeByIdOrSlug, isValidUuid } from "../db/client";
import {
  evaluateCodeReview,
  EvaluationValidationError,
} from "../services/ai_judge";

const challengesRouter = new Hono<{ Bindings: Bindings }>();

/**
 * 1. GET /api/challenges
 * Retrieves all active exercises for the sidebar explorer (no solution leakage).
 */
challengesRouter.get("/", async (c) => {
  try {
    const supabase = getSupabase(c.env);

    const { data, error } = await supabase
      .from("challenges")
      .select("id, title, slug, level, language, context_prompt, is_active, created_at")
      .eq("is_active", true)
      .order("level", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return c.json({ error: `Failed to fetch challenges from database: ${error.message}` }, 500);
    }

    return c.json({
      success: true,
      total: data ? data.length : 0,
      challenges: data || [],
    });
  } catch (err: any) {
    return c.json({ error: `Internal server error: ${err.message}` }, 500);
  }
});

/**
 * 2. GET /api/challenges/:id
 * Retrieves a single exercise by UUID or human-readable slug.
 */
challengesRouter.get("/:id", async (c) => {
  const identifier = c.req.param("id");

  if (!identifier) {
    return c.json({ error: "Challenge identifier is required" }, 400);
  }

  try {
    const supabase = getSupabase(c.env);
    const { challenge, error } = await findChallengeByIdOrSlug(
      supabase,
      identifier,
      "id, title, slug, level, language, context_prompt, buggy_code, is_active, created_at"
    );

    if (error || !challenge) {
      return c.json({ error: `Challenge "${identifier}" not found` }, 404);
    }

    return c.json({
      success: true,
      challenge,
    });
  } catch (err: any) {
    return c.json({ error: `Failed to fetch challenge: ${err.message}` }, 500);
  }
});

/**
 * 3. POST /api/challenges/:id/submit
 * Receives code review comments, delegates evaluation to AI Judge, records submission,
 * and reveals reference solution for diff inspection.
 */
challengesRouter.post("/:id/submit", async (c) => {
  const identifier = c.req.param("id");
  const geminiKey = c.env.GEMINI_API_KEY;

  if (!geminiKey) {
    return c.json({ error: "GEMINI_API_KEY is not configured in Cloudflare environment" }, 500);
  }

  // Parse request body
  let payload: SubmitReviewPayload;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON request body" }, 400);
  }

  try {
    const supabase = getSupabase(c.env);

    // Fetch challenge details including reference solution and golden bugs
    const { challenge, error: challengeError } = await findChallengeByIdOrSlug(
      supabase,
      identifier,
      "id, title, slug, context_prompt, buggy_code, fixed_code, golden_bugs"
    );

    if (challengeError || !challenge) {
      return c.json({ error: `Challenge "${identifier}" not found` }, 404);
    }

    // Delegate validation and AI evaluation entirely to the AI Judge service
    const { evaluation, sanitizedComments } = await evaluateCodeReview({
      apiKey: geminiKey,
      model: c.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      challengeTitle: challenge.title,
      contextPrompt: challenge.context_prompt,
      buggyCode: challenge.buggy_code,
      rawGoldenBugs: challenge.golden_bugs,
      userComments: payload?.comments || [],
    });

    // Persist submission record in database
    const { data: submissionRow, error: insertError } = await supabase
      .from("submissions")
      .insert({
        challenge_id: challenge.id,
        user_id: isValidUuid(payload.user_id) ? payload.user_id : null,
        user_claims: sanitizedComments,
        ai_evaluation: evaluation,
        total_score: evaluation.score,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.warn("Warning: Failed to persist submission to database:", insertError.message);
    }

    // Return complete evaluation and reveal reference code for Diff inspection
    return c.json({
      success: true,
      submission_id: submissionRow?.id || null,
      challenge_id: challenge.id,
      evaluation,
      solution_code: challenge.fixed_code,
      created_at: submissionRow?.created_at || new Date().toISOString(),
    });
  } catch (err: any) {
    if (err instanceof EvaluationValidationError) {
      return c.json({ error: err.message }, 400);
    }
    return c.json({ error: `Evaluation processing error: ${err.message}` }, 500);
  }
});

export default challengesRouter;
