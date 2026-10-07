import { useLocation, useNavigation } from "react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useStore } from "../lib/store";
/* Routes with loaders previously gave no sign that anything was happening
   between the click and the new page. This is that sign. */
export function NavigationProgress() {
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (busy) {
      // Only show for navigations slow enough to notice, so instant ones do
      // not flash a bar.
      const timer = setTimeout(() => setVisible(true), 140);
      return () => clearTimeout(timer);
    }
    // Let the completed bar finish its run before it disappears.
    const timer = setTimeout(() => setVisible(false), 260);
    return () => clearTimeout(timer);
  }, [busy]);
  if (!visible && !busy) return null;
  return (
    <div
      className={`navigation-progress ${busy && visible ? "is-loading" : "is-done"}`}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{busy ? "Loading page" : "Page loaded"}</span>
    </div>
  );
}

export { Header } from "./header";

export { default as Footer } from "./footer";

/* The panels themselves load on first use, or once the browser is idle,
   whichever comes first; this shell keeps the shortcuts, the close-on-navigate
   rule and the toast, which must work from the first frame. */
const Panels = lazy(() => import("./panels"));
const preloadPanels = () => import("./panels");

export function GlobalPanels() {
  const { panel, setPanel, notice } = useStore();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (panel !== null) setMounted(true);
  }, [panel]);
  useEffect(() => {
    const warm = () => preloadPanels().catch(() => {});
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(warm, { timeout: 4000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 2500);
    return () => clearTimeout(id);
  }, []);
  // A hash jump on the same page (the trade menu's section links) closes too.
  useEffect(
    () => setPanel(null),
    [location.pathname, location.search, location.hash],
  );
  // "/" and Ctrl/Cmd+K open search from anywhere, unless the reader is typing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || "");
      const shortcut =
        (event.key === "/" && !typing) ||
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey));
      if (!shortcut || event.altKey) return;
      event.preventDefault();
      setPanel("search");
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [setPanel]);
  return (
    <>
      {mounted && (
        <Suspense fallback={null}>
          <Panels />
        </Suspense>
      )}
      <div className={`toast ${notice ? "show" : ""}`} role="status">
        {notice && (
          <>
            <Check size={16} />
            {notice}
          </>
        )}
      </div>
    </>
  );
}
/* Route reveals and the hero parallax now live in AtelierMotion, so GSAP is
   loaded and context-managed once per route instead of twice. This keeps only
   the work that has to happen on every navigation. */
export function RouteEffects() {
  const location = useLocation();
  const first = useRef(true);
  useEffect(() => {
    // A client-side navigation does not announce itself, so screen reader users
    // otherwise get no confirmation that the page changed.
    if (first.current) {
      first.current = false;
      return;
    }
    // The new page fades in as a whole; the words and reveals within it
    // carry the rest of the arrival.
    const main = document.getElementById("main");
    main?.classList.remove("is-arriving");
    void main?.offsetWidth;
    main?.classList.add("is-arriving");
    const settle = setTimeout(() => main?.classList.remove("is-arriving"), 700);
    const announcer = document.getElementById("route-announcer");
    if (!announcer) return () => clearTimeout(settle);
    const heading = document
      .querySelector("main h1")
      ?.textContent?.replace(/\s+/g, " ")
      .trim();
    const timer = setTimeout(() => {
      announcer.textContent = `${heading || document.title.split("—")[0].trim()}. Page loaded.`;
    }, 80);
    return () => {
      clearTimeout(timer);
      clearTimeout(settle);
    };
  }, [location.pathname]);
  return null;
}
