import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";

/* Blocks enrolled in the shared reveal by selector (see useAmbientMotion). */
const autoReveal: [string, string][] = [
  [".collection-card > div, .journal-card > div, .about-portrait", "image"],
  [
    ".philosophy > *, .collection-card > h2, .collection-card > p, .journal-card > h2, .journal-card > p, .editorial-cta > *, .info-content > *, .care-content > *, .article-body > *, .material-index, .suggestions-head, .section-heading, .trade-faq-list > *, .contact-links, .brand-contact",
    "rise",
  ],
];

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
    // Content that should arrive as it is reached but was written without a
    // reveal of its own is enrolled here, so every page shares one entrance:
    // blocks rise, image frames open like a curtain.
    for (const [selector, kind] of autoReveal)
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        // An image frame may open inside a card that itself rises; a plain
        // block never nests inside another reveal.
        if (el.dataset.reveal) return;
        if (kind === "image" || !el.closest("[data-reveal]"))
          el.dataset.reveal = kind;
      });
    let pending = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const reveal = () => {
      if (!pending.length) return;
      const limit = window.innerHeight * 0.94;
      // Whatever arrives in the same frame is staggered, so a row of cards
      // lands one after another rather than all at once.
      let wave = 0;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top >= limit) return true;
        el.style.setProperty("--reveal-delay", `${Math.min(wave++, 6) * 85}ms`);
        // A group reveals its children in sequence (CSS reads --n).
        if (el.dataset.reveal === "group")
          [...el.children].forEach((child, i) =>
            (child as HTMLElement).style.setProperty("--n", String(i)),
          );
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

/* The glide of the original site: wheel and trackpad scrolling eased with
   Lenis, so pinned and scrubbed scenes move with weight instead of in steps.
   Only for a mouse or trackpad (touch scrolling is already inertial), never
   for reduced motion or low-powered devices, and paused whenever a dialog
   locks the page. Lenis scrolls the window itself, so the reveal and
   ScrollTrigger keep reading the native scroll position. */
function useGlide(pathname: string) {
  const glide = useRef<{
    resize(): void;
    destroy(): void;
    stop(): void;
    start(): void;
  } | null>(null);
  const location = useLocation();
  const navigation = useNavigationType();
  useEffect(() => {
    if (
      !matchMedia("(hover: hover) and (pointer: fine)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.perf === "lite"
    )
      return;
    let disposed = false;
    let frame = 0;
    let locks: MutationObserver | undefined;
    const begin = async () => {
      const { default: Lenis } = await import("lenis");
      if (disposed) return;
      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        // Anything that scrolls on its own keeps native scrolling.
        prevent: (node: HTMLElement) =>
          !!node.closest?.(
            ".side-panel, .cat-modal, .commerce-mega, [data-lenis-prevent]",
          ),
      });
      glide.current = lenis;
      const loop = (time: number) => {
        lenis.raf(time);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
      locks = new MutationObserver(() =>
        document.body.hasAttribute("data-scroll-locked")
          ? lenis.stop()
          : lenis.start(),
      );
      locks.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-scroll-locked"],
      });
    };
    const idle = () => begin().catch(() => {});
    const id =
      "requestIdleCallback" in window
        ? requestIdleCallback(idle, { timeout: 2000 })
        : setTimeout(idle, 600);
    return () => {
      disposed = true;
      if ("cancelIdleCallback" in window) cancelIdleCallback(id as number);
      clearTimeout(id as number);
      cancelAnimationFrame(frame);
      locks?.disconnect();
      glide.current?.destroy();
      glide.current = null;
    };
  }, []);
  // Navigation belongs to the router: it puts a new page at the top or its
  // anchor, and Back at the remembered spot. Two things used to fight it: the
  // site's smooth scroll-behavior turned that jump into a slow glide that the
  // next ScrollTrigger refresh cut short, and Lenis kept the old page's
  // target. This layout effect runs before the router's own scroll handling,
  // so it makes that jump instant and pauses Lenis until the page has landed.
  // A jump to an anchor on the same page is the one move that should glide.
  const previous = useRef(location.pathname);
  useLayoutEffect(() => {
    const html = document.documentElement;
    const lenis = glide.current;
    const samePage = previous.current === location.pathname;
    previous.current = location.pathname;
    const anchor =
      samePage && location.hash
        ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
        : null;
    if (anchor) {
      // The browser's own smooth anchor scroll already honours the header's
      // scroll-padding; Lenis steps aside until it has arrived.
      html.classList.add("is-anchoring");
      void getComputedStyle(html).scrollBehavior;
      lenis?.stop();
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        // Sections passed on the way finish rendering and grow, which moves
        // the target; one short glide puts the anchor back under the header.
        const pad = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0;
        const drift = anchor.getBoundingClientRect().top - pad;
        if (Math.abs(drift) > 24)
          window.scrollBy({ top: drift, behavior: "smooth" });
        setTimeout(() => {
          html.classList.remove("is-anchoring");
          lenis?.start();
        }, Math.abs(drift) > 24 ? 700 : 0);
      };
      const timer = setTimeout(done, 1600);
      addEventListener("scrollend", done, { once: true });
      return () => {
        clearTimeout(timer);
        removeEventListener("scrollend", done);
        settled = true;
        html.classList.remove("is-anchoring");
        lenis?.start();
      };
    }
    html.classList.add("is-routing");
    // Read the style back so the browser applies it before the router
    // scrolls in the same frame; otherwise the jump still starts smoothly.
    void getComputedStyle(html).scrollBehavior;
    lenis?.stop();
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        html.classList.remove("is-routing");
        lenis?.start();
        lenis?.resize();
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      html.classList.remove("is-routing");
    };
  }, [location.pathname, location.hash, location.key, navigation]);
}

