// ============================================================================
// CodeReview Arena - Hub & Category Browser Page
// Colorful categories, progress telemetry, and rich Hebrew hover previews
// ============================================================================

import React, { useState } from "react";
import { ChallengeMetadata, SolvedRecord, AuthUser } from "../types";
import { getChallengeHebrewSummary } from "../data/challengeSummaries";

interface HubPageProps {
  challenges: ChallengeMetadata[];
  solvedMap: Record<string, SolvedRecord>;
  authUser: AuthUser | null;
  onSelectChallenge: (slug: string) => void;
  onSignOut: () => void;
  onLoginWithGithub: () => void;
}

export const HubPage: React.FC<HubPageProps> = ({
  challenges,
  solvedMap,
  authUser,
  onSelectChallenge,
  onSignOut,
  onLoginWithGithub,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(1);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const solvedCount = Object.keys(solvedMap).length;
  const totalCount = challenges.length;
  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  // Level statistics
  const level1 = challenges.filter((c) => c.level === 1);
  const level2 = challenges.filter((c) => c.level === 2);
  const level3 = challenges.filter((c) => c.level === 3);

  const level1Solved = level1.filter((c) => solvedMap[c.id]).length;
  const level2Solved = level2.filter((c) => solvedMap[c.id]).length;
  const level3Solved = level3.filter((c) => solvedMap[c.id]).length;

  const activeCategoryList = challenges.filter((c) => c.level === selectedLevel);
  const hoveredSummary = hoveredSlug ? getChallengeHebrewSummary(hoveredSlug) : null;
  const hoveredChallenge = challenges.find((c) => c.slug === hoveredSlug);

  return (
    <div className="hub-root">
      {/* 1. Header Bar */}
      <header className="hub-topbar">
        <div className="hub-brand">
          <span className="hub-logo">🧠</span>
          <div>
            <h1 className="hub-title">CodeReview Arena</h1>
            <span className="hub-subtitle">סימולטור אימון מתקדם לביקורת קוד</span>
          </div>
        </div>

        <div className="hub-topbar-actions">
          {authUser ? (
            <div className="hub-user-pill">
              {authUser.avatar_url && (
                <img src={authUser.avatar_url} alt={authUser.username} className="hub-avatar" />
              )}
              <span className="hub-username">@{authUser.username}</span>
              <button onClick={onSignOut} className="hub-btn-signout" title="יציאה">
                יציאה
              </button>
            </div>
          ) : (
            <button onClick={onLoginWithGithub} className="hub-btn-signin">
              התחבר עם GitHub
            </button>
          )}
        </div>
      </header>

      {/* 2. Hero Progress Bar */}
      <div className="hub-hero-banner">
        <div className="hub-progress-card">
          <div className="hub-progress-header">
            <div>
              <h2>{authUser ? `שלום, ${authUser.username}!` : "שלום, סוקר קוד!"}</h2>
              <p>בחר רמת קושי, עיין בתקציר הבעיה בעברית, והתחל בביקורת הקוד.</p>
            </div>
            <div className="hub-stat-bubble">
              <span className="hub-stat-num">{solvedCount} / {totalCount}</span>
              <span className="hub-stat-label">אתגרים פוענחו ({progressPercent}%)</span>
            </div>
          </div>

          <div className="hub-progress-track">
            <div className="hub-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* 3. Three Colorful Categories */}
      <div className="hub-categories-grid">
        {/* Category 1: Fundamentals */}
        <div
          className={`hub-category-card level-1 ${selectedLevel === 1 ? "active" : ""}`}
          onClick={() => setSelectedLevel(1)}
        >
          <div className="hub-card-top">
            <span className="hub-card-badge">Level 1</span>
            <span className="hub-card-count">{level1Solved}/{level1.length} פוענחו</span>
          </div>
          <h3>🟢 Fundamentals</h3>
          <p>אלגוריתמיקה, לוגיקה בסיסית, אינדקסים, תנאים ומניפולציות מחרוזת.</p>
          <div className="hub-card-footer">
            <span>15 אתגרים</span>
            <span className="hub-arrow">{selectedLevel === 1 ? "▼ נבחר" : "בחר ➔"}</span>
          </div>
        </div>

        {/* Category 2: Software Engineering */}
        <div
          className={`hub-category-card level-2 ${selectedLevel === 2 ? "active" : ""}`}
          onClick={() => setSelectedLevel(2)}
        >
          <div className="hub-card-top">
            <span className="hub-card-badge">Level 2</span>
            <span className="hub-card-count">{level2Solved}/{level2.length} פוענחו</span>
          </div>
          <h3>🟡 Software Engineering</h3>
          <p>ארכיטקטורת תוכנה, מבני נתונים מורכבים, תבניות עיצוב, דליפות זיכרון ו-OOP.</p>
          <div className="hub-card-footer">
            <span>10 אתגרים</span>
            <span className="hub-arrow">{selectedLevel === 2 ? "▼ נבחר" : "בחר ➔"}</span>
          </div>
        </div>

        {/* Category 3: Real-World Backend */}
        <div
          className={`hub-category-card level-3 ${selectedLevel === 3 ? "active" : ""}`}
          onClick={() => setSelectedLevel(3)}
        >
          <div className="hub-card-top">
            <span className="hub-card-badge">Level 3</span>
            <span className="hub-card-count">{level3Solved}/{level3.length} פוענחו</span>
          </div>
          <h3>🔴 Real-World Backend & Sec</h3>
          <p>אבטחת מידע (SQLi, IDOR, SSRF), Concurrency, נעילות ו-Production Failures.</p>
          <div className="hub-card-footer">
            <span>10 אתגרים</span>
            <span className="hub-arrow">{selectedLevel === 3 ? "▼ נבחר" : "בחר ➔"}</span>
          </div>
        </div>
      </div>

      {/* 4. Challenge List & Live Hover Preview Container */}
      <div className="hub-challenges-browser">
        <div className="hub-browser-header">
          <h3>
            רשימת אתגרים:{" "}
            {selectedLevel === 1
              ? "🟢 Level 1: Fundamentals"
              : selectedLevel === 2
              ? "🟡 Level 2: Software Engineering"
              : "🔴 Level 3: Real-World Backend"}
          </h3>
          <span className="hub-browser-hint">
            עבור עם העכבר מעל כל אתגר לתקציר מהיר בעברית, לחץ עליו כדי לפתוח את הקוד.
          </span>
        </div>

        <div className="hub-browser-content">
          {/* Left Column: Challenge Items List */}
          <div className="hub-challenges-list">
            {activeCategoryList.map((item, index) => {
              const itemSummary = getChallengeHebrewSummary(item.slug);
              const isSolved = Boolean(solvedMap[item.id]);
              const solvedRecord = solvedMap[item.id];
              const isHovered = hoveredSlug === item.slug;

              return (
                <div
                  key={item.id}
                  className={`hub-challenge-row ${isHovered ? "hovered" : ""} ${isSolved ? "solved" : ""}`}
                  onMouseEnter={() => setHoveredSlug(item.slug)}
                  onClick={() => onSelectChallenge(item.slug)}
                >
                  <div className="hub-row-left">
                    <span className="hub-row-index">#{index + 1}</span>
                    <div className="hub-row-titles">
                      <strong>{itemSummary ? itemSummary.hebrewTitle : item.title}</strong>
                      <span className="hub-row-slug">{item.slug}.py</span>
                    </div>
                  </div>

                  <div className="hub-row-right">
                    {isSolved ? (
                      <span className="hub-badge-solved">
                        ✅ פוענח ({solvedRecord?.score} נק')
                      </span>
                    ) : (
                      <span className="hub-badge-unsolved">טרם נבדק</span>
                    )}
                    <span className="hub-row-arrow">➔</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Floating Hebrew Preview Card */}
          <div className="hub-preview-column">
            {hoveredSummary && hoveredChallenge ? (
              <div className="hub-preview-card">
                <div className="hub-preview-header">
                  <span className={`hub-preview-level-badge level-${hoveredChallenge.level}`}>
                    Level {hoveredChallenge.level}
                  </span>
                  <span className="hub-preview-category">{hoveredSummary.category}</span>
                </div>

                <h4 className="hub-preview-title">{hoveredSummary.hebrewTitle}</h4>
                <div className="hub-preview-slug">{hoveredChallenge.slug}.py</div>

                <div className="hub-preview-section">
                  <strong>💡 תקציר הבאג והתרחיש:</strong>
                  <p>{hoveredSummary.summary}</p>
                </div>

                <div className="hub-preview-section">
                  <strong>🎯 התנהגות מצופה ותקינה:</strong>
                  <p>{hoveredSummary.expectedBehavior}</p>
                </div>

                {hoveredSummary.reviewTips && hoveredSummary.reviewTips.length > 0 && (
                  <div className="hub-preview-section tips">
                    <strong>🔍 דגשים לחקירה בקוד:</strong>
                    <ul>
                      {hoveredSummary.reviewTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  className="hub-btn-launch"
                  onClick={() => onSelectChallenge(hoveredChallenge.slug)}
                >
                  פתח אתגר זה לביקורת קוד 🚀
                </button>
              </div>
            ) : (
              <div className="hub-preview-placeholder">
                <span className="hub-placeholder-icon">👆</span>
                <p>עבור עם העכבר מעל אחד האתגרים ברשימה כדי לראות את התקציר המלא בעברית כאן.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
