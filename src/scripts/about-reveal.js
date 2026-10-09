/** One trigger and one CSS timeline for the portrait and all three text blocks. */
export function initAboutComposition(root) {
  const composition = root.querySelector('.about__cols')
  const portrait = root.querySelector('.portrait__frame')
  const signals = root.querySelector('.about__signals')
  if (!composition || !portrait || !('IntersectionObserver' in window)) return

  const reveal = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return
    composition.classList.add('is-visible')
    reveal.disconnect()
  }, { threshold: 0.15 })

  composition.classList.add('is-reveal-ready')
  // Observe the portrait rather than the tall mobile composition.
  reveal.observe(portrait)

  if (signals) {
    const visibility = new IntersectionObserver(([entry]) => {
      signals.classList.toggle('is-paused', !entry.isIntersecting)
    })
    visibility.observe(signals)
  }
}
