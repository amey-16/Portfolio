// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import react from '@astrojs/react'

// Static output (dist/) — deploys as-is to Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.
// Set `site` to the production URL once the domain is known (used for canonical/OG URLs).
export default defineConfig({
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
})
