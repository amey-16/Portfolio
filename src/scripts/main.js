import '@fontsource/anton'
import { gsap, ScrollTrigger, SplitText, lenis, tickers, $, $$, clamp, reduced, fine, makeOdo, initMagnetic, initCursor, small } from './core.js'
import { initHero } from './hero.js'
import { initWork } from './work.js'
import { initCase } from './case.js'
import { initAbout } from './about.js'
import { initRoute } from './route.js'
import { initOrbit } from './orbit.js'
import { initProcess } from './process.js'
import { initDeck } from './deck.js'
import { initClients } from './clients.js'
import { initContact } from './contact.js'
import { cover, redrawCovers } from './covers.js'

const html = document.documentElement
const toast = $('.toast')

/* ---------------- small things ---------------- */
const fS = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })
const tick = () => { const s = fS.format(new Date()); $$('[data-clock-full]').forEach((e) => (e.textContent = s)) }
tick(); setInterval(tick, 1000)

$$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); toast.textContent = 'Email copied' } catch { toast.textContent = b.dataset.copy }
  toast.classList.add('is-on'); setTimeout(() => toast.classList.remove('is-on'), 1800)
}))

const scrollToEl = (target, opts = {}) => lenis.scrollTo(target, { duration: reduced ? 0 : 1.7, easing: (x) => 1 - Math.pow(1 - x, 4), ...opts })
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href')
  const t = id.length > 1 && $(id)
  if (!t) return
  e.preventDefault()
  if (menu.isOpen()) menu.close(() => scrollToEl(t))
  else scrollToEl(t)
}))
$('.to-top')?.addEventListener('click', () => scrollToEl(0, { duration: reduced ? 0 : 2.6 }))

/* ---------------- nav + menu ---------------- */
const nav = $('.nav')
const menu = (() => {
  const root = $('.menu'), bg = $('.menu__bg'), btn = $('.nav__menu')
  const links = $$('.menu__links .mk'), side = $$('.menu__side > div')
  let open = false, tl
  gsap.set(links, { yPercent: 110 })
  gsap.set(side, { opacity: 0, y: 20 })
  const set = (v) => {
    root.setAttribute('aria-hidden', String(!v)); root.inert = !v
    btn.setAttribute('aria-expanded', String(v)); nav.classList.toggle('is-open', v)
  }
  const api = {
    isOpen: () => open,
    open() {
      if (open) return
      open = true; set(true); lenis.stop(); tl?.kill()
      const r = btn.getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      gsap.set(bg, { clipPath: `circle(0px at ${cx}px ${cy}px)` })
      gsap.set(root, { visibility: 'visible' })
      tl = gsap.timeline()
        .to(bg, { clipPath: `circle(${Math.hypot(innerWidth, innerHeight) * 1.05}px at ${cx}px ${cy}px)`, duration: 1.1, ease: 'expo.inOut' })
        .to(links, { y: 0, yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06 }, 0.35)
        .to(side, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0.6)
    },
    close(done) {
      if (!open) return done?.()
      open = false; set(false); tl?.kill()
      const r = btn.getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      tl = gsap.timeline({ onComplete: () => { gsap.set(root, { visibility: 'hidden' }); lenis.start(); done?.() } })
        .to([...side, ...links], { opacity: (i, el) => (side.includes(el) ? 0 : 1), y: (i, el) => (side.includes(el) ? 14 : 0), yPercent: (i, el) => (links.includes(el) ? 110 : 0), duration: 0.45, ease: 'power3.in', stagger: 0.02 })
        .to(bg, { clipPath: `circle(0px at ${cx}px ${cy}px)`, duration: 0.9, ease: 'expo.inOut' }, 0.15)
    },
  }
  btn.addEventListener('click', () => (open ? api.close() : api.open()))
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) api.close() })
  return api
})()

lenis.on('scroll', ({ direction, scroll }) => {
  if (menu.isOpen()) return
  nav.classList.toggle('is-hide', direction === 1 && scroll > 320)
})

/* ---------------- boot ---------------- */
const P = { p: 0 }
let heroApi = null
async function boot() {
  $$('.odo').forEach((el) => { el._odo = makeOdo(el, el.dataset.odo) })
  const bootOdo = $('.odo--boot')._odo
  bootOdo.snap('000')

  const words = $$('.boot__words span')
  const status = $('.boot__status')
  const bar = $('.boot__bar i')
  const statuses = ['Setting the type', 'Mixing the ink', 'Warming the shaders', 'Almost there']
  let wi = 0
  const show = (i) => {
    if (i === wi) return
    gsap.to(words[wi], { yPercent: -105, duration: 0.7, ease: 'expo.inOut' })
    gsap.fromTo(words[i], { yPercent: 105 }, { yPercent: 0, duration: 0.7, ease: 'expo.inOut' })
    status.textContent = statuses[i]
    wi = i
  }
  gsap.set(words.slice(1), { yPercent: 105, opacity: 1 })
  gsap.set(words[0], { yPercent: 0 })
  const paint = () => {
    const v = Math.round(P.p * 100)
    bootOdo.set(String(v).padStart(3, '0'), { duration: 0.5, stagger: 0.03, ease: 'power3.out' })
    gsap.set(bar, { scaleX: P.p })
    show(Math.min(3, Math.floor(P.p * 4)))
  }
  const load = gsap.to(P, { p: 0.82, duration: 2.4, ease: 'power2.inOut', onUpdate: paint })

  await Promise.race([
    Promise.all([
      document.fonts.load('400 120px Anton'),
      document.fonts.load('italic 400 80px "Instrument Serif"'),
      document.fonts.load('400 14px "Geist Mono"'),
      document.fonts.load('400 16px Geist'),
      document.fonts.ready,
    ]),
    new Promise((r) => setTimeout(r, 3500)),
  ])

  if (!reduced) heroApi = initHero($('.hero'))
  heroApi?.start()
  await load
  await build()

  gsap.to(P, { p: 1, duration: 0.6, ease: 'power2.out', onUpdate: paint })
  await new Promise((r) => setTimeout(r, 700))
  exit()
}

