// Small shared helpers for the "Broken Blueprint" loader.

export const NS = 'http://www.w3.org/2000/svg'
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t) }
export const rad = (d) => (d * Math.PI) / 180
export const f1 = (v) => (Math.round(v * 10) / 10).toString()

// Seeded random numbers, so the blueprint is drawn the same way on every load.
export function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function svgEl(name, attrs = {}, parent) {
  const n = document.createElementNS(NS, name)
  for (const k in attrs) n.setAttribute(k, attrs[k])
  parent?.appendChild(n)
  return n
}

// Two-bone IK in screen space. `out` (+1 / -1) picks which side the joint bends towards;
// wy / wx weight "bend downwards" against "bend outwards" when choosing between the two solutions.
export function ik(ax, ay, tx, ty, l1, l2, out, wy = 0.6, wx = 0.8) {
  const dx = tx - ax, dy = ty - ay, d0 = Math.hypot(dx, dy) || 0.001
  const d = clamp(d0, Math.abs(l1 - l2) + 2, (l1 + l2) * 0.999)
  const ux = dx / d0, uy = dy / d0
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a))
  const mx = ax + ux * a, my = ay + uy * a, px = -uy * h, py = ux * h
  const c1 = [mx + px, my + py], c2 = [mx - px, my - py]
  const score = (c) => c[1] * wy + out * (c[0] - ax) * wx
  const j = score(c1) >= score(c2) ? c1 : c2
  return { jx: j[0], jy: j[1], ex: ax + ux * d, ey: ay + uy * d }
}

// Fonts the blueprint is drawn with. Resolves when they are ready, or after `ms`, whichever is first.
export function fontsReady(ms = 1600) {
  if (!document.fonts?.load) return Promise.resolve()
  const loads = [
    '400 40px "Instrument Serif"',
    '400 12px "Geist Mono Variable"',
    '500 22px "Caveat"',
  ].map((f) => document.fonts.load(f).catch(() => {}))
  return Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, ms))])
}
