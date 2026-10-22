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
      className="inline-comment-overlay"
      style={{ top: `${Math.max(10, topPx)}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit}>
        <div className="inline-form-header">
          <div className="inline-form-title">
            <span>💬 הוספת הערת סקירה לשורה {lineNumber}</span>
          </div>

          <select
            className="severity-select"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
          >
            <option value="Critical">🔴 קריטי (Critical)</option>
            <option value="High">🟠 גבוה (High)</option>
            <option value="Medium">🟡 בינוני (Medium)</option>
            <option value="Low">🔵 נמוך (Low)</option>
          </select>
        </div>

        <textarea
          className="comment-textarea"
          placeholder="תאר את הכשל, הבאג או צוואר הבקבוק שמצאת בשורה זו (עד 350 תווים)..."
          maxLength={350}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          autoFocus
          required
        />

        <textarea
          className="fix-textarea"
          placeholder="# הצעה לתיקון קוד (אופציונלי)"
          value={suggestedFix}
          onChange={(e) => setSuggestedFix(e.target.value)}
        />

        <div className="inline-form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            ביטול
          </button>
          <button type="submit" className="btn-primary" disabled={!commentText.trim()}>
            {existingComment ? "עדכן ממצא" : "הוסף ממצא לסקירה"}
          </button>
        </div>
      </form>
    </div>
  );
};
