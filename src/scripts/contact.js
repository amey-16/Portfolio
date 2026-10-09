import Matter from 'matter-js'
import { gsap, ScrollTrigger, SplitText, $, $$, tickers, pointer, clamp, fine, reduced, watchVisible, charRoll } from './core.js'

/*
  Contact + footer.
  - The headline's letters bulge and flush vermilion around the cursor.
  - The page is a curtain: the footer is fixed underneath and revealed as the
    last section lifts away.
  - In the footer, a pile of tags drops under real physics and can be thrown.
*/

export function initContact(root) {
  /* ---- headline: proximity wave ---- */
  const split = SplitText.create($$('.ct-line', root), { type: 'chars', mask: 'chars', charsClass: 'cch' })
  const chars = split.chars
  if (!reduced) {
    gsap.set(chars, { yPercent: 115 })
    ScrollTrigger.create({ trigger: root, start: 'top 55%', once: true, onEnter: () => gsap.to(chars, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.025 }) })
  }
  if (fine && !reduced) {
    const title = $('.contact__title', root)
    const vis = watchVisible(title)
    let rects = [], stamp = 0
    const measure = () => { rects = chars.map((c) => { const r = c.getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width } }); stamp = performance.now() }
    const state = chars.map(() => ({ g: 0 }))
    tickers.add((dt) => {
      if (!vis.on) return
      if (performance.now() - stamp > 250) measure()
      chars.forEach((c, i) => {
        const r = rects[i]
        const d = Math.hypot(r.cx - pointer.x, (r.cy - pointer.y) * 0.7)
        const target = pointer.inside ? Math.exp(-(d * d) / (2 * 150 * 150)) : 0
        const s = state[i]
        s.g += (target - s.g) * Math.min(1, dt * 10)
        const g = s.g
        c.style.transform = `translateY(${(-g * 0.14).toFixed(3)}em) scale(${(1 + g * 0.12).toFixed(3)}, ${(1 + g * 0.3).toFixed(3)})`
        c.style.color = g > 0.55 ? 'var(--accent)' : ''
      })
    })
  }

  /* ---- buttons ---- */
  charRoll($('.mailkey span', root))
  const orb = $('.orb', root), fill = $('.orb__fill', orb)
  orb.addEventListener('pointerenter', () => gsap.to(fill, { scale: 1, duration: 0.7, ease: 'expo.out' }))
  orb.addEventListener('pointerleave', () => gsap.to(fill, { scale: 0, duration: 0.6, ease: 'expo.inOut' }))
  gsap.set(fill, { scale: 0 })
  if (!reduced) gsap.from('.contact__row > *', { y: 60, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.contact__row', start: 'top 92%' } })

  initFooter()
}

const TAGS = ['Python', 'React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'SQL', 'MongoDB', 'OpenCV', 'YOLO', 'LangChain', 'Docker', 'GitHub', 'Data pipelines']

function initFooter() {
  const foot = $('.foot')
  const play = $('.foot__play', foot)
  const bottom = $('.foot__bottom', foot)
  const name = $('.foot__name', foot)
  const main = $('main')

  /* wordmark: stretched to the full width, rising letter by letter */
  const nameSplit = SplitText.create(name, { type: 'chars', mask: 'chars', charsClass: 'fch' })
  const fit = () => {
    name.style.transform = 'none'
    const avail = innerWidth - parseFloat(getComputedStyle(foot).paddingLeft) * 2
    const w = name.scrollWidth
    name.style.transformOrigin = '0 100%'
    name.style.transform = `scaleX(${clamp(avail / w, 0.5, 3.2).toFixed(4)})`
  }
  fit()
  addEventListener('resize', fit)
  document.fonts?.ready.then(fit)

  /* tags */
  const pills = TAGS.slice(0, innerWidth < 760 ? 9 : TAGS.length).map((t, i) => {
    const el = document.createElement('span')
    el.className = 'fpill' + (i % 4 === 1 ? ' fpill--ink' : i % 4 === 3 ? ' fpill--out' : '')
    el.textContent = t
    play.appendChild(el)
    return { el, t }
  })

  if (reduced) { foot.classList.add('is-static'); main.classList.add('is-static'); return }

  const nameTl = gsap.timeline({ paused: true }).from(nameSplit.chars, { yPercent: 110, duration: 1.5, ease: 'expo.out', stagger: 0.08 })
  gsap.set(nameSplit.chars, { yPercent: 110 })

  /* physics */
  const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter
  const engine = Engine.create({ gravity: { x: 0, y: 1.1 } })
  let W = 0, H = 0, floorY = 0, walls = [], bodies = []
  const sizeAll = () => {
    const pr = play.getBoundingClientRect(), br = bottom.getBoundingClientRect()
    W = pr.width; H = pr.height
    floorY = br.top - pr.top + 6
    Composite.remove(engine.world, walls)
    const t = 200
    walls = [
      Bodies.rectangle(W / 2, floorY + t / 2, W + 400, t, { isStatic: true }),
      Bodies.rectangle(-t / 2, H / 2, t, H * 4, { isStatic: true }),
      Bodies.rectangle(W + t / 2, H / 2, t, H * 4, { isStatic: true }),
    ]
    Composite.add(engine.world, walls)
  }
  sizeAll()
  addEventListener('resize', () => setTimeout(sizeAll, 200))

  pills.forEach((p) => {
    const r = p.el.getBoundingClientRect()
    p.w = r.width; p.h = r.height
    p.body = Bodies.rectangle(W * 0.1 + Math.random() * W * 0.8, -200 - Math.random() * 300, p.w, p.h, { chamfer: { radius: p.h / 2 }, restitution: 0.4, friction: 0.25, frictionAir: 0.012, density: 0.002, angle: (Math.random() - 0.5) * 0.9 })
    p.dropped = false
  })

  const mouse = Mouse.create(play)
  mouse.element.removeEventListener('wheel', mouse.mousewheel)
  mouse.element.removeEventListener('mousewheel', mouse.mousewheel)
  mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel)
  // keep page scrolling alive on touch: no drag capture for fingers
  ;['touchstart', 'touchmove', 'touchend'].forEach((ev) => mouse.element.removeEventListener(ev, ev === 'touchstart' ? mouse.mousedown : ev === 'touchmove' ? mouse.mousemove : mouse.mouseup))
  const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.18, damping: 0.1, render: { visible: false } } })
  Composite.add(engine.world, mc)
  const revealed = () => main.getBoundingClientRect().bottom < innerHeight + 20
  let started = false, hoverBody = null

  const drop = () => {
    if (started) return
    started = true
    pills.forEach((p, i) => setTimeout(() => { p.el.classList.add('is-in'); Composite.add(engine.world, p.body); Body.setAngularVelocity(p.body, (Math.random() - 0.5) * 0.2); p.dropped = true }, 120 + i * 110))
  }
  ScrollTrigger.create({ trigger: main, start: 'bottom 88%', onEnter: () => { drop(); nameTl.play() } })
  ScrollTrigger.create({ trigger: main, start: 'bottom 100%', onLeaveBack: () => nameTl.reverse() })

  tickers.add((dt) => {
    if (!started || !revealed()) return
    Engine.update(engine, Math.min(dt, 1 / 30) * 1000)
    // hover cue: the pill under the pointer
    hoverBody = mc.body || null
    for (const p of pills) {
      if (!p.dropped) continue
      const b = p.body
      p.el.style.transform = `translate3d(${(b.position.x - p.w / 2).toFixed(1)}px, ${(b.position.y - p.h / 2).toFixed(1)}px, 0) rotate(${b.angle.toFixed(3)}rad)`
      p.el.classList.toggle('is-held', hoverBody === b)
    }
  })
}
