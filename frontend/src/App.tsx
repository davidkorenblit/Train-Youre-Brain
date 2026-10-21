import { useState, useEffect } from "react";

const BACKEND_URL =
  import.meta.env.VITE_API_URL || "https://train-youre-brain.dycoren18.workers.dev";

export function App() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading");
  const [latency, setLatency] = useState<number | null>(null);
  const [apiData, setApiData] = useState<any>(null);

  const checkBackend = async () => {
    setStatus("loading");
    const start = performance.now();
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLatency(Math.round(performance.now() - start));
      setApiData(data);
      setStatus("connected");
    } catch (err: any) {
      setLatency(null);
      setApiData({ error: err.message || "Failed to fetch" });
      setStatus("error");
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  return (
    <div className="container">
      <div className="logo-icon">🧠</div>
      <h1>CodeReview Arena</h1>
      <p className="subtitle">כפרה, עובדים ומחכים להוראות מהבאקאנד 🚀</p>

      <div className="status-card">
        <div className="status-row">
          <span>חיבור לשרת (Cloudflare):</span>
          {status === "loading" && (
            <span className="badge badge-loading">
              <span className="ping-dot"></span> בודק חיבור...
            </span>
          )}
          {status === "connected" && (
            <span className="badge badge-connected">
              <span className="ping-dot"></span> מחובר ({latency}ms)
            </span>
          )}
          {status === "error" && (
            <span className="badge badge-error">
              <span className="ping-dot"></span> שגיאת חיבור
            </span>
          )}
        </div>

        {apiData && (
          <div className="log-box">
            {JSON.stringify(apiData, null, 2)}
          </div>
        )}
      </div>

      <button
        className="btn"
        onClick={checkBackend}
        disabled={status === "loading"}
      >
        {status === "loading" ? "בודק..." : "בדוק חיבור לשרת שוב"}
      </button>
    </div>
  );
}

export default App;
