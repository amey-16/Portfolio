/*
  Two canvas motion graphics for the "noise to signal" idea.

  initField   A flow field. Thousands of short strokes follow a drifting
              vector field; the pointer bends the flow around itself. Used
              behind the hero name.
  initSignal  A waveform strip. Three traces start as noise and resolve into
              clean sine waves as the page scrolls through the strip.
*/

export function initField(canvas) {
  const ctx = canvas.getContext('2d')
  let W = 0, H = 0, dpr = 1, t = 0, visible = true, energy = 1
  const N = 900
  const P = []
  const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, on: false }

  const resize = () => {
    const r = canvas.getBoundingClientRect()
    dpr = Math.min(devicePixelRatio, 1.75)
    W = r.width; H = r.height
    canvas.width = W * dpr; canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#121212'; ctx.fillRect(0, 0, W, H)
    P.length = 0
    for (let i = 0; i < N; i++) P.push({ x: Math.random() * W, y: Math.random() * H, life: Math.random() * 200, hot: Math.random() < 0.08, col: ['rgba(217,183,106,0.9)', 'rgba(90,120,255,0.9)', 'rgba(255,216,74,0.9)'][i % 3] })
  }
  resize()
  addEventListener('resize', resize)

  addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect()
    const nx = e.clientX - r.left, ny = e.clientY - r.top
    pointer.vx = nx - pointer.x; pointer.vy = ny - pointer.y
    pointer.x = nx; pointer.y = ny; pointer.on = ny >= 0 && ny <= H
  }, { passive: true })

  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas)

  const angle = (x, y) => {
    const a = Math.sin(x * 0.0021 + t * 0.35) + Math.cos(y * 0.0027 - t * 0.28)
    const b = Math.sin((x + y) * 0.0013 + t * 0.2)
    return (a + b) * Math.PI * 0.9
  }

  function frame() {
    if (!visible) return
    t += 0.016
    // fade the previous frame: this is what leaves the trails
    ctx.fillStyle = 'rgba(18,18,18,0.075)'
    ctx.fillRect(0, 0, W, H)
    ctx.lineWidth = 1
    for (const p of P) {
      let a = angle(p.x, p.y)
      let sp = 1.1 + energy * 1.6
      if (pointer.on) {
        const dx = p.x - pointer.x, dy = p.y - pointer.y, d2 = dx * dx + dy * dy
        if (d2 < 24000) {
          const f = 1 - d2 / 24000
          a += Math.atan2(dy, dx) * 0.0 + f * 2.6
          sp += f * 4
        }
      }
      const nx = p.x + Math.cos(a) * sp, ny = p.y + Math.sin(a) * sp
      ctx.strokeStyle = p.hot ? p.col : 'rgba(237,235,230,0.22)'
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke()
      p.x = nx; p.y = ny; p.life--
      if (p.life < 0 || nx < -10 || nx > W + 10 || ny < -10 || ny > H + 10) {
        p.x = Math.random() * W; p.y = Math.random() * H; p.life = 120 + Math.random() * 220
      }
    }
  }
  return { frame, setEnergy: (v) => (energy = v) }
}

export function initSignal(canvas) {
  const ctx = canvas.getContext('2d')
  let W = 0, H = 0, dpr = 1, t = 0, visible = false, p = 0
  const resize = () => {
    const r = canvas.getBoundingClientRect()
    dpr = Math.min(devicePixelRatio, 2)
    W = r.width; H = r.height
    canvas.width = W * dpr; canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize(); addEventListener('resize', resize)
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas)

  const traces = [
    { amp: 0.3, f: 2.0, ph: 0, col: 'rgba(237,235,230,0.95)', w: 2 },
    { amp: 0.22, f: 3.5, ph: 1.7, col: 'rgba(237,235,230,0.35)', w: 1.2 },
    { amp: 0.16, f: 5.0, ph: 3.1, col: 'rgba(217,183,106,0.95)', w: 2 },
  ]
  // deterministic jitter so the noise shimmers rather than flickers
  const jitter = (i, k) => Math.sin(i * 12.9898 + k * 78.233 + Math.floor(t * 18) * 3.17) * 43758.5453 % 1

  function frame() {
    if (!visible) return
    t += 0.016
    ctx.clearRect(0, 0, W, H)
    const mid = H / 2, step = 4
    // faint centre rule
    ctx.strokeStyle = 'rgba(237,235,230,0.1)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke()
    const noise = 1 - p
    traces.forEach((tr, k) => {
      ctx.strokeStyle = tr.col; ctx.lineWidth = tr.w
      ctx.beginPath()
      for (let x = 0; x <= W; x += step) {
        const u = x / W
        // the left edge is always clean, noise spreads in from the right as p falls
        const local = Math.max(0, noise * (1.35 - u * 1.1))
        const clean = Math.sin(u * Math.PI * 2 * tr.f + tr.ph + t * (0.9 + k * 0.3)) * tr.amp * H * 0.9
        const dirty = jitter(x, k) * H * 0.42 * local
        const y = mid + clean * (1 - local * 0.55) + dirty
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    })
  }
  return { frame, set: (v) => (p = v) }
}
