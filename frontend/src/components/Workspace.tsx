// ============================================================================
// CodeReview Arena - 3-Pane Balanced Workspace Component
// Pane 1: Hebrew Briefing + English README (Clean LTR/RTL separation)
// Pane 2: Monaco Code Editor (The Buggy Code)
// Pane 3: Review Findings & AI Evaluation Inspector
// ============================================================================

import React, { useState } from "react";
import {
  ChallengeDetail,
  UserComment,
  SubmitReviewResponse,
  AuthUser,
  SolvedRecord,
} from "../types";
import { getChallengeHebrewSummary } from "../data/challengeSummaries";
import { CodeEditor } from "./CodeEditor";
import { InlineCommentForm } from "./InlineCommentForm";
import { MarkdownViewer } from "./MarkdownViewer";

interface WorkspaceProps {
  challenge: ChallengeDetail;
  comments: UserComment[];
  authUser: AuthUser | null;
  solvedRecord?: SolvedRecord;
  isSubmitting: boolean;
  evaluationResponse: SubmitReviewResponse | null;
  onBackToHub: () => void;
  onSaveComment: (comment: UserComment) => void;
  onDeleteComment: (lineNumber: number) => void;
  onSubmitReview: () => void;
  onNextChallenge: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  challenge,
  comments,
  authUser,
  solvedRecord,
  isSubmitting,
  evaluationResponse,
  onBackToHub,
  onSaveComment,
  onDeleteComment,
  onSubmitReview,
  onNextChallenge,
}) => {
  const [activeLineForComment, setActiveLineForComment] = useState<number | null>(null);
  const [commentFormTopPx, setCommentFormTopPx] = useState(40);
  const [showSolutionCode, setShowSolutionCode] = useState(false);

  const hebrew = getChallengeHebrewSummary(challenge.slug);
  const evaluation = evaluationResponse?.evaluation;
  const activeExistingComment = comments.find((c) => c.line_number === activeLineForComment);

  const handleLineClick = (lineNumber: number, topPx: number) => {
    setActiveLineForComment(lineNumber);
    setCommentFormTopPx(topPx);
  };

  const handleSaveAndClose = (comment: UserComment) => {
    onSaveComment(comment);
    setActiveLineForComment(null);
  };

  return (
    <div className="ws-root">
      {/* 1. Workspace Top Navigation Header */}
      <header className="ws-header">
        <div className="ws-header-left">
          <button onClick={onBackToHub} className="ws-btn-back" title="חזרה לקטלוג האתגרים">
            ← חזרה לקטלוג האתגרים
          </button>
          <div className="ws-title-group">
            <h2 className="ws-title">
              {hebrew ? hebrew.hebrewTitle : challenge.title}
            </h2>
            <span className="ws-slug">({challenge.slug}.py)</span>
          </div>
        </div>

        <div className="ws-header-right">
          <span className={`ws-level-badge level-${challenge.level}`}>
            Level {challenge.level}
          </span>
          {solvedRecord && (
            <span className="ws-solved-badge">
              ✅ פוענח ({solvedRecord.score} נק')
            </span>
          )}
          {authUser && (
            <span className="ws-user-chip">@{authUser.username}</span>
          )}
        </div>
      </header>

      {/* 2. Main 3-Pane Body */}
      <div className="ws-body">
        {/* PANE 1: Context & Briefing (RTL Hebrew summary on top, LTR English README on bottom) */}
        <aside className="ws-pane ws-pane-briefing">
          {/* Sub-panel A: Hebrew Summary */}
          {hebrew && (
            <div className="ws-hebrew-card">
              <div className="ws-hebrew-header">
                <span className="ws-tag-hebrew">💡 תמצית בעברית</span>
                <span className="ws-hebrew-category">{hebrew.category}</span>
              </div>
              <h3 className="ws-hebrew-title">{hebrew.hebrewTitle}</h3>
              <p className="ws-hebrew-text">{hebrew.summary}</p>

              <div className="ws-hebrew-behavior">
                <strong>🎯 התנהגות מצופה:</strong>
                <p>{hebrew.expectedBehavior}</p>
              </div>

              {hebrew.reviewTips && hebrew.reviewTips.length > 0 && (
                <div className="ws-hebrew-tips">
                  <strong>🔍 דגשים לבדיקה:</strong>
                  <ul>
                    {hebrew.reviewTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Sub-panel B: English Raw README (Clean LTR) */}
          <div className="ws-english-readme-container">
            <div className="ws-readme-header">
              <span>📖 Technical Specification (English)</span>
            </div>
            <div className="ws-readme-body">
              <MarkdownViewer
                content={challenge.context_prompt}
                showHebrewIntro={false}
              />
            </div>
          </div>
        </aside>

        {/* PANE 2: Center - Monaco Code Editor */}
        <main className="ws-pane ws-pane-editor">
          <div className="ws-editor-header">
            <div className="ws-file-meta">
              <span>📄</span>
              <strong>{challenge.slug}.py</strong>
              <span className="ws-lang-tag">{challenge.language || "python"}</span>
            </div>
            <div className="ws-editor-hint">
              <span>לחץ על מספר שורה כדי להוסיף הערת ביקורת 💬</span>
            </div>
          </div>

          <div className="ws-editor-content">
            <CodeEditor
              code={challenge.buggy_code}
              language={challenge.language || "python"}
              comments={comments}
              activeLineForComment={activeLineForComment}
              onLineClick={handleLineClick}
            />

            {/* Inline Comment Floating Form */}
            {activeLineForComment !== null && (
              <InlineCommentForm
                lineNumber={activeLineForComment}
                topPx={commentFormTopPx}
                existingComment={activeExistingComment}
                onSave={handleSaveAndClose}
                onCancel={() => setActiveLineForComment(null)}
              />
            )}
          </div>
        </main>

        {/* PANE 3: Right/Left - Findings & AI Review Inspector */}
        <aside className="ws-pane ws-pane-findings">
          <div className="ws-findings-header">
            <h3>ממצאי ביקורת ({comments.length})</h3>
            <span className="ws-findings-sub">הערות שהוספת לשורות הקוד</span>
          </div>

          {/* Comments List */}
          <div className="ws-findings-list">
            {comments.length === 0 ? (
              <div className="ws-findings-empty">
                <span>🔍</span>
                <p>עדיין לא הוספת ממצאים.</p>
                <small>עבור על הקוד במרכז, לחץ על שורות בעייתיות והוסף הערה מנומקת.</small>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.line_number} className="ws-comment-card">
                  <div className="ws-comment-card-top">
                    <span className="ws-comment-line">שורה {c.line_number}</span>
                    <span className={`ws-comment-severity ${c.severity.toLowerCase()}`}>
                      {c.severity}
                    </span>
                    <button
                      className="ws-btn-delete-comment"
                      onClick={() => onDeleteComment(c.line_number)}
                      title="מחק ממצא"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="ws-comment-text">{c.comment}</p>
                  {c.suggested_fix && (
                    <div className="ws-comment-fix">
                      <span className="ws-fix-label">הצעת תיקון:</span>
                      <code>{c.suggested_fix}</code>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Submit Action Button */}
          <div className="ws-findings-action">
            <button
              className="ws-btn-submit"
              onClick={onSubmitReview}
              disabled={comments.length === 0 || isSubmitting}
            >
              {isSubmitting ? "שופט את הביקורת... ⏳" : `🚀 שלח לבדיקת AI (${comments.length})`}
            </button>
          </div>

          {/* AI Evaluation Result Card */}
          {evaluation && (
            <div className="ws-ai-evaluation-box">
              <div className="ws-eval-header">
                <h4>🤖 תוצאות שפיטת AI:</h4>
                <div className="ws-eval-score">
                  <strong>{evaluation.score}</strong> / 100
                </div>
              </div>

              <div className="ws-eval-snr">
                <span>איכות ביקורת (SNR):</span>
                <strong className={`snr-${evaluation.snr_rating.toLowerCase().replace(" ", "-")}`}>
                  {evaluation.snr_rating}
                </strong>
              </div>

              <div className="ws-eval-feedback">
                <p>{evaluation.ai_feedback}</p>
              </div>

              {/* Positives / Negatives counters */}
              <div className="ws-eval-metrics-pills">
                <span className="ws-pill-success">
                  🎯 {evaluation.true_positives.length} פגיעות
                </span>
                <span className="ws-pill-warning">
                  ⚠️ {evaluation.false_positives.length} שווא
                </span>
                <span className="ws-pill-danger">
                  🔍 {evaluation.false_negatives.length} פוספסו
                </span>
              </div>

              {/* Solution Code Toggle */}
              {evaluationResponse?.solution_code && (
                <div className="ws-solution-drawer">
                  <button
                    className="ws-btn-toggle-solution"
                    onClick={() => setShowSolutionCode((prev) => !prev)}
                  >
                    {showSolutionCode ? "הסתר פתרון תקין ▲" : "צפה בפתרון התקין של הייחוס ▼"}
                  </button>

                  {showSolutionCode && (
                    <pre className="ws-solution-pre">
                      <code>{evaluationResponse.solution_code}</code>
                    </pre>
                  )}
                </div>
              )}

              <button className="ws-btn-next-challenge" onClick={onNextChallenge}>
                המשך לאתגר הבא ➔
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
