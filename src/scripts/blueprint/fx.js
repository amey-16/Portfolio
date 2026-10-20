// The particle layer: ink on the paper turns into raw data and flows into the hero.
//
// Every particle begins life on the blueprint (at an exact point on a stroke or a handwritten letter, riding
// the 3D-transformed piece it belongs to). As a piece dissolves, particles lift off in a sweep, fall under
// gravity and pool along the bottom. Then they are pulled along one funnel-shaped curve into the mouth of the
// hero's own particle stream (a point supplied by the hero scene), narrowing into the same ordered lanes the
// hero uses, with the hero's colour ramp. Nothing here is a separate "effect": it is the paper's own ink.

import { clamp, lerp, smooth, rng } from './util.js'

const RAMP = [[0, 95, 115], [10, 148, 150], [148, 210, 189]] // the hero shader's deep teal -> teal -> mint
const WARM = [187, 62, 3]
const rampAt = (t) => {
  t = clamp(t)
  const a = t < 0.5 ? RAMP[0] : RAMP[1], b = t < 0.5 ? RAMP[1] : RAMP[2], k = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]
}
const cubic = (a, b, c, d, t) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d }
const dcubic = (a, b, c, d, t) => { const u = 1 - t; return 3 * u * u * (b - a) + 6 * u * t * (c - b) + 3 * t * t * (d - c) }

