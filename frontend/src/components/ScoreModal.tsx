import React, { useState } from "react";
import { DiffEditor } from "@monaco-editor/react";
import { ReviewEvaluation } from "../types";

interface ScoreModalProps {
  evaluation: ReviewEvaluation;
  solutionCode: string;
  buggyCode: string;
  language?: string;
  onClose: () => void;
  onNextChallenge?: () => void;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({
  evaluation,
  solutionCode,
  buggyCode,
  language = "python",
  onClose,
  onNextChallenge,
}) => {
  const [showDiff, setShowDiff] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getSnrClass = (snr: string) => {
    if (snr === "Excellent") return "snr-excellent";
    if (snr === "Good") return "snr-good";
    return "snr-needs-improvement";
  };

  const scoreColor = getScoreColor(evaluation.score);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="scorecard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="scorecard-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>🏆</span>
            <span style={{ fontSize: "17px", fontWeight: 700 }}>תוצאות שפיטת AI</span>
          </div>

          <button className="btn-icon" onClick={onClose} title="סגור">
            ✕
          </button>
        </div>

        <div className="scorecard-body">
          {/* Score & SNR Hero Card */}
          <div className="score-hero">
            <div className="score-circle-container">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * evaluation.score) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
              </svg>
              <div
                className="score-number"
                style={{ position: "absolute", color: scoreColor }}
              >
                {evaluation.score}
              </div>
            </div>

            <div className="score-details">
              <div className={`snr-pill ${getSnrClass(evaluation.snr_rating)}`}>
                <span>דירוג SNR:</span>
                <strong>{evaluation.snr_rating}</strong>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                {evaluation.score >= 80
                  ? "ביקורת מעולה! הצלחת לאתר את ליבת הכשל בקוד."
                  : evaluation.score >= 50
                  ? "עבודה טובה, אך יש מקום לדיוק ולהפחתת הערות שווא."
                  : "הביקורת פספסה את הבאג המרכזי או כללה הערות סרק מרובות."}
              </p>
            </div>
          </div>

          {/* AI Constructive Feedback */}
          <div className="ai-feedback-box">
            <div className="ai-feedback-title">
              <span>🤖 משוב מנוע השפיטה (Gemini AI)</span>
            </div>
            <p style={{ fontSize: "13px", color: "#e2e8f0" }}>{evaluation.ai_feedback}</p>

            {evaluation.suggested_fix_review && (
              <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <strong style={{ fontSize: "12px", color: "#67e8f9" }}>הערכת התיקון המוצע: </strong>
                <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{evaluation.suggested_fix_review}</span>
              </div>
            )}
          </div>

          {/* Breakdown Grid */}
          <div className="eval-breakdown-grid">
            {/* True Positives */}
            <div className="breakdown-card" style={{ borderColor: "rgba(16, 185, 129, 0.3)" }}>
              <div className="breakdown-header" style={{ color: "#34d399" }}>
                <span>🎯 פגיעות מדויקות ({evaluation.true_positives.length})</span>
              </div>
              <ul className="breakdown-list">
                {evaluation.true_positives.map((tp, idx) => (
                  <li key={idx}>• {tp}</li>
                ))}
                {evaluation.true_positives.length === 0 && (
                  <li style={{ color: "var(--text-dim)" }}>לא זוהו באגים אמיתיים.</li>
                )}
              </ul>
            </div>

            {/* False Positives */}
            <div className="breakdown-card" style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}>
              <div className="breakdown-header" style={{ color: "#fbbf24" }}>
                <span>⚠️ הערות שווא / רעש ({evaluation.false_positives.length})</span>
              </div>
              <ul className="breakdown-list">
                {evaluation.false_positives.map((fp, idx) => (
                  <li key={idx}>• {fp}</li>
                ))}
                {evaluation.false_positives.length === 0 && (
                  <li style={{ color: "#34d399" }}>אין הערות סרק! כל הכבוד.</li>
                )}
              </ul>
            </div>

            {/* False Negatives */}
            <div className="breakdown-card" style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}>
              <div className="breakdown-header" style={{ color: "#f87171" }}>
                <span>🔍 באגים שפוספסו ({evaluation.false_negatives.length})</span>
              </div>
              <ul className="breakdown-list">
                {evaluation.false_negatives.map((fn, idx) => (
                  <li key={idx}>• {fn}</li>
                ))}
                {evaluation.false_negatives.length === 0 && (
                  <li style={{ color: "#34d399" }}>מצאת את כל הבאגים!</li>
                )}
              </ul>
            </div>
          </div>

          {/* Diff Viewer Toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: 600 }}>השוואת פתרון הייחוס (Diff):</span>
            <button
              className="btn-secondary"
              onClick={() => setShowDiff(!showDiff)}
            >
              {showDiff ? "הסתר השוואה" : "🔍 הצג קוד פגום מול פתרון"}
            </button>
          </div>

          {showDiff && (
            <div className="diff-section">
              <DiffEditor
                height="100%"
                language={language}
                original={buggyCode}
                modified={solutionCode}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  fontSize: 13,
                  fontFamily: "'Fira Code', monospace",
                  renderSideBySide: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          )}
        </div>

        <div className="scorecard-footer">
          <button className="btn-secondary" onClick={onClose}>
            סגור
          </button>
          {onNextChallenge && (
            <button className="btn-primary" onClick={onNextChallenge}>
              האתגר הבא ⬅️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
