import { gsap, ScrollTrigger, $, $$, tickers, pointer, clamp, fine, reduced, charRoll } from './core.js'
import { cover } from './covers.js'
import { drawPoster } from './posters.js'

/*
  Clients. A typographic list. Hovering a row rolls its name, dims the rest
  and a poster follows the cursor, tilting with its speed.
*/
const TW = 300, TH = 380
const POSTERS = ['swiss', 'ui', 'dots', 'type']

function thumb(k) {
  const cv = document.createElement('canvas')
  cv.width = TW * 2; cv.height = TH * 2
  const c = cv.getContext('2d')
  // rows 0..5 map onto the five project covers; the rest use the poster system
  const map = { 0: 2, 1: 0, 3: 4, 4: 1, 5: 3 }
  if (k in map) {
    const src = cover(map[k])
    const sh = src.height, sw = sh * (TW / TH)
    c.drawImage(src, (src.width - sw) / 2, 0, sw, sh, 0, 0, cv.width, cv.height)
  } else drawPoster(cv, cv.width, cv.height, k + 3, POSTERS[k % POSTERS.length])
  return cv
}

export function initClients(root) {
  const list = $('.clist', root)
  const rows = $$('.crow', list)
  const peek = $('.peek', root), peekIn = $('.peek__in', peek), pc = $('canvas', peek)
  const pctx = pc.getContext('2d')
  pc.width = TW * 2; pc.height = TH * 2
  rows.forEach((r) => charRoll($('.crow__name', r)))
  const thumbs = new Map()

  if (!reduced) {
    rows.forEach((r, i) => {
      const line = document.createElement('i'); line.className = 'crow__line'; r.prepend(line)
      gsap.set(line, { scaleX: 0 })
      gsap.from($$(':scope > span', r), { yPercent: 100, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: r, start: 'top 92%' } })
      gsap.to(line, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: r, start: 'top 92%' } })
    })
  }

  if (!fine || reduced) {
    // touch: tap a row to open its description
    rows.forEach((r) => r.addEventListener('click', () => { const on = r.classList.contains('is-open'); rows.forEach((x) => x.classList.remove('is-open')); r.classList.toggle('is-open', !on) }))
    return
  }

  const S = { x: innerWidth / 2, y: innerHeight / 2, rot: 0, on: false, cur: -1, vx: 0 }
  const show = (k) => {
    if (k === S.cur) return
    S.cur = k
    if (!thumbs.has(k)) thumbs.set(k, thumb(k))
    pctx.drawImage(thumbs.get(k), 0, 0, pc.width, pc.height)
    gsap.fromTo(peekIn, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.out', overwrite: 'auto' })
    gsap.fromTo(pc, { scale: 1.3 }, { scale: 1, duration: 1, ease: 'expo.out', overwrite: 'auto' })
  }
  rows.forEach((r) => {
    r.addEventListener('pointerenter', () => { S.on = true; show(+r.dataset.art); gsap.to(peekIn, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' }) })
  })
  list.addEventListener('pointerleave', () => { S.on = false; S.cur = -1; gsap.to(peekIn, { opacity: 0, scale: 0.7, duration: 0.45, ease: 'power3.in', overwrite: 'auto' }) })
  gsap.set(peekIn, { opacity: 0, scale: 0.7 })

  tickers.add((dt) => {
    if (!S.on && !(+gsap.getProperty(peekIn, 'opacity') > 0.01)) return
    const tx = pointer.x + 60, ty = pointer.y - TH / 2
    const px = S.x
    S.x += (tx - S.x) * Math.min(1, dt * 9); S.y += (ty - S.y) * Math.min(1, dt * 9)
    S.vx += ((S.x - px) / Math.max(dt, 0.001) - S.vx) * 0.2
    S.rot += (clamp(S.vx * 0.012, -16, 16) - S.rot) * Math.min(1, dt * 8)
    peek.style.transform = `translate3d(${S.x.toFixed(1)}px, ${S.y.toFixed(1)}px, 0) rotate(${S.rot.toFixed(2)}deg)`
  })
}
