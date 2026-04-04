import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "@/app/App";
import "@/shared/styles/index.css";

function registerServiceWorker(): void {
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
        console.error("Service worker registration failed.", error);
      });
    });
  }
}

registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
