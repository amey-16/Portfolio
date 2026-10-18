// Noise to Signal — interaction and motion.
// Content is fully readable without this script. Motion layers on only when
// the visitor has not asked for reduced motion (?motion=off also works).

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { initRoute } from './site-route.js'
import { initField, initSignal } from './site-field.js'
import { initOrbit, GROUPS } from './site-orbit.js'
import { initDirector, initWipe, resolveHeading } from './director.js'
import { initHero } from './hero-ui.js'

if (import.meta.hot) import.meta.hot.decline()

gsap.registerPlugin(ScrollTrigger)

const root = document.documentElement
const motion = root.classList.contains('is-motion')
const fine = matchMedia('(pointer: fine)').matches
if (fine) root.classList.add('has-fine')
const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const bar = $('.bar')
const barH = () => bar?.offsetHeight ?? 72
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&$@0123456789'
const rand = (a, b) => a + Math.random() * (b - a)
// Per-frame work only runs while its section is on screen (or about to be), so the page stays light.
function live(el, fn, margin = '120px') {
  let on = false
  new IntersectionObserver((es) => {
    const vis = es[es.length - 1].isIntersecting
    if (vis && !on) { gsap.ticker.add(fn); on = true } else if (!vis && on) { gsap.ticker.remove(fn); on = false }
  }, { rootMargin: margin }).observe(el)
}

/* ---------------- Split text into characters ---------------- */
function split(el) {
  const text = el.textContent
  if (!el.closest('[aria-label]')) el.setAttribute('aria-label', text)
  el.innerHTML = ''
  for (const c of text) {
    const s = document.createElement('span')
    s.className = 'ch'
    s.setAttribute('aria-hidden', 'true')
    s.textContent = c === ' ' ? ' ' : c
    s.dataset.c = s.textContent
    el.appendChild(s)
  }
  return $$('.ch', el)
}
// Scramble a character through random glyphs before it settles.
function scramble(ch, duration = 600) {
  const final = ch.dataset.c
  if (final === ' ') return
  const t0 = performance.now()
  const tick = (now) => {
    if (now - t0 >= duration) { ch.textContent = final; return }
    ch.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/* ---------------- Smooth scroll ---------------- */
let lenis = null
if (motion) {
  lenis = new Lenis({ duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4) })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}
function goTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: id === 'top' ? 0 : 0, duration: 1.6 })
  else el.scrollIntoView()
  el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href*="#"]')
  if (!a) return
  const url = new URL(a.href, location.href)
  if (url.pathname !== location.pathname || !url.hash) return
  const id = decodeURIComponent(url.hash.slice(1))
  if (!document.getElementById(id)) return
  e.preventDefault()
  closeMenu()
  history.pushState(null, '', `#${id}`)
  goTo(id)
})

/* ---------------- Header follows the colour underneath ---------------- */
$$('.t-bone, .t-butter, .ticker').forEach((sec) => motion && sec.classList.contains('caps') || ScrollTrigger.create({ trigger: sec, start: 'top 36px', end: 'bottom 36px', toggleClass: { targets: bar, className: 'on-light' } }))
if ($('.contact')) ScrollTrigger.create({ trigger: '.contact', start: 'top 60px', end: 'bottom top', toggleClass: { targets: '.bar-cta', className: 'is-away' } })

/* ---------------- Header: steps aside on the way down ---------------- */
let lastY = scrollY
addEventListener('scroll', () => {
  const y = scrollY
  const open = $('.bar__menu')?.getAttribute('aria-expanded') === 'true'
  if (!open && y > 300 && y > lastY + 4) bar?.classList.add('is-hidden')
  else if (y < lastY - 4 || y < 300) bar?.classList.remove('is-hidden')
  lastY = y
}, { passive: true })
bar?.addEventListener('focusin', () => bar.classList.remove('is-hidden'))

