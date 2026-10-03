import { useEffect, useRef, useState } from "react";

/** The reference introduction plays once per full page load. */
export function PageIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible || !ref.current) return;
    const el = ref.current;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    // Never leave the introduction blocking the site if animation loading fails.
    const fallback = window.setTimeout(() => setVisible(false), 6000);

    import("gsap")
      .then(({ gsap }) => {
        if (disposed) return;
        const context = gsap.context(() => {
          const count = el.querySelector(".pi-count");
          const progress = { value: 0 };
          // Keep pixel and percentage offsets separate so a CSS transform
          // cannot leave the wordmark below its mask after the reveal.
          gsap.set(".pi-mark-inner", { y: 0, yPercent: 108 });
          const timeline = gsap.timeline({ delay: 0.04 });
          timeline.to(
            progress,
            {
              value: 100,
              duration: 1.25,
              ease: "power1.inOut",
              onUpdate: () => {
                if (count)
                  count.textContent = String(
                    Math.round(progress.value),
                  ).padStart(2, "0");
              },
            },
            0,
          );
          timeline
            .to(
              ".pi-mark-inner",
              {
                y: 0,
                yPercent: 0,
                duration: 0.8,
                ease: "power4.out",
              },
              0,
            )
            .to(
              ".pi-rule",
              { scaleX: 1, duration: 0.7, ease: "power3.out" },
              0.38,
            )
            .fromTo(
              ".pi-tag",
              { opacity: 0 },
              { opacity: 0.52, duration: 0.45, ease: "power2.out" },
              0.78,
            )
            .to(el, {
              yPercent: -100,
              duration: 0.85,
              ease: "power4.inOut",
              delay: 0.4,
              onComplete: () => setVisible(false),
            });
        }, el);
        cleanup = () => context.revert();
      })
      .catch(() => {
        if (!disposed) setVisible(false);
      });

    return () => {
      disposed = true;
      clearTimeout(fallback);
      cleanup?.();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={ref} className="pi" aria-hidden="true">
      <div className="pi-mark-wrap">
        <span className="pi-mark-inner">AURELIO</span>
      </div>
      <span className="pi-rule" />
      <span className="pi-tag">By AF International — Est. 2008</span>
      <span className="pi-count">00</span>
    </div>
  );
}
