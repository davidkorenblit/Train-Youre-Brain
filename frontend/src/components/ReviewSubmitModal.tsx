// ============================================================================
// CodeReview Arena - GitHub Style "Review Changes" Submit Dialog
// Replicates GitHub's native PR review submission dropdown
// ============================================================================

import React, { useState } from "react";
import { UserComment } from "../types";

interface ReviewSubmitModalProps {
  comments: UserComment[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (generalFeedback: string, verdict: "comment" | "approve" | "request_changes") => void;
}

export const ReviewSubmitModal: React.FC<ReviewSubmitModalProps> = ({
  comments,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [generalComment, setGeneralComment] = useState("");
  const [verdict, setVerdict] = useState<"comment" | "approve" | "request_changes">("request_changes");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comments.length === 0 || isSubmitting) return;
    onSubmit(generalComment, verdict);
  };

  return (
    <div className="gh-modal-backdrop" onClick={onClose}>
      <div className="gh-submit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="gh-dialog-header">
          <h3>Finish your review</h3>
          <button className="gh-dialog-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="gh-dialog-body">
          {/* Summary comment */}
          <div className="gh-form-group">
            <label htmlFor="general-comment">Summary comment (optional):</label>
            <textarea
              id="general-comment"
              className="gh-textarea"
              placeholder="Leave a summary of your findings for the junior author..."
              rows={3}
              value={generalComment}
              onChange={(e) => setGeneralComment(e.target.value)}
            />
          </div>

          {/* Active findings review list */}
          <div className="gh-findings-summary">
            <div className="gh-findings-header">
              <strong>Pending Review Comments ({comments.length}):</strong>
            </div>
            {comments.length === 0 ? (
              <div className="gh-no-findings-alert">
                ⚠️ לא סימנת שום הערות בקוד עדיין! לחץ על מספרי השורות בקוד כדי להוסיף הערות לפני שליחה.
              </div>
            ) : (
              <div className="gh-findings-list">
                {comments.map((c) => (
                  <div key={c.line_number} className="gh-finding-item">
                    <span className="gh-line-badge">Line {c.line_number}</span>
                    <span className={`gh-severity-chip ${c.severity.toLowerCase()}`}>
                      {c.severity}
                    </span>
                    <span className="gh-finding-text">{c.comment}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Verdict Radios */}
          <div className="gh-verdict-options">
            <label className="gh-radio-label">
              <input
                type="radio"
                name="verdict"
                value="comment"
                checked={verdict === "comment"}
                onChange={() => setVerdict("comment")}
              />
              <div className="gh-radio-info">
                <strong>Comment</strong>
                <span>Submit general feedback without explicit approval.</span>
              </div>
            </label>

            <label className="gh-radio-label">
              <input
                type="radio"
                name="verdict"
                value="approve"
                checked={verdict === "approve"}
                onChange={() => setVerdict("approve")}
              />
              <div className="gh-radio-info">
                <strong>Approve</strong>
                <span>Submit feedback and approve merging these changes.</span>
              </div>
            </label>

            <label className="gh-radio-label">
              <input
                type="radio"
                name="verdict"
                value="request_changes"
                checked={verdict === "request_changes"}
                onChange={() => setVerdict("request_changes")}
              />
              <div className="gh-radio-info">
                <strong>Request changes</strong>
                <span>Submit feedback that must be addressed before merging.</span>
              </div>
            </label>
          </div>

          {/* Dialog Action Buttons */}
          <div className="gh-dialog-actions">
            <button
              type="button"
              className="gh-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gh-btn-primary"
              disabled={comments.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Evaluating with AI... ⏳" : "Submit review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
