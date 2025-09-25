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
    const meta = document.querySelector('meta[name="theme-color"]') || (() => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'theme-color');
      document.head.appendChild(m);
      return m;
    })();
    // Force a solid dark theme color to avoid any iOS Safari tinting
    (meta as HTMLMetaElement).content = '#0f0f0f';
    console.info('[ThemeColor] Applied', (meta as HTMLMetaElement).content, { ua: navigator.userAgent });
  } catch (e) {
    console.warn('[ThemeColor] Failed to set', e);
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