/* ---------------- Menu ---------------- */
const menuBtn = $('.bar__menu')
const menu = $('#menu')
function closeMenu() {
  if (!menu || menu.hidden) return
  menu.hidden = true
  menuBtn.setAttribute('aria-expanded', 'false')
  menuBtn.querySelector('span').textContent = 'Menu'
  lenis?.start()
}
menuBtn?.addEventListener('click', () => {
  if (menuBtn.getAttribute('aria-expanded') === 'true') { closeMenu(); menuBtn.focus(); return }
  menu.hidden = false
  menuBtn.setAttribute('aria-expanded', 'true')
  menuBtn.querySelector('span').textContent = 'Close'
  lenis?.stop()
  menu.querySelector('a')?.focus()
})
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu && !menu.hidden) { closeMenu(); menuBtn.focus() } })
addEventListener('resize', () => { if (innerWidth > 1100) closeMenu() })

/* ---------------- Motion toggle label ---------------- */
const qt = $('[data-quiet-toggle]')
if (qt && !motion) { qt.textContent = 'Play motion'; qt.setAttribute('href', '?motion=on') }

/* ---------------- Copy email ---------------- */
$$('.copy').forEach((btn) => {
  const state = $('.copy__state', btn)
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.email); state.textContent = 'Copied' }
    catch { location.href = `mailto:${btn.dataset.email}`; state.textContent = 'Opening mail' }
    clearTimeout(btn._t)
    btn._t = setTimeout(() => (state.textContent = 'Copy email'), 2400)
  })
})

/* ---------------- Tech globe ---------------- */
const orbitRoot = $('.orbit')
if (orbitRoot) {
  const detail = $('.stack__detail')
  const show = (name, use, group) => {
    $('.stack__tool', detail).textContent = name
    $('.stack__use', detail).textContent = use
    $('.stack__group', detail).textContent = group
    if (motion) gsap.fromTo($$('p', detail), { opacity: 0, filter: 'blur(6px)', y: 6 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.5, stagger: 0.04, ease: 'expo.out', overwrite: true })
  }
  const orbit = initOrbit(orbitRoot, { reducedMotion: !motion, onTool: show })
  live(orbitRoot, orbit.update)
  $$('.filter').forEach((f) => f.addEventListener('click', () => {
    $$('.filter').forEach((x) => x.setAttribute('aria-pressed', String(x === f)))
    orbit.setFilter(f.dataset.group)
    if (f.dataset.group) {
      const first = $(`.orbit__item[data-group="${f.dataset.group}"]`)
      $('.stack__group', detail).textContent = GROUPS[f.dataset.group]
      if (first) { first.dispatchEvent(new Event('pointerenter')); first.dispatchEvent(new Event('pointerleave')) }
    }
  }))
}

/* ---------------- Route: quiet fallback needs no script ---------------- */
const exp = $('.exp')

