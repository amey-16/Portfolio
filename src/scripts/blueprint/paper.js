// The sheet of paper: its tear lines, and the DOM that lets the pieces fly in 3D.
//
// Tear geometry
//   Three straight "intended" cut lines are applied to the sheet one after another, each splitting every
//   polygon it crosses. Because every cut runs edge to edge, neighbouring pieces share the same vertices.
//   Each cut is then made ragged with a noise function of the position *along the line*, so the two pieces
//   either side of a tear get exactly the same zig-zag and mate perfectly until they are pulled apart.
//
//     rip 1  cut 1 frees a corner flap (A)
//     rip 2  cuts 2 and 3 split what is left into four more pieces
//
// DOM
//   One intact sheet, then clipped clones for each piece. Pieces are real 3D objects (rotateX/Y, perspective),
//   with a front (the drawing), a back (plain paper) and a soft blurred shadow, so they tumble properly.

import { ART_W, ART_H } from './art.js'
import { clamp, f1 } from './util.js'

const CUTS = [
  { id: 1, a: [0, 516], b: [318, ART_H] },
  { id: 2, a: [560, 0], b: [470, ART_H] },
  { id: 3, a: [0, 262], b: [ART_W, 318] },
]
const STEP = 13
const AMP = 9

const lenOf = (c) => Math.hypot(c.b[0] - c.a[0], c.b[1] - c.a[1])
const dirOf = (c) => { const L = lenOf(c); return [(c.b[0] - c.a[0]) / L, (c.b[1] - c.a[1]) / L] }
const sideOf = (p, c) => ((c.b[0] - c.a[0]) * (p[1] - c.a[1]) - (c.b[1] - c.a[1]) * (p[0] - c.a[0])) / lenOf(c)
const alongOf = (p, c) => { const u = dirOf(c); return (p[0] - c.a[0]) * u[0] + (p[1] - c.a[1]) * u[1] }

function splitPoly(poly, c) {
  const pos = [], neg = [], e = 1e-6
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i], Q = poly[(i + 1) % poly.length], sp = sideOf(P, c), sq = sideOf(Q, c)
    if (sp >= -e) pos.push(P)
    if (sp <= e) neg.push(P)
    if ((sp > e && sq < -e) || (sp < -e && sq > e)) {
      const t = sp / (sp - sq), X = [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]
      pos.push(X); neg.push(X)
    }
  }
  return [pos, neg]
}
const straddles = (poly, c) => poly.some((p) => sideOf(p, c) > 1e-3) && poly.some((p) => sideOf(p, c) < -1e-3)
function inside(poly, x, y) {
  let r = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) r = !r
  }
  return r
}

function offAt(c, s) {
  const h = (n) => { const x = Math.sin((n + 1) * 127.1 + c.id * 311.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1 }
  const k = s / STEP, i = Math.floor(k), f = k - i
  const v = h(i) * (1 - f) + h(i + 1) * f + h(i * 7 + 3) * 0.3
  let dn = Infinity
  for (const n of c.nodes) dn = Math.min(dn, Math.abs(s - n))
  return v * AMP * clamp(dn / 14)
}
const ptAt = (c, s) => { const u = dirOf(c), n = [-u[1], u[0]], o = offAt(c, s); return [c.a[0] + u[0] * s + n[0] * o, c.a[1] + u[1] * s + n[1] * o] }

function jagPoly(poly, cuts) {
  const out = []
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i], Q = poly[(i + 1) % poly.length]
    out.push(P)
    const c = cuts.find((k) => Math.abs(sideOf(P, k)) < 0.6 && Math.abs(sideOf(Q, k)) < 0.6)
    if (!c) continue
    const sP = alongOf(P, c), sQ = alongOf(Q, c), lo = Math.min(sP, sQ), hi = Math.max(sP, sQ)
    const mids = []
    for (let k = Math.ceil(lo / STEP); k * STEP < hi; k++) { const s = k * STEP; if (s > lo + 2 && s < hi - 2) mids.push(s) }
    if (sQ < sP) mids.reverse()
    for (const s of mids) out.push(ptAt(c, s))
  }
  return out
}

