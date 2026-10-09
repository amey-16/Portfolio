# Amey Shelar - Portfolio v7

Static Astro portfolio with Tailwind CSS v4 and the v7 interactive visual system.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs ./dist
npm run preview   # serve the production build
```

On Windows PowerShell with script execution disabled, use `npm.cmd` in place of `npm`.

## Content

- `src/scripts/data.js`: profile, projects, education, certifications and skill groups.
- `src/components/Experience.astro`: internship timeline.
- `src/components/Hero.astro` and `About.astro`: introductory copy.
- `public/amey-shelar-resume.pdf`: downloadable full-stack resume.
- `src/scripts/covers.js`: locally drawn project schematics, shared by the gallery and project dialogs.
- `src/styles/content.css`: adjustments for the real resume content within the existing design.

Content is based on the three resumes supplied by Amey. The full-stack resume supplies the downloadable PDF and the main role focus; the data-focused resume adds the data-engineering skills. The About section uses an AS monogram until a personal portrait is supplied. Project dates and external project URLs are omitted because the resumes do not provide them.

## Deployment

The project lives at the repository root. Build with `npm run build` and publish `dist/` using a static hosting provider. Set `site` in `astro.config.mjs` once the production URL is known.

## Restore point

The complete original v7 website was saved on `main` before the resume edits:

[e4058c5 - Save complete portfolio v7 before resume content updates](https://github.com/amey-16/Portfolio/commit/e4058c55aa86afc2e800a203c613dc6df633d573)

To undo the resume changes while keeping the Git history, use `git revert` with the commit titled `Fill portfolio with Amey Shelar resume content`, then push the resulting commit to `main`.
