# Homepage background video

The homepage uses the supplied `aurelvid.mov`, optimized on 2026-10-18. The original stays outside the repository. All 764 frames are retained, with approximately 31.8 seconds of playback, the original 1080p desktop resolution, and no audio. The source has a short opening fade from black; the poster uses the visible frame at one second.

## Delivered assets

Sizes below use decimal MB. VMAF is the mean score across every decoded frame against the source (against the same center crop for portrait). Frames were aligned by decoded frame number to account for the MOV timestamp timebase. These are high-quality lossy encodes, not mathematically lossless copies.

| Asset in `public/videos/` | Dimensions | Size | Mean VMAF |
| --- | --- | --- | --- |
| `hero.webm` | 1920 x 1080 | 7.43 MB | 93.97 |
| `hero.mp4` | 1920 x 1080 | 10.76 MB | 94.93 |
| `hero-portrait.webm` | 608 x 1080 | 3.48 MB | 93.87 |
| `hero-portrait.mp4` | 608 x 1080 | 4.21 MB | 94.72 |

The source is 23.93 MB. The preferred WebM cuts the desktop download by 69% and the portrait download by 85%. Each file fits ordinary GitHub commits and the browser upload limit; Git LFS is unnecessary for these files. Keep master MOV files and encoder binaries outside the repository. See [GitHub file limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

## Loading and playback

- `vite.config.ts` discovers the existing film files at build time. Portrait sources come first for viewports at or below a 4:5 aspect ratio; WebM precedes MP4 within each group. The browser requests its selected source, with MP4 available as a compatibility fallback.
- The portrait is a centered 608 x 1080 crop, without upscaling. This avoids downloading the invisible sides of a landscape video on tall phones. Review framing if replacing the source.
- `app/routes/home.tsx` serves a responsive WebP poster before fetching the film. Desktop posters have widths of 800, 1440 and 1920 pixels; portrait posters have widths of 304 and 608 pixels. The largest desktop poster is 226 KB; the largest phone poster is 67 KB. They use a separate `hero-film-` prefix to preserve the existing editorial images.
- Film loading starts after the poster loads, at an idle opportunity with a one-second deadline. Playback is muted, inline and looping; it fades over the poster only after playback begins.
- Reduced-motion, Save-Data, and 2G visits retain the poster without requesting video. The poster also remains available without JavaScript or if autoplay is rejected. Playback pauses off-screen and in a hidden tab.
- Both MP4 files have their `moov` metadata before `mdat` (`+faststart`), so playback can begin before the complete file downloads. See [FFmpeg format documentation](https://ffmpeg.org/ffmpeg-formats.html#mov_002c-mp4_002c-ismv).
- Existing Express and Vercel media headers cache these assets for seven days with stale-while-revalidate. Express supports HTTP Range requests. For future replacements, use new filenames or invalidate cached URLs rather than expecting existing caches to refresh immediately.

## Reproduce the video encodes

Run from the repository with FFmpeg available. Substitute the path to the master for `aurelvid.mov`.

```sh
ffmpeg -i aurelvid.mov -map 0:v:0 -an -sn -dn -map_metadata -1 -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -profile:v high -level:v 4.0 -g 240 -movflags +faststart -fps_mode passthrough -threads 6 public/videos/hero.mp4
ffmpeg -i aurelvid.mov -map 0:v:0 -an -sn -dn -map_metadata -1 -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p -g 240 -fps_mode passthrough -threads 6 public/videos/hero.webm
ffmpeg -i aurelvid.mov -map 0:v:0 -an -sn -dn -map_metadata -1 -vf crop=608:1080 -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -profile:v high -level:v 4.0 -g 240 -movflags +faststart -fps_mode passthrough -threads 4 public/videos/hero-portrait.mp4
ffmpeg -i aurelvid.mov -map 0:v:0 -an -sn -dn -map_metadata -1 -vf crop=608:1080 -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p -g 240 -fps_mode passthrough -threads 4 public/videos/hero-portrait.webm
```

Extract the poster with `ffmpeg -ss 1 -i aurelvid.mov -frames:v 1 poster.png`. Using the existing Sharp dependency, resize it to the desktop widths above and export WebP at quality 86, effort 6. For portrait, first extract `{ left: 656, top: 0, width: 608, height: 1080 }`, then resize to each portrait width with the same WebP settings. Do not commit the intermediate PNG.

Restart the dev server after adding or removing film files. Before shipping, run `npm run typecheck` and `npm run build`, and verify the desktop/portrait source selection, autoplay, loop, poster fallback and media response headers in a browser. Actual startup time depends on the device, connection and hosting cache.

## Verification on 2026-10-18

- TypeScript check and production build passed.
- Chrome production-preview checks passed for desktop and phone source selection, muted inline autoplay, looping, off-screen pause/resume, MP4 fallback, and poster-only behavior with reduced motion, Save-Data, 2G, disabled JavaScript and rejected autoplay.
- Each normal browser visit requested only its selected film variant. MP4 streaming returned HTTP 206 and the existing media cache headers.
- With a fresh mobile browser context throttled to 3 Mbps and 100 ms latency against the local server, the poster loaded at 1.21 seconds and playback started at 1.59 seconds. These are local simulated-network results, not production guarantees.
- The existing first-visit brand intro remains in place and covers the playing background until its animation ends. The full homepage appeared at roughly 2.8–2.9 seconds in unthrottled local checks; subsequent visits within the same session skip that intro.
- Desktop and phone screenshots were visually reviewed after the intro finished, along with source/MP4/WebM detail comparisons.