function bboxOf(poly, pad = 4) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y) }
  return { x0: Math.max(0, x0 - pad), y0: Math.max(0, y0 - pad), x1: Math.min(ART_W, x1 + pad), y1: Math.min(ART_H, y1 + pad) }
}
function centroidOf(poly) {
  let a = 0, cx = 0, cy = 0
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % poly.length], k = x0 * y1 - x1 * y0
    a += k; cx += (x0 + x1) * k; cy += (y0 + y1) * k
  }
  a *= 0.5
  return Math.abs(a) < 1e-3 ? poly[0] : [cx / (6 * a), cy / (6 * a)]
}

let GEO
export function geometry() {
  if (GEO) return GEO
  const rect = [[0, 0], [ART_W, 0], [ART_W, ART_H], [0, ART_H]]
  const [c1, c2, c3] = CUTS
  const corner = [10, ART_H - 10]
  let polys = splitPoly(rect, c1)
  const A0 = polys.find((p) => inside(p, corner[0], corner[1])), R1 = polys.find((p) => p !== A0)
  let rest = [R1]
  for (const c of [c2, c3]) rest = rest.flatMap((p) => (straddles(p, c) ? splitPoly(p, c) : [p]))
  const all = [A0, R1, ...rest]
  for (const c of CUTS) {
    const ns = []
    for (const p of all) for (const v of p) if (Math.abs(sideOf(v, c)) < 0.6) ns.push(alongOf(v, c))
    ns.sort((a, b) => a - b)
    c.nodes = ns.filter((n, i) => i === 0 || n - ns[i - 1] > 0.6)
  }
  const mk = (id, clean, cuts) => {
    const poly = jagPoly(clean, cuts)
    const [cx, cy] = centroidOf(poly)
    const cutEdges = []
    // every edge that is not part of the sheet's outer border is a torn edge
    for (let i = 0; i < poly.length; i++) {
      const P = poly[i], Q = poly[(i + 1) % poly.length]
      if (!(onBoundary(P) && onBoundary(Q))) cutEdges.push([P, Q])
    }
    return { id, clean, poly, cx, cy, bbox: bboxOf(poly), cutEdges }
  }
  const crack = (c) => { const L = lenOf(c), pts = []; for (let s = 0; s < L; s += STEP) pts.push(ptAt(c, s)); pts.push(c.b); return pts }
  GEO = {
    cuts: CUTS,
    A: mk('A', A0, [c1]),
    R1: mk('R1', R1, [c1]),
    rest: rest.map((p, i) => mk(`P${i}`, p, CUTS)),
    cracks: { 1: crack(c1), 2: crack(c2), 3: crack(c3) },
    hinge1: c1.a, // the far end of the first tear: the flap hinges here while the crack runs towards it
  }
  return GEO
}
const onBoundary = (p) => p[0] < 0.5 || p[1] < 0.5 || p[0] > ART_W - 0.5 || p[1] > ART_H - 0.5

/* ------------------------------------------------------------------ DOM ------------------------------------------------------------------ */

const cssPoly = (pts, sx, sy, L, T, mirrorX) =>
  `polygon(${pts.map(([x, y]) => `${f1(mirrorX == null ? x * sx - L : 2 * mirrorX - (x * sx - L))}px ${f1(y * sy - T)}px`).join(',')})`

