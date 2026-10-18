// Skill Transit Map — interaction and motion.
// Content is fully visible without this script; motion is layered on only
// when the visitor has not asked for reduced motion (?motion=off also works).

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const root = document.documentElement
const motion = root.classList.contains('is-motion')
const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const header = $('.sign')
const headerH = () => header?.offsetHeight ?? 68

/* ---------------- Smooth scroll ---------------- */
let lenis = null
if (motion) {
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

function goTo(target) {
  const el = typeof target === 'string' ? document.getElementById(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: el.id === 'top' ? 0 : -headerH() + 1, duration: 1.4 })
  else el.scrollIntoView({ behavior: motion ? 'smooth' : 'auto' })
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

/* ---------------- Header: hide on the way down ---------------- */
let lastY = scrollY
const onScroll = () => {
  const y = scrollY
  const menuOpen = $('.sign__menu')?.getAttribute('aria-expanded') === 'true'
  header?.classList.toggle('is-hidden', !menuOpen && y > 400 && y > lastY + 4)
  if (y < lastY - 4 || y < 400) header?.classList.remove('is-hidden')
  lastY = y
}
addEventListener('scroll', onScroll, { passive: true })
header?.addEventListener('focusin', () => header.classList.remove('is-hidden'))

/* ---------------- Mobile menu ---------------- */
const menuBtn = $('.sign__menu')
const menu = $('#menu')
function closeMenu() {
  if (!menu || menu.hidden) return
  menu.hidden = true
  menuBtn.setAttribute('aria-expanded', 'false')
  menuBtn.querySelector('span').textContent = 'Menu'
  lenis?.start()
}
menuBtn?.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') !== 'true'
  if (!open) { closeMenu(); menuBtn.focus(); return }
  menu.hidden = false
  menuBtn.setAttribute('aria-expanded', 'true')
  menuBtn.querySelector('span').textContent = 'Close'
  lenis?.stop()
  menu.querySelector('a')?.focus()
})
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu && !menu.hidden) { closeMenu(); menuBtn.focus() } })
addEventListener('resize', () => { if (innerWidth > 1100) closeMenu() })

