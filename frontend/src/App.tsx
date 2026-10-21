import { useState, useEffect } from "react";

const BACKEND_URL =
  import.meta.env.VITE_API_URL || "https://train-youre-brain.dycoren18.workers.dev";

interface IntegrationResult {
  success: boolean;
  totalLatencyMs: number;
  services: {
    frontend: string;
    worker: string;
    database: {
      status: string;
      sample: string;
    };
    ai: {
      status: string;
      response: string;
    };
  };
  timestamp: string;
}

export function App() {
  const [basicStatus, setBasicStatus] = useState<"loading" | "connected" | "error">("loading");
  const [basicLatency, setBasicLatency] = useState<number | null>(null);

  const [testingAll, setTestingAll] = useState(false);
  const [integrationResult, setIntegrationResult] = useState<IntegrationResult | null>(null);
  const [integrationError, setIntegrationError] = useState<string | null>(null);

  const checkBasicHealth = async () => {
    setBasicStatus("loading");
    const start = performance.now();
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
      setBasicLatency(Math.round(performance.now() - start));
      setBasicStatus("connected");
    } catch {
      setBasicLatency(null);
      setBasicStatus("error");
    }
  };

  const runFullIntegrationTest = async () => {
    setTestingAll(true);
    setIntegrationError(null);
    setIntegrationResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/test-integration`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setIntegrationResult(data);
    } catch (err: any) {
      setIntegrationError(err.message || "שגיאה בבדיקת האינטגרציה");
    } finally {
      setTestingAll(false);
    }
  };

  useEffect(() => {
    checkBasicHealth();
  }, []);

  return (
    <div className="container">
      <div className="logo-icon">🧠</div>
      <h1>CodeReview Arena</h1>
      <p className="subtitle">כפרה, עובדים ומחכים להוראות מהבאקאנד 🚀</p>

      <div className="status-card">
        <div className="status-row">
          <span>חיבור ל-Cloudflare Worker:</span>
          {basicStatus === "loading" && (
            <span className="badge badge-loading">
              <span className="ping-dot"></span> בודק...
            </span>
          )}
          {basicStatus === "connected" && (
            <span className="badge badge-connected">
              <span className="ping-dot"></span> פעיל ({basicLatency}ms)
            </span>
          )}
          {basicStatus === "error" && (
            <span className="badge badge-error">
              <span className="ping-dot"></span> שגיאה
            </span>
          )}
        </div>
      </div>

      <button
        className="btn"
        onClick={runFullIntegrationTest}
        disabled={testingAll}
      >
        {testingAll ? "⏳ בודק את כל 4 השירותים..." : "🧪 בדיקת מערכת מלאה (4 השירותים)"}
      </button>

      {integrationError && (
        <div className="status-card error-card">
          <div className="error-title">❌ הבדיקה נכשלה:</div>
          <div className="log-box">{integrationError}</div>
        </div>
      )}

      {integrationResult && (
        <div className="status-card result-card">
          <div className="result-header">
            <span>🎉 כל 4 השירותים עובדים ומדברים!</span>
            <span className="latency-pill">{integrationResult.totalLatencyMs}ms</span>
          </div>

          <div className="checklist">
            <div className="check-item">
              <span className="check-icon">✅</span>
              <div>
                <strong>Frontend:</strong> {integrationResult.services.frontend}
              </div>
            </div>

            <div className="check-item">
              <span className="check-icon">✅</span>
              <div>
                <strong>Backend:</strong> {integrationResult.services.worker}
              </div>
            </div>

            <div className="check-item">
              <span className="check-icon">✅</span>
              <div>
                <strong>Database:</strong> {integrationResult.services.database.status}
                <div className="sub-detail">דגם אתגר: "{integrationResult.services.database.sample}"</div>
              </div>
            </div>

            <div className="check-item">
              <span className="check-icon">✅</span>
              <div>
                <strong>AI Model:</strong> {integrationResult.services.ai.status}
                <div className="ai-bubble">"{integrationResult.services.ai.response}"</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