// A paper piece in the scene: the element plus what is needed to project design-space points to the screen.
export class Piece {
  constructor(layer, view, svgSource, g, opts = {}) {
    const { px, py, pw, ph } = view
    this.view = view
    this.id = g.id
    this.g = g
    const sx = (this.sx = pw / ART_W), sy = (this.sy = ph / ART_H)
    const b = opts.full ? { x0: 0, y0: 0, x1: ART_W, y1: ART_H } : g.bbox
    this.left = px + b.x0 * sx
    this.top = py + b.y0 * sy
    const BW = (b.x1 - b.x0) * sx, BH = (b.y1 - b.y0) * sy
    this.ox = g.cx * sx - b.x0 * sx
    this.oy = g.cy * sy - b.y0 * sy
    if (opts.full) { this.ox = BW / 2; this.oy = BH / 2 }
    const el = (this.el = document.createElement('div'))
    el.className = 'bp-piece'
    el.style.cssText = `left:${f1(this.left)}px;top:${f1(this.top)}px;width:${f1(BW)}px;height:${f1(BH)}px;transform-origin:${f1(this.ox)}px ${f1(this.oy)}px;`
    const clip = opts.full ? 'none' : cssPoly(g.poly, sx, sy, b.x0 * sx, b.y0 * sy)
    const clipBack = opts.full ? 'none' : cssPoly(g.poly, sx, sy, b.x0 * sx, b.y0 * sy, this.ox)

    const shadow = document.createElement('div')
    shadow.className = 'bp-sh'
    shadow.innerHTML = `<i style="clip-path:${clip}"></i>`
    const front = (this.front = document.createElement('div'))
    front.className = 'bp-face bp-front'
    front.style.clipPath = clip
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', `${f1(b.x0)} ${f1(b.y0)} ${f1(b.x1 - b.x0)} ${f1(b.y1 - b.y0)}`)
    svg.setAttribute('width', f1(BW)); svg.setAttribute('height', f1(BH))
    svg.setAttribute('aria-hidden', 'true')
    const gg = svgSource.cloneNode(true)
    if (!opts.keepIds) gg.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'))
    svg.appendChild(gg)
    if (!opts.full && g.cutEdges.length) {
      const d = g.cutEdges.map(([P, Q]) => `M${f1(P[0])} ${f1(P[1])}L${f1(Q[0])} ${f1(Q[1])}`).join('')
      svg.insertAdjacentHTML('beforeend', `<path d="${d}" fill="none" stroke="rgba(120,96,52,.4)" stroke-width="2.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fffdf7" stroke-width="8" stroke-linecap="round"/>`)
    }
    front.appendChild(svg)
    this.art = gg
    const back = (this.back = document.createElement('div'))
    back.className = 'bp-face bp-back'
    back.style.cssText = `clip-path:${clipBack};transform-origin:${f1(this.ox)}px ${f1(this.oy)}px;transform:rotateY(180deg);`
    el.append(shadow, front, back)
    layer.appendChild(el)
    this.shadow = shadow
    this.m = new Float64Array(16)
    this.last = [0, 0]
    this.vel = [0, 0]
    this.refreshMatrix()
  }

  // Cache the element's current transform so points can be projected cheaply.
  refreshMatrix() {
    const t = getComputedStyle(this.el).transform
    const m = t && t !== 'none' ? new DOMMatrix(t) : new DOMMatrix()
    const a = this.m
    a[0] = m.m11; a[1] = m.m12; a[2] = m.m14; a[3] = m.m21; a[4] = m.m22; a[5] = m.m24; a[6] = m.m41; a[7] = m.m42; a[8] = m.m44
    return this
  }

  // design-space point -> overlay pixel position (includes the 3D transform and its perspective)
  map(lx, ly, out = [0, 0]) {
    const x = lx * this.sx - (this.left - this.view.px) - this.ox
    const y = ly * this.sy - (this.top - this.view.py) - this.oy
    const a = this.m
    const w = a[2] * x + a[5] * y + a[8] || 1
    out[0] = this.left + this.ox + (a[0] * x + a[3] * y + a[6]) / w
    out[1] = this.top + this.oy + (a[1] * x + a[4] * y + a[7]) / w
    return out
  }

  center(out = [0, 0]) { return this.map(this.g.cx ?? ART_W / 2, this.g.cy ?? ART_H / 2, out) }

  // brightness of the paper as it turns away from the light
  setShade(v) { this.front.style.setProperty('--sh', v.toFixed(3)) }

  destroy() { this.el.remove() }
}

// The whole scene's paper: the intact sheet plus clone factories.
export function createPaper(layer, view, artMarkup) {
  const holder = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  holder.setAttribute('class', 'bp-art')
  holder.innerHTML = artMarkup
  const geo = geometry()
  const full = { id: 'sheet', cx: ART_W / 2, cy: ART_H / 2, poly: [], cutEdges: [], bbox: { x0: 0, y0: 0, x1: ART_W, y1: ART_H } }
  const sheet = new Piece(layer, view, holder, full, { full: true, keepIds: true })
  sheet.el.classList.add('bp-sheet')
  const src = sheet.art
  return {
    geo, sheet, src,
    // clipped clone of the sheet in its current state (so the drawing, the extra scribbles and his own marks come along)
    makePiece(g) { return new Piece(layer, view, src, g) },
    clipSheet(g) { // after the first tear the sheet only keeps what is left
      const sx = view.pw / ART_W, sy = view.ph / ART_H
      sheet.front.style.clipPath = cssPoly(g.poly, sx, sy, 0, 0)
      sheet.shadow.firstElementChild.style.clipPath = cssPoly(g.poly, sx, sy, 0, 0)
      sheet.back.style.clipPath = 'none'
    },
  }
}
