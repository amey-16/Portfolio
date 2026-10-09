import { rng } from './posters.js'

/*
  Five project covers, drawn at 1600 x 1000 and reused everywhere: as WebGL
  textures in the gallery, in the case-study view and in the clients list.
  Everything is deterministic and local; no images are fetched.
*/

const W = 1600, H = 1000
const DISPLAY = '"Anton", Impact, sans-serif'
const SERIF = '"Instrument Serif", Georgia, serif'
const MONO = '"Geist Mono", ui-monospace, monospace'
const SANS = 'Geist, system-ui, sans-serif'
const INK = '#0e0e0d', BONE = '#ece9e1', ACC = '#ff4b26'

function rr(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath()
}
const txt = (c, s, x, y, font, color, align = 'left', ls = '0px') => { c.font = font; c.fillStyle = color; c.textAlign = align; c.textBaseline = 'alphabetic'; c.letterSpacing = ls; c.fillText(s, x, y); c.letterSpacing = '0px' }

const covers = [
  /* 0 — Orbital: a night sky, a horizon and a booking card */
  (c) => {
    const r = rng(11)
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#080a18'); g.addColorStop(1, '#1b2150')
    c.fillStyle = g; c.fillRect(0, 0, W, H)
    c.fillStyle = BONE
    for (let k = 0; k < 160; k++) { c.globalAlpha = r() * 0.8; c.fillRect(r() * W, r() * H * 0.7, r() > 0.9 ? 2.4 : 1.4, r() > 0.9 ? 2.4 : 1.4) }
    c.globalAlpha = 1
    const cx = W * 0.42, cy = H * 1.55, R = W * 0.95
    const glow = c.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.12); glow.addColorStop(0, 'rgba(255,120,80,0.55)'); glow.addColorStop(0.35, 'rgba(120,140,255,0.4)'); glow.addColorStop(1, 'rgba(120,140,255,0)')
    c.fillStyle = glow; c.fillRect(0, 0, W, H)
    c.fillStyle = '#05060d'; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill()
    c.strokeStyle = 'rgba(236,233,225,.95)'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R, Math.PI * 1.2, Math.PI * 1.8); c.stroke()
    c.strokeStyle = ACC; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, R, Math.PI * 1.46, Math.PI * 1.56); c.stroke()
    // orbit rings
    c.save(); c.translate(W * 0.42, H * 0.46); c.rotate(-0.32)
    for (let k = 0; k < 9; k++) { c.beginPath(); c.ellipse(0, 0, 230 + k * 62, (230 + k * 62) * 0.34, 0, 0, Math.PI * 2); c.strokeStyle = `rgba(236,233,225,${0.55 - k * 0.055})`; c.lineWidth = k === 0 ? 3 : 1.4; c.stroke() }
    c.fillStyle = ACC; c.beginPath(); c.arc(292, -20, 11, 0, Math.PI * 2); c.fill()
    c.strokeStyle = ACC; c.lineWidth = 1.5; c.beginPath(); c.arc(292, -20, 24, 0, Math.PI * 2); c.stroke()
    c.restore()
    // booking card
    c.save(); rr(c, 1030, 250, 430, 520, 28); c.fillStyle = 'rgba(236,233,225,.94)'; c.fill(); c.restore()
    txt(c, 'DEPARTURE', 1070, 316, `500 17px ${MONO}`, '#6b6a66', 'left', '2px')
    txt(c, 'Low Earth', 1070, 390, `italic 400 64px ${SERIF}`, INK)
    txt(c, 'Orbit', 1070, 452, `italic 400 64px ${SERIF}`, INK)
    c.fillStyle = 'rgba(14,14,13,.12)'; c.fillRect(1070, 486, 350, 2)
    ;[['Nov 04', '3 nights'], ['Crew', '6 seats']].forEach(([a, b], i) => { txt(c, a, 1070, 548 + i * 62, `500 26px ${SANS}`, INK); txt(c, b, 1420, 548 + i * 62, `400 26px ${SANS}`, '#6b6a66', 'right') })
    rr(c, 1070, 664, 350, 66, 33); c.fillStyle = INK; c.fill()
    txt(c, 'Reserve a seat  →', 1245, 706, `500 24px ${SANS}`, BONE, 'center')
    txt(c, 'PERIGEE / 220 KM', 70, 940, `500 18px ${MONO}`, 'rgba(236,233,225,.6)', 'left', '3px')
    txt(c, 'ORBITAL', 70, 120, `400 56px ${DISPLAY}`, BONE, 'left', '6px')
  },

  /* 1 — Terrain: contour field and a trail tag */
  (c) => {
    const r = rng(23)
    c.fillStyle = '#c4d0b3'; c.fillRect(0, 0, W, H)
    const cx = W * 0.52, cy = H * 0.5
    for (let k = 1; k < 34; k++) {
      c.lineWidth = k % 5 === 0 ? 3 : 1.2; c.strokeStyle = k % 5 === 0 ? '#2e4430' : 'rgba(46,68,48,.55)'
      c.beginPath()
      for (let a = 0; a <= 180; a++) {
        const t = (a / 180) * Math.PI * 2
        const rad = k * 26 * (1 + 0.14 * Math.sin(t * 3 + k * 0.22) + 0.08 * Math.cos(t * 5 - k * 0.18) + 0.05 * Math.sin(t * 2 + 1))
        const x = cx + Math.cos(t) * rad * 1.5, y = cy + Math.sin(t) * rad * 0.9
        a ? c.lineTo(x, y) : c.moveTo(x, y)
      }
      c.closePath(); c.stroke()
    }
    // trail
    c.setLineDash([12, 12]); c.strokeStyle = ACC; c.lineWidth = 5; c.beginPath(); c.moveTo(250, 820); c.bezierCurveTo(520, 700, 640, 860, 860, 640); c.bezierCurveTo(1050, 470, 1180, 560, 1300, 300); c.stroke(); c.setLineDash([])
    ;[[250, 820], [1300, 300]].forEach(([x, y]) => { c.fillStyle = BONE; c.beginPath(); c.arc(x, y, 18, 0, Math.PI * 2); c.fill(); c.fillStyle = ACC; c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.fill() })
    // label
    c.save(); c.translate(1020, 700); c.rotate(-0.12); rr(c, 0, 0, 380, 220, 6); c.fillStyle = ACC; c.fill()
    txt(c, 'TERRAIN', 26, 92, `400 82px ${DISPLAY}`, INK, 'left', '3px')
    txt(c, 'GO YOUR OWN WAY.', 28, 140, `500 18px ${MONO}`, INK, 'left', '3px')
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(30, 196); c.lineTo(86, 156); c.lineTo(138, 196); c.stroke()
    c.restore()
    txt(c, 'N 18° 31′  E 073° 51′   ELEV 560 M', 70, 940, `500 18px ${MONO}`, '#2e4430', 'left', '3px')
    c.fillStyle = '#2e4430'; c.font = `500 18px ${MONO}`; for (let k = 0; k < 16; k++) c.fillRect(70 + k * 24, 80, 2, k % 5 === 0 ? 26 : 14)
    void r
  },

  /* 2 — Ledger: a product screen on lilac */
  (c) => {
    c.fillStyle = '#d6d0f4'; c.fillRect(0, 0, W, H)
    for (let k = 0; k < 6; k++) { c.fillStyle = `rgba(255,255,255,${0.1 + k * 0.03})`; c.beginPath(); c.arc(W * 0.78, H * 0.9, 150 + k * 120, 0, Math.PI * 2); c.fill() }
    // back card
    c.save(); c.translate(980, 120); c.rotate(0.06); rr(c, 0, 0, 520, 700, 40); c.fillStyle = INK; c.fill()
    txt(c, 'THIS MONTH', 44, 80, `500 17px ${MONO}`, 'rgba(236,233,225,.6)', 'left', '3px')
    txt(c, '+ ₹84,200', 44, 170, `400 70px ${DISPLAY}`, BONE)
    for (let i = 0; i < 9; i++) { const h = 70 + Math.sin(i * 1.3) * 40 + i * 22; rr(c, 44 + i * 50, 560 - h, 34, h, 8); c.fillStyle = i === 8 ? ACC : 'rgba(236,233,225,.28)'; c.fill() }
    c.restore()
    // front card
    c.save(); c.translate(170, 150); rr(c, 0, 0, 760, 700, 40); c.fillStyle = BONE; c.fill()
    txt(c, 'ledger.', 56, 96, `italic 400 54px ${SERIF}`, INK)
    txt(c, 'Your money at a glance.', 56, 190, `500 34px ${SANS}`, INK)
    txt(c, 'Total balance', 56, 260, `400 20px ${SANS}`, '#7b7870')
    txt(c, '₹ 2,48,120', 56, 370, `400 112px ${DISPLAY}`, INK)
    rr(c, 56, 410, 290, 66, 33); c.fillStyle = '#6c5bd1'; c.fill(); txt(c, '+ Make a payment', 201, 452, `500 22px ${SANS}`, '#fff', 'center')
    c.fillStyle = 'rgba(14,14,13,.12)'; c.fillRect(56, 520, 648, 2)
    ;[['Studio invoice', '+ ₹24,000', '#6c5bd1'], ['Rent', '− ₹38,500', '#b9b4aa'], ['Design tools', '− ₹3,980', '#b9b4aa']].forEach(([a, b, col], i) => {
      const y = 580 + i * 36 + i * 14
      c.fillStyle = col; c.beginPath(); c.arc(76, y - 8, 14, 0, Math.PI * 2); c.fill()
      txt(c, a, 108, y, `500 22px ${SANS}`, INK); txt(c, b, 704, y, `500 22px ${SANS}`, INK, 'right')
    })
    c.restore()
    txt(c, 'DESIGN SYSTEM / 400K USERS', 70, 940, `500 18px ${MONO}`, 'rgba(14,14,13,.6)', 'left', '3px')
  },

  /* 3 — Chroma Records: a record, interference and rhythm */
  (c) => {
    c.fillStyle = '#2f3cff'; c.fillRect(0, 0, W, H)
    // interference rings
    for (let k = 0; k < 2; k++) {
      const ox = k ? 1120 : 780
      c.strokeStyle = k ? 'rgba(236,233,225,.5)' : 'rgba(255,75,38,.9)'; c.lineWidth = 2
      for (let i = 0; i < 60; i++) { c.beginPath(); c.arc(ox, 500, 30 + i * 13, 0, Math.PI * 2); c.stroke() }
    }
    const cx = 960, cy = 500, R = 340
    c.fillStyle = INK; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill()
    c.strokeStyle = 'rgba(236,233,225,.14)'; c.lineWidth = 1.2
    for (let k = 0; k < 32; k++) { c.beginPath(); c.arc(cx, cy, R * (0.42 + k * 0.018), 0, Math.PI * 2); c.stroke() }
    const sh = c.createConicGradient(0.4, cx, cy)
    sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.1, 'rgba(255,255,255,.26)'); sh.addColorStop(0.22, 'rgba(255,255,255,0)'); sh.addColorStop(0.6, 'rgba(255,255,255,0)'); sh.addColorStop(0.7, 'rgba(255,255,255,.2)'); sh.addColorStop(0.82, 'rgba(255,255,255,0)')
    c.fillStyle = sh; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill()
    c.fillStyle = ACC; c.beginPath(); c.arc(cx, cy, R * 0.3, 0, Math.PI * 2); c.fill()
    txt(c, 'CHROMA', cx, cy - 6, `400 44px ${DISPLAY}`, INK, 'center', '4px'); txt(c, 'SIDE A', cx, cy + 34, `500 15px ${MONO}`, INK, 'center', '4px')
    c.fillStyle = BONE; c.beginPath(); c.arc(cx, cy, 8, 0, Math.PI * 2); c.fill()
    // waveform
    c.fillStyle = BONE
    for (let i = 0; i < 44; i++) { const h = 16 + Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.21)) * 120; c.fillRect(80 + i * 12, 820 - h / 2, 6, h) }
    txt(c, 'CHROMA', 80, 190, `400 150px ${DISPLAY}`, BONE, 'left', '2px')
    txt(c, 'RECORDS', 80, 330, `400 150px ${DISPLAY}`, 'transparent')
    c.strokeStyle = BONE; c.lineWidth = 2; c.font = `400 150px ${DISPLAY}`; c.strokeText('RECORDS', 80, 330)
    txt(c, 'IDENTITY + GENERATIVE MOTION', 80, 940, `500 18px ${MONO}`, 'rgba(236,233,225,.8)', 'left', '3px')
  },

  /* 4 — Molten: warm blobs and a launch label */
  (c) => {
    const r = rng(5)
    c.fillStyle = '#efe3d3'; c.fillRect(0, 0, W, H)
    const blobs = [[720, 540, 300], [1010, 430, 210], [520, 370, 150], [1130, 700, 170], [860, 780, 120]]
    c.save(); c.filter = 'blur(2px)'
    blobs.forEach(([x, y, rad]) => {
      const g = c.createRadialGradient(x - rad * 0.3, y - rad * 0.35, rad * 0.05, x, y, rad)
      g.addColorStop(0, '#fff0d6'); g.addColorStop(0.3, '#ffa24a'); g.addColorStop(0.7, ACC); g.addColorStop(1, '#7a2208')
      c.fillStyle = g; c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill()
    })
    c.restore()
    // glossy highlights
    blobs.forEach(([x, y, rad]) => { c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x - rad * 0.32, y - rad * 0.4, rad * 0.22, rad * 0.11, -0.6, 0, Math.PI * 2); c.fill() })
    for (let k = 0; k < 40; k++) { c.fillStyle = `rgba(122,34,8,${r() * 0.25})`; c.beginPath(); c.arc(r() * W, r() * H, r() * 5 + 1, 0, Math.PI * 2); c.fill() }
    txt(c, 'MOLTEN', 70, 180, `400 190px ${DISPLAY}`, INK, 'left', '3px')
    txt(c, 'Coffee with a little heat.', 74, 250, `italic 400 54px ${SERIF}`, INK)
    c.save(); c.translate(1270, 190); c.rotate(0.2); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 100, 0, Math.PI * 2); c.stroke()
    txt(c, 'BLEND', 0, -4, `500 20px ${MONO}`, INK, 'center', '5px'); txt(c, 'N° 03', 0, 36, `400 50px ${DISPLAY}`, INK, 'center', '2px'); c.restore()
    txt(c, 'LAUNCH SITE / 3D ART DIRECTION', 70, 940, `500 18px ${MONO}`, INK, 'left', '3px')
  },
]

const cache = []
export function cover(i) {
  if (cache[i]) return cache[i]
  const cv = document.createElement('canvas')
  cv.width = W; cv.height = H
  const c = cv.getContext('2d')
  covers[i % covers.length](c)
  cache[i] = cv
  return cv
}
export function redrawCovers() {
  covers.forEach((fn, i) => { const cv = cover(i); const c = cv.getContext('2d'); c.clearRect(0, 0, W, H); fn(c) })
}
export const COVER_COUNT = covers.length
export const COVER_ASPECT = W / H
