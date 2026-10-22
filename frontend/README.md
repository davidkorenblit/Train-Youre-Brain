# 🎨 CodeReview Arena - Frontend

Modern, interactive code review interface built with **React 18**, **Vite**, and **TypeScript**, styled to emulate the GitHub Pull Request review experience.

---

## 🛠️ Tech Stack

- **Core:** React 18 + TypeScript
- **Bundler:** Vite
- **Editor Engine:** `@monaco-editor/react` (Monaco Editor / VS Code engine)
- **Deployment:** GitHub Pages

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/      # Monaco editor wrapper, inline comments, challenge explorer
│   ├── services/        # Edge API communication client
│   ├── types.ts         # Frontend data interfaces & types
│   ├── App.tsx          # Main application layout and review workflow
│   ├── index.css        # Responsive dark-theme styling
│   └── main.tsx         # Application entry point
├── vite.config.ts       # Vite build configuration
└── package.json
```

---

## 🎯 Key Client Features

- **Monaco Code Viewer:** Read-only syntax-highlighted editor with glyph margin triggers.
- **GitHub PR-Style Inline Commenting:** Click `+` on any code line to open an inline review card.
- **Challenge Explorer:** Browse and filter 35 challenges by difficulty level (Fundamentals, Software Engineering, Real-World Backend).
- **Instant AI Feedback Display:** View overall score (0–100), signal-to-noise ratio, AI remarks, and code diff comparisons.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```
