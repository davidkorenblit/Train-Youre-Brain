// ============================================================================
// CodeReview Arena - Frontend API Client
// Connects to Cloudflare Workers backend for challenges, submissions, and AI scoring
// ============================================================================

import {
  ChallengeMetadata,
  ChallengeDetail,
  UserComment,
  SubmitReviewResponse,
} from "../types";

const BACKEND_URL =
  import.meta.env.VITE_API_URL || "https://train-youre-brain.dycoren18.workers.dev";

/**
 * Fetch all available challenges metadata (Level 1, 2, 3)
 */
export async function fetchChallenges(): Promise<ChallengeMetadata[]> {
  const res = await fetch(`${BACKEND_URL}/api/challenges`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: Failed to load challenges`);
  }
  const data = await res.json();
  return data.challenges || [];
}

/**
 * Fetch single challenge by ID or slug with buggy_code and instructions
 */
export async function fetchChallenge(identifier: string): Promise<ChallengeDetail> {
  const res = await fetch(`${BACKEND_URL}/api/challenges/${identifier}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: Failed to load challenge`);
  }
  const data = await res.json();
  return data.challenge;
}

/**
 * Submit user code review findings for evaluation by Gemini AI Judge
 */
export async function submitReview(
  identifier: string,
  comments: UserComment[],
  userId?: string
): Promise<SubmitReviewResponse> {
  const res = await fetch(`${BACKEND_URL}/api/challenges/${identifier}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      comments,
      user_id: userId,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: Review submission failed`);
  }

  return data;
}

/**
 * Fetch past submission details by UUID
 */
export async function fetchSubmission(submissionId: string) {
  const res = await fetch(`${BACKEND_URL}/api/submissions/${submissionId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: Failed to load submission`);
  }
  const data = await res.json();
  return data.submission;
}
