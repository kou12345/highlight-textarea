import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HighlightedTextarea } from "./HighlightedTextarea.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HighlightedTextarea />
  </StrictMode>
);
