import React from "react";
import { ChallengeDetail, AuthUser } from "../types";
import { getChallengeHebrewSummary } from "../data/challengeSummaries";

interface HeaderProps {
  currentChallenge: ChallengeDetail | null;
  commentsCount: number;
  solvedCount: number;
  totalCount: number;
  isSidebarOpen: boolean;
  isDrawerOpen: boolean;
  isSubmitting: boolean;
  authUser: AuthUser | null;
  onLoginWithGithub: () => void;
  onSignOut: () => void;
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
  authUser,
  onLoginWithGithub,
  onSignOut,
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
        {/* GitHub Auth Section */}
        {authUser ? (
          <div
            className="auth-user-chip"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 10px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "9999px",
              fontSize: "12px",
            }}
          >
            {authUser.avatar_url && (
              <img
                src={authUser.avatar_url}
                alt={authUser.username}
                style={{ width: "20px", height: "20px", borderRadius: "50%" }}
              />
            )}
            <span style={{ fontWeight: 600 }}>@{authUser.username}</span>
            <button
              onClick={onSignOut}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "2px 4px",
                fontSize: "11px",
              }}
              title="התנתק"
            >
              יציאה
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginWithGithub}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: "#24292e",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            title="התחבר עם חשבון GitHub שלך כדי לשמור התקדמות וציונים"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>התחבר עם GitHub</span>
          </button>
        )}

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
