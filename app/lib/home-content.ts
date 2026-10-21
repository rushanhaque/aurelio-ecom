export const homeContent = {
  eyebrow: "THE MATERIAL ATELIER",
  title: "A different kind of presence.",
  intro: "Nine materials, each with its own character.",
  sections: [
    ["Look closer.", "Explore the surface and the grain."],
    ["Make it yours.", "Start with a material. Bring us your idea."],
  ] as [string, string][],
};

/* The landing film lives in public/videos: hero.mp4 and hero.webm (16:9), and
   optionally hero-portrait.mp4 / hero-portrait.webm (9:16) for phones. The
   build offers whichever exist (vite.config.ts); the responsive hero still
   (public/images/hero-film-*.webp) holds the screen until the film is playing.
   See docs/HOMEPAGE_VIDEO.md for the optimized assets and encoding settings. */
