// ============================================================================
// CodeReview Arena - Frontend TypeScript Types
// ============================================================================

export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface UserComment {
  line_number: number;
  severity: Severity;
  comment: string;
  suggested_fix?: string;
}

export interface ChallengeMetadata {
  id: string;
  title: string;
  slug: string;
  level: 1 | 2 | 3;
  language: string;
  context_prompt: string;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeDetail extends ChallengeMetadata {
  buggy_code: string;
}

export interface ReviewEvaluation {
  score: number;
  true_positives: string[];
  false_positives: string[];
  false_negatives: string[];
  snr_rating: "Excellent" | "Good" | "Needs Improvement";
  ai_feedback: string;
  suggested_fix_review: string;
}

export interface SubmitReviewResponse {
  success: boolean;
  submission_id: string;
  challenge_id: string;
  evaluation: ReviewEvaluation;
  solution_code: string;
  created_at: string;
}

export interface SolvedRecord {
  score: number;
  snr: string;
  timestamp: string;
}
