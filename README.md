# Amey v7 — Astro + Tailwind

Static Astro site (plain JS, no TypeScript) with Tailwind CSS v4.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs ./dist
npm run preview   # serve the production build
```

## Structure

```
src/
  pages/index.astro      page: composes the sections
  layouts/Layout.astro   <head>, fonts, global CSS, loads scripts/main.js
  components/*.astro     one file per section (Hero, Work, About, ...)
  scripts/*.js           GSAP / Lenis / Three.js / Matter.js scenes (unchanged from v7)
  styles/global.css      Tailwind entry + design tokens, then the v7 stylesheets
public/                  static files; drop amey.jpg here for the About portrait
```

## Deploying

`dist/` is plain static files. Vercel, Netlify, Cloudflare Pages: build command `npm run build`,
output directory `dist`. Set `site` in `astro.config.mjs` once the production URL is known.

## Notes

- The About portrait expects `public/amey.jpg`; if it's missing the image removes itself and
  the "A" placeholder shows.
- Tailwind preflight is deliberately not imported; v7's own reset is used so rendering matches the original.
