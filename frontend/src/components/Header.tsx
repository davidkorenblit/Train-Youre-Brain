import React from "react";
import { ChallengeDetail } from "../types";

interface HeaderProps {
  currentChallenge: ChallengeDetail | null;
  commentsCount: number;
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
      <div className="brand" onClick={onToggleSidebar} title="פתח/סגור רשימת אתגרים">
        <span className="brand-icon">🧠</span>
        <span className="brand-title">CodeReview Arena</span>
      </div>

      {currentChallenge && (
        <div className="header-active-info">
          <span className="active-title">{currentChallenge.title}</span>
          {getLevelBadge(currentChallenge.level)}
        </div>
      )}

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
              <span className="comments-counter">{commentsCount}</span>
            </>
          )}
        </button>

        <button
          className={`btn-icon ${isDrawerOpen ? "active" : ""}`}
          onClick={onToggleDrawer}
          title="מגירת ממצאים והערות"
        >
          📝
        </button>

        <button
          className={`btn-icon ${isSidebarOpen ? "active" : ""}`}
          onClick={onToggleSidebar}
          title="סרגל בחירת אתגרים"
        >
          ☰
        </button>
      </div>
    </header>
  );
};
