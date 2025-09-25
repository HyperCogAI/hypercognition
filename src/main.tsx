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

    const varVal = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
    // Convert H S% L% (space or comma separated) to HEX for iOS Safari reliability
    const toHex = (h: number, s: number, l: number) => {
      s /= 100; l /= 100;
      const k = (n: number) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      const rgb = [f(0), f(8), f(4)].map(x => Math.round(255 * x).toString(16).padStart(2, '0')).join('');
      return `#${rgb}`;
    };

    let hex = '#0f0f0f';
    const match = varVal.match(/([\d.]+)\s*,?\s*([\d.]+)%\s*,?\s*([\d.]+)%/);
    if (match) {
      const h = parseFloat(match[1]);
      const s = parseFloat(match[2]);
      const l = parseFloat(match[3]);
      hex = toHex(h, s, l);
    }
    (meta as HTMLMetaElement).content = hex;
  } catch {}
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
