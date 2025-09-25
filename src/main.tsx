import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalErrorHandling, overrideConsole } from "./lib/errorSuppression";

// Initialize error handling and suppression
setupGlobalErrorHandling();
overrideConsole();

// Ensure browser UI (iOS Safari) matches app background
(function ensureThemeColor() {
  try {
    const root = document.querySelector('meta[name="theme-color"]') || (() => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'theme-color');
      document.head.appendChild(m);
      return m;
    })();
    const bgVar = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
    if (bgVar) {
      const color = `hsl(${bgVar})`;
      (root as HTMLMetaElement).content = color;
    }
  } catch {}
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
