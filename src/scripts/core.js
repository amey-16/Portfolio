import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, SplitText)
export { gsap, ScrollTrigger, SplitText }

export const params = new URLSearchParams(location.search)
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || params.get('motion') === 'off'
export const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
export const $ = (s, r = document) => r.querySelector(s)
export const $$ = (s, r = document) => [...r.querySelectorAll(s)]
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }
export const small = () => innerWidth < 760

if (fine) document.documentElement.classList.add('has-cursor')
if (reduced) document.documentElement.classList.add('lite')

/* ---------------- one scroll engine, one ticker ---------------- */
export const lenis = new Lenis({ lerp: reduced ? 1 : 0.085, smoothWheel: !reduced })
lenis.stop()
lenis.on('scroll', ScrollTrigger.update)
if (import.meta.env.DEV) window.__lenis = lenis

export const tickers = new Set()
export const time = { t: 0, dt: 0.016 }
gsap.ticker.lagSmoothing(0)
gsap.ticker.add((t, ms) => {
  lenis.raf(t * 1000)
  time.dt = Math.min(ms / 1000, 1 / 20)
  time.t += time.dt
  tickers.forEach((fn) => fn(time.dt, time.t))
})

// smoothed scroll velocity, roughly -1..1
export const vel = { v: 0 }
tickers.add(() => { vel.v += (clamp(lenis.velocity / 40, -1.5, 1.5) - vel.v) * 0.12 })

/* ---------------- pointer ---------------- */
export const pointer = { x: innerWidth / 2, y: innerHeight / 2, vx: 0, vy: 0, inside: false, moved: false }
addEventListener('pointermove', (e) => {
  pointer.vx = e.clientX - pointer.x
  pointer.vy = e.clientY - pointer.y
  pointer.x = e.clientX
  pointer.y = e.clientY
  pointer.inside = true
  pointer.moved = true
}, { passive: true })
document.documentElement.addEventListener('pointerleave', () => { pointer.inside = false })
document.documentElement.addEventListener('pointerenter', () => { pointer.inside = true })

/* ---------------- visibility helper ---------------- */
export function watchVisible(el, cb, margin = '0px') {
  const state = { on: false }
  const io = new IntersectionObserver(([e]) => { state.on = e.isIntersecting; cb?.(state.on) }, { rootMargin: margin })
  io.observe(el)
  return state
}

/* ---------------- odometer: digit columns that roll ---------------- */
export function makeOdo(el, value = el.dataset.odo || '0') {
  const str = String(value)
  el.innerHTML = ''
  el.setAttribute('role', 'text')
  el.setAttribute('aria-label', str)
  const cols = [...str].map(() => {
    const col = document.createElement('span')
    col.className = 'odo__col'
    col.setAttribute('aria-hidden', 'true')
    const strip = document.createElement('span')
    strip.className = 'odo__strip'
    strip.innerHTML = Array.from({ length: 10 }, (_, d) => `<i>${d}</i>`).join('')
    col.appendChild(strip)
    el.appendChild(col)
    return strip
  })
  const api = {
    el, cols,
    set(v, { duration = 1.2, stagger = 0.08, ease = 'expo.out', from } = {}) {
      const s = String(v).padStart(cols.length, '0')
      cols.forEach((strip, i) => {
        const d = +s[i] || 0
        gsap.to(strip, { yPercent: -d * 10, duration, ease, delay: i * stagger, overwrite: true })
      })
      el.setAttribute('aria-label', String(v))
    },
    snap(v) {
      const s = String(v).padStart(cols.length, '0')
      cols.forEach((strip, i) => gsap.set(strip, { yPercent: -(+s[i] || 0) * 10 }))
      el.setAttribute('aria-label', String(v))
    },
  }
  return api
}

/* ---------------- magnetic elements ---------------- */
export function initMagnetic() {
  if (!fine || reduced) return
  $$('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.35
    const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1, 0.45)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1, 0.45)' })
    let active = false
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      const dx = e.clientX - cx, dy = e.clientY - cy
      const reach = Math.max(r.width, r.height) * 0.9
      const d = Math.hypot(dx, dy)
      if (d < reach) { active = true; xTo(dx * strength); yTo(dy * strength) }
      else if (active) { active = false; xTo(0); yTo(0) }
    }
    addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerleave', () => { active = false; xTo(0); yTo(0) })
  })
}

/* ---------------- cursor ---------------- */
export function initCursor() {
  if (!fine) return
  const cursor = $('.cursor')
  const label = $('.cursor-label')
  const labelT = $('span', label)
  const x = gsap.quickTo(cursor, 'x', { duration: 0.22, ease: 'power3' })
  const y = gsap.quickTo(cursor, 'y', { duration: 0.22, ease: 'power3' })
  const lx = gsap.quickTo(label, 'x', { duration: 0.5, ease: 'power3' })
  const ly = gsap.quickTo(label, 'y', { duration: 0.5, ease: 'power3' })
  addEventListener('pointermove', (e) => { x(e.clientX); y(e.clientY); lx(e.clientX); ly(e.clientY) }, { passive: true })
  let cur = null
  const set = (el) => {
    cur = el
    cursor.classList.remove('is-hover', 'is-label')
    label.classList.remove('is-on')
    if (!el) return
    const v = el.getAttribute('data-cursor')
    if (v && v !== 'hover') { labelT.textContent = v; label.classList.add('is-on'); cursor.classList.add('is-label') }
    else cursor.classList.add('is-hover')
  }
  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest?.('[data-cursor], a, button')
    if (el !== cur) set(el)
  })
  addEventListener('pointerdown', () => cursor.classList.add('is-down'))
  addEventListener('pointerup', () => cursor.classList.remove('is-down'))
  document.documentElement.addEventListener('pointerleave', () => cursor.classList.add('is-out'))
  document.documentElement.addEventListener('pointerenter', () => cursor.classList.remove('is-out'))
  return { set }
}

/* ---------------- char roll: duplicate text so a hover slides it up ---------------- */
export function charRoll(el) {
  const text = el.textContent
  el.textContent = ''
  el.setAttribute('aria-label', text)
  const chars = [...text].map((c, i) => {
    const w = document.createElement('span')
    w.className = 'cr'
    w.setAttribute('aria-hidden', 'true')
    w.style.setProperty('--i', i)
    const a = c === ' ' ? ' ' : c
    w.innerHTML = `<span>${a}</span><span>${a}</span>`
    el.appendChild(w)
    return w
  })
  return chars
}
