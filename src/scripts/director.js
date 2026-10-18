// Director — the motion layer that ties the sections together.
// The idea: the page starts as noise and resolves into signal. Each effect here
// is that same gesture at a different scale, so nothing reads as an unrelated trick.
//   preloader   noise sharpens into the name as the counter climbs to lock
//   chapters    a live index names the stage of the pipeline you are in
//   veils       a sheet sinks into shadow while the next one lands on it
//   headings    letters scramble then settle while the type widens to full width
//   uncover     the last sheet lifts away to show the sign-off underneath
//   wipe        moving between pages is a curtain, not a reload

import { animate } from 'motion'
import { initWorkFx } from './work-fx.js'
import { initWorkTiles } from './work-tiles.js'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&0123456789'
const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]

/* Characters cycle through random glyphs before landing on the real one. */
export function settle(ch, delay, duration = 520) {
  const final = ch.dataset.c
  if (final === ' ') return
  setTimeout(() => {
    const t0 = performance.now()
    const tick = (now) => {
      if (now - t0 >= duration) { ch.textContent = final; return }
      ch.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0]
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, delay)
}

/* ---------------- Page wipe (runs on every page) ---------------- */
export function initWipe() {
  const root = document.documentElement
  const wipe = $('.wipe')
  if (!wipe) return
  const label = $('.wipe__label span', wipe)
  const reset = () => {
    wipe.getAnimations().forEach((a) => a.cancel()); wipe.style.pointerEvents = ''
    wipe.classList.remove('is-in', 'is-out', 'is-iris'); root.classList.remove('wipe-on', 'wipe-iris')
    wipe.style.removeProperty('clip-path'); wipe.style.removeProperty('--ir'); document.querySelector('.wipe-lead')?.remove()
    root.style.removeProperty('--wipe-bg'); root.style.removeProperty('--wipe-fg')
  }

  // Arriving: the curtain is already drawn (set in <head>); lift it.
  if (root.classList.contains('wipe-on')) {
    let name = '', iris = ''
    try { name = sessionStorage.getItem('amey-wipe') || ''; iris = sessionStorage.getItem('amey-wipe-iris') || ''; ['amey-wipe', 'amey-wipe-bg', 'amey-wipe-fg', 'amey-wipe-iris'].forEach((k) => sessionStorage.removeItem(k)) } catch {}
    label.textContent = name
    const lift = () => {
      if (iris) {
        // iris open: a circular hole grows from the middle of the screen and the new page appears through it
        wipe.classList.add('is-iris')
        const reach = Math.hypot(innerWidth, innerHeight) / 2 + 40
        animate(0, reach, {
          duration: 1.05, ease: [0.76, 0, 0.24, 1],
          onUpdate: (v) => wipe.style.setProperty('--ir', v + 'px'),
          onComplete: () => { reset(); wipe.classList.add('is-done') },
        })
        animate(label, { transform: ['translateY(0%)', 'translateY(-110%)'] }, { duration: 0.5, ease: [0.76, 0, 0.24, 1] })
        return
      }
      wipe.classList.add('is-out')
      wipe.addEventListener('animationend', () => { reset(); wipe.classList.add('is-done') }, { once: true })
    }
    const fonts = document.fonts?.ready ?? Promise.resolve()
    Promise.race([fonts, new Promise((r) => setTimeout(r, 900))]).then(() => setTimeout(lift, 120))
  }

  // Leaving: draw the curtain, name the destination, then go.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = e.target.closest('a[href]')
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return
    const url = new URL(a.href, location.href)
    if (url.origin !== location.origin || url.pathname === location.pathname) return
    e.preventDefault()
    const name = a.dataset.wipe || a.textContent.replace(/\s+/g, ' ').trim() || 'Amey Shelar'
    label.textContent = name
    wipe.classList.remove('is-done')
    const bg = a.dataset.wipeBg, fg = a.dataset.wipeFg
    if (bg && a.hasAttribute('data-iris')) {
      // Iris curtain: two circles open from the exact spot that was clicked. A thin leading curtain (the card's
      // text colour) runs just ahead of the main one (the card's colour), then the page is entered through an iris opening.
      root.style.setProperty('--wipe-bg', bg)
      if (fg) root.style.setProperty('--wipe-fg', fg)
      const ox = e.clientX || innerWidth / 2, oy = e.clientY || innerHeight / 2
      const reach = Math.max(Math.hypot(ox, oy), Math.hypot(innerWidth - ox, oy), Math.hypot(ox, innerHeight - oy), Math.hypot(innerWidth - ox, innerHeight - oy)) + 30
      const lead = document.createElement('div')
      lead.className = 'wipe-lead'
      lead.setAttribute('aria-hidden', 'true')
      lead.style.background = fg || '#fff'
      lead.style.clipPath = `circle(0px at ${ox}px ${oy}px)`
      document.body.appendChild(lead)
      wipe.classList.add('is-iris-out')
      wipe.style.clipPath = `circle(0px at ${ox}px ${oy}px)`
      wipe.style.pointerEvents = 'all'
      const ease = [0.76, 0, 0.24, 1]
      animate(lead, { clipPath: [`circle(0px at ${ox}px ${oy}px)`, `circle(${reach}px at ${ox}px ${oy}px)`] }, { duration: 0.8, ease })
      animate(wipe, { clipPath: [`circle(0px at ${ox}px ${oy}px)`, `circle(${reach}px at ${ox}px ${oy}px)`] }, { duration: 0.8, delay: 0.14, ease })
      animate(label, { transform: ['translateY(110%)', 'translateY(0%)'] }, { duration: 0.65, delay: 0.5, ease: [0.16, 1, 0.3, 1] })
      try { sessionStorage.setItem('amey-wipe-bg', bg); if (fg) sessionStorage.setItem('amey-wipe-fg', fg); sessionStorage.setItem('amey-wipe-iris', '1') } catch {}
    } else if (bg) {
      // Shared element: the card's own colour grows from where the card sits until it is the whole screen,
      // and the next page opens on that same colour.
      root.style.setProperty('--wipe-bg', bg)
      if (fg) root.style.setProperty('--wipe-fg', fg)
      const r = a.getBoundingClientRect()
      const from = `inset(${Math.max(0, r.top)}px ${Math.max(0, innerWidth - r.right)}px ${Math.max(0, innerHeight - r.bottom)}px ${Math.max(0, r.left)}px round 20px)`
      wipe.classList.add('is-shared')
      wipe.animate([{ clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], { duration: 850, easing: 'cubic-bezier(.76, 0, .24, 1)', fill: 'forwards' })
      wipe.style.pointerEvents = 'all'
      const lab = label.animate([{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], { duration: 650, delay: 380, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'forwards' })
      void lab
      try { sessionStorage.setItem('amey-wipe-bg', bg); if (fg) sessionStorage.setItem('amey-wipe-fg', fg) } catch {}
    } else {
      wipe.classList.add('is-in')
    }
    try { sessionStorage.setItem('amey-wipe', name) } catch {}
    setTimeout(() => { location.href = a.href }, bg ? 1050 : 900)
  })
  addEventListener('pageshow', (e) => { if (e.persisted) reset() })
}

/* ---------------- Headings: resolve + breathe open ---------------- */
export function resolveHeading(gsap, h) {
  const lines = h.innerHTML.split(/<br\s*\/?>/i)
  h.setAttribute('aria-label', lines.map((l) => l.replace(/<[^>]+>/g, '').trim()).join(' '))
  h.innerHTML = lines.map((l) => `<span class="ln" aria-hidden="true"><span class="ln__in">${l.trim()}</span></span>`).join('')
  // Each line rises out of its own mask. No glyph scrambling and no animated font width, so the
  // text is always real, always the same size, and never reflows while it moves.
  gsap.from($$('.ln__in', h), {
    yPercent: 112, duration: 1.1, ease: 'expo.out', stagger: 0.1,
    scrollTrigger: { trigger: h, start: 'top 88%', once: true },
  })
}

/* ---------------- Everything else on the home page ---------------- */
export function initDirector({ gsap, ScrollTrigger, mm }) {
  const root = document.documentElement
  const body = document.body
  if (body.classList.contains('interior')) return

  /* --- Chapters: the page is a pipeline, and a small index tells you which stage you are in --- */
  const chap = $('.chap')
  if (chap) {
    const roll = $('.chap__roll', chap), num = $('.chap__n', chap)
    const thread = $('.chap__thread i', chap), pct = $('.chap__pct', chap)
    const stages = [
      ['Overview', ['.hero']],
      ['Work', ['.work']],
      ['Story', ['.pic', '.lens', '.signal', '.about']],
      ['Craft', ['.caps', '.exp', '.stack']],
      ['Contact', ['.creds', '.contact']],
    ]
    let current = -1
    const show = (i) => {
      if (i === current) return
      const dir = i > current ? 1 : -1
      current = i
      const next = document.createElement('b')
      next.textContent = stages[i][0]
      roll.appendChild(next)
      const old = $$('b', roll).filter((b) => b !== next)
      gsap.fromTo(next, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.7, ease: 'expo.out' })
      gsap.to(old, { yPercent: -110 * dir, duration: 0.7, ease: 'expo.out', onComplete: () => old.forEach((o) => o.remove()) })
      num.textContent = String(i + 1).padStart(2, '0')
      chap.classList.toggle('is-off', i === 0)
    }
    stages.forEach(([, sels], i) => sels.forEach((sel) => {
      const el = $(sel)
      if (el) ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && show(i) })
    }))
    show(0)
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (s) => { gsap.set(thread, { scaleX: s.progress }); pct.textContent = String(Math.round(s.progress * 100)).padStart(3, '0') + '%' },
    })
  }

  initWorkFx({ gsap, ScrollTrigger })
  initWorkTiles({ gsap, ScrollTrigger })

  /* --- Veils: each sheet dims the one beneath it as it lands --- */
  $$('.sheet').forEach((sheet) => {
    const prev = sheet.previousElementSibling
    if (!prev || prev.classList.contains('exp')) return // the route keeps its own colour; no shadow over it
    const veil = document.createElement('span')
    veil.className = 'veil'
    veil.setAttribute('aria-hidden', 'true')
    prev.style.isolation = 'isolate'
    prev.appendChild(veil)
    gsap.to(veil, { opacity: 0.62, ease: 'none', scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top 12%', scrub: true } })
  })

  /* --- Work: the diagram is revealed through a window that opens as the panel arrives --- */
  mm.add('(min-width: 900px)', () => {
    $$('.proj').forEach((p) => {
      const art = $('.art', p)
      if (!art) return
      gsap.fromTo(art, { clipPath: 'inset(16% 12% 16% 12% round 28px)', scale: 1.12 }, {
        clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1, ease: 'power2.out',
        scrollTrigger: { trigger: p, start: 'top 82%', end: 'top 26%', scrub: 0.6 },
      })
    })
  })

  /* --- Footer uncover --- */
  const foot = $('.foot')
  const contact = $('.contact')
  if (foot && contact) {
    let footH = 0
    const measure = () => {
      footH = foot.offsetHeight
      const on = innerWidth >= 900 && footH <= innerHeight * 0.85
      body.classList.toggle('has-uncover', on)
      root.style.setProperty('--foot-h', on ? footH + 'px' : '0px')
    }
    measure()
    addEventListener('resize', () => { measure(); ScrollTrigger.refresh() })
    const word = $('.foot__word', foot), rest = $$('.foot__row, .foot__base', foot)
    gsap.fromTo(word, { yPercent: 38 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: contact, start: 'bottom bottom', end: () => `bottom bottom-=${footH || 300}`, scrub: true, invalidateOnRefresh: true },
    })
    gsap.fromTo(rest, { opacity: 0 }, {
      opacity: 1, ease: 'none',
      scrollTrigger: { trigger: contact, start: 'bottom bottom-=20%', end: () => `bottom bottom-=${footH || 300}`, scrub: true, invalidateOnRefresh: true },
    })
  }
}
