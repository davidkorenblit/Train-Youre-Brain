import React from "react";
import { ChallengeDetail } from "../types";
import { getChallengeHebrewSummary } from "../data/challengeSummaries";

interface HeaderProps {
  currentChallenge: ChallengeDetail | null;
  commentsCount: number;
  solvedCount: number;
  totalCount: number;
  isSidebarOpen: boolean;
  isDrawerOpen: boolean;
  isSubmitting: boolean;
  onToggleSidebar: () => void;
  onToggleDrawer: () => void;
  onSubmitReview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentChallenge,
  commentsCount,
  solvedCount,
  totalCount,
  isSidebarOpen,
  isDrawerOpen,
  isSubmitting,
  onToggleSidebar,
  onToggleDrawer,
  onSubmitReview,
}) => {
  const getLevelBadge = (level?: number) => {
    switch (level) {
      case 1:
        return <span className="level-badge level-1-badge">Level 1: Fundamentals</span>;
      case 2:
        return <span className="level-badge level-2-badge">Level 2: Architecture</span>;
      case 3:
        return <span className="level-badge level-3-badge">Level 3: Production</span>;
      default:
        return null;
    }
  };

  return (
    <header className="app-header">
      {/* Brand & Tactical Title */}
      <div className="brand-wrapper" onClick={onToggleSidebar} title="פתח/סגור סרגל אתגרים">
        <div className="brand-shield">
          <span>🧠</span>
        </div>
        <div className="brand-texts">
          <span className="brand-title">CodeReview Arena</span>
          <span className="brand-tagline">TACTICAL SIMULATOR</span>
        </div>
      </div>

      {/* Center: Live Telemetry & Active Challenge */}
      <div className="header-telemetry">
        <div className="live-pulse-chip" title="מנוע השפיטה של AI זמין">
          <span className="pulse-dot"></span>
          <span>EDGE ONLINE</span>
        </div>

        {totalCount > 0 && (
          <div className="progress-counter-badge" title="אתגרים שנפתרו">
            <span>מפוענחים:</span>
            <strong>{solvedCount} / {totalCount}</strong>
          </div>
        )}

        {currentChallenge && (() => {
          const hebrew = getChallengeHebrewSummary(currentChallenge.slug);
          return (
            <div className="header-active-challenge">
              <span className="active-title">
                {hebrew ? `${hebrew.hebrewTitle} (${currentChallenge.title})` : currentChallenge.title}
              </span>
              {getLevelBadge(currentChallenge.level)}
            </div>
          );
        })()}
      </div>

      {/* Action Buttons */}
      <div className="header-actions">
        <button
          className="btn-submit-review"
          onClick={onSubmitReview}
          disabled={commentsCount === 0 || isSubmitting}
          title={commentsCount === 0 ? "סמן שורות בקוד כדי להוסיף הערות לפני שליחה" : "שלח ביקורת לשפיטת AI"}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span>
              <span>שופט את הביקורת...</span>
            </>
          ) : (
            <>
              <span>🚀 שלח ביקורת</span>
              {commentsCount > 0 && <span className="comments-counter">{commentsCount}</span>}
            </>
          )}
        </button>

        <button
          className={`btn-icon ${isDrawerOpen ? "active" : ""}`}
          onClick={onToggleDrawer}
          title="מגירת ממצאים והערות"
          style={{ position: "relative" }}
        >
          <span>📝</span>
          {commentsCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                background: "var(--cyan-electric)",
                color: "#000",
                fontSize: "10px",
                fontWeight: 800,
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 8px rgba(6, 182, 212, 0.8)",
              }}
            >
              {commentsCount}
            </span>
          )}
        </button>

        <button
          className={`btn-icon ${isSidebarOpen ? "active" : ""}`}
          onClick={onToggleSidebar}
          title="סרגל בחירת אתגרים"
        >
          <span>☰</span>
        </button>
      </div>
    </header>
  );
};
