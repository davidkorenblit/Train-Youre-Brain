// ============================================================================
// CodeReview Arena - Shared Backend TypeScript Types
// ============================================================================

// Cloudflare Worker runtime environment bindings
export type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_SECRET_KEY?: string;
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
};

// Single line comment submitted by a developer reviewing code
export interface UserComment {
  line_number: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  comment: string;
  suggested_fix?: string;
}

// Reference bug from golden_bugs stored in Supabase
export interface GoldenBug {
  line_number: number;
  severity: string;
  bug_description: string;
  suggested_fix?: string;
}

// Strict AI Judge evaluation output
export interface ReviewEvaluation {
  score: number;                     // Weighted score between 0 and 100
  true_positives: string[];          // Real bugs accurately identified
  false_positives: string[];         // False alarms or noise that reduced score
  false_negatives: string[];         // Real bugs that were missed
  snr_rating: "Excellent" | "Good" | "Needs Improvement"; // Signal to Noise ratio
  ai_feedback: string;               // Constructive feedback written in Hebrew
  suggested_fix_review: string;      // Evaluation of user proposed fixes in Hebrew
}

// Payload sent to POST /api/challenges/:id/submit
export interface SubmitReviewPayload {
  comments: UserComment[];
  user_id?: string;
}

// Response returned after a review is evaluated
export interface SubmitReviewResponse {
  submission_id: string;
  challenge_id: string;
  evaluation: ReviewEvaluation;
  solution_code: string;
  created_at: string;
}