export function createFx(canvas, { W, H, dpr, scale }) {
  const ctx = canvas.getContext('2d')
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
  canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const R = rng(5)
  const k = H / 900 // everything physical is expressed for a 900px-tall screen and scaled
  const GRAV = 1500 * k
  let parts = [], pieces = [], bits = [], rings = []
  let tint = Infinity // nothing turns to data until dissolve() is called
  const pv = [] // per piece centre / velocity
  const conv = { on: false, t0: 0 }
  const tmp = [0, 0]

  function load(samples, assign) {
    parts = samples.map((s) => {
      const seed = R()
      return {
        pi: assign(s.x, s.y), lx: s.x, ly: s.y, ang: s.ang, kind: s.kind, sw: s.sw,
        c0: s.col, seed, warm: seed > 0.935, ramp: rampAt(seed * 0.55 + 0.12 + R() * 0.3),
        x: 0, y: 0, vx: 0, vy: 0, a: 0, st: 0, rel: Infinity, rt: 0, floor: H * (0.8 + Math.pow(R(), 1.9) * 0.18),
        lane: R() * 2 - 1, cd: R() * 0.55, dur: 0.85 + R() * 0.55, tau: 0, p0x: 0, p0y: 0, size: 1.4 + R() * 1.9, dx: 0, dy: 0,
      }
    })
  }
  const setPieces = (list) => { pieces = list; for (let i = 0; i < list.length; i++) pv[i] ??= { x: 0, y: 0, vx: 0, vy: 0, ok: false } }

  // schedule the release: ink lifts off from the bottom of each piece upwards, in a sweeping wave
  function dissolve(t0, span) {
    tint = t0
    for (const p of parts) {
      const order = clamp(0.7 * (1 - p.ly / 760) + 0.3 * (p.lx / 1000) + (R() - 0.5) * 0.22)
      p.rel = t0 + order * span
    }
  }
  const converge = (t0) => { conv.on = true; conv.t0 = t0 }

  function burst(x, y, n, { dx = 0, dy = -1, speed = 380, spread = 1.1, ink = false } = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.atan2(dy, dx) + (R() - 0.5) * spread * 2, sp = speed * k * (0.3 + R() * 0.9)
      bits.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, life: 0.5 + R() * 0.5, w: (2 + R() * 4) * k + 1, h: (1.5 + R() * 3) * k + 1, rot: R() * 6.28, vr: (R() - 0.5) * 16, ink: ink || R() < 0.12 })
    }
  }
  const puff = (x, y, r = 60) => rings.push({ x, y, age: 0, life: 0.55, r })

  function step(dt, clock, entry) {
    ctx.clearRect(0, 0, W, H)
    // piece matrices and velocities (needed while any particle still rides a piece)
    for (let i = 0; i < pieces.length; i++) {
      const pc = pieces[i]
      if (!pc || !pc.el.isConnected) continue
      pc.center(tmp) // (the loader refreshes every piece's matrix once per frame, just before this)
      const v = pv[i]
      if (v.ok && dt > 0) { v.vx = lerp(v.vx, (tmp[0] - v.x) / dt, 0.5); v.vy = lerp(v.vy, (tmp[1] - v.y) / dt, 0.5) }
      v.x = tmp[0]; v.y = tmp[1]; v.ok = true
    }
    // the funnel
    let E = null, B = null
    if (conv.on && entry) {
      E = entry
      const S = Math.min(W, 1.5 * H)
      B = { x0: E.x - 0.035 * W, y0: Math.min(H * 0.95, E.y + 0.46 * H), x3: E.x, y3: E.y }
      B.x1 = B.x0; B.y1 = lerp(B.y0, B.y3, 0.62)
      B.x2 = E.x - 0.15 * S; B.y2 = E.y + 0.02 * H
    }

    const sw = scale
    for (const p of parts) {
      if (p.st === 3) continue
      if (p.st === 0) {
        if (clock < p.rel) {
          // riding the paper
          const pc = pieces[p.pi]
          if (!pc || !pc.el.isConnected) { continue }
          pc.map(p.lx, p.ly, tmp)
          p.x = tmp[0]; p.y = tmp[1]
          // (before dissolve() is called `tint` is Infinity, which must read as "not yet", never as NaN)
          p.a = clock < tint - 0.05 ? 0 : smooth(tint - 0.05, tint + 0.28, clock)
          if (!(p.a > 0.003)) continue
          draw(p, 1, sw)
          continue
        }
        const v = pv[p.pi] || { vx: 0, vy: 0 }
        p.st = 1; p.rt = clock
        p.vx = v.vx * 0.55 + (R() - 0.5) * 120 * k; p.vy = v.vy * 0.45 + (R() * 90 + 20) * k
      }
      if (p.st === 1) {
        const age = clock - p.rt
        p.vy += GRAV * dt
        const drag = Math.exp(-1.6 * dt)
        p.vx *= drag; p.vy *= Math.exp(-0.5 * dt)
        p.vx += Math.sin(clock * 3 + p.seed * 40) * 60 * k * dt
        p.x += p.vx * dt; p.y += p.vy * dt
        if (p.y > p.floor) { p.y = p.floor; p.vy *= -0.18; p.vx *= 0.55 }
        if (Math.abs(p.vy) < 30 * k && p.y >= p.floor - 0.5) { p.y += Math.sin(clock * 2.2 + p.seed * 30) * 0.35; p.x += Math.sin(clock * 1.1 + p.seed * 17) * 8 * k * dt }
        p.a = 1
        draw(p, smooth(0, 0.6, age) >= 0.999 ? 1 : smooth(0, 0.6, age), sw)
        if (E && clock >= conv.t0 + p.cd) { p.st = 2; p.tau = 0; p.p0x = p.x; p.p0y = p.y; p.lastX = p.x; p.lastY = p.y }
        continue
      }
      if (p.st === 2) {
        if (!B) { draw(p, 1, sw); continue }
        p.tau += dt
        const t = clamp(p.tau / p.dur), u = t * t * (3 - 2 * t)
        const bx = cubic(B.x0, B.x1, B.x2, B.x3, u), by = cubic(B.y0, B.y1, B.y2, B.y3, u)
        let tx = dcubic(B.x0, B.x1, B.x2, B.x3, u), ty = dcubic(B.y0, B.y1, B.y2, B.y3, u)
        const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl
        const nx = -ty, ny = tx
        const wide = 0.15 * H
        const quant = (Math.floor((p.lane * 0.5 + 0.5) * 11.999) + 0.5) / 12 * 2 - 1
        const lane = lerp(p.lane, quant, smooth(0.55, 0.95, u))
        const width = lerp(wide, Math.max(6, E.r), Math.pow(smooth(0, 1, u), 0.8))
        // start offset from the curve decays so nothing pops
        const t0x = dcubic(B.x0, B.x1, B.x2, B.x3, 0), t0y = dcubic(B.y0, B.y1, B.y2, B.y3, 0), t0l = Math.hypot(t0x, t0y) || 1
        const sx0 = B.x0 + (-t0y / t0l) * p.lane * wide, sy0 = B.y0 + (t0x / t0l) * p.lane * wide
        const decay = Math.pow(1 - smooth(0, 0.55, u), 2)
        const nxp = bx + nx * lane * width + (p.p0x - sx0) * decay, nyp = by + ny * lane * width + (p.p0y - sy0) * decay
        p.vx = (nxp - p.x) / Math.max(dt, 0.001); p.vy = (nyp - p.y) / Math.max(dt, 0.001)
        p.x = nxp; p.y = nyp
        p.a = 1 - smooth(0.9, 1, u)
        draw(p, 1, sw, true)
        if (t >= 1) p.st = 3
      }
    }
    // paper scraps and dust rings
    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i]
      b.age += dt
      if (b.age > b.life) { bits.splice(i, 1); continue }
      b.vy += GRAV * 0.5 * dt; b.vx *= Math.exp(-1.2 * dt); b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt
      const a = 1 - smooth(b.life * 0.5, b.life, b.age)
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot); ctx.globalAlpha = a
      ctx.fillStyle = b.ink ? '#0a9396' : '#fffdf7'; ctx.strokeStyle = 'rgba(120,96,52,.45)'; ctx.lineWidth = 0.8
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); if (!b.ink) ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h)
      ctx.restore()
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]
      r.age += dt
      if (r.age > r.life) { rings.splice(i, 1); continue }
      const t = r.age / r.life
      ctx.globalAlpha = (1 - t) * 0.22; ctx.strokeStyle = '#142a31'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r * (0.3 + t), r.r * (0.3 + t) * 0.22, 0, 0, 6.283); ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  // colour and shape. `m` is how far the particle has turned from ink into data (0..1)
  function draw(p, m, sw, flying) {
    const a = p.a
    if (!(a > 0.003)) return
    ctx.globalAlpha = a
    if (m >= 1) {
      // fully turned into data: the colour never changes again, so build the string once
      p.cs ??= (() => { const c = p.warm ? WARM : p.ramp; return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` })()
      ctx.fillStyle = ctx.strokeStyle = p.cs
    } else {
      const c = p.warm ? WARM : p.ramp, c0 = p.c0
      ctx.fillStyle = ctx.strokeStyle = `rgb(${lerp(c0[0], c[0], m) | 0},${lerp(c0[1], c[1], m) | 0},${lerp(c0[2], c[2], m) | 0})`
    }
    const base = Math.max(1.05, p.sw * sw * 0.62)
    const size = lerp(base, p.size * (0.85 + k * 0.25), m)
    if (p.kind === 1) {
      // a fine vector line: a short stroke on the paper, a streak along the motion once it flows
      let ax, ay, len
      if (flying) { const sp = Math.hypot(p.vx, p.vy) || 1; ax = p.vx / sp; ay = p.vy / sp; len = clamp(sp * 0.028, 3, 26 * k + 6) }
      else if (m > 0.05) { const sp = Math.hypot(p.vx, p.vy) || 1; ax = lerp(Math.cos(p.ang), p.vx / sp, m); ay = lerp(Math.sin(p.ang), p.vy / sp, m); len = lerp(8 * sw * 1.1, clamp(sp * 0.03, 3, 20), m) }
      else { ax = Math.cos(p.ang); ay = Math.sin(p.ang); len = 8 * sw * 1.1 }
      ctx.lineWidth = Math.max(1, size * 0.75); ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(p.x - ax * len * 0.5, p.y - ay * len * 0.5); ctx.lineTo(p.x + ax * len * 0.5, p.y + ay * len * 0.5); ctx.stroke()
    } else if (p.kind === 2) {
      const s = size * 1.5
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)
    } else {
      ctx.beginPath(); ctx.arc(p.x, p.y, size * 0.55, 0, 6.283); ctx.fill()
    }
  }

  return {
    load, setPieces, dissolve, converge, burst, puff, step,
    count: () => parts.length,
    alive: () => parts.reduce((n, p) => n + (p.st < 3 ? 1 : 0), 0),
    clear: () => ctx.clearRect(0, 0, W, H),
    dispose() { parts = []; bits = []; rings = []; canvas.width = 0 },
  }
}
