// ============================================================================
// CodeReview Arena - Main Application Controller
// Flow: Gatekeeper (LoginPage) -> Hub / Categories (HubPage) -> 3-Pane Workspace
// ============================================================================

import { useState, useEffect } from "react";
import { LoginPage } from "./pages/LoginPage";
import { HubPage } from "./pages/HubPage";
import { Workspace } from "./components/Workspace";
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
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. User PR Review Comments & AI Evaluation State
  const [comments, setComments] = useState<UserComment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResponse, setEvaluationResponse] = useState<SubmitReviewResponse | null>(null);

  // 3. Auth State
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // 4. Solved Map from LocalStorage
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
      } catch (err: any) {
        setError(err.message || "Failed to load challenges from API");
      } finally {
        setIsLoadingChallenges(false);
      }
    }
    init();
  }, []);

  // Load challenge detail when user selects from Hub
  const handleSelectChallenge = async (slug: string) => {
    setSelectedSlug(slug);
    setIsLoadingDetail(true);
    setComments([]);
    setEvaluationResponse(null);

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

  // Back to Hub / Category Browser
  const handleBackToHub = () => {
    setSelectedSlug(null);
    setCurrentChallenge(null);
    setComments([]);
    setEvaluationResponse(null);
  };

  // Save comment from inline form
  const handleSaveComment = (newComment: UserComment) => {
    setComments((prev) => {
      const filtered = prev.filter((c) => c.line_number !== newComment.line_number);
      return [...filtered, newComment].sort((a, b) => a.line_number - b.line_number);
    });
  };

  // Delete comment
  const handleDeleteComment = (lineNumber: number) => {
    setComments((prev) => prev.filter((c) => c.line_number !== lineNumber));
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
    handleSelectChallenge(nextChallenge.slug);
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      setIsGuestMode(false);
      setAuthUser(null);
      setSelectedSlug(null);
      setCurrentChallenge(null);
    }
  };

  // 1. Initial Auth & Challenges Loading screen
  if (isAuthChecking || isLoadingChallenges) {
    return (
      <div className="cr-loading-screen">
        <span className="cr-spinner" />
        <p>טוען את CodeReview Arena...</p>
      </div>
    );
  }

  // 2. Gatekeeper: Show LoginPage if unauthenticated
  if (!authUser && !isGuestMode) {
    return (
      <LoginPage
        onLoginWithGithub={signInWithGithub}
        onContinueAsGuest={() => setIsGuestMode(true)}
      />
    );
  }

  // 3. Main Views: Workspace (if challenge chosen) vs HubPage (Dashboard & Categories)
  return (
    <div className="cr-app-container">
      {/* Global Error Banner */}
      {error && (
        <div className="cr-flash-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {selectedSlug && currentChallenge ? (
        isLoadingDetail ? (
          <div className="cr-loading-screen">
            <span className="cr-spinner" />
            <p>טוען אתגר ומפרט טכני...</p>
          </div>
        ) : (
          <Workspace
            challenge={currentChallenge}
            comments={comments}
            authUser={authUser}
            solvedRecord={solvedMap[currentChallenge.id]}
            isSubmitting={isSubmitting}
            evaluationResponse={evaluationResponse}
            onBackToHub={handleBackToHub}
            onSaveComment={handleSaveComment}
            onDeleteComment={handleDeleteComment}
            onSubmitReview={handleSubmitReview}
            onNextChallenge={handleNextChallenge}
          />
        )
      ) : (
        <HubPage
          challenges={challenges}
          solvedMap={solvedMap}
          authUser={authUser}
          onSelectChallenge={handleSelectChallenge}
          onSignOut={handleSignOut}
          onLoginWithGithub={signInWithGithub}
        />
      )}
    </div>
  );
}

export default App;
