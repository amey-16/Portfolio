// Loads the page script exactly once, however many times this module is evaluated
// (hot reloads, back/forward cache restores). The page script splits text into
// letters, so running it twice would merge lines together.
const root = document.documentElement
if (!root.dataset.siteInit) {
  root.dataset.siteInit = '1'
  import('./site.js')
}
