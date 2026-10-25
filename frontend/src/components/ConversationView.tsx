// ============================================================================
// CodeReview Arena - GitHub Style PR Conversation View Component
// Shows the PR initial brief by @junior-dev and the resulting AI Judge review
// ============================================================================

import React from "react";
import { ChallengeDetail, ReviewEvaluation } from "../types";
import { getChallengeHebrewSummary } from "../data/challengeSummaries";
import { MarkdownViewer } from "./MarkdownViewer";

interface ConversationViewProps {
  challenge: ChallengeDetail;
  evaluation: ReviewEvaluation | null;
  solutionCode: string | null;
  onGoToFilesChanged: () => void;
  onNextChallenge: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  challenge,
  evaluation,
  solutionCode,
  onGoToFilesChanged,
  onNextChallenge,
}) => {
  const hebrew = getChallengeHebrewSummary(challenge.slug);

  return (
    <div className="gh-conversation-container">
      {/* 1. Initial PR Author Post by @junior-dev */}
      <div className="gh-timeline-item">
        <div className="gh-avatar-column">
          <div className="gh-author-avatar junior">
            <span>JD</span>
          </div>
        </div>

        <div className="gh-comment-box">
          <div className="gh-comment-header">
            <div className="gh-comment-meta">
              <strong>junior-dev</strong> commented 2 hours ago
              <span className="gh-author-badge">Author</span>
            </div>
            <span className="gh-commit-sha">commit {challenge.slug.substring(0, 7)}</span>
          </div>

          <div className="gh-comment-body">
            {hebrew && (
              <div className="gh-hebrew-brief-card">
                <h3>💡 תדריך משימה: {hebrew.hebrewTitle}</h3>
                <p className="gh-brief-desc">{hebrew.summary}</p>
                <div className="gh-review-focus-box">
                  <strong>🎯 דגשי ביקורת עיקריים:</strong>
                  <ul>
                    {hebrew.reviewTips?.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="gh-markdown-wrapper">
              <MarkdownViewer
                content={challenge.context_prompt}
                slug={challenge.slug}
                challengeTitle={challenge.title}
              />
            </div>

            <div className="gh-call-to-action-box">
              <p>
                הקוד המלא מוכן לביקורת שלך. עבור לטאב <strong>Files changed</strong> כדי לסקור את השורות, לסמן תקלות ולהגיש ביקורת.
              </p>
              <button className="gh-btn-primary" onClick={onGoToFilesChanged}>
                פתח את הקוד לביקורת (Files Changed ➔)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI Review Result Thread Post (Appears once evaluated) */}
      {evaluation && (
        <div className="gh-timeline-item ai-verdict-item">
          <div className="gh-avatar-column">
            <div className="gh-author-avatar bot">
              <span>🤖</span>
            </div>
          </div>

          <div className="gh-comment-box verdict-box">
            <div className="gh-comment-header verdict-header">
              <div className="gh-comment-meta">
                <strong>gemini-senior-judge</strong>
                <span className="gh-bot-badge">BOT</span>
                commented just now • Review Verdict
              </div>
              <div className="gh-score-pill">
                <span>ציון:</span>
                <strong>{evaluation.score} / 100</strong>
              </div>
            </div>

            <div className="gh-comment-body">
              {/* SNR Badge */}
              <div className="gh-score-metrics-row">
                <div className="gh-metric-chip">
                  <span>יחס אות לרעש (SNR):</span>
                  <strong className={`snr-${evaluation.snr_rating.toLowerCase().replace(" ", "-")}`}>
                    {evaluation.snr_rating}
                  </strong>
                </div>
                <div className="gh-metric-chip">
                  <span>סטטוס:</span>
                  <strong>{evaluation.score >= 70 ? "✅ Changes Approved" : "❌ Changes Requested"}</strong>
                </div>
              </div>

              {/* Constructive AI Feedback */}
              <div className="gh-ai-feedback-box">
                <h4>📋 משוב השופט המקצועי:</h4>
                <p>{evaluation.ai_feedback}</p>
                {evaluation.suggested_fix_review && (
                  <p className="gh-fix-review-note">
                    <strong>הערכה על הצעות התיקון שלך:</strong> {evaluation.suggested_fix_review}
                  </p>
                )}
              </div>

              {/* True / False Positives breakdown */}
              <div className="gh-findings-breakdown-grid">
                {evaluation.true_positives.length > 0 && (
                  <div className="gh-breakdown-card success">
                    <h5>🎯 פגיעות מדויקות ({evaluation.true_positives.length})</h5>
                    <ul>
                      {evaluation.true_positives.map((tp, idx) => (
                        <li key={idx}>{tp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {evaluation.false_positives.length > 0 && (
                  <div className="gh-breakdown-card warning">
                    <h5>⚠️ אזעקות שווא / רעש ({evaluation.false_positives.length})</h5>
                    <ul>
                      {evaluation.false_positives.map((fp, idx) => (
                        <li key={idx}>{fp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {evaluation.false_negatives.length > 0 && (
                  <div className="gh-breakdown-card danger">
                    <h5>🔍 כשלים שפוספסו ({evaluation.false_negatives.length})</h5>
                    <ul>
                      {evaluation.false_negatives.map((fn, idx) => (
                        <li key={idx}>{fn}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Reference Solution Code Snippet */}
              {solutionCode && (
                <div className="gh-reference-solution-box">
                  <h4>✨ פתרון הייחוס התקין (Golden Fix):</h4>
                  <pre className="gh-code-block">
                    <code>{solutionCode}</code>
                  </pre>
                </div>
              )}

              {/* Next Challenge Action */}
              <div className="gh-verdict-footer">
                <button className="gh-btn-primary" onClick={onNextChallenge}>
                  המשך לאתגר ה-PR הבא ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
