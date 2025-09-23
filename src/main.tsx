import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupGlobalErrorHandling, overrideConsole } from "./lib/errorSuppression";

// Initialize error handling and suppression
setupGlobalErrorHandling();
overrideConsole();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
