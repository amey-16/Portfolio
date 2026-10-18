// Selected Work interactions (pointer devices only; touch keeps plain, readable taps).
//   square cursor   a small outline that trails the pointer with inertia, leans into its own
//                   velocity, and grows into an arrow chip while a project is under it
// Everything restrained on purpose: small angles, no trails, no glow.

export function initWorkFx({ gsap, ScrollTrigger }) {
  const work = document.querySelector('.work')
  if (!work || !matchMedia('(pointer: fine)').matches) return
  const root = document.documentElement

  /* ---- the square ---- */
  const sq = document.createElement('div')
  sq.className = 'sqc'
  sq.setAttribute('aria-hidden', 'true')
  sq.innerHTML = '<i></i><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9" /></svg>'
  document.body.appendChild(sq)
  const box = sq.querySelector('i')

  let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, vx = 0, on = false, link = false
  const place = () => {
    const nx = x + (tx - x) * 0.16, ny = y + (ty - y) * 0.16
    vx += ((nx - x) - vx) * 0.25
    x = nx; y = ny
    const lean = link ? 0 : Math.max(-14, Math.min(14, vx * 1.1))
    sq.style.transform = `translate3d(${x}px, ${y}px, 0)`
    box.style.transform = `rotate(${lean}deg)`
  }
  const tick = () => on && place()
  gsap.ticker.add(tick)

  work.addEventListener('pointerenter', (e) => {
    tx = x = e.clientX; ty = y = e.clientY
    on = true; sq.classList.add('is-on'); root.classList.add('in-work')
  })
  work.addEventListener('pointerleave', () => {
    on = false; link = false
    sq.classList.remove('is-on', 'is-link'); root.classList.remove('in-work')
  })
  work.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY })

  /* ---- cards: the square grows into an arrow chip while one is under it (tilt and depth live in ProjectCard.jsx, with Motion) ---- */
  work.addEventListener('pointerover', (e) => {
    const on = !!e.target.closest('.proj__inner')
    if (on !== link) { link = on; sq.classList.toggle('is-link', on) }
  })

  // never leave the square stranded when the page is left via back/forward
  addEventListener('pageshow', () => { on = false; sq.classList.remove('is-on', 'is-link'); root.classList.remove('in-work') })
  void ScrollTrigger
}
