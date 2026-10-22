import React, { useState } from "react";
import { ChallengeMetadata, SolvedRecord } from "../types";

interface SidebarProps {
  challenges: ChallengeMetadata[];
  isLoading?: boolean;
  selectedSlug: string | null;
  isOpen: boolean;
  solvedMap: Record<string, SolvedRecord>;
  onSelectChallenge: (slug: string) => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  challenges,
  isLoading = false,
  selectedSlug,
  isOpen,
  solvedMap,
  onSelectChallenge,
}) => {
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChallenges = challenges.filter((c) => {
    const matchesLevel = levelFilter === null || c.level === levelFilter;
    const matchesSearch =
      searchQuery === "" ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <aside className={`sidebar ${isOpen ? "" : "collapsed"}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">
          <span>אתגרי קוד ({challenges.length})</span>
          <span>🎯</span>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="חיפוש אתגר..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="level-filters">
          <button
            className={`filter-chip ${levelFilter === null ? "active" : ""}`}
            onClick={() => setLevelFilter(null)}
          >
            הכל ({challenges.length})
          </button>
          <button
            className={`filter-chip ${levelFilter === 1 ? "active" : ""}`}
            onClick={() => setLevelFilter(1)}
          >
            🟢 רמה 1 (15)
          </button>
          <button
            className={`filter-chip ${levelFilter === 2 ? "active" : ""}`}
            onClick={() => setLevelFilter(2)}
          >
            🟡 רמה 2 (10)
          </button>
          <button
            className={`filter-chip ${levelFilter === 3 ? "active" : ""}`}
            onClick={() => setLevelFilter(3)}
          >
            🔴 רמה 3 (10)
          </button>
        </div>
      </div>

      <div className="challenge-list">
        {isLoading ? (
          <div className="empty-findings">
            <span className="loading-spinner"></span>
            <p style={{ marginTop: "8px" }}>טוען אתגרים מ-Supabase...</p>
          </div>
        ) : (
          <>
            {filteredChallenges.map((item) => {
              const isSelected = item.slug === selectedSlug;
              const solvedInfo = solvedMap[item.id] || solvedMap[item.slug];

              return (
                <div
                  key={item.id}
                  className={`challenge-item ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelectChallenge(item.slug)}
                >
                  <div className="challenge-info">
                    <span className="challenge-title">{item.title}</span>
                    <div className="challenge-meta">
                      <span>רמה {item.level}</span>
                      <span>•</span>
                      <span>{item.language}</span>
                    </div>
                  </div>

                  {solvedInfo && (
                    <div className="solved-indicator" title={`נפתר בציון ${solvedInfo.score}`}>
                      <span>✓</span>
                      <span>{solvedInfo.score}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredChallenges.length === 0 && (
              <div className="empty-findings">לא נמצאו אתגרים התואמים לחיפוש.</div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
