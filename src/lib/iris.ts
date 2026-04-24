// Iris overlay transition — port of app-helpers.jsx iris helpers.
import { useEffect } from "react";

export type Origin = { x: number; y: number };

export function irisNavigate(url: string, color: string, origin: Origin): void {
  const iris = document.getElementById("iris");
  if (!iris) { window.location.href = url; return; }
  iris.style.setProperty("--iris-color", color);
  iris.style.setProperty("--iris-x", origin.x + "px");
  iris.style.setProperty("--iris-y", origin.y + "px");
  iris.setAttribute("data-state", "open");
  requestAnimationFrame(() => {
    iris.setAttribute("data-state", "expanding");
  });
  try { sessionStorage.setItem("iris_color", color); } catch { /* noop */ }
  setTimeout(() => { window.location.href = url; }, 800);
}

// Reset iris on visibility/bfcache restore so returning users don't see a stuck overlay
export function useIrisReset(): void {
  useEffect(() => {
    const reset = () => {
      const iris = document.getElementById("iris");
      if (iris) iris.setAttribute("data-state", "idle");
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") reset();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", reset);
    reset();
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", reset);
    };
  }, []);
}

// Consume a pending iris color (set by homepage before navigation) and play
// a "closing" animation once the article mounts.
export function useIrisIntro(): void {
  useEffect(() => {
    let color: string | null = null;
    try { color = sessionStorage.getItem("iris_color"); } catch { /* noop */ }
    if (!color) return;
    const iris = document.getElementById("iris");
    if (!iris) return;
    iris.style.setProperty("--iris-color", color);
    iris.style.setProperty("--iris-x", "50%");
    iris.style.setProperty("--iris-y", "50%");
    iris.setAttribute("data-state", "expanding");
    requestAnimationFrame(() => {
      iris.style.transition = "opacity 400ms";
      iris.style.opacity = "0";
      setTimeout(() => {
        iris.setAttribute("data-state", "idle");
        iris.style.opacity = "";
      }, 500);
    });
    try { sessionStorage.removeItem("iris_color"); } catch { /* noop */ }
  }, []);
}
