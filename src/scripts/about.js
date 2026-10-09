import { gsap, ScrollTrigger, $, $$, tickers, watchVisible, reduced, clamp, time } from './core.js'
import { makeMarquee } from './marquee.js'
import { initAboutComposition } from './about-reveal.js'

/*
  About. The statement is split into words that light up as you scroll while
  small live canvases ("pills") open inline between them. A scribble in one
  pill straightens as the sentence completes. The portrait and supporting copy assemble together.
*/

const INK = '#0e0e0d', ACC = '#ff4b26', BONE = '#ece9e1'

const painters = {
  // soft vermilion blobs drifting
  flow(c, w, h, t) {
    c.fillStyle = ACC; c.fillRect(0, 0, w, h)
    for (let i = 0; i < 4; i++) {
      const x = w * (0.5 + 0.42 * Math.sin(t * (0.7 + i * 0.23) + i * 2)), y = h * (0.5 + 0.5 * Math.cos(t * (0.9 + i * 0.17) + i))
      const g = c.createRadialGradient(x, y, 0, x, y, h * 1.1)
      g.addColorStop(0, i % 2 ? '#ffd2a8' : '#ffe9d6'); g.addColorStop(1, 'rgba(255,75,38,0)')
      c.fillStyle = g; c.fillRect(0, 0, w, h)
    }
  },
  // a scribble that straightens as the sentence completes
  tangle(c, w, h, t, p) {
    c.fillStyle = INK; c.fillRect(0, 0, w, h)
    c.lineWidth = 2.2; c.lineCap = 'round'
    const k = 1 - p
    for (let j = 0; j < 4; j++) {
      c.strokeStyle = j === 0 ? ACC : 'rgba(236,233,225,0.85)'
      c.beginPath()
      for (let x = 0; x <= w; x += 3) {
        const u = x / w
        const amp = k * (h * 0.46) * (0.6 + 0.4 * Math.sin(u * 7 + j))
        const y = h / 2 + Math.sin(u * (9 + j * 3) + t * 1.6 + j * 1.7) * amp * Math.sin(u * 3 + j) + Math.cos(u * (5 + j) - t * 1.1) * amp * 0.5
        x ? c.lineTo(x, y) : c.moveTo(x, y)
      }
      c.stroke()
    }
  },
  // ink dots that breathe
  dots(c, w, h, t) {
    c.fillStyle = BONE; c.fillRect(0, 0, w, h)
    c.fillStyle = INK
    const s = h / 4
    for (let y = 0; y < 4; y++) for (let x = 0; x < Math.ceil(w / s); x++) {
      const r = (0.5 + 0.5 * Math.sin(t * 2 - x * 0.7 + y * 0.9)) * s * 0.42 + 1
      c.beginPath(); c.arc(x * s + s / 2, y * s + s / 2, r, 0, Math.PI * 2); c.fill()
    }
  },
}

export function initAbout(root) {
  const lead = $('.about__lead', root)

  /* tokenise: words become spans, pills stay */
  const nodes = [...lead.childNodes]
  lead.textContent = ''
  const words = []
  const pills = []
  nodes.forEach((n) => {
    if (n.nodeType === 3) {
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return
        if (/^\s+$/.test(part)) { lead.appendChild(document.createTextNode(' ')); return }
        const s = document.createElement('span')
        s.className = 'wd'; s.textContent = part
        if (/^obvious/i.test(part)) s.classList.add('wd--acc')
        lead.appendChild(s); words.push(s)
      })
    } else {
      lead.appendChild(n)
      const cv = document.createElement('canvas'); cv.className = 'pill__cv'; cv.width = 240; cv.height = 80
      n.appendChild(cv)
      pills.push({ el: n, cv, ctx: cv.getContext('2d'), type: n.dataset.pill, after: words.length - 1 })
    }
  })

  /* pills paint themselves while visible */
  const vis = watchVisible(root, null, '100px')
  const fillState = { p: reduced ? 1 : 0 }
  const paintAll = (t) => pills.forEach((p) => painters[p.type](p.ctx, p.cv.width, p.cv.height, t, fillState.p))
  paintAll(0)
  if (!reduced) tickers.add((dt, t) => { if (vis.on) paintAll(t) })

  if (reduced) {
    words.forEach((w) => (w.style.color = w.classList.contains('wd--acc') ? ACC : INK))
    pills.forEach((p) => p.el.classList.add('is-open'))
  } else {
    const n = words.length
    gsap.set(words, { color: 'rgba(14,14,13,0.13)' })
    gsap.set(pills.map((p) => p.el), { width: 0, marginLeft: 0, marginRight: 0, opacity: 0 })
    const tl = gsap.timeline({ scrollTrigger: { trigger: root, pin: $('.about__pin', root), start: 'top top', end: '+=' + Math.round(innerHeight * 2.1), scrub: 0.6, anticipatePin: 1 } })
    const slot = 1 / n
    words.forEach((w, i) => {
      tl.to(w, { color: w.classList.contains('wd--acc') ? ACC : INK, duration: slot * 1.6, ease: 'none' }, i * slot * 0.9)
    })
    pills.forEach((p) => {
      const at = Math.max(0, p.after) * slot * 0.9 + slot * 0.6
      tl.to(p.el, { width: '2.5em', marginLeft: '0.14em', marginRight: '0.14em', opacity: 1, duration: slot * 3.2, ease: 'power2.inOut' }, at)
    })
    tl.to(fillState, { p: 1, duration: 1, ease: 'none' }, 0)
    tl.to({}, { duration: 0.12 }) // a short hold on the finished sentence
  }

  initAboutComposition(root)
  makeMarquee($('.marquee', root), { speed: 70, dir: 1, lean: 10 })
}
