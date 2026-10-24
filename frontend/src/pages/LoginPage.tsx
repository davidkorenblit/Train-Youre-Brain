// ============================================================================
// CodeReview Arena - Dedicated Gatekeeper Login Page
// Clean, developer-grade authentication gate before entering the Arena
// ============================================================================

import React from "react";

interface LoginPageProps {
  onLoginWithGithub: () => void;
  onContinueAsGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginWithGithub,
  onContinueAsGuest,
}) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#080c14",
        padding: "20px",
        direction: "rtl",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#0d1322",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "14px",
          padding: "36px 32px",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.8)",
          textAlign: "center",
          color: "#f8fafc",
        }}
      >
        {/* Emblem & Branding */}
        <div
          style={{
            width: "56px",
            height: "56px",
            margin: "0 auto 16px auto",
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
          }}
        >
          🧠
        </div>

        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            marginBottom: "8px",
          }}
        >
          CodeReview Arena
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "#94a3b8",
            lineHeight: 1.6,
            marginBottom: "28px",
          }}
        >
          סימולטור מתקדם לאימון מפתחים בקריאת קוד וביצוע Code Review מקצועי (GitHub PR-style), עם הערכה מיידית מבוססת AI.
        </p>

        {/* Feature Highlights */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "8px",
            padding: "14px 16px",
            marginBottom: "28px",
            textAlign: "right",
            fontSize: "13px",
            color: "#cbd5e1",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#10b981", fontSize: "16px" }}>✓</span>
            <span>35 אתגרי קוד ריאליסטיים ב-3 רמות קושי</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#10b981", fontSize: "16px" }}>✓</span>
            <span>סימון שורות PR ואימון עורך Monaco מלא</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#10b981", fontSize: "16px" }}>✓</span>
            <span>שפיטת AI קפדנית, מדד SNR ומשוב קונסטרוקטיבי</span>
          </div>
        </div>

        {/* Primary Action: GitHub OAuth */}
        <button
          onClick={onLoginWithGithub}
          style={{
            width: "100%",
            padding: "13px 20px",
            background: "#24292e",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#2f363d";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#24292e";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>התחבר באמצעות GitHub</span>
        </button>

        {/* Guest Mode Option */}
        {onContinueAsGuest && (
          <div style={{ marginTop: "16px" }}>
            <button
              onClick={onContinueAsGuest}
              style={{
                background: "transparent",
                border: "none",
                color: "#64748b",
                fontSize: "13px",
                cursor: "pointer",
                textDecoration: "underline",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#94a3b8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#64748b";
              }}
            >
              המשך כאורח במצב תצוגה
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
