// Hero orchestration: intro, the scroll story, and the link to the 3D scene.
//
//  scroll    0.00 – 0.30  headline lifts away; the camera is drawn through the ring while the field wobbles
//            0.28 – 0.58  the layers arrive as loose squares and align into an exploded stack
//            0.28 – 0.72  three layers are named (Interface, Logic, Intelligence)
//            0.74 – 1.00  the layers collapse into one product panel that fills the screen

import { settle } from './director.js'

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const rand = (a, b) => a + Math.random() * (b - a)

// Wrap every character in a span, keeping inline markup (<em>, <b>) intact.
function splitChars(root) {
  const out = []
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment()
        for (const c of child.textContent) {
          const s = document.createElement('span')
          s.className = 'ch'
          s.dataset.c = c === ' ' ? ' ' : c
          s.textContent = s.dataset.c
          frag.appendChild(s)
          out.push(s)
        }
        child.replaceWith(frag)
      } else if (child.nodeType === 1) walk(child)
    }
  }
  walk(root)
  return out
}

export async function initHero({ gsap, ScrollTrigger, lenis, motion, fine }) {
  const hero = $('.hero')
  if (!hero) return
  const root = document.documentElement
  const bar = $('.bar'), cta = $('.bar-cta')
  const stage = $('.hero__stage', hero)
  bar?.classList.add('on-light')
  const lite = matchMedia('(max-width: 899px), (pointer: coarse)').matches



  /* ---- the scene (falls back to the plain porcelain page if WebGL is unavailable) ---- */
  let scene = null
  try {
    const { createHeroScene } = await import('./hero-scene.js')
    scene = createHeroScene($('.hero__gl', hero), { animate: motion, lite })
  } catch (err) {
    console.warn('Hero scene unavailable, showing static hero.', err)
    $('.hero__gl', hero)?.remove()
    root.classList.add('hero-go')
  }

  if (!motion) { scene?.renderOnce(); return }

  /* ---- starting state ---- */
  const lines = $$('.hl__in', hero)
  const chars = lines.flatMap(splitChars)
  const rest = [$('.hero__kicker'), $('.hero__lede'), $('.hero__actions'), $('.hero__rail')]
  const chrome = [bar, cta].filter(Boolean)
  gsap.set(lines, { yPercent: 112 })
  gsap.set(rest, { opacity: 0, y: 18 })
  gsap.set(chrome, { opacity: 0 })
  gsap.set($$('.hero__cap span', hero), { opacity: 0 })
  gsap.set($('.hero__gl', hero), { opacity: 0 })

  let seen = false
  try { seen = sessionStorage.getItem('amey-signal') === '1'; sessionStorage.setItem('amey-signal', '1') } catch {}
  const full = !seen && !location.hash
  if (full) lenis?.stop()
  let alive = false

  /* ---- intro: lines rise, letters resolve, the signal sweeps in from the left ---- */
  const intro = () => {
    root.classList.add('hero-go')
    const tl = gsap.timeline({ onComplete: () => { lenis?.start(); alive = true } })
    tl.to($('.hero__gl', hero), { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
    if (scene) tl.fromTo(scene.uniforms.uReveal, { value: 0 }, { value: 1, duration: full ? 3.4 : 2, ease: 'power2.inOut' }, 0)
    tl.to(lines, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: 0.14 }, 0.15)
    chars.forEach((c, i) => settle(c, 250 + (i % 14) * 38, 620))
    tl.to(rest, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out' }, 0.9)
      .to(chrome, { opacity: 1, duration: 0.9 }, 0.8)
  }
  Promise.all([Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 900))]), window.__pre ?? 0]).then(intro)

  /* ---- pointer: letters near the cursor lift, like keys being pressed ---- */
  if (fine) {
    const title = $('.hero__title')
    const tos = chars.map((c) => ({ c, y: gsap.quickTo(c, 'y', { duration: 0.5, ease: 'power3.out' }), r: gsap.quickTo(c, 'rotate', { duration: 0.6, ease: 'power3.out' }) }))
    stage.addEventListener('pointermove', (e) => {
      if (!alive || scrollY > innerHeight * 0.4) return
      tos.forEach(({ c, y, r }) => {
        const b = c.getBoundingClientRect()
        const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2)
        const f = Math.max(0, 1 - Math.hypot(dx, dy) / 220)
        y(-f * 22); r(f * dx * -0.02)
      })
    })
    stage.addEventListener('pointerleave', () => tos.forEach(({ y, r }) => { y(0); r(0) }))
    void title
  }

  /* ---- scroll story ---- */
  const railLine = $('.hero__railline', hero)
  const steps = $$('.hero__steps em', hero)
  const caps = $$('[data-cap]', hero)
  let dark = false
  const tl = gsap.timeline({ defaults: { ease: 'none' } })
  const copy = $('.hero__copy')
  tl.to(copy, { yPercent: -18, opacity: 0, duration: 0.1 }, 0.01)
  const win = [[0.4, 0.52], [0.52, 0.64], [0.64, 0.76]]
  caps.forEach((c, i) => {
    tl.fromTo(c, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.05 }, win[i][0])
    tl.to(c, { opacity: 0, y: -18, duration: 0.04 }, win[i][1])
  })
  const fin = $$('.hero__final > *, .hero__final li', hero)
  gsap.set(fin, { opacity: 0, y: 30 })
  tl.to(fin, { opacity: 1, y: 0, duration: 0.05, stagger: 0.012 }, 0.94)
  tl.to({}, { duration: 1 }, 0) // pad to a length of exactly 1

  const st = ScrollTrigger.create({
    trigger: hero, start: 'top top', end: 'bottom bottom', animation: tl, scrub: 0.7,
    onUpdate: (self) => {
      const p = self.progress
      scene?.setProgress(p)
      hero.style.setProperty('--hp', p.toFixed(3))
      const isDark = p > 0.94
      if (isDark !== dark) {
        dark = isDark
        hero.classList.toggle('is-dark', dark)
        bar?.classList.toggle('on-light', !dark)
      }
      const si = p < 0.3 ? -1 : p < 0.52 ? 0 : p < 0.64 ? 1 : p < 0.78 ? 2 : 3
      steps.forEach((s, i) => s.classList.toggle('is-on', i === si))
    },
  })
  ScrollTrigger.create({
    trigger: hero, start: 'top bottom', end: 'bottom top',
    onToggle: (self) => (self.isActive ? scene?.start() : scene?.stop()),
  })
  void st; void rand
}
