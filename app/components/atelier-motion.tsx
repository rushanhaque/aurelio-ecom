import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

/* The ambient layer: reading progress, the condensed header, the shared reveal
   and the cursor coordinates every v2 hover effect reads from. None of it needs
   GSAP, so it runs on the first frame and keeps working when motion is reduced
   or the animation bundle never loads. */
function useAmbientMotion(pathname: string) {
  useEffect(() => {
    const abort = new AbortController();
    const body = document.body;
    const header = document.querySelector<HTMLElement>(".site-header");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    // Everything that still has to appear. An IntersectionObserver looks like
    // the obvious tool here, but it samples intersections per frame: an anchor
    // jump, the End key or a fast flick can carry an element from below the
    // fold to above it between two samples, and it then never reveals at all.
    // Comparing positions on the scroll frame cannot miss one.
    let pending = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const reveal = () => {
      if (!pending.length) return;
      const limit = window.innerHeight * 0.94;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top >= limit) return true;
        el.dataset.revealed = "true";
        return false;
      });
    };

    let lastY = window.scrollY;
    const measure = () => {
      frame = 0;
      const scrolled = window.scrollY;
      const travel = document.documentElement.scrollHeight - window.innerHeight;
      body.dataset.scrolled = scrolled > 120 ? "true" : "false";
      // Headroom: step aside while reading down, return on any scroll up. Never
      // hide while keyboard focus is inside the header.
      const delta = scrolled - lastY;
      if (Math.abs(delta) > 6) {
        const hide =
          delta > 0 &&
          scrolled > 520 &&
          !header?.contains(document.activeElement);
        body.dataset.header = hide ? "hidden" : "shown";
        lastY = scrolled;
      }
      if (scrolled < 120) body.dataset.header = "shown";
      header?.style.setProperty(
        "--read",
        String(travel > 0 ? Math.min(1, scrolled / travel) : 0),
      );
      reveal();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    addEventListener("scroll", onScroll, {
      passive: true,
      signal: abort.signal,
    });
    addEventListener("resize", onScroll, {
      passive: true,
      signal: abort.signal,
    });

    body.dataset.motion = reduce.matches ? "off" : "on";

    // Cursor coordinates, as percentages, on whichever surface is hovered.
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let pointerFrame = 0;
      let spot: { el: HTMLElement; x: number; y: number } | null = null;
      const apply = () => {
        pointerFrame = 0;
        if (!spot) return;
        spot.el.style.setProperty("--px", `${spot.x}%`);
        spot.el.style.setProperty("--py", `${spot.y}%`);
      };
      document.addEventListener(
        "pointermove",
        (event) => {
          const surface = (event.target as Element)?.closest<HTMLElement>(
            ".product-image > a, .button, .collection-card > div, .main-product-image",
          );
          if (!surface) return;
          const box = surface.getBoundingClientRect();
          if (!box.width || !box.height) return;
          spot = {
            el: surface,
            x: Math.round(((event.clientX - box.left) / box.width) * 100),
            y: Math.round(((event.clientY - box.top) / box.height) * 100),
          };
          if (!pointerFrame) pointerFrame = requestAnimationFrame(apply);
        },
        { passive: true, signal: abort.signal },
      );
    }

    return () => {
      abort.abort();
      cancelAnimationFrame(frame);
      pending = [];
    };
  }, [pathname]);
}

