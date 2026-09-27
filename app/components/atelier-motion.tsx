import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
export function AtelierMotion() {
  const location = useLocation();
  const cursor = useRef<HTMLDivElement>(null);
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
              { scaleX: 1, duration: 3, ease: "none" },
              0,
            );
            const path = root.querySelector<SVGPathElement>(
              ".making-thread path",
            )!;
            const length = path.getTotalLength();
            gsap.set(path, {
              strokeDasharray: length,
              strokeDashoffset: length,
            });
            story.to(
              path,
              { strokeDashoffset: 0, duration: 3, ease: "none" },
              0,
            );
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
          document
            .querySelectorAll<HTMLElement>(".archive-frame")
            .forEach((frame) => {
              const rotateX = gsap.quickTo(frame, "rotationX", {
                duration: 0.55,
                ease: "power3.out",
              });
              const rotateY = gsap.quickTo(frame, "rotationY", {
                duration: 0.55,
                ease: "power3.out",
              });
              gsap.set(frame, { transformPerspective: 1000 });
              frame.addEventListener(
                "pointermove",
                (e) => {
                  if (e.pointerType === "touch") return;
                  const b = frame.getBoundingClientRect();
                  const x = (e.clientX - b.left) / b.width,
                    y = (e.clientY - b.top) / b.height;
                  rotateX((0.5 - y) * 5);
                  rotateY((x - 0.5) * 5);
                  frame.style.setProperty("--glint-x", x * 100 + "%");
                  frame.style.setProperty("--glint-y", y * 100 + "%");
                },
                { passive: true, signal: abort.signal },
              );
              frame.addEventListener(
                "pointerleave",
                () => {
                  rotateX(0);
                  rotateY(0);
                },
                { signal: abort.signal },
              );
            });
          const bubble = cursor.current!;
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
