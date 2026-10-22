import React from "react";
import { UserComment, Severity } from "../types";

interface ReviewDrawerProps {
  comments: UserComment[];
  isOpen: boolean;
  onDeleteComment: (lineNumber: number) => void;
  onEditComment: (comment: UserComment) => void;
  onSubmitReview: () => void;
  isSubmitting: boolean;
  onClose: () => void;
}

export const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  comments,
  isOpen,
  onDeleteComment,
  onEditComment,
  onSubmitReview,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case "Critical":
        return <span style={{ color: "var(--severity-critical)", fontSize: "11px", fontWeight: 700 }}>🔴 Critical</span>;
      case "High":
        return <span style={{ color: "var(--severity-high)", fontSize: "11px", fontWeight: 700 }}>🟠 High</span>;
      case "Medium":
        return <span style={{ color: "var(--severity-medium)", fontSize: "11px", fontWeight: 700 }}>🟡 Medium</span>;
      case "Low":
        return <span style={{ color: "var(--severity-low)", fontSize: "11px", fontWeight: 700 }}>🔵 Low</span>;
    }
  };

  return (
    <div className="findings-drawer">
      <div className="drawer-header">
        <div className="drawer-title">
          <span>ממצאי ביקורת</span>
          <span className="comments-counter">{comments.length}</span>
        </div>
      </div>

      <div className="findings-list">
        {comments.map((c) => (
          <div key={c.line_number} className="finding-card">
            <div className="finding-card-header">
              <span className="finding-line-badge">Line {c.line_number}</span>
              {getSeverityBadge(c.severity)}
              <div className="finding-actions">
                <button
                  className="btn-mini-delete"
                  onClick={() => onEditComment(c)}
                  title="ערוך הערה"
                >
                  ✏️
                </button>
                <button
                  className="btn-mini-delete"
                  onClick={() => onDeleteComment(c.line_number)}
                  title="מחק הערה"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="finding-comment">{c.comment}</div>

            {c.suggested_fix && (
              <div className="finding-fix" title="קוד מתקן שהוצע">
                {c.suggested_fix}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <div className="empty-findings">
            <p style={{ marginBottom: "8px" }}>עדיין לא סומנו באגים.</p>
            <p style={{ fontSize: "11px", color: "var(--text-dim)" }}>
              לחץ על שורה בעורך הקוד כדי להוסיף הערת ביקורת והצעה לתיקון.
            </p>
          </div>
        )}
      </div>

      {comments.length > 0 && (
        <div style={{ padding: "14px", borderTop: "1px solid var(--border-subtle)" }}>
          <button
            className="btn-submit-review"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={onSubmitReview}
            disabled={isSubmitting}
          >
            {isSubmitting ? "שופט את ההגשה..." : `שלח ביקורת (${comments.length} ממצאים)`}
          </button>
        </div>
      )}
    </div>
  );
};
