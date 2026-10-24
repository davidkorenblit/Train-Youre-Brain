// ============================================================================
// CodeReview Arena - Submissions Routes
// Enables reviewing historical submission results and past scores
// ============================================================================

import { Hono } from "hono";
import { Bindings } from "../types";
import { getSupabase, isValidUuid } from "../db/client";
import { getAuthenticatedUser } from "../middleware/auth";

const submissionsRouter = new Hono<{ Bindings: Bindings }>();

/**
 * GET /api/submissions/user/me
 * Retrieves user profile & history for the currently authenticated developer.
 */
submissionsRouter.get("/user/me", async (c) => {
  try {
    const supabase = getSupabase(c.env);
    const authUser = await getAuthenticatedUser(c, supabase);

    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: history, error } = await supabase
      .from("submissions")
      .select("id, challenge_id, total_score, created_at, challenges(title, slug, level)")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(25);

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    return c.json({
      success: true,
      user: authUser,
      submissions: history || [],
    });
  } catch (err: any) {
    return c.json({ error: `Failed to fetch user history: ${err.message}` }, 500);
  }
});

/**
 * 4. GET /api/submissions/:id
 * Retrieves a past submission by its UUID for review and scorecard display.
 */
submissionsRouter.get("/:id", async (c) => {
  const submissionId = c.req.param("id");

  if (!isValidUuid(submissionId)) {
    return c.json({ error: "A valid submission UUID must be provided" }, 400);
  }

  try {
    const supabase = getSupabase(c.env);

    const { data: submission, error } = await supabase
      .from("submissions")
      .select(`
        id,
        user_id,
        challenge_id,
        user_claims,
        ai_evaluation,
        total_score,
        tokens_used,
        created_at,
        challenges (
          id,
          title,
          slug,
          level,
          language,
          buggy_code,
          fixed_code
        )
      `)
      .eq("id", submissionId)
      .single();

    if (error || !submission) {
      return c.json({ error: `Submission "${submissionId}" was not found` }, 404);
    }

    return c.json({
      success: true,
      submission,
    });
  } catch (err: any) {
    return c.json({ error: `Failed to retrieve submission: ${err.message}` }, 500);
  }
});

export default submissionsRouter;
