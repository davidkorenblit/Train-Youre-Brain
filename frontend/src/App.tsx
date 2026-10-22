import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { CodeEditor } from "./components/CodeEditor";
import { InlineCommentForm } from "./components/InlineCommentForm";
import { ReviewDrawer } from "./components/ReviewDrawer";
import { ScoreModal } from "./components/ScoreModal";
import { MarkdownViewer } from "./components/MarkdownViewer";
import {
  ChallengeMetadata,
  ChallengeDetail,
  UserComment,
  SubmitReviewResponse,
  SolvedRecord,
} from "./types";
import { fetchChallenges, fetchChallenge, submitReview } from "./services/api";

const STORAGE_SOLVED_KEY = "codereview_arena_solved_map";

export function App() {
  // State
  const [challenges, setChallenges] = useState<ChallengeMetadata[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeDetail | null>(null);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [isLoadingChallengeDetail, setIsLoadingChallengeDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active view tab in workspace (Editor vs Problem README)
  const [activeTab, setActiveTab] = useState<"editor" | "instructions">("editor");

  // User PR comments on the current challenge
  const [comments, setComments] = useState<UserComment[]>([]);

  // Inline commenting state
  const [activeLineForComment, setActiveLineForComment] = useState<number | null>(null);
  const [commentFormTopPx, setCommentFormTopPx] = useState(40);

  // Sidebar and Drawer visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Submission & Scoring state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResponse, setEvaluationResponse] = useState<SubmitReviewResponse | null>(null);

  // Solved challenges map loaded from localStorage
  const [solvedMap, setSolvedMap] = useState<Record<string, SolvedRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SOLVED_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // 1. Initial Load: Fetch all 35 challenges
  useEffect(() => {
    async function init() {
      setIsLoadingChallenges(true);
      setError(null);
      try {
        const list = await fetchChallenges();
        setChallenges(list);

        if (list.length > 0) {
          // Load the first challenge or resume from last viewed
          const savedSlug = localStorage.getItem("codereview_last_slug") || list[0].slug;
          const target = list.find((c) => c.slug === savedSlug) || list[0];
          await loadChallenge(target.slug);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load challenges from API");
      } finally {
        setIsLoadingChallenges(false);
      }
    }
    init();
  }, []);

  // 2. Load a single challenge detail
  const loadChallenge = async (slug: string) => {
    setIsLoadingChallengeDetail(true);
    setActiveLineForComment(null);
    setComments([]);
    try {
      const detail = await fetchChallenge(slug);
      setCurrentChallenge(detail);
      localStorage.setItem("codereview_last_slug", slug);
    } catch (err: any) {
      setError(err.message || `Failed to load challenge ${slug}`);
    } finally {
      setIsLoadingChallengeDetail(false);
    }
  };

  // 3. User clicks line in Monaco Editor
  const handleLineClick = (lineNumber: number, topPx: number) => {
    setActiveLineForComment(lineNumber);
    setCommentFormTopPx(topPx);
  };

  // 4. Save comment from inline form
  const handleSaveComment = (newComment: UserComment) => {
    setComments((prev) => {
      // Replace existing comment on that line if any, otherwise append
      const filtered = prev.filter((c) => c.line_number !== newComment.line_number);
      return [...filtered, newComment].sort((a, b) => a.line_number - b.line_number);
    });
    setActiveLineForComment(null);
    setIsDrawerOpen(true); // Automatically open drawer so developer sees the finding added
  };

  // 5. Delete comment
  const handleDeleteComment = (lineNumber: number) => {
    setComments((prev) => prev.filter((c) => c.line_number !== lineNumber));
    if (activeLineForComment === lineNumber) {
      setActiveLineForComment(null);
    }
  };

  // 6. Edit comment
  const handleEditComment = (comment: UserComment) => {
    setActiveLineForComment(comment.line_number);
    setCommentFormTopPx(80); // Default visible top position
  };

  // 7. Submit Review to AI Judge
  const handleSubmitReview = async () => {
    if (!currentChallenge || comments.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitReview(currentChallenge.slug, comments);
      setEvaluationResponse(result);

      // Persist solved record in localStorage
      const updatedSolved: Record<string, SolvedRecord> = {
        ...solvedMap,
        [currentChallenge.id]: {
          score: result.evaluation.score,
          snr: result.evaluation.snr_rating,
          timestamp: new Date().toISOString(),
        },
      };
      setSolvedMap(updatedSolved);
      localStorage.setItem(STORAGE_SOLVED_KEY, JSON.stringify(updatedSolved));
    } catch (err: any) {
      setError(err.message || "שגיאה בשיגור הביקורת ל-AI");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 8. Next Challenge handler
  const handleNextChallenge = () => {
    if (!currentChallenge || challenges.length === 0) return;
    const currentIndex = challenges.findIndex((c) => c.slug === currentChallenge.slug);
    const nextIndex = (currentIndex + 1) % challenges.length;
    const nextChallenge = challenges[nextIndex];
    setEvaluationResponse(null);
    loadChallenge(nextChallenge.slug);
  };

  const activeExistingComment = comments.find((c) => c.line_number === activeLineForComment);

  return (
    <div className="app-shell">
      {/* Top Application Header */}
      <Header
        currentChallenge={currentChallenge}
        commentsCount={comments.length}
        isSidebarOpen={isSidebarOpen}
        isDrawerOpen={isDrawerOpen}
        isSubmitting={isSubmitting}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
        onSubmitReview={handleSubmitReview}
      />

      {/* Global Error Banner */}
      {error && (
        <div
          style={{
            background: "#450a0a",
            color: "#f87171",
            padding: "8px 20px",
            fontSize: "13px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="workspace">
        {/* Left: Challenge Explorer Sidebar */}
        <Sidebar
          challenges={challenges}
          isLoading={isLoadingChallenges}
          selectedSlug={currentChallenge?.slug || null}
          isOpen={isSidebarOpen}
          solvedMap={solvedMap}
          onSelectChallenge={(slug) => loadChallenge(slug)}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Center: IDE Panel */}
        <main className="editor-panel">
          {/* Editor Header Navigation Tabs */}
          <div className="panel-tabs">
            <button
              className={`panel-tab ${activeTab === "editor" ? "active" : ""}`}
              onClick={() => setActiveTab("editor")}
            >
              <span>📄</span>
              <span>{currentChallenge ? `${currentChallenge.slug}.py` : "buggy.py"}</span>
              {comments.length > 0 && (
                <span className="comments-counter" style={{ fontSize: "10px", padding: "1px 5px" }}>
                  {comments.length}
                </span>
              )}
            </button>

            <button
              className={`panel-tab ${activeTab === "instructions" ? "active" : ""}`}
              onClick={() => setActiveTab("instructions")}
            >
              <span>📖</span>
              <span>הוראות האתגר (README)</span>
            </button>
          </div>

          {/* Tab 1: Code Review in Monaco Editor */}
          {activeTab === "editor" && (
            <div className="editor-content">
              {isLoadingChallengeDetail ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)" }}>
                  <span className="loading-spinner"></span>
                  <p style={{ marginTop: "12px" }}>טוען אתגר...</p>
                </div>
              ) : currentChallenge ? (
                <>
                  <CodeEditor
                    code={currentChallenge.buggy_code}
                    language={currentChallenge.language || "python"}
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
                      onSave={handleSaveComment}
                      onCancel={() => setActiveLineForComment(null)}
                    />
                  )}
                </>
              ) : (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)" }}>
                  בחר אתגר מסרגל הניווט.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Instructions (Markdown Context) */}
          {activeTab === "instructions" && (
            currentChallenge ? (
              <MarkdownViewer content={currentChallenge.context_prompt} />
            ) : (
              <div className="instructions-view">
                <p>טוען הוראות...</p>
              </div>
            )
          )}
        </main>

        {/* Right: Review Findings Drawer */}
        <ReviewDrawer
          comments={comments}
          isOpen={isDrawerOpen}
          onDeleteComment={handleDeleteComment}
          onEditComment={handleEditComment}
          onSubmitReview={handleSubmitReview}
          isSubmitting={isSubmitting}
          onClose={() => setIsDrawerOpen(false)}
        />
      </div>

      {/* Scorecard & Diff Viewer Modal */}
      {evaluationResponse && currentChallenge && (
        <ScoreModal
          evaluation={evaluationResponse.evaluation}
          solutionCode={evaluationResponse.solution_code}
          buggyCode={currentChallenge.buggy_code}
          language={currentChallenge.language}
          onClose={() => setEvaluationResponse(null)}
          onNextChallenge={handleNextChallenge}
        />
      )}
    </div>
  );
}

export default App;