export function AtelierMotion() {
  const location = useLocation();
  const cursor = useRef<HTMLDivElement>(null);
  useAmbientMotion(location.pathname);
  useEffect(() => {
    let disposed = false;
    let context: any;
    let media: any;
    const abort = new AbortController();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    async function start() {
      if (reduce.matches) return;
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed || reduce.matches) return;
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
        media = gsap.matchMedia();
        // Native sticky positioning keeps the story stable as images decode.
        media.add(
          "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
          () => {
            const root = document.querySelector<HTMLElement>(".making-story");
            if (!root) return;
            root.classList.add("is-choreographed");
            const panels = gsap.utils.toArray<HTMLElement>(
              ".making-panel",
              root,
            );
            gsap.set(panels.slice(1), { autoAlpha: 0 });
            const story = gsap.timeline({
              scrollTrigger: {
                trigger: root,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.65,
              },
            });
            panels.forEach((panel, i) => {
              const image = panel.querySelector(".making-image");
              const lines = panel.querySelectorAll(".making-line>*");
              if (i > 0) {
                story
                  .to(panels[i - 1], { autoAlpha: 0, duration: 0.2 }, i - 0.22)
                  .to(panel, { autoAlpha: 1, duration: 0.2 }, i - 0.1)
                  .fromTo(
                    image,
                    {
                      clipPath: "inset(50% 0% 50% 0%)",
                      scale: 0.94,
                      rotation: -3,
                    },
                    {
                      clipPath: "inset(0% 0% 0% 0%)",
                      scale: 1,
                      rotation: 0,
                      duration: 0.55,
                      ease: "power2.out",
                    },
                    i - 0.1,
                  )
                  .fromTo(
                    lines,
                    { yPercent: 115 },
                    {
                      yPercent: 0,
                      stagger: 0.08,
                      duration: 0.45,
                      ease: "power3.out",
                    },
                    i,
                  );
              }
              story.fromTo(
                panel.querySelector(".making-image img"),
                { scale: 1.12 },
                { scale: 1, duration: 0.95, ease: "none" },
                i,
              );
            });
            story.to(
              ".making-track i",
              { scaleX: 1, duration: panels.length, ease: "none" },
              0,
            );
            const path = root.querySelector<SVGPathElement>(
              ".making-thread path",
            );
            if (path) {
              const length = path.getTotalLength();
              gsap.set(path, {
                strokeDasharray: length,
                strokeDashoffset: length,
              });
              story.to(
                path,
                { strokeDashoffset: 0, duration: panels.length, ease: "none" },
                0,
              );
            }
            return () => root.classList.remove("is-choreographed");
          },
        );
        media.add(
          "(max-width: 900px) and (prefers-reduced-motion: no-preference)",
          () => {
            gsap.utils
              .toArray<HTMLElement>(".making-panel")
              .forEach((panel) => {
                gsap.fromTo(
                  panel.querySelectorAll(".making-line>*"),
                  { yPercent: 105 },
                  {
                    yPercent: 0,
                    duration: 1,
                    stagger: 0.12,
                    ease: "power3.out",
                    scrollTrigger: {
                      trigger: panel,
                      start: "top 85%",
                      once: true,
                    },
                  },
                );
                gsap.fromTo(
                  panel.querySelector(".making-image"),
                  { clipPath: "inset(12% 0% 12% 0%)" },
                  {
                    clipPath: "inset(0% 0% 0% 0%)",
                    ease: "none",
                    scrollTrigger: {
                      trigger: panel.querySelector(".making-image"),
                      start: "top 95%",
                      end: "top 30%",
                      scrub: 0.6,
                    },
                  },
                );
              });
          },
        );
        if (document.querySelector(".hero-line-inner")) {
          gsap.fromTo(
            ".hero-line-inner",
            { yPercent: 110, rotation: 3 },
            {
              yPercent: 0,
              rotation: 0,
              stagger: 0.15,
              duration: 1.3,
              ease: "power4.out",
            },
          );
          gsap.fromTo(
            ".hero-storyline",
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 1, delay: 0.5 },
          );
        }
        if (document.querySelector(".story-reading")) {
          gsap.fromTo(
            ".reading-word",
            { color: "#bfc5be" },
            {
              color: "#072319",
              stagger: 0.12,
              ease: "none",
              scrollTrigger: {
                trigger: ".story-reading",
                start: "top 85%",
                end: "bottom 40%",
                scrub: 0.5,
              },
            },
          );
        }
        gsap.utils.toArray<HTMLElement>(".archive-work").forEach((work, i) => {
          const frame = work.querySelector(".archive-frame");
          gsap.fromTo(
            frame,
            { clipPath: "inset(0% 0% 100% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.1,
              ease: "power3.inOut",
              scrollTrigger: { trigger: work, start: "top 95%", once: true },
              onComplete: () => {
                gsap.set(frame, { clearProps: "clipPath" });
              },
            },
          );
          gsap.fromTo(
            work.querySelector("figcaption"),
            { y: 18, opacity: 0.3 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: 0.1,
              scrollTrigger: { trigger: work, start: "top 85%", once: true },
            },
          );
        });
        gsap.utils
          .toArray<HTMLElement>(".original-section-spine")
          .forEach((line) => {
            gsap.fromTo(
              line,
              { clipPath: "inset(0% 100% 0% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: { trigger: line, start: "top 92%", once: true },
              },
            );
          });
        if (document.querySelector(".type-ribbon"))
          gsap.fromTo(
            ".type-ribbon>div",
            { xPercent: 0 },
            {
              xPercent: -20,
              ease: "none",
              scrollTrigger: {
                trigger: ".type-ribbon",
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
        if (document.querySelector(".commission-scene"))
          gsap.to(".commission-scene>img", {
            yPercent: -10,
            ease: "none",
            scrollTrigger: {
              trigger: ".commission-scene",
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        // Absorbed from the old RouteEffects pass so GSAP is imported, parsed
        // and context-managed exactly once per route.
        media.add("(min-width: 900px) and (pointer: fine)", () => {
          if (!document.querySelector(".hero-visual img")) return;
          gsap.to(".hero-visual img", {
            yPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
        });
        // Section rules draw themselves in as each block is reached, which
        // gives the long reading pages a visible spine.
        gsap.utils
          .toArray<HTMLElement>(".section-heading, .page-intro")
          .forEach((block) => {
            const rule = block.querySelector(".eyebrow");
            if (!rule) return;
            gsap.fromTo(
              rule,
              { opacity: 0, x: -12 },
              {
                opacity: 1,
                x: 0,
                duration: 0.7,
                ease: "power3.out",
                scrollTrigger: { trigger: block, start: "top 92%", once: true },
              },
            );
          });
        gsap.utils
          .toArray<HTMLElement>(
            ".statement,.lab-intro,.explorer-heading,.premiere-head,.archive-heading,.original-standard h2,.workshop-heading",
          )
          .forEach((el) => {
            gsap.fromTo(
              el,
              { y: 30 },
              {
                y: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: "top bottom",
                  end: "top 65%",
                  scrub: 0.8,
                },
              },
            );
          });
        if (
          matchMedia("(hover:hover) and (pointer:fine)").matches &&
          document.querySelector("[data-cursor],[data-magnetic]")
        ) {
          const bubble = cursor.current;
          if (!bubble) return;
          const setX = gsap.quickTo(bubble, "x", {
              duration: 0.3,
              ease: "power3.out",
            }),
            setY = gsap.quickTo(bubble, "y", {
              duration: 0.3,
              ease: "power3.out",
            });
          document.addEventListener(
            "pointermove",
            (e) => {
              const target = (e.target as Element).closest<HTMLElement>(
                "[data-cursor]",
              );
              bubble.classList.toggle("visible", !!target);
              if (target)
                bubble.textContent = target.dataset.cursor || "EXPLORE";
              setX(e.clientX);
              setY(e.clientY);
            },
            { passive: true, signal: abort.signal },
          );
          document.addEventListener(
            "pointerleave",
            () => bubble.classList.remove("visible"),
            { signal: abort.signal },
          );
          document
            .querySelectorAll<HTMLElement>("[data-magnetic]")
            .forEach((el) => {
              const x = gsap.quickTo(el, "x", {
                  duration: 0.45,
                  ease: "power3.out",
                }),
                y = gsap.quickTo(el, "y", {
                  duration: 0.45,
                  ease: "power3.out",
                });
              el.addEventListener(
                "pointermove",
                (e) => {
                  const b = el.getBoundingClientRect();
                  x((e.clientX - b.left - b.width / 2) * 0.14);
                  y((e.clientY - b.top - b.height / 2) * 0.14);
                },
                { passive: true, signal: abort.signal },
              );
              el.addEventListener(
                "pointerleave",
                () => {
                  x(0);
                  y(0);
                },
                { signal: abort.signal },
              );
            });
        }
      });
      ScrollTrigger.refresh();
    }
    start().catch(() => {});
    const stop = () => {
      abort.abort();
      media?.revert();
      context?.revert();
      cursor.current?.classList.remove("visible");
    };
    reduce.addEventListener("change", stop, { signal: abort.signal });
    return () => {
      disposed = true;
      stop();
    };
  }, [location.pathname]);
  return <div ref={cursor} className="discovery-cursor" aria-hidden="true" />;
}
