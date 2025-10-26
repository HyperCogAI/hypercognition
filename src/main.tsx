import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalErrorHandling, overrideConsole } from "./lib/errorSuppression";

// Initialize error handling and suppression
setupGlobalErrorHandling();
overrideConsole();

// Dynamic theme-color meta tag that updates based on theme
(function setupThemeColor() {
  try {
    const meta = document.querySelector('meta[name="theme-color"]') || (() => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'theme-color');
      document.head.appendChild(m);
      return m;
    })();
    
    const updateThemeColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      (meta as HTMLMetaElement).content = isDark ? '#0f0f0f' : '#f8f9fa';
      console.info('[ThemeColor] Applied', (meta as HTMLMetaElement).content, { theme: isDark ? 'dark' : 'light' });
    };
    
    // Set initial color
    updateThemeColor();
    
    // Watch for theme changes
    const observer = new MutationObserver(updateThemeColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  } catch (e) {
    console.warn('[ThemeColor] Failed to set', e);
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
