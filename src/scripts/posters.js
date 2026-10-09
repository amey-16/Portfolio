/*
  Generative "project posters". One editorial system, many variations:
  used as textures on the archive globe and as covers in the work reel.
*/

export const C = {
  paper: '#ece9e1',
  ink: '#0e0e0d',
  graphite: '#2b2b29',
  cobalt: '#ff4b26',
  blush: '#efc7b8',
  sage: '#c7d1bd',
  sand: '#e7dfcf',
  lilac: '#d3cdf2',
  stone: '#bdb8ad',
}

export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SERIF = '"Instrument Serif", Georgia, serif'
const MONO = '"Geist Mono", ui-monospace, monospace'
const SANS = 'Geist, system-ui, sans-serif'

function caption(ctx, w, h, text, color, idx) {
  const s = Math.max(10, w * 0.026)
  ctx.font = `500 ${s}px ${MONO}`
  ctx.fillStyle = color
  ctx.globalAlpha = 0.75
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillText(text.toUpperCase(), w * 0.06, h - w * 0.06)
  ctx.textAlign = 'right'
  ctx.fillText(String(idx).padStart(3, '0'), w * 0.94, h - w * 0.06)
  ctx.textAlign = 'left'
  ctx.globalAlpha = 1
}

const kinds = {
  // big italic serif word on a quiet ground
  type(ctx, w, h, r, i) {
    const bgs = [C.sand, C.ink, C.blush, C.paper, C.lilac]
    const bg = bgs[Math.floor(r() * bgs.length)]
    const fg = bg === C.ink ? C.paper : C.ink
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    const words = ['Aa', 'Hello', 'Form', 'Calm', 'Nº', 'Type', 'Slow', 'Grid', '&']
    const word = words[Math.floor(r() * words.length)]
    const fs = w * (word.length <= 2 ? 0.7 : 0.38)
    ctx.font = `italic 400 ${fs}px ${SERIF}`
    ctx.fillStyle = fg
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(word, w / 2, h * 0.47)
    ctx.textAlign = 'left'
    ctx.fillStyle = C.cobalt
    if (r() > 0.5) { ctx.beginPath(); ctx.arc(w * 0.82, h * 0.16, w * 0.035, 0, Math.PI * 2); ctx.fill() }
    caption(ctx, w, h, 'Specimen', fg, i)
  },

  // a product screen, drawn with restraint
  ui(ctx, w, h, r, i) {
    ctx.fillStyle = r() > 0.5 ? C.sand : C.sage
    ctx.fillRect(0, 0, w, h)
    const pw = w * 0.62, ph = h * 0.74
    const px = (w - pw) / 2, py = h * 0.09
    ctx.fillStyle = C.paper
    roundRect(ctx, px, py, pw, ph, w * 0.05); ctx.fill()
    ctx.fillStyle = C.ink
    ctx.font = `500 ${pw * 0.075}px ${SANS}`
    ctx.fillText('Balance', px + pw * 0.1, py + ph * 0.13)
    ctx.font = `400 ${pw * 0.16}px ${SERIF}`
    ctx.fillText('₹2,48,120', px + pw * 0.1, py + ph * 0.29)
    // chart
    ctx.strokeStyle = C.cobalt
    ctx.lineWidth = Math.max(1.5, w * 0.006)
    ctx.beginPath()
    let y = py + ph * 0.52
    for (let k = 0; k <= 12; k++) {
      const x = px + pw * 0.1 + (k / 12) * pw * 0.8
      y = py + ph * (0.45 + 0.12 * Math.sin(k * 0.8 + r() * 0.6) - k * 0.006)
      k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    }
    ctx.stroke()
    // rows
    for (let k = 0; k < 3; k++) {
      const ry = py + ph * (0.66 + k * 0.1)
      ctx.fillStyle = k === 0 ? C.blush : C.sand
      ctx.beginPath(); ctx.arc(px + pw * 0.14, ry, pw * 0.04, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = C.stone
      roundRect(ctx, px + pw * 0.24, ry - pw * 0.015, pw * (0.3 + r() * 0.2), pw * 0.03, pw * 0.015); ctx.fill()
    }
    caption(ctx, w, h, 'Product UI', C.ink, i)
  },

  // soft mesh-gradient orb
  orb(ctx, w, h, r, i) {
    ctx.fillStyle = C.paper
    ctx.fillRect(0, 0, w, h)
    const pal = [C.blush, C.lilac, C.sage, '#b9c4ff', '#f3d9a4']
    for (let k = 0; k < 4; k++) {
      const x = w * (0.3 + r() * 0.4), y = h * (0.3 + r() * 0.35), rad = w * (0.35 + r() * 0.25)
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
      g.addColorStop(0, pal[Math.floor(r() * pal.length)])
      g.addColorStop(1, 'rgba(246,245,241,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }
    ctx.strokeStyle = C.ink
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(w / 2, h * 0.45, w * 0.28, 0, Math.PI * 2); ctx.stroke()
    caption(ctx, w, h, 'Study', C.ink, i)
  },

  // swiss composition
  swiss(ctx, w, h, r, i) {
    ctx.fillStyle = C.paper
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = C.ink
    const n = 3 + Math.floor(r() * 3)
    for (let k = 0; k < n; k++) {
      const bw = w * (0.08 + r() * 0.5)
      ctx.fillRect(w * 0.08, h * (0.1 + k * 0.12), bw, h * 0.05)
    }
    ctx.fillStyle = C.cobalt
    ctx.beginPath(); ctx.arc(w * (0.55 + r() * 0.2), h * 0.66, w * 0.2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = C.ink
    ctx.font = `italic 400 ${w * 0.12}px ${SERIF}`
    ctx.fillText('no.' + (i % 9 + 1), w * 0.08, h * 0.8)
    caption(ctx, w, h, 'Poster', C.ink, i)
  },

  // halftone field
  dots(ctx, w, h, r, i) {
    ctx.fillStyle = C.ink
    ctx.fillRect(0, 0, w, h)
    const cells = 16
    const s = w / cells
    const cx = w * (0.3 + r() * 0.4), cy = h * (0.3 + r() * 0.3)
    ctx.fillStyle = C.paper
    for (let y = 0; y < h / s; y++) for (let x = 0; x < cells; x++) {
      const d = Math.hypot(x * s - cx, y * s - cy) / w
      const rad = Math.max(0, (0.5 - d * 0.9)) * s * 0.9
      if (rad < 0.4) continue
      ctx.beginPath(); ctx.arc(x * s + s / 2, y * s + s / 2, rad, 0, Math.PI * 2); ctx.fill()
    }
    caption(ctx, w, h, 'Field', C.paper, i)
  },

  // contour lines
  contour(ctx, w, h, r, i) {
    ctx.fillStyle = C.sage
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = C.ink
    const cx = w * (0.4 + r() * 0.2), cy = h * (0.4 + r() * 0.2)
    const f1 = 2 + Math.floor(r() * 3), f2 = 3 + Math.floor(r() * 4)
    for (let k = 1; k < 18; k++) {
      ctx.lineWidth = k % 5 === 0 ? 1.6 : 0.7
      ctx.globalAlpha = k % 5 === 0 ? 0.9 : 0.5
      ctx.beginPath()
      for (let a = 0; a <= 120; a++) {
        const t = (a / 120) * Math.PI * 2
        const rr = k * w * 0.035 * (1 + 0.12 * Math.sin(t * f1 + k * 0.3) + 0.06 * Math.cos(t * f2))
        const x = cx + Math.cos(t) * rr, y = cy + Math.sin(t) * rr * 1.1
        a ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
      }
      ctx.closePath(); ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = C.cobalt
    ctx.beginPath(); ctx.arc(cx, cy, w * 0.018, 0, Math.PI * 2); ctx.fill()
    caption(ctx, w, h, 'Terrain', C.ink, i)
  },

  // record grooves
  record(ctx, w, h, r, i) {
    ctx.fillStyle = C.blush
    ctx.fillRect(0, 0, w, h)
    const cx = w / 2, cy = h * 0.46, R = w * 0.38
    ctx.fillStyle = C.ink
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(246,245,241,0.12)'
    ctx.lineWidth = 1
    for (let k = 0; k < 26; k++) { ctx.beginPath(); ctx.arc(cx, cy, R * (0.4 + k * 0.023), 0, Math.PI * 2); ctx.stroke() }
    const sheen = ctx.createConicGradient(r() * 6, cx, cy)
    sheen.addColorStop(0, 'rgba(255,255,255,0)'); sheen.addColorStop(0.1, 'rgba(255,255,255,0.18)'); sheen.addColorStop(0.2, 'rgba(255,255,255,0)')
    sheen.addColorStop(0.6, 'rgba(255,255,255,0)'); sheen.addColorStop(0.7, 'rgba(255,255,255,0.14)'); sheen.addColorStop(0.8, 'rgba(255,255,255,0)')
    ctx.fillStyle = sheen
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = C.cobalt
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = C.paper
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.035, 0, Math.PI * 2); ctx.fill()
    caption(ctx, w, h, 'Side A', C.ink, i)
  },

  // night sky with a horizon arc
  space(ctx, w, h, r, i) {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#0d0f1c'); g.addColorStop(1, '#1d2148')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = C.paper
    for (let k = 0; k < 70; k++) { ctx.globalAlpha = r() * 0.8; ctx.fillRect(r() * w, r() * h * 0.6, 1.2, 1.2) }
    ctx.globalAlpha = 1
    const cx = w / 2, cy = h * 1.25, R = w * 0.95
    const glow = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.25)
    glow.addColorStop(0, 'rgba(120,140,255,0.55)'); glow.addColorStop(1, 'rgba(120,140,255,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#07080f'
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(220,226,255,0.9)'
    ctx.lineWidth = Math.max(1, w * 0.004)
    ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke()
    caption(ctx, w, h, 'Orbit', C.paper, i)
  },

  // warm molten blob
  molten(ctx, w, h, r, i) {
    ctx.fillStyle = '#efe6da'
    ctx.fillRect(0, 0, w, h)
    for (let k = 0; k < 5; k++) {
      const x = w * (0.25 + r() * 0.5), y = h * (0.25 + r() * 0.45), rad = w * (0.12 + r() * 0.16)
      const g = ctx.createRadialGradient(x - rad * 0.3, y - rad * 0.35, rad * 0.05, x, y, rad)
      g.addColorStop(0, '#ffe4c2'); g.addColorStop(0.35, '#e8833f'); g.addColorStop(1, '#8a3a12')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill()
    }
    caption(ctx, w, h, 'Roast', C.ink, i)
  },
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const archiveKinds = ['type', 'ui', 'orb', 'swiss', 'dots', 'contour', 'record', 'space', 'molten']

export function drawPoster(canvas, w, h, i, kind) {
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const r = rng(i * 9301 + 49297)
  kinds[kind || archiveKinds[i % archiveKinds.length]](ctx, w, h, r, i + 1)
  return canvas
}

// covers for the five featured projects
export const featured = ['space', 'contour', 'ui', 'record', 'molten']
