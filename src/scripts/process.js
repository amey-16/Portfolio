import { gsap, ScrollTrigger, SplitText, $, $$, tickers, pointer, watchVisible, clamp, lerp, smooth, reduced, small } from './core.js'

/*
  Process. About a thousand points change shape with the four phases:
  scatter -> grid -> a turning sphere -> the word "SHIP". Each point follows
  its own spring and switches formation a little earlier or later than its
  neighbours, so every change rolls across the field like a wave. The
  pointer pushes points aside.
*/

const PHASES = ['Scatter', 'Align', 'Form', 'Ship']

export function initProcess(root) {
  const pin = $('.process__pin', root)
  const cv = $('.process__cv', root)
  const ctx = cv.getContext('2d')
  const steps = $$('.pstep', root)
  const numOdo = $('.process__num .odo', root)._odo
  const hud = { n: $('.ph-n', root), p: $('.ph-p', root), s: $('.ph-s', root) }
  const ticks = $$('.process__ticks li', root)
  const stepSplits = steps.map((s) => SplitText.create($('h3', s), { type: 'chars', mask: 'chars', charsClass: 'pch' }))

  if (reduced) { root.classList.add('is-lite'); return }

  let W = 0, H = 0, dpr = 1, N = 0, cx = 0, cy = 0, R = 0
  let px, py, vx, vy, delay, seed, size, accent
  let base, gridT, textT
  const phase = { v: 0, target: 0 }

  const sampleText = (word, n) => {
    const c = document.createElement('canvas'); const w = 900, h = 360
    c.width = w; c.height = h
    const g = c.getContext('2d')
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'
    g.font = `400 330px Anton, Impact, sans-serif`
    g.fillText(word, w / 2, h / 2 + 12)
    const d = g.getImageData(0, 0, w, h).data
    const pts = []
    for (let y = 0; y < h; y += 5) for (let x = 0; x < w; x += 5) if (d[(y * w + x) * 4 + 3] > 140) pts.push([x / w - 0.5, y / h - 0.5])
    // shuffle so every particle gets a spread of the shape
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]] }
    return Array.from({ length: n }, (_, i) => pts[i % pts.length] || [0, 0])
  }

  const layout = () => {
    const r = pin.getBoundingClientRect()
    W = Math.round(r.width); H = Math.round(r.height)
    dpr = Math.min(devicePixelRatio || 1, 2)
    cv.width = W * dpr; cv.height = H * dpr
    const mobile = small()
    N = mobile ? 520 : 1000
    cx = mobile ? W * 0.5 : W * 0.66
    cy = mobile ? H * 0.3 : H * 0.52
    R = mobile ? Math.min(W * 0.36, H * 0.2) : Math.min(W * 0.27, H * 0.38)
    px = new Float32Array(N); py = new Float32Array(N); vx = new Float32Array(N); vy = new Float32Array(N)
    delay = new Float32Array(N); seed = new Float32Array(N); size = new Float32Array(N); accent = new Uint8Array(N)
    base = []
    for (let i = 0; i < N; i++) {
      px[i] = Math.random() * W; py[i] = Math.random() * H
      delay[i] = Math.random(); seed[i] = Math.random() * 1000
      size[i] = 1.1 + Math.random() * 1.7
      accent[i] = Math.random() < 0.09 ? 1 : 0
      base.push([Math.random() * W, Math.random() * H])
    }
    // grid: a rectangle of dots
    const gw = R * 2.5, gh = R * 1.7
    const cols = Math.ceil(Math.sqrt(N * (gw / gh)))
    const rows = Math.ceil(N / cols)
    gridT = Array.from({ length: N }, (_, i) => [cx - gw / 2 + ((i % cols) + 0.5) * (gw / cols), cy - gh / 2 + (((i / cols) | 0) + 0.5) * (gh / rows)])
    const tw = R * 2.9
    textT = sampleText('SHIP', N).map(([x, y]) => [cx + x * tw, cy + y * tw * 0.4])
  }

  const target = (i, ph, t, out) => {
    // out = [x, y, depth]
    if (ph === 0) {
      const b = base[i], s = seed[i]
      out[0] = b[0] + Math.sin(t * 0.35 + s) * 46 + Math.cos(t * 0.21 + s * 1.7) * 30
      out[1] = b[1] + Math.cos(t * 0.3 + s * 1.3) * 46 + Math.sin(t * 0.26 + s) * 30
      out[2] = 0.5
    } else if (ph === 1) { out[0] = gridT[i][0]; out[1] = gridT[i][1]; out[2] = 0.7 }
    else if (ph === 2) {
      const k = i + 0.5
      const y = 1 - (k / N) * 2, rr = Math.sqrt(Math.max(0, 1 - y * y)), th = Math.PI * (3 - Math.sqrt(5)) * k
      let x = Math.cos(th) * rr, z = Math.sin(th) * rr
      const a = t * 0.35, c = Math.cos(a), s = Math.sin(a)
      const x2 = x * c + z * s, z2 = -x * s + z * c
      const tilt = -0.35, y2 = y * Math.cos(tilt) - z2 * Math.sin(tilt), z3 = y * Math.sin(tilt) + z2 * Math.cos(tilt)
      const sc = 3 / (3 - z3)
      out[0] = cx + x2 * R * 1.05 * sc; out[1] = cy + y2 * R * 1.05 * sc; out[2] = z3 * 0.5 + 0.5
    } else { out[0] = textT[i][0]; out[1] = textT[i][1]; out[2] = 0.8 }
  }

  const A = [0, 0, 0], B = [0, 0, 0]
  const vis = watchVisible(root, null, '50px')
  let hov = { x: -999, y: -999 }

  tickers.add((dt, t) => {
    if (!vis.on || !px) return
    const r = cv.getBoundingClientRect()
    hov.x = pointer.x - r.left; hov.y = pointer.y - r.top
    phase.v += (phase.target - phase.v) * Math.min(1, dt * 3.2)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const damp = Math.pow(0.0009, dt)
    for (let i = 0; i < N; i++) {
      // each point is a little early or late: the change rolls through the field
      const phi = clamp(phase.v + (delay[i] - 0.5) * 0.5, 0, 3)
      const a = Math.min(2, Math.floor(phi)), f = smooth(0, 1, phi - a)
      target(i, a, t, A)
      let tx = A[0], ty = A[1], dep = A[2]
      if (f > 0.001) { target(i, a + 1, t, B); tx = lerp(tx, B[0], f); ty = lerp(ty, B[1], f); dep = lerp(dep, B[2], f) }
      const k = 18 + (seed[i] % 14)
      vx[i] += (tx - px[i]) * k * dt; vy[i] += (ty - py[i]) * k * dt
      const dx = px[i] - hov.x, dy = py[i] - hov.y, d2 = dx * dx + dy * dy
      if (d2 < 130 * 130 && pointer.inside) { const d = Math.sqrt(d2) + 0.01, f2 = (1 - d / 130) * 900; vx[i] += (dx / d) * f2 * dt; vy[i] += (dy / d) * f2 * dt }
      vx[i] *= damp; vy[i] *= damp
      px[i] += vx[i] * dt; py[i] += vy[i] * dt
      const sp = Math.min(1, Math.hypot(vx[i], vy[i]) / 600)
      ctx.globalAlpha = 0.28 + dep * 0.62
      ctx.fillStyle = accent[i] || sp > 0.55 ? '#ff4b26' : '#ece9e1'
      const s = size[i] * (0.7 + dep * 0.7) * (1 + sp * 0.8)
      ctx.fillRect(px[i] - s / 2, py[i] - s / 2, s, s)
    }
    ctx.globalAlpha = 1
  })

  /* ---- text per phase ---- */
  let cur = -1
  const show = (i) => {
    if (i === cur) return
    const prev = cur
    cur = i
    const dir = prev < 0 || i > prev ? 1 : -1
    numOdo.set(String(i + 1).padStart(2, '0'), { duration: 1.1, stagger: 0.06 })
    hud.n.textContent = String(i + 1).padStart(2, '0'); hud.s.textContent = PHASES[i]
    hud.p.textContent = String(N)
    ticks.forEach((tk, k) => tk.classList.toggle('is-on', k === i))
    steps.forEach((el, k) => {
      if (k === i) {
        gsap.set(el, { autoAlpha: 1 })
        gsap.fromTo(stepSplits[k].chars, { yPercent: 110 * dir }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.035, delay: prev < 0 ? 0 : 0.25, overwrite: true })
        gsap.fromTo([$('.pstep__n', el), $('p', el)], { y: 24 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.1, delay: prev < 0 ? 0 : 0.35, overwrite: true })
      } else if (k === prev) {
        gsap.to(stepSplits[k].chars, { yPercent: -110 * dir, duration: 0.5, ease: 'expo.in', stagger: 0.02, overwrite: true })
        gsap.to([$('.pstep__n', el), $('p', el)], { y: -20 * dir, opacity: 0, duration: 0.35, ease: 'power2.in', overwrite: true, onComplete: () => gsap.set(el, { autoAlpha: 0 }) })
      }
    })
  }

  layout()
  numOdo.snap('01')
  show(0)
  let rt
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 200) })
  ScrollTrigger.create({
    trigger: root, pin, start: 'top top', end: '+=300%', scrub: true, anticipatePin: 1,
    snap: { snapTo: 1 / 3, duration: { min: 0.25, max: 0.7 }, delay: 0.05, ease: 'power2.inOut' },
    onUpdate: (s) => { phase.target = s.progress * 3; show(clamp(Math.round(s.progress * 3), 0, 3)) },
  })
  gsap.from('.process__num', { y: 60, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: root, start: 'top 60%' } })
}
