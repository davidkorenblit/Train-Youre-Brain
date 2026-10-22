// ============================================================================
// CodeReview Arena - Submissions Routes
// Enables reviewing historical submission results and past scores
// ============================================================================

import { Hono } from "hono";
import { Bindings } from "../types";
import { getSupabase, isValidUuid } from "../db/client";

const submissionsRouter = new Hono<{ Bindings: Bindings }>();

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
