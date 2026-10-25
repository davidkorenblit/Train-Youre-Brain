// ============================================================================
// CodeReview Arena - GitHub Native PR Header Component
// Faithfully replicates GitHub's Pull Request view header and tab navigation
// ============================================================================

import React, { useState } from "react";
import { ChallengeDetail, ChallengeMetadata, AuthUser } from "../types";
import { getChallengeHebrewSummary } from "../data/challengeSummaries";

interface HeaderProps {
  currentChallenge: ChallengeDetail | null;
  challenges: ChallengeMetadata[];
  activeTab: "files" | "conversation";
  onTabChange: (tab: "files" | "conversation") => void;
  commentsCount: number;
  solvedCount: number;
  totalCount: number;
  authUser: AuthUser | null;
  onSelectChallenge: (slug: string) => void;
  onLoginWithGithub: () => void;
  onSignOut: () => void;
  onOpenReviewModal: () => void;
  isSubmitting: boolean;
  hasEvaluated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentChallenge,
  challenges,
  activeTab,
  onTabChange,
  commentsCount,
  solvedCount,
  totalCount,
  authUser,
  onSelectChallenge,
  onLoginWithGithub,
  onSignOut,
  onOpenReviewModal,
  isSubmitting,
  hasEvaluated,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const hebrew = currentChallenge ? getChallengeHebrewSummary(currentChallenge.slug) : null;
  const currentIndex = challenges.findIndex((c) => c.slug === currentChallenge?.slug);
  const prNumber = currentIndex >= 0 ? currentIndex + 1 : 1;

  const prTitle = hebrew
    ? `${hebrew.hebrewTitle} (${currentChallenge?.title})`
    : currentChallenge?.title || "Select a Pull Request to review";

  return (
    <div className="gh-header-container">
      {/* 1. Global GitHub Top Bar */}
      <header className="gh-topbar">
        <div className="gh-topbar-left">
          {/* GitHub Octocat Logo */}
          <a
            href="https://github.com/davidkorenblit/Train-Youre-Brain"
            target="_blank"
            rel="noopener noreferrer"
            className="gh-logo-link"
            title="View on GitHub"
          >
            <svg height="32" viewBox="0 0 16 16" width="32" fill="currentColor">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
            </svg>
          </a>

          {/* Breadcrumb Navigation */}
          <nav className="gh-breadcrumbs" aria-label="Repository navigation">
            <span className="gh-org">davidkorenblit</span>
            <span className="gh-separator">/</span>
            <strong className="gh-repo">CodeReview-Arena</strong>
            <span className="gh-badge-public">Public</span>
          </nav>
        </div>

        {/* Topbar Right Actions & Profile */}
        <div className="gh-topbar-right">
          {/* Challenge / PR Switcher Dropdown */}
          <div className="gh-pr-switcher-wrapper">
            <button
              className="gh-btn-switcher"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              title="בחר אתגר מתוך 35 אתגרי ה-Pull Request"
            >
              <span>🔀 החלף PR (#{prNumber})</span>
              <span className="gh-caret">▾</span>
            </button>

            {isDropdownOpen && (
              <div className="gh-switcher-menu" onClick={(e) => e.stopPropagation()}>
                <div className="gh-switcher-menu-header">
                  <strong>בחר Pull Request לבדיקה</strong>
                  <button
                    className="gh-btn-close-dropdown"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="gh-switcher-menu-list">
                  {challenges.map((c, idx) => {
                    const cSummary = getChallengeHebrewSummary(c.slug);
                    const isCurrent = c.slug === currentChallenge?.slug;
                    return (
                      <div
                        key={c.id}
                        className={`gh-switcher-item ${isCurrent ? "selected" : ""}`}
                        onClick={() => {
                          onSelectChallenge(c.slug);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="gh-switcher-item-left">
                          <span className="gh-pr-tag">#{idx + 1}</span>
                          <span className="gh-pr-item-title">
                            {cSummary ? cSummary.hebrewTitle : c.title}
                          </span>
                        </div>
                        <span className={`gh-level-pill level-${c.level}`}>
                          L{c.level}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Solved Progress Counter */}
          <div className="gh-progress-pill" title="אתגרים שנפתרו בהצלחה">
            <span>מפוענחים:</span>
            <strong>{solvedCount} / {totalCount}</strong>
          </div>

          {/* User Auth Section */}
          {authUser ? (
            <div className="gh-user-menu">
              {authUser.avatar_url && (
                <img
                  src={authUser.avatar_url}
                  alt={authUser.username}
                  className="gh-avatar"
                />
              )}
              <span className="gh-username">@{authUser.username}</span>
              <button
                onClick={onSignOut}
                className="gh-btn-signout"
                title="התנתק מהמערכת"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginWithGithub}
              className="gh-btn-signin"
              title="התחבר עם GitHub כדי לשמור התקדמות"
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </header>

      {/* 2. Authentic PR Title & Meta Header */}
      <div className="gh-pr-header">
        <div className="gh-pr-title-row">
          <h1 className="gh-pr-title">
            <span>{prTitle}</span>
            <span className="gh-pr-num">#{prNumber}</span>
          </h1>

          {/* Finish Review Green Button */}
          <button
            className="gh-btn-review-changes"
            onClick={onOpenReviewModal}
            disabled={isSubmitting}
            title={commentsCount === 0 ? "סמן שורות בקוד כדי להוסיף הערות לפני שליחה" : "שלח ביקורת לשפיטת AI"}
          >
            {isSubmitting ? (
              <span>Evaluating... ⏳</span>
            ) : (
              <>
                <span>Review changes</span>
                {commentsCount > 0 && (
                  <span className="gh-review-counter">{commentsCount}</span>
                )}
                <span className="gh-caret">▾</span>
              </>
            )}
          </button>
        </div>

        {/* PR Status Line */}
        <div className="gh-pr-meta-line">
          <span className="gh-status-badge open">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.5 5.396l2.323-2.323a.75.75 0 0 1 1.06 1.06L10.56 6.457l2.323 2.323a.75.75 0 1 1-1.06 1.06L9.5 7.518l-2.323 2.323a.75.75 0 0 1-1.06-1.06l2.323-2.323-2.323-2.323a.75.75 0 0 1 1.06-1.06ZM3 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm0 9.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm10-9.5a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
            </svg>
            <span>Open</span>
          </span>

          <span className="gh-pr-author-line">
            <strong>junior-dev</strong> wants to merge 1 commit into <code>main</code> from <code>patch-{prNumber}</code>
          </span>

          {currentChallenge && (
            <span className={`gh-level-indicator level-${currentChallenge.level}`}>
              Level {currentChallenge.level}
            </span>
          )}
        </div>

        {/* 3. GitHub PR Navigation Tabs */}
        <nav className="gh-pr-tabs" aria-label="Pull request tabs">
          <button
            className={`gh-pr-tab ${activeTab === "conversation" ? "active" : ""}`}
            onClick={() => onTabChange("conversation")}
          >
            <span>💬 Conversation</span>
            <span className="gh-tab-counter">{hasEvaluated ? "2" : "1"}</span>
          </button>

          <button
            className={`gh-pr-tab ${activeTab === "files" ? "active" : ""}`}
            onClick={() => onTabChange("files")}
          >
            <span>📄 Files changed</span>
            <span className="gh-tab-counter">1</span>
            {commentsCount > 0 && (
              <span className="gh-tab-comments-dot" title={`${commentsCount} הערות פעילות`} />
            )}
          </button>
        </nav>
      </div>
    </div>
  );
};