let scrollMemory: { clearScrollMemory(): void } | undefined;

export function AtelierMotion() {
  const location = useLocation();
  const cursor = useRef<HTMLDivElement>(null);
  useAmbientMotion(location.pathname);
  useGlide(location.pathname);
  useEffect(() => {
    let disposed = false;
    let context: any;
    let media: any;
    const abort = new AbortController();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    async function start() {
      if (reduce.matches) return;
      // GSAP is not needed to paint or to respond, so it waits until the
      // browser is idle instead of competing with hydration for the CPU.
      await new Promise<void>((resolve) =>
        "requestIdleCallback" in window
          ? requestIdleCallback(() => resolve(), { timeout: 1600 })
          : setTimeout(resolve, 300),
      );
      if (disposed) return;
      // Low-powered devices keep every reveal but skip the continuously
      // scrubbed parallax, which re-renders on every scroll frame.
      const lite = document.documentElement.dataset.perf === "lite";
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed || reduce.matches) return;
      gsap.registerPlugin(ScrollTrigger);
      scrollMemory = ScrollTrigger;
      // ScrollTrigger remembers the last page's scroll position and restores
      // it after a refresh, which undid the router's scroll to the top on
      // every client-side navigation. The router owns scroll position.
      ScrollTrigger.clearScrollMemory();
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
            // The resting tone still reads (3:1 at this size) before the
            // words ink in as the statement is reached.
            { color: "#7d8b86" },
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
            // From fully transparent: a half-faded caption waiting below the
            // fold read as low-contrast text to assistive checks.
            { y: 18, opacity: 0 },
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
        if (!lite && document.querySelector(".type-ribbon"))
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
        if (!lite && document.querySelector(".commission-scene"))
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
          if (lite || !document.querySelector(".hero-visual img")) return;
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
        // Page heroes: as the reader scrolls on, the title lifts away and
        // fades over the photograph, handing the screen to the story below.
        media.add(
          "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
          () => {
            if (lite) return;
            gsap.utils
              .toArray<HTMLElement>(
                ".page-hero-body, .shop-hero-body, .trade-hero-body",
              )
              .forEach((copy) => {
                const hero = copy.parentElement;
                if (!hero) return;
                gsap.to(copy, {
                  yPercent: -22,
                  opacity: 0.15,
                  ease: "none",
                  scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "bottom top",
                    scrub: 0.6,
                  },
                });
              });
            // The seven worlds settle into place from a slight depth.
            const worlds = document.querySelector(".worlds-panels");
            if (worlds)
              gsap.fromTo(
                worlds,
                { scale: 0.94 },
                {
                  scale: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: worlds,
                    start: "top bottom",
                    end: "top 30%",
                    scrub: 0.8,
                  },
                },
              );
          },
        );
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
          .filter(() => !lite)
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
      scrollMemory?.clearScrollMemory();
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