function exit() {
  const slats = $$('.boot__slats i')
  heroApi?.hideText()
  gsap.set('.nav > *', { y: -24, opacity: 0 })
  gsap.set('.hero__top > *, .hero__bottom > *', { y: 24, opacity: 0 })
  const tl = gsap.timeline()
  tl.to('.boot__words', { yPercent: -120, duration: 0.7, ease: 'expo.in' })
    .to('.boot__top, .boot__bot', { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in' }, 0)
    .to(slats, { scaleY: 0, duration: 1.15, ease: 'expo.inOut', stagger: { each: 0.07, from: 'edges' } }, 0.35)
    .add(() => { $('.boot__ui').remove(); html.classList.add('is-ready') }, 0.6)
  if (heroApi) tl.add(heroApi.reveal(), 1.0)
  tl.to('.nav > *', { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 1.1)
    .to('.hero__top > *, .hero__bottom > *', { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.07 }, 1.2)
    .add(() => {
      $('.boot').remove()
      document.body.classList.remove('is-loading')
      lenis.start()
      ScrollTrigger.refresh()
    }, 1.6)
}

/* ---------------- build all scroll scenes ---------------- */
async function build() {
  initMagnetic()
  initCursor()
  redrawCovers()

  const caseView = initCase()
  initWork($('.work'), { onOpen: (i, rect) => caseView.open(i, rect) })

  initAbout($('.about'))

  /* EXPERIENCE (v2 survey map): the marker follows the route as you scroll */
  const exp = $('.exp')
  if (reduced) {
    const list = document.createElement('ol'); list.className = 'exp__list'
    $$('.stop', exp).forEach((s) => list.appendChild(s))
    $('.exp__pin', exp).appendChild(list)
    exp.classList.add('is-lite')
  } else {
    const route = initRoute(exp)
    ScrollTrigger.create({ trigger: exp, pin: '.exp__pin', start: 'top top', end: '+=280%', scrub: 0.8, onUpdate: (s) => route.set(s.progress) })
    gsap.from('.exp__head h2', { yPercent: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: exp, start: 'top 70%' } })
  }

  /* STACK (v2 logo sphere) */
  const tool = $('.stack__tool'), use = $('.stack__use')
  const orbit = initOrbit($('.orbit'), {
    finePointer: fine,
    onTool: (name, text) => {
      if (tool.textContent === name) return
      gsap.to([tool, use], { opacity: 0, y: -6, duration: 0.15, onComplete: () => {
        tool.textContent = name; use.textContent = text
        gsap.fromTo([tool, use], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'expo.out' })
      } })
    },
  })
  if (reduced) orbit()
  else {
    tickers.add(orbit)
    gsap.from('.stack__title .ln > span', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.stack', start: 'top 65%' } })
    gsap.from('.orbit', { scale: 0.55, rotate: -24, opacity: 0, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.orbit', start: 'top 85%' } })
    gsap.from('.stack__p, .stack__detail', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.stack', start: 'top 55%' } })
  }

  initProcess($('.process'))
  initDeck($('.words'))
  initClients($('.clients'))
  initContact($('.contact'))

  /* section lip flattens as each section arrives */
  $$('.sec:not(.hero)').forEach((s) => {
    gsap.fromTo(s, { '--c': 1 }, { '--c': 0, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 35%', scrub: true } })
  })

  /* nav + rail colours follow the section underneath */
  const rail = $('.rail'), railNum = $('.rail__num'), railName = $('.rail__name'), railBar = $('.rail__track i')
  $$('[data-rail]').forEach((s, i) => ScrollTrigger.create({
    trigger: s, start: 'top 60px', end: 'bottom 60px',
    onToggle: (st) => {
      if (!st.isActive) return
      nav.classList.toggle('is-light', s.classList.contains('sec--dark'))
      rail.classList.toggle('is-light', s.classList.contains('sec--dark'))
      rail.classList.toggle('is-accent', s.classList.contains('sec--accent'))
    },
  }))
  $$('[data-rail]').forEach((s, i) => ScrollTrigger.create({
    trigger: s, start: 'top 50%', end: 'bottom 50%',
    onToggle: (st) => {
      if (!st.isActive) return
      railNum.textContent = String(i + 1).padStart(2, '0')
      railName.textContent = s.dataset.rail
    },
    onUpdate: (st) => (railBar.style.transform = `scaleY(${st.progress})`),
  }))

  ScrollTrigger.sort()
  ScrollTrigger.refresh()
}

boot()
addEventListener('load', () => ScrollTrigger.refresh())