/* ================= Motion layer ================= */
if (!document.querySelector('.hero')) root.classList.add('hero-go')
if (motion) {
  const mm = gsap.matchMedia()

  /* --- Cursor + magnetic --- */
  if (fine) {
    const cursor = $('.cursor'), label = $('.cursor__label')
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y
    addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; if (!root.classList.contains('cursor-on')) { cx = x; cy = y; root.classList.add('cursor-on') } })
    gsap.ticker.add(() => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; cursor.style.transform = `translate3d(${cx}px,${cy}px,0)` })
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor]')
      cursor.classList.toggle('has-label', !!t)
      if (t) label.textContent = t.dataset.cursor
    })
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'expo.out' }), yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'expo.out' })
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.28); yTo((e.clientY - r.top - r.height / 2) * 0.35) })
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0) })
    })
  }

  /* --- Hero: a Three.js scene scrubbed by scroll (hero-ui.js / hero-scene.js) --- */
  initHero({ gsap, ScrollTrigger, lenis, motion, fine })

  /* --- Ticker: constant crawl, pushed by scroll velocity --- */
  const track = $('.ticker__track')
  if (track) {
    let x = 0, boost = 0, dir = -1
    const w = () => $('.ticker__set', track).offsetWidth
    ScrollTrigger.create({ trigger: '.ticker', start: 'top bottom', end: 'bottom top', onUpdate: (s) => { boost = Math.min(Math.abs(s.getVelocity()) / 90, 18); dir = s.direction === 1 ? -1 : 1 } })
    live($('.ticker'), () => {
      boost *= 0.92; x += dir * (0.9 + boost)
      const W = w()
      if (x <= -W) x += W
      if (x > 0) x -= W
      track.style.transform = `translate3d(${x}px,0,0)`
    })
    gsap.fromTo('.ticker', { rotate: -1.2 }, { rotate: 1.2, ease: 'none', scrollTrigger: { trigger: '.ticker', start: 'top bottom', end: 'bottom top', scrub: true } })
  }

  /* --- Portrait: the photo opens like a shutter while the graphics orbit it --- */
  const pic = $('.pic')
  if (pic) {
    const counts = $$('[data-count]')
    const frame = $('.pic__frame'), img = $('.pic__frame img')
    const chips = $$('.pic__chips li'), copy = $$('.pic__copy > *'), stats = $$('.pic__stats > div')
    counts.forEach((c) => { c.dataset.final = c.dataset.count; c.textContent = '0' })
    ScrollTrigger.create({
      trigger: pic, start: 'top 55%', once: true,
      onEnter: () => counts.forEach((c) => {
        const o = { v: 0 }
        gsap.to(o, { v: +c.dataset.final, duration: 2, ease: 'power3.out', onUpdate: () => (c.textContent = String(Math.round(o.v)).padStart(2, '0') + (c.dataset.suffix || '')) })
      }),
    })
    mm.add('(min-width: 900px)', () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: pic, start: 'top top', end: 'bottom bottom', scrub: 0.9 } })
      tl.fromTo(frame, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', ease: 'power3.out', duration: 0.3 }, 0)
        .fromTo(img, { scale: 1.6 }, { scale: 1, ease: 'power2.out', duration: 0.55 }, 0)
        .fromTo('.pic__row--a', { xPercent: 0 }, { xPercent: -38, ease: 'none', duration: 1 }, 0)
        .fromTo('.pic__row--b', { xPercent: -38 }, { xPercent: 0, ease: 'none', duration: 1 }, 0)
        .fromTo('.pic__badge', { scale: 0, rotate: -200, opacity: 0 }, { scale: 1, rotate: 160, opacity: 1, ease: 'none', duration: 1 }, 0.05)
        .fromTo(chips, { opacity: 0, scale: 0.3, y: 70 }, { opacity: 1, scale: 1, y: 0, stagger: 0.04, duration: 0.18, ease: 'back.out(2)' }, 0.18)
        .fromTo(copy, { opacity: 0, y: 70, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.06, duration: 0.2, ease: 'power2.out' }, 0.14)
        .fromTo(stats, { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.16, ease: 'power2.out' }, 0.4)
      chips.forEach((c) => tl.to(c, { y: `+=${parseFloat(c.dataset.speed) * 110}`, ease: 'none', duration: 0.7 }, 0.4))
      tl.to(frame, { yPercent: -4, ease: 'none', duration: 0.5 }, 0.5)
    })
    mm.add('(max-width: 899px)', () => {
      gsap.fromTo(frame, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: frame, start: 'top 85%' } })
      gsap.from(copy, { opacity: 0, y: 40, filter: 'blur(10px)', duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.pic__copy', start: 'top 85%' } })
      gsap.from(chips.slice(0, 3), { opacity: 0, scale: 0.4, duration: 0.9, stagger: 0.1, ease: 'back.out(2)', scrollTrigger: { trigger: frame, start: 'top 70%' } })
    })
  }

  /* --- Lens: the photograph slides behind the words --- */
  $$('[data-lens]').forEach((w) => {
    const right = w.classList.contains('lens__word--r')
    gsap.fromTo(w, { xPercent: right ? 14 : -14, '--by': '0%' }, { xPercent: right ? -6 : 6, '--by': '100%', ease: 'none', scrollTrigger: { trigger: w, start: 'top bottom', end: 'bottom top', scrub: 0.7 } })
  })

  /* --- Signal: noise resolves into clean waves as you pass --- */
  const sig = $('.signal__cv')
  if (sig) {
    const s = initSignal(sig)
    live(sig, s.frame)
    ScrollTrigger.create({ trigger: '.signal', start: 'top 85%', end: 'bottom 35%', scrub: true, onUpdate: (st) => s.set(st.progress) })
  }

  /* --- Statement: words fill in, a highlighter wipes under the key ones, a star spins --- */
  const words = $$('[data-denoise] .w')
  if (words.length) {
    gsap.fromTo(words, { opacity: 0.14, filter: 'blur(7px)' }, { opacity: 1, filter: 'blur(0px)', ease: 'none', stagger: 0.06, scrollTrigger: { trigger: '.denoise', start: 'top 80%', end: 'bottom 50%', scrub: 0.5 } })
    $$('.w--accent').forEach((w) => gsap.fromTo(w, { '--hl': '0%' }, { '--hl': '100%', ease: 'power2.out', scrollTrigger: { trigger: w, start: 'top 64%', end: 'top 40%', scrub: 0.4 } }))
    gsap.from('.about__foot > *', { y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.about__foot', start: 'top 90%' } })
    gsap.fromTo('.about__star', { rotate: -40, scale: 0.4 }, { rotate: 320, scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: 0.8 } })
  }

  /* --- Section headings: each line rises out of its own mask --- */
  $$('h2.wide').forEach((h) => {
    if (h.dataset.split) return
    h.dataset.split = '1'
    if (h.closest('.contact')) {
      gsap.from($$('.ln__in', h), { yPercent: 118, rotate: 4, transformOrigin: '0 100%', duration: 1.3, ease: 'expo.out', stagger: 0.14, scrollTrigger: { trigger: h, start: 'top 85%' } })
      return
    }
    resolveHeading(gsap, h)
  })

  /* --- Capabilities: a pinned horizontal rail; the cards straighten and draw themselves --- */
  const capsTrack = $('.caps__track')
  // The rail pins while it scrolls, holds on the last card, then the Journey opens over it like an iris:
  //   [0, dist]            cards travel
  //   [dist, dist+hold]    last card rests so the rail visibly finishes
  //   [.., +irisD]         the next section is revealed through a growing circle while the rail stays pinned behind it
  const irisOf = () => Math.round(innerHeight * 0.95)
  const holdOf = () => Math.round(innerHeight * 0.3)
  mm.add('(min-width: 900px)', () => {
    if (!capsTrack) return
    const cards = $$('.ccard')
    const view = $('.caps__viewport')
    const dist = () => Math.max(0, capsTrack.scrollWidth - view.clientWidth)
    const D = () => (exp ? irisOf() : 0)
    const setIris = () => root.style.setProperty('--iris-d', D() + 'px')
    if (exp) { exp.classList.add('exp--iris'); setIris(); ScrollTrigger.addEventListener('refreshInit', setIris) }
    const stops = () => {
      const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : dist()
      const out = []
      for (let x = 0; x < dist() - 4; x += step) out.push(x / dist())
      out.push(1)
      return out
    }
    ScrollTrigger.create({ trigger: '.caps', start: 'top top', end: () => '+=' + (dist() + holdOf() + D()), pin: '.caps__pin', invalidateOnRefresh: true })
    const rail = gsap.to(capsTrack, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.caps', start: 'top top', end: () => '+=' + dist(), scrub: 0.7, invalidateOnRefresh: true,
        snap: { snapTo: (v) => gsap.utils.snap(stops(), v), duration: { min: 0.2, max: 0.55 }, ease: 'power2.inOut', delay: 0.05 },
      },
    })
    // the header stays dark-on-light while the light section is still the visible one
    ScrollTrigger.create({ trigger: '.caps', start: 'top 36px', end: () => '+=' + (dist() + holdOf() + D() * 0.38), toggleClass: { targets: bar, className: 'on-light' }, invalidateOnRefresh: true })
    cards.forEach((c, i) => {
      const parts = $$('.ccard__art > *', c)
      parts.forEach((p) => p.setAttribute('pathLength', '1'))
      gsap.set(parts, { strokeDasharray: 1, strokeDashoffset: 1 })
      gsap.to(parts, { strokeDashoffset: 0, duration: 1.1, stagger: 0.06, ease: 'power2.inOut', scrollTrigger: { trigger: c, containerAnimation: rail, start: 'left 82%', toggleActions: 'play none none reverse' } })
      gsap.fromTo(c, { rotate: i % 2 ? 4 : -4, yPercent: i % 2 ? 7 : -7 }, { rotate: 0, yPercent: 0, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: rail, start: 'left 100%', end: 'left 48%', scrub: true } })
    })
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', setIris)
      exp?.classList.remove('exp--iris'); root.style.removeProperty('--iris-d')
    }
  })
  mm.add('(max-width: 899px)', () => {
    if ($('.caps')) ScrollTrigger.create({ trigger: '.caps', start: 'top 36px', end: 'bottom 36px', toggleClass: { targets: bar, className: 'on-light' } })
    $$('.ccard').forEach((c, i) => gsap.from(c, { opacity: 0, y: 60, rotate: i % 2 ? 2 : -2, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 88%' } }))
  })

  /* --- Work: the cards animate with Motion (ProjectCard.jsx); here only the diagram strokes draw --- */
  $$('.proj').forEach((p) => {
    const lines = $$('.art__line', p)
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.to(lines, { strokeDashoffset: 0, duration: 1.4, stagger: 0.15, ease: 'power3.inOut', delay: 0.25, scrollTrigger: { trigger: p, start: 'top 72%' } })
  })

  /* --- Experience route --- */
  if (exp) {
    const routeLen = () => innerHeight * 3.2
    // desktop: opens as an iris over the pinned "What I build" rail, then the route plays
    mm.add('(min-width: 900px)', () => {
      exp.classList.remove('is-lite')
      const pinEl = $('.exp__pin', exp)
      const route = initRoute(exp)
      route.set(0.06)
      const D = () => irisOf()
      gsap.set(pinEl, { clipPath: 'circle(0% at 50% 50%)' })
      const iris = gsap.to(pinEl, {
        clipPath: 'circle(82% at 50% 50%)', ease: 'power2.inOut',
        scrollTrigger: { trigger: exp, start: 'top top', end: () => '+=' + D(), scrub: 0.6, invalidateOnRefresh: true,
          // the header follows the colour that is actually under it
          onUpdate: (s) => bar?.classList.toggle('on-light', s.progress < 0.38) },
      })
      const st = ScrollTrigger.create({
        trigger: exp, pin: '.exp__pin', start: 'top top', end: () => '+=' + (D() + routeLen()), scrub: 0.8,
        invalidateOnRefresh: true, onRefresh: () => route.build(),
        onUpdate: (s) => { const total = D() + routeLen(); route.set(0.06 + Math.min(1, Math.max(0, (s.progress * total - D()) / routeLen())) * 0.88) },
      })
      return () => { st.kill(); iris.scrollTrigger?.kill(); iris.kill(); gsap.set(pinEl, { clearProps: 'clipPath' }) }
    })
    mm.add('(min-width: 720px) and (max-width: 899px)', () => {
      exp.classList.remove('is-lite')
      const route = initRoute(exp)
      route.set(0.06)
      const st = ScrollTrigger.create({
        trigger: exp, pin: '.exp__pin', start: 'top top', end: () => '+=' + routeLen(), scrub: 0.8,
        invalidateOnRefresh: true, onUpdate: (s) => route.set(0.06 + s.progress * 0.88), onRefresh: () => route.build(),
      })
      return () => st.kill()
    })
    mm.add('(max-width: 719px)', () => {
      exp.classList.add('is-lite')
      $$('.stop__card', exp).forEach((c) => gsap.from(c, { opacity: 0, y: 40, filter: 'blur(10px)', duration: 1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 90%' } }))
      return () => exp.classList.remove('is-lite')
    })
  }

  /* --- Stack copy --- */
  gsap.from('.stack__lede, .filters, .stack__detail', { opacity: 0, y: 30, duration: 1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.stack', start: 'top 70%' } })
  gsap.from('.orbit', { opacity: 0, scale: 0.85, filter: 'blur(20px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.stack', start: 'top 70%' } })

  /* --- Credentials: rows wipe in from the left --- */
  gsap.from('.cred', { clipPath: 'inset(0 100% 0 0)', duration: 1.2, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.creds__list', start: 'top 86%' } })

  /* --- Contact: a marquee that speeds up and leans with your scroll --- */
  const shout = $('.shout__track')
  if (shout) {
    let sx = 0, sboost = 0, sdir = -1
    const set = () => $('.shout__set', shout).offsetWidth
    ScrollTrigger.create({ trigger: '.contact', start: 'top bottom', end: 'bottom top', onUpdate: (st) => { sboost = Math.min(Math.abs(st.getVelocity()) / 70, 22); sdir = st.direction === 1 ? -1 : 1 } })
    live($('.contact'), () => {
      sboost *= 0.92; sx += sdir * (1 + sboost)
      const W = set()
      if (sx <= -W) sx += W
      if (sx > 0) sx -= W
      shout.style.transform = `translate3d(${sx}px,0,0)`
      $('.shout').style.transform = `skewX(${(-sdir * sboost * 0.35).toFixed(2)}deg)`
    })
  }
  gsap.from('.contact__row > *', { opacity: 0, y: 30, duration: 1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.contact__row', start: 'top 90%' } })

  /* --- Footer wordmark: the portrait drifts inside the letters --- */
  if ($('.foot__word')) gsap.fromTo('.foot__word', { backgroundPosition: '62% 10%' }, { backgroundPosition: '62% 50%', ease: 'none', scrollTrigger: { trigger: '.contact', start: 'bottom bottom', end: 'max', scrub: true } })

  /* --- Case study --- */
  if ($('.case')) {
    const t = $('.case__title')
    // words stay whole (they wrap between words, never inside one); each word rises out of its own mask
    const label = t.textContent.trim()
    t.setAttribute('aria-label', label)
    t.innerHTML = label.split(' ').map((w) => `<span class="cw" aria-hidden="true"><span class="cw__in">${w}</span></span>`).join(' ')
    gsap.from($$('.cw__in', t), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.1 })
    gsap.from('.case__meta, .case__thesis, .case__intro, .case__art', { opacity: 0, y: 30, duration: 1.1, stagger: 0.08, ease: 'expo.out', delay: 0.3 })
    const lines = $$('.case__art .art__line')
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.to(lines, { strokeDashoffset: 0, duration: 1.6, stagger: 0.15, ease: 'power3.inOut', delay: 0.6 })
    $$('.case__block').forEach((b) => gsap.from($$('h2, .case__text, li', b), { opacity: 0, y: 30, filter: 'blur(8px)', duration: 1, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 78%' } }))
  }

  initWipe()
  initDirector({ gsap, ScrollTrigger, mm })

  addEventListener('load', () => ScrollTrigger.refresh())
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
}

if (!motion) initHero({ gsap, ScrollTrigger, lenis, motion, fine })

if (location.hash && document.getElementById(location.hash.slice(1))) {
  addEventListener('load', () => setTimeout(() => goTo(location.hash.slice(1)), 80))
}
