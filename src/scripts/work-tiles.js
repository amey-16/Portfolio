// Project art arrives as a field of loose squares and resolves into the aligned diagram.
// A grid of square tiles sits over each diagram: scattered, rotated and noisy at first, then
// scrubbed by scroll into a perfect grid that dissolves to reveal the diagram underneath.

export function initWorkTiles({ gsap, ScrollTrigger }) {
  const arts = [...document.querySelectorAll('.work .proj .art')]
  if (!arts.length) return
  const COLS = 12, ROWS = 8
  arts.forEach((art) => {
    const svg = art.querySelector('svg')
    const layer = document.createElement('div')
    layer.className = 'tiles'
    layer.setAttribute('aria-hidden', 'true')
    const tiles = []
    for (let i = 0; i < COLS * ROWS; i++) {
      const t = document.createElement('i')
      t.style.setProperty('--c', i % COLS)
      t.style.setProperty('--r', Math.floor(i / COLS))
      layer.appendChild(t)
      tiles.push(t)
    }
    art.appendChild(layer)
    const w = art.clientWidth || 600, h = art.clientHeight || 440
    gsap.set(tiles, {
      x: () => gsap.utils.random(-w * 0.45, w * 0.45), y: () => gsap.utils.random(-h * 0.5, h * 0.5),
      rotation: () => gsap.utils.random(-120, 120), scale: () => gsap.utils.random(0.5, 1.4), opacity: 0.9,
    })
    if (svg) gsap.set(svg, { opacity: 0, filter: 'blur(6px)' })
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, scrollTrigger: { trigger: art, start: 'top 92%', end: 'top 30%', scrub: 0.8 } })
    // distorted -> aligned (a tile lands on its own cell), then the grid melts into the diagram
    tl.to(tiles, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1, stagger: { each: 0.004, from: 'random' } }, 0)
    if (svg) tl.to(svg, { opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'none' }, 1)
    tl.to(tiles, { opacity: 0, duration: 0.5, stagger: { each: 0.003, from: 'center', grid: [ROWS, COLS] }, ease: 'none' }, 1)
  })
}
