import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import Analytics from "./analytics/Analytics";
function Root() {
  const standalone = location.pathname.endsWith("Mediary-Studio.html");
  const [studio, setStudio] = React.useState(standalone || location.hash === "#studio");
  React.useEffect(() => {
    const change = () => setStudio(standalone || location.hash === "#studio");
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, [standalone]);
  return studio ? (
    <Analytics
      back={() => {
        if (standalone) location.assign("./Mediary-preview.html");
        else location.hash = "";
      }}
    />
  ) : (
    <App />
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
