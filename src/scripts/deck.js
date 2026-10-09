import { gsap, ScrollTrigger, SplitText, $, $$, clamp, reduced, watchVisible } from './core.js'
import { makeMarquee } from './marquee.js'

/*
  Education: a deck of cards you can drag and throw. Release past a
  threshold (or with a flick) and the card flies off, then rejoins the back
  of the deck. Arrow buttons do the same for keyboards and touch.
*/
export function initDeck(root) {
  const deck = $('.deck', root)
  const cards = $$('.card', deck)
  const N = cards.length
  const countB = $('.words__count b', root)
  const words = cards.map((c) => SplitText.create($('.card__text', c), { type: 'words', wordsClass: 'dw' }).words)
  let order = cards.map((_, i) => i)   // order[0] is the top card
  let busy = false, interacted = false
  const slot = (s) => ({ y: s * 22, scale: 1 - s * 0.055, rotate: s === 0 ? 0 : (s % 2 ? 1 : -1) * (1.6 + s * 1.4), opacity: s > 2 ? 0 : 1 })

  makeMarquee($('.words__bg', root), { speed: 46, dir: -1, lean: 6 })

  const layout = (animate = true, skipTop = false) => {
    order.forEach((ci, s) => {
      const el = cards[ci]
      el.style.zIndex = String(N - s)
      el.classList.toggle('is-top', s === 0)
      el.setAttribute('aria-hidden', s === 0 ? 'false' : 'true')
      if (skipTop && s === 0) return
      const p = slot(s)
      if (!animate || reduced) gsap.set(el, { x: 0, ...p })
      else gsap.to(el, { x: 0, ...p, duration: 1.1, ease: 'elastic.out(1, 0.7)', overwrite: 'auto' })
    })
    countB.textContent = order[0] + 1
  }
  const revealTop = (first = false) => {
    const w = words[order[0]]
    if (reduced) return
    gsap.fromTo(w, { opacity: 0, y: 18, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.018, ease: 'expo.out', delay: first ? 0.2 : 0.35, overwrite: true })
  }

  const throwTop = (dir, vx = 0, vy = 0) => {
    if (busy) return
    busy = true; interacted = true
    const el = cards[order[0]]
    gsap.to(el, {
      x: dir * innerWidth * 0.85, y: el._y + vy * 0.25, rotate: dir * 26, opacity: 0, duration: 0.75, ease: 'power3.in', overwrite: true,
      onComplete: () => {
        order.push(order.shift())
        gsap.set(el, { x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.9 })
        layout(true)
        revealTop()
        busy = false
      },
    })
    // the next card rises into place while the top one leaves
    const next = cards[order[1]]
    gsap.to(next, { y: 0, scale: 1, rotate: 0, duration: 0.8, ease: 'expo.out', overwrite: true })
    countB.textContent = order[1] + 1
  }
  const bringBack = () => {
    if (busy) return
    busy = true; interacted = true
    const ci = order.pop()
    order.unshift(ci)
    const el = cards[ci]
    gsap.set(el, { x: -innerWidth * 0.8, y: 0, rotate: -24, opacity: 0, scale: 1 })
    layout(true, true)
    gsap.to(el, { x: 0, rotate: 0, opacity: 1, duration: 1.0, ease: 'expo.out', onComplete: () => (busy = false) })
    revealTop()
  }

  /* ---- dragging ---- */
  let drag = null
  deck.addEventListener('pointerdown', (e) => {
    const top = cards[order[0]]
    if (busy || !top.contains(e.target) && e.target !== top) return
    interacted = true
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), lx: e.clientX, ly: e.clientY, lt: performance.now(), vx: 0, vy: 0, dx: 0, dy: 0 }
    deck.setPointerCapture?.(e.pointerId)
    gsap.killTweensOf(top)
    top.classList.add('is-drag')
  })
  deck.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return
    const top = cards[order[0]]
    drag.dx = e.clientX - drag.x0; drag.dy = e.clientY - drag.y0
    const now = performance.now(), dt = Math.max(1, now - drag.lt)
    drag.vx = (e.clientX - drag.lx) / dt * 1000; drag.vy = (e.clientY - drag.ly) / dt * 1000
    drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now
    top._y = drag.dy * 0.6
    gsap.set(top, { x: drag.dx, y: top._y, rotate: drag.dx * 0.05 })
    // the card underneath leans in as you pull
    const k = clamp(Math.abs(drag.dx) / 260, 0, 1)
    const nx = cards[order[1]]
    gsap.set(nx, { scale: 1 - 0.055 + 0.055 * k, y: 22 - 22 * k })
  })
  const end = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return
    const top = cards[order[0]]
    top.classList.remove('is-drag')
    const { dx, vx, vy } = drag
    drag = null
    if (Math.abs(dx) > 150 || Math.abs(vx) > 900) throwTop(dx !== 0 ? Math.sign(dx) : Math.sign(vx), vx, vy)
    else { layout(true) }
  }
  deck.addEventListener('pointerup', end)
  deck.addEventListener('pointercancel', end)

  $$('.rbtn', root).forEach((b) => b.addEventListener('click', () => (+b.dataset.dir > 0 ? throwTop(1) : bringBack())))
  addEventListener('keydown', (e) => {
    const r = root.getBoundingClientRect()
    if (r.top > innerHeight * 0.5 || r.bottom < innerHeight * 0.5) return
    if (e.key === 'ArrowRight' && !e.target.closest?.('input,textarea')) throwTop(1)
    if (e.key === 'ArrowLeft' && !e.target.closest?.('input,textarea')) bringBack()
  })

  layout(false)
  cards.forEach((c) => (c._y = 0))
  if (!reduced) {
    gsap.set(words.flat(), { opacity: 0 })
    ScrollTrigger.create({ trigger: root, start: 'top 55%', once: true, onEnter: () => {
      gsap.from(cards, { y: 160, rotate: (i) => (i % 2 ? 8 : -8), opacity: 0, duration: 1.4, ease: 'expo.out', stagger: -0.1, clearProps: 'opacity' })
      revealTop(true)
    } })
    // a small nudge now and then invites a drag
    const vis = watchVisible(root)
    setInterval(() => {
      if (!vis.on || interacted || busy || drag) return
      const top = cards[order[0]]
      gsap.timeline().to(top, { x: 26, rotate: 2.4, duration: 0.5, ease: 'power2.out' }).to(top, { x: 0, rotate: 0, duration: 1.2, ease: 'elastic.out(1, 0.45)' })
    }, 5200)
  } else gsap.set(words.flat(), { opacity: 1 })
}
