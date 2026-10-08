/* Hero film sources present in public/videos at build time (vite.config.ts),
   portrait cut first so a tall screen picks it up before the landscape film. */
declare const __HERO_FILM__: { src: string; type: string; media?: string }[];
