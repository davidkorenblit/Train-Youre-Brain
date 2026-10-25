// ============================================================================
// CodeReview Arena - GitHub Native Inline Comment Form Component
// Matches GitHub's line-by-line review commenting interface exactly
// ============================================================================

import React, { useState } from "react";
import { Severity, UserComment } from "../types";

interface InlineCommentFormProps {
  lineNumber: number;
  topPx: number;
  existingComment?: UserComment;
  onSave: (comment: UserComment) => void;
  onCancel: () => void;
}

export const InlineCommentForm: React.FC<InlineCommentFormProps> = ({
  lineNumber,
  topPx,
  existingComment,
  onSave,
  onCancel,
}) => {
  const [severity, setSeverity] = useState<Severity>(existingComment?.severity || "High");
  const [commentText, setCommentText] = useState(existingComment?.comment || "");
  const [suggestedFix, setSuggestedFix] = useState(existingComment?.suggested_fix || "");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onSave({
      line_number: lineNumber,
      severity,
      comment: commentText.trim(),
      suggested_fix: suggestedFix.trim() || undefined,
    });
  };

  return (
    <div
      className="gh-inline-comment-wrapper"
      style={{ top: `${Math.max(10, topPx)}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} className="gh-inline-box">
        {/* Header Tabs: Write / Preview & Line indicator */}
        <div className="gh-inline-header">
          <div className="gh-inline-tabs">
            <button
              type="button"
              className={`gh-inline-tab ${activeTab === "write" ? "active" : ""}`}
              onClick={() => setActiveTab("write")}
            >
              Write
            </button>
            <button
              type="button"
              className={`gh-inline-tab ${activeTab === "preview" ? "active" : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </button>
          </div>

          <div className="gh-inline-line-meta">
            <span className="gh-line-ref">Line {lineNumber}</span>
            <select
              className="gh-severity-dropdown"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
            >
              <option value="Critical">🔴 Critical Severity</option>
              <option value="High">🟠 High Severity</option>
              <option value="Medium">🟡 Medium Severity</option>
              <option value="Low">🔵 Low Severity</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Write Mode */}
        {activeTab === "write" ? (
          <div className="gh-inline-body">
            <textarea
              className="gh-comment-input"
              placeholder="Leave a code review comment (e.g. index error, concurrency bug, SQL injection)..."
              maxLength={350}
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              autoFocus
              required
            />

            <textarea
              className="gh-fix-input"
              placeholder="# Suggested code fix (optional)..."
              rows={2}
              value={suggestedFix}
              onChange={(e) => setSuggestedFix(e.target.value)}
            />
          </div>
        ) : (
          /* Tab 2: Preview Mode */
          <div className="gh-inline-preview">
            <p className="gh-preview-text">
              {commentText ? commentText : <em>Nothing to preview</em>}
            </p>
            {suggestedFix && (
              <div className="gh-preview-fix">
                <span className="gh-preview-tag">Suggested fix:</span>
                <pre>
                  <code>{suggestedFix}</code>
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="gh-inline-actions">
          <button type="button" className="gh-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="submit"
            className="gh-btn-primary"
            disabled={!commentText.trim()}
          >
            {existingComment ? "Update comment" : "Add review comment"}
          </button>
        </div>
      </form>
    </div>
  );
};
