// Turns the ink on the blueprint into points: this is what lets the very same lines and handwriting
// become the raw data. Strokes are sampled along their length; text is rasterised with the real font
// and sampled on the glyph pixels, so handwriting turns into particles shaped like handwriting.

import { rng } from './util.js'

const KIND_DOT = 0, KIND_DASH = 1, KIND_SQUARE = 2

function parseColor(str) {
  if (!str) return [20, 42, 49]
  if (str[0] === '#') {
    const n = parseInt(str.length === 4 ? str.replace(/./g, (c, i) => (i ? c + c : c)).slice(1) : str.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const m = str.match(/[\d.]+/g)
  return m ? [+m[0], +m[1], +m[2]] : [20, 42, 49]
}

let tctx
const textCtx = () => (tctx ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true }))

// root: the live <svg> of the intact sheet. budget: how many particles to produce overall.
export function sampleInk(root, budget) {
  const R = rng(11)
  const ref = root.querySelector('.ink')
  const inv = ref.getCTM().inverse()
  const rel = (el) => inv.multiply(el.getCTM())
  // Everything is sampled up front (including strokes that are drawn later in the story), while the
  // sheet is still on screen and measurable. By the time the paper falls apart all of it is visible.
  const strokes = [...root.querySelectorAll('.dw')]
  const texts = [...root.querySelectorAll('.tx')]

  // text first: collect glyph pixels
  const textPts = []
  const ctx = textCtx()
  for (const t of texts) {
    const font = t.dataset.font, s = t.textContent
    if (!font || !s.trim()) continue
    const size = parseFloat(font.match(/(\d+(\.\d+)?)px/)[1])
    const ls = +t.dataset.ls || 0
    ctx.font = font
    ctx.letterSpacing = `${ls}px`
    const w = Math.ceil(ctx.measureText(s).width) + 8, h = Math.ceil(size * 1.6)
    ctx.canvas.width = w; ctx.canvas.height = h
    ctx.font = font; ctx.letterSpacing = `${ls}px`
    ctx.fillStyle = '#000'; ctx.textBaseline = 'alphabetic'
    ctx.fillText(s, 4, size * 1.15)
    const data = ctx.getImageData(0, 0, w, h).data
    const anchor = t.dataset.anchor
    const shift = anchor === 'middle' ? -(w - 8) / 2 : anchor === 'end' ? -(w - 8) : 0
    const x0 = +t.getAttribute('x'), y0 = +t.getAttribute('y')
    const m = rel(t), col = parseColor(t.getAttribute('fill'))
    const pts = []
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 110) pts.push([x0 + shift + x - 4, y0 + y - size * 1.15])
    for (const p of pts) textPts.push({ pt: new DOMPoint(p[0], p[1]).matrixTransform(m), col })
  }

  // strokes: measure, then spread the stroke budget by length
  const lens = strokes.map((s) => { try { return s.getTotalLength() } catch { return 0 } })
  const totalL = lens.reduce((a, b) => a + b, 0) || 1
  const strokeBudget = Math.round(budget * 0.62), textBudget = budget - strokeBudget
  const out = []
  strokes.forEach((el, i) => {
    const L = lens[i]
    if (!L) return
    const n = Math.max(2, Math.round((L / totalL) * strokeBudget))
    const m = rel(el), col = parseColor(el.getAttribute('stroke'))
    const sw = parseFloat(el.getAttribute('stroke-width') || 2)
    for (let k = 0; k < n; k++) {
      const s = ((k + R()) / n) * L
      const p = el.getPointAtLength(s), q = el.getPointAtLength(Math.min(L, s + 1.5))
      const P = new DOMPoint(p.x, p.y).matrixTransform(m), Q = new DOMPoint(q.x, q.y).matrixTransform(m)
      const r = R()
      out.push({ x: P.x + (R() - 0.5) * sw * 0.5, y: P.y + (R() - 0.5) * sw * 0.5, ang: Math.atan2(Q.y - P.y, Q.x - P.x), kind: r < 0.64 ? KIND_DOT : r < 0.86 ? KIND_DASH : KIND_SQUARE, col, sw })
    }
  })
  // text pixels, thinned to the text budget
  const keep = Math.min(1, textBudget / (textPts.length || 1))
  for (const { pt, col } of textPts) {
    if (R() > keep) continue
    const r = R()
    out.push({ x: pt.x, y: pt.y, ang: R() * 6.283, kind: r < 0.8 ? KIND_DOT : r < 0.92 ? KIND_SQUARE : KIND_DASH, col, sw: 2 })
  }
  return out
}
