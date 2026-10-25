// ============================================================================
// CodeReview Arena - GitHub Twin Main Application Component
// ============================================================================

import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { CodeEditor } from "./components/CodeEditor";
import { InlineCommentForm } from "./components/InlineCommentForm";
import { ConversationView } from "./components/ConversationView";
import { ReviewSubmitModal } from "./components/ReviewSubmitModal";
import { LoginPage } from "./pages/LoginPage";
import {
  ChallengeMetadata,
  ChallengeDetail,
  UserComment,
  SubmitReviewResponse,
  SolvedRecord,
  AuthUser,
} from "./types";
import { fetchChallenges, fetchChallenge, submitReview } from "./services/api";
import {
  signInWithGithub,
  signOut,
  getCurrentUser,
  getAuthToken,
  onAuthStateChange,
} from "./services/auth";

const STORAGE_SOLVED_KEY = "codereview_arena_solved_map";

export function App() {
  // 1. Data State
  const [challenges, setChallenges] = useState<ChallengeMetadata[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeDetail | null>(null);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Navigation State: "files" (Files changed) vs "conversation"
  const [activeTab, setActiveTab] = useState<"files" | "conversation">("files");

  // 3. User PR Review Comments & Form State
  const [comments, setComments] = useState<UserComment[]>([]);
  const [activeLineForComment, setActiveLineForComment] = useState<number | null>(null);
  const [commentFormTopPx, setCommentFormTopPx] = useState(40);

  // 4. Submission & AI Verdict State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResponse, setEvaluationResponse] = useState<SubmitReviewResponse | null>(null);

  // 5. Auth State
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // 6. Solved Map from LocalStorage
  const [solvedMap, setSolvedMap] = useState<Record<string, SolvedRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SOLVED_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Track GitHub authentication state
  useEffect(() => {
    getCurrentUser()
      .then(setAuthUser)
      .catch(() => {})
      .finally(() => setIsAuthChecking(false));

    const unsubscribe = onAuthStateChange((user) => {
      setAuthUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Initial load of all 35 challenges
  useEffect(() => {
    async function init() {
      setIsLoadingChallenges(true);
      setError(null);
      try {
        const list = await fetchChallenges();
        setChallenges(list);

        if (list.length > 0) {
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

  // Load a single challenge detail
  const loadChallenge = async (slug: string) => {
    setIsLoadingDetail(true);
    setActiveLineForComment(null);
    setComments([]);
    setEvaluationResponse(null);
    setActiveTab("files");

    try {
      const detail = await fetchChallenge(slug);
      setCurrentChallenge(detail);
      localStorage.setItem("codereview_last_slug", slug);
    } catch (err: any) {
      setError(err.message || `Failed to load challenge ${slug}`);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Line click in Monaco Editor
  const handleLineClick = (lineNumber: number, topPx: number) => {
    setActiveLineForComment(lineNumber);
    setCommentFormTopPx(topPx);
  };

  // Save comment from inline form
  const handleSaveComment = (newComment: UserComment) => {
    setComments((prev) => {
      const filtered = prev.filter((c) => c.line_number !== newComment.line_number);
      return [...filtered, newComment].sort((a, b) => a.line_number - b.line_number);
    });
    setActiveLineForComment(null);
  };

  // Delete comment
  const handleDeleteComment = (lineNumber: number) => {
    setComments((prev) => prev.filter((c) => c.line_number !== lineNumber));
    if (activeLineForComment === lineNumber) {
      setActiveLineForComment(null);
    }
  };

  // Submit Review to AI Judge
  const handleSubmitReview = async () => {
    if (!currentChallenge || comments.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getAuthToken().catch(() => null);
      const result = await submitReview(
        currentChallenge.slug,
        comments,
        authUser?.id,
        token
      );
      setEvaluationResponse(result);
      setIsReviewModalOpen(false);

      // Persist solved record
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

      // Switch to Conversation tab to view the AI Judge review response
      setActiveTab("conversation");
    } catch (err: any) {
      setError(err.message || "שגיאה בשיגור הביקורת ל-AI");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Next Challenge handler
  const handleNextChallenge = () => {
    if (!currentChallenge || challenges.length === 0) return;
    const currentIndex = challenges.findIndex((c) => c.slug === currentChallenge.slug);
    const nextIndex = (currentIndex + 1) % challenges.length;
    const nextChallenge = challenges[nextIndex];
    loadChallenge(nextChallenge.slug);
  };

  // Loading state
  if (isAuthChecking) {
    return (
      <div className="gh-loading-screen">
        <span className="gh-spinner" />
        <p>Loading CodeReview Arena...</p>
      </div>
    );
  }

  // Gatekeeper Login Page
  if (!authUser && !isGuestMode) {
    return (
      <LoginPage
        onLoginWithGithub={signInWithGithub}
        onContinueAsGuest={() => setIsGuestMode(true)}
      />
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      setIsGuestMode(false);
      setAuthUser(null);
    }
  };

  const activeExistingComment = comments.find((c) => c.line_number === activeLineForComment);
  const codeLinesCount = currentChallenge?.buggy_code?.split("\n").length || 0;

  return (
    <div className="gh-app-root">
      {/* 1. Global GitHub Header & PR Meta */}
      <Header
        currentChallenge={currentChallenge}
        challenges={challenges}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        commentsCount={comments.length}
        solvedCount={Object.keys(solvedMap).length}
        totalCount={challenges.length}
        authUser={authUser}
        onSelectChallenge={loadChallenge}
        onLoginWithGithub={signInWithGithub}
        onSignOut={handleSignOut}
        onOpenReviewModal={() => setIsReviewModalOpen(true)}
        isSubmitting={isSubmitting}
        hasEvaluated={evaluationResponse !== null}
      />

      {/* Global Error Banner */}
      {error && (
        <div className="gh-flash-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* 2. Main Content Area */}
      <main className="gh-main-container">
        {isLoadingChallenges || isLoadingDetail ? (
          <div className="gh-loading-box">
            <span className="gh-spinner" />
            <p>Loading Pull Request details...</p>
          </div>
        ) : !currentChallenge ? (
          <div className="gh-empty-state">
            <p>No Pull Request selected. Choose one from the PR switcher above.</p>
          </div>
        ) : activeTab === "conversation" ? (
          /* TAB 1: Conversation View (PR thread & AI review) */
          <ConversationView
            challenge={currentChallenge}
            evaluation={evaluationResponse?.evaluation || null}
            solutionCode={evaluationResponse?.solution_code || null}
            onGoToFilesChanged={() => setActiveTab("files")}
            onNextChallenge={handleNextChallenge}
          />
        ) : (
          /* TAB 2: Files Changed View (GitHub Diff Box with Monaco Editor) */
          <div className="gh-files-changed-view">
            {/* Diff Summary Bar */}
            <div className="gh-diff-summary-bar">
              <div className="gh-diff-stat">
                <span>Showing <strong>1 changed file</strong> with <strong>{codeLinesCount} lines</strong></span>
              </div>

              {/* Pending Comments Summary */}
              {comments.length > 0 && (
                <div className="gh-pending-badge">
                  <span>{comments.length} review comment(s) ready</span>
                </div>
              )}
            </div>

            {/* The Diff File Container */}
            <div className="gh-file-box">
              {/* File Header */}
              <div className="gh-file-header">
                <div className="gh-file-info">
                  <span className="gh-diff-icon">📄</span>
                  <span className="gh-file-path">src/{currentChallenge.slug}.py</span>
                </div>

                <div className="gh-file-actions">
                  <span className="gh-language-tag">{currentChallenge.language || "python"}</span>
                  <button
                    className="gh-btn-copy-code"
                    onClick={() => navigator.clipboard.writeText(currentChallenge.buggy_code)}
                    title="Copy raw code"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Existing Comments Bar if any */}
              {comments.length > 0 && (
                <div className="gh-active-comments-shelf">
                  <div className="gh-shelf-title">
                    <span>Active Findings ({comments.length}):</span>
                  </div>
                  <div className="gh-shelf-tags">
                    {comments.map((c) => (
                      <span key={c.line_number} className="gh-shelf-tag">
                        <strong>L{c.line_number}:</strong> {c.comment.substring(0, 45)}...
                        <button
                          className="gh-btn-remove-finding"
                          onClick={() => handleDeleteComment(c.line_number)}
                          title="Remove comment"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Monaco Code Editor */}
              <div className="gh-editor-wrapper">
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
              </div>
            </div>

            {/* Bottom Bar: Finish Review CTA */}
            <div className="gh-bottom-review-cta">
              <div className="gh-cta-text">
                <span>Finished inspecting the code?</span>
              </div>
              <button
                className="gh-btn-review-changes large"
                onClick={() => setIsReviewModalOpen(true)}
                disabled={comments.length === 0 || isSubmitting}
              >
                <span>Finish your review ({comments.length})</span>
                <span className="gh-caret">▾</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Review Submission Modal (GitHub Submit Review Dialog) */}
      {isReviewModalOpen && (
        <ReviewSubmitModal
          comments={comments}
          isSubmitting={isSubmitting}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
}

export default App;