/* ---------------- Departure-board flap text ---------------- */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
function flap(el, { duration = 0.9, stagger = 0.035 } = {}) {
  const final = el.dataset.text ?? el.textContent
  el.dataset.text = final
  if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', final)
  const chars = [...final]
  const start = performance.now()
  return new Promise((resolve) => {
    const tick = (now) => {
      const t = (now - start) / 1000
      let done = true
      el.textContent = chars.map((c, i) => {
        if (c === ' ' || c === '.' || c === '’') return c
        const settle = duration * 0.45 + i * stagger
        if (t >= settle) return c
        done = false
        return GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }).join('')
      if (done) { el.textContent = final; resolve() } else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

/* ---------------- Copy email ---------------- */
$$('.copy-email').forEach((btn) => {
  const state = btn.querySelector('.copy-email__state')
  btn.addEventListener('click', async () => {
    const email = btn.dataset.email
    try {
      await navigator.clipboard.writeText(email)
      state.textContent = 'Copied'
    } catch {
      location.href = `mailto:${email}`
      state.textContent = 'Opening mail'
    }
    clearTimeout(btn._t)
    btn._t = setTimeout(() => (state.textContent = 'Copy'), 2400)
  })
})

/* ---------------- Journey planner (prepares an email) ---------------- */
const planner = $('[data-planner]')
planner?.addEventListener('submit', (e) => {
  e.preventDefault()
  const status = $('.planner__status', planner)
  const fields = $$('input[name="name"], input[name="email"], textarea', planner)
  let firstBad = null
  fields.forEach((f) => {
    const ok = f.checkValidity()
    f.closest('.field').classList.toggle('is-invalid', !ok)
    f.setAttribute('aria-invalid', String(!ok))
    if (!ok && !firstBad) firstBad = f
  })
  if (firstBad) {
    status.classList.add('is-error')
    const label = firstBad.closest('.field').querySelector('span').textContent
    status.textContent = firstBad.type === 'email' && firstBad.value
      ? 'That email address looks incomplete. Check it and try again.'
      : firstBad.name === 'message' && firstBad.value
        ? 'Add a little more detail (at least 10 characters).'
        : `Please fill in “${label}”.`
    firstBad.focus()
    return
  }
  const data = new FormData(planner)
  const subject = `${data.get('type')} — from ${data.get('name')}`
  const body = `${data.get('message')}\n\n${data.get('name')}\n${data.get('email')}`
  status.classList.remove('is-error')
  status.textContent = 'Your email app is opening with the message ready to send.'
  location.href = `mailto:ameys436@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
})
planner?.addEventListener('input', (e) => {
  const f = e.target.closest('.field')
  if (f?.classList.contains('is-invalid') && e.target.checkValidity()) { f.classList.remove('is-invalid'); e.target.setAttribute('aria-invalid', 'false') }
})

/* ---------------- Skill network ---------------- */
const network = $('[data-network]')
if (network) {
  const keys = $$('.line-key', network)
  const routes = $$('.route', network)
  const stations = $$('.station', network)
  const capsules = $$('.capsule', network)
  const boards = $$('[data-board]', network)
  const corridors = $$('[data-corridor]', network)
  let active = null

  const showBoard = (id) => boards.forEach((b) => (b.hidden = b.dataset.board !== id))

  function selectLine(id) {
    active = active === id ? null : id
    keys.forEach((k) => k.setAttribute('aria-pressed', String(k.dataset.line === active)))
    routes.forEach((r) => r.classList.toggle('is-dim', !!active && r.dataset.route !== active))
    stations.forEach((s) => s.classList.toggle('is-dim', !!active && s.dataset.route !== active))
    capsules.forEach((c) => { c.classList.remove('is-active'); c.classList.toggle('is-dim', !!active && !c.dataset.serves.split(' ').includes(active)) })
    showBoard(active ?? 'default')
    corridors.forEach((c) => c.classList.toggle('is-shown', c.dataset.corridor === (active ?? 'frontend')))
    if (active && motion) {
      const path = $(`.route[data-route="${active}"] .route__path`, network)
      gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: 'power3.out', overwrite: true })
    }
  }

  function selectCapsule(cap) {
    const id = cap.dataset.capsule
    const on = !cap.classList.contains('is-active')
    active = null
    keys.forEach((k) => k.setAttribute('aria-pressed', 'false'))
    const serves = cap.dataset.serves.split(' ')
    capsules.forEach((c) => { c.classList.toggle('is-active', on && c === cap); c.classList.toggle('is-dim', on && c !== cap) })
    routes.forEach((r) => r.classList.toggle('is-dim', on && !serves.includes(r.dataset.route)))
    stations.forEach((s) => s.classList.toggle('is-dim', on && !serves.includes(s.dataset.route)))
    showBoard(on ? `x-${id}` : 'default')
  }

  keys.forEach((k) => k.addEventListener('click', () => selectLine(k.dataset.line)))
  capsules.forEach((c) => {
    c.addEventListener('click', () => selectCapsule(c))
    c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCapsule(c) } })
  })
  corridors[0]?.classList.add('is-shown')

  if (motion) {
    const paths = $$('.route__path', network)
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 })
    // Intro uses autoAlpha/scale, then clears its inline styles so the
    // .is-dim class can take over opacity once the visitor picks a line.
    network.classList.add('is-arriving')
    const arrive = () => {
      if (!network.classList.contains('is-arriving')) return
      gsap.set([...stations, ...capsules], { opacity: 0 })
      network.classList.remove('is-arriving')
      gsap.to(paths, { strokeDashoffset: 0, ease: 'power2.inOut', stagger: 0.14, duration: 1.6 })
      gsap.fromTo(stations, { opacity: 0 }, { opacity: 1, stagger: { each: 0.025, from: 'center' }, duration: 0.4, delay: 0.7, clearProps: 'opacity' })
      capsules.forEach((c, i) => gsap.fromTo(c, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, ease: 'back.out(2.2)', duration: 0.6, delay: 0.9 + i * 0.08, clearProps: 'opacity,transform' }))
    }
    ScrollTrigger.create({ trigger: '.network__stage', start: 'top 78%', once: true, onEnter: arrive })
    const settle = () => { gsap.killTweensOf([...paths, ...stations, ...capsules]); gsap.set(paths, { strokeDashoffset: 0 }); gsap.set([...stations, ...capsules], { clearProps: 'opacity,transform' }); network.classList.remove('is-arriving') }
    keys.forEach((k) => k.addEventListener('click', settle, { capture: true }))
    capsules.forEach((c) => c.addEventListener('click', settle, { capture: true }))
  }
}

/* ---------------- Route rail + current nav ---------------- */
const stopLinks = $$('[data-stop]')
const navLinks = $$('.sign__nav a')
const sections = ['top', 'network', 'work', 'photo', 'journey', 'contact'].map((id) => document.getElementById(id)).filter(Boolean)
const railFill = $('.rail__track')
function setCurrent(id) {
  stopLinks.forEach((a) => a.classList.toggle('is-current', a.dataset.stop === id))
  navLinks.forEach((a) => a.classList.toggle('is-current', a.hash === `#${id}`))
}
if (sections.length) {
  sections.forEach((sec) => ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: (self) => self.isActive && setCurrent(sec.id) }))
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => railFill?.style.setProperty('--progress', self.progress.toFixed(4)) })
}

/* ---------------- Motion layer ---------------- */
if (motion) {
  const mm = gsap.matchMedia()

  /* Loader: a split-flap board, once per session */
  const heroIntro = () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    const lines = $$('.hero__lines path')
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 })
    tl.to(lines, { strokeDashoffset: 0, duration: 1.6, stagger: 0.12, ease: 'power3.inOut' }, 0)
      .from('.hero__ring', { scale: 0.2, opacity: 0, duration: 1.3 }, 0.55)
      .from('.hero__tags text', { opacity: 0, duration: 0.6, stagger: 0.08 }, 1.1)
      .from('.hero__role, .hero__lede, .hero__actions', { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, 0.5)
      .from('.hero__board > div', { y: 40, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.8)
    $$('[data-flap]').forEach((el, i) => setTimeout(() => flap(el, { duration: 0.8, stagger: 0.05 }), i * 160))
  }

  let seen = false
  try { seen = sessionStorage.getItem('amey-boarded') === '1'; sessionStorage.setItem('amey-boarded', '1') } catch {}
  if ($('.hero') && !seen && !location.hash) {
    const board = document.createElement('div')
    board.className = 'flapboard'
    board.setAttribute('role', 'presentation')
    const text = 'AMEY SHELAR'
    board.innerHTML = `<div class="flapboard__row">${[...text].map((c) => `<span class="flapboard__ch${c === ' ' ? ' is-gap' : ''}">${c === ' ' ? '' : '&nbsp;'}</span>`).join('')}</div>
      <div class="flapboard__lines"><i style="--line:var(--red)"></i><i style="--line:var(--blue)"></i><i style="--line:var(--amber)"></i><i style="--line:var(--green)"></i></div>
      <button type="button" class="flapboard__skip">Skip intro</button>`
    document.body.appendChild(board)
    lenis?.stop()
    const cells = $$('.flapboard__ch:not(.is-gap)', board)
    const chars = text.replace(' ', '')
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      gsap.to(board, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', onComplete: () => board.remove() })
      lenis?.start()
      heroIntro()
      removeEventListener('keydown', onKey)
    }
    const onKey = (e) => { if (e.key === 'Escape') finish() }
    addEventListener('keydown', onKey)
    $('.flapboard__skip', board).addEventListener('click', finish)
    gsap.from($$('.flapboard__lines i', board), { scaleX: 0, duration: 1.2, stagger: 0.08, ease: 'expo.inOut' })
    cells.forEach((cell, i) => {
      const end = 500 + i * 70
      const t0 = performance.now()
      const spin = (now) => {
        if (now - t0 >= end) { cell.textContent = chars[i]; gsap.fromTo(cell, { rotateX: -90 }, { rotateX: 0, duration: 0.35, ease: 'back.out(2)' }); return }
        cell.textContent = GLYPHS[(Math.random() * 26) | 0]
        requestAnimationFrame(spin)
      }
      requestAnimationFrame(spin)
    })
    setTimeout(finish, 1750)
    setTimeout(() => board.isConnected && finish(), 3500)
  } else if ($('.hero')) {
    heroIntro()
  }

  /* Hero: the junction drifts back as the page leaves Central */
  if ($('.hero')) {
    gsap.to('.hero__junction', { yPercent: -18, rotate: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('.hero__name', { yPercent: -22, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
  }

  /* Ticker: constant crawl, pushed by scroll velocity */
  const track = $('.ticker__track')
  if (track) {
    let x = 0, boost = 0, dir = -1
    const setWidth = () => $('.ticker__set', track).offsetWidth
    let w = setWidth()
    addEventListener('resize', () => (w = setWidth()))
    ScrollTrigger.create({ trigger: '.ticker', start: 'top bottom', end: 'bottom top', onUpdate: (self) => { boost = Math.min(Math.abs(self.getVelocity()) / 120, 14); dir = self.direction === 1 ? -1 : 1 } })
    gsap.ticker.add(() => {
      boost *= 0.92
      x += dir * (0.6 + boost)
      if (x <= -w) x += w
      if (x > 0) x -= w
      track.style.transform = `translate3d(${x}px,0,0)`
    })
  }

  /* Section headings flap in like a departures board */
  $$('h2.display').forEach((h) => {
    ScrollTrigger.create({ trigger: h, start: 'top 82%', once: true, onEnter: () => flap(h, { duration: 0.7, stagger: 0.025 }) })
  })
  gsap.utils.toArray('.chapter__head p, .toolbox').forEach((el) => {
    gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
  })

  /* Work: cards stack — each arriving card pushes the last one back */
  const cards = $$('.card')
  cards.forEach((card, i) => {
    const nextCard = cards[i + 1]
    if (!nextCard) return
    gsap.to(card.querySelector('.card__inner'), {
      scale: 0.9, yPercent: -2, '--veil': 0.86, ease: 'none',
      scrollTrigger: { trigger: nextCard, start: 'top bottom', end: () => `top ${headerH() + 40}px`, scrub: true },
    })
  })
  cards.forEach((card) => {
    const lines = $$('.art__line', card)
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.to(lines, { strokeDashoffset: 0, duration: 1.4, stagger: 0.15, ease: 'power3.inOut', scrollTrigger: { trigger: card, start: 'top 70%' } })
    gsap.from($$('.card__body > *', card), { y: 34, opacity: 0, duration: 1, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 70%' } })
  })

  /* Portrait: the interchange ring opens into the full photograph */
  if ($('.photo')) mm.add('(min-width: 900px)', () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.photo', start: 'top top', end: 'bottom bottom', scrub: 1 } })
    tl.fromTo('.photo__frame', { clipPath: 'circle(19% at 50% 30%)' }, { clipPath: 'circle(75% at 50% 50%)', ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo('.photo__frame img', { scale: 1.35 }, { scale: 1, ease: 'power2.out', duration: 1 }, 0)
      .fromTo('.photo__edge', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 1 }, 0)
      .fromTo('.photo__nameboard', { yPercent: 110 }, { yPercent: 0, ease: 'expo.out', duration: 0.5 }, 0.6)
      .fromTo('.photo__ticket', { y: 120, opacity: 0, rotate: 3 }, { y: 0, opacity: 1, rotate: 0, ease: 'expo.out', duration: 0.6 }, 0.55)
  })
  if ($('.photo')) mm.add('(max-width: 899px)', () => {
    gsap.fromTo('.photo__frame', { clipPath: 'circle(24% at 50% 30%)' }, { clipPath: 'circle(80% at 50% 50%)', ease: 'none', scrollTrigger: { trigger: '.photo__frame', start: 'top 85%', end: 'center 45%', scrub: true } })
  })

  /* Journey: ride the line horizontally, snapping to each station */
  if ($('.journey')) mm.add('(min-width: 900px)', () => {
    const pin = $('.journey__pin')
    const viewport = $('.journey__viewport')
    const trackEl = $('.journey__track')
    const stops = $$('.stop')
    const train = $('.journey__train')
    const rail = $('.journey__rail')
    const distance = () => Math.max(0, trackEl.scrollWidth - viewport.clientWidth)
    const snaps = () => {
      const d = distance()
      return stops.map((s) => Math.min(1, Math.max(0, (s.offsetLeft - parseFloat(getComputedStyle(trackEl).paddingLeft)) / d)))
    }
    const update = (p) => {
      const first = stops[0].offsetLeft, last = stops[stops.length - 1].offsetLeft
      const pos = first + p * (last - first)
      gsap.set(train, { x: pos })
      rail.style.setProperty('--ride', Math.min(1, Math.max(0, (pos + 40 - rail.offsetLeft) / rail.offsetWidth)).toFixed(4))
      stops.forEach((s) => s.classList.toggle('is-passed', s.offsetLeft <= pos + 12))
    }
    const tween = gsap.to(trackEl, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: pin, pin: true, start: 'top top', end: () => `+=${distance()}`, scrub: 0.6, invalidateOnRefresh: true,
        snap: { snapTo: (v) => gsap.utils.snap(snaps(), v), duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power2.inOut' },
        onUpdate: (self) => update(self.progress), onRefresh: (self) => update(self.progress),
      },
    })
    ScrollTrigger.create({ trigger: '.journey', start: 'top 55%', end: 'bottom 45%', toggleClass: { targets: '.rail', className: 'is-away' } })
    stops.forEach((s) => gsap.from($('.stop__card', s), { y: 50, opacity: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: s, containerAnimation: tween, start: 'left 85%' } }))
    return () => gsap.set([trackEl, train], { clearProps: 'all' })
  })
  if ($('.journey')) mm.add('(max-width: 899px)', () => {
    const rail = $('.journey__rail')
    ScrollTrigger.create({ trigger: '.journey__stops', start: 'top 70%', end: 'bottom 70%', scrub: true, onUpdate: (self) => rail.style.setProperty('--ride', self.progress.toFixed(4)) })
  })

  /* Tickets drop in like they were just issued */
  if ($('.tickets')) gsap.from('.ticket', { y: 80, rotate: (i) => [-4, 3, -2][i] ?? 0, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.tickets', start: 'top 85%' } })

  /* Contact: the closing sign slides in on its axis */
  if ($('.contact')) {
    gsap.from('.contact__title span', { xPercent: (i) => (i ? 18 : -18), opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.contact', start: 'top 70%' } })
    gsap.from('.planner', { y: 90, rotate: 2, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.planner', start: 'top 90%' } })
  }

  /* Case study: draw the route of steps */
  const route = $('.case__route')
  if (route) {
    gsap.from($$('.case__route li', route), { x: -30, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'expo.out', scrollTrigger: { trigger: route, start: 'top 75%' } })
    const lines = $$('.art__line')
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.to(lines, { strokeDashoffset: 0, duration: 1.6, stagger: 0.15, ease: 'power3.inOut', delay: 0.3 })
    gsap.from('.case__title, .case__thesis, .case__lines', { y: 50, opacity: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out' })
  }

  addEventListener('load', () => ScrollTrigger.refresh())
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
}

/* Direct hash entry lands below the fixed sign */
if (location.hash && document.getElementById(location.hash.slice(1))) {
  addEventListener('load', () => setTimeout(() => goTo(location.hash.slice(1)), 60))
}
