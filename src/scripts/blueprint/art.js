// The blueprint: a software architect's first sketch of a product, drawn by hand.
//
// Authored in a fixed 1000 x 760 design space and scaled to the viewport. Everything that is "ink"
// (class .dw for strokes, .tx for text) is tagged so the transformation scene can later turn the very
// same lines and glyphs into particles. Strokes use pathLength=1, so one dash-offset tween draws them on.

import { rng, f1 } from './util.js'

export const ART_W = 1000
export const ART_H = 760

const INK = '#142a31'
const SOFT = 'rgba(20,42,49,.55)'
const TEAL = '#0a7f8a'
const ORG = '#bb3e03'
const MINT = 'rgba(10,147,150,.10)'
const ORGF = 'rgba(187,62,3,.10)'

const FONT = {
  serif: '"Instrument Serif"',
  mono: '"Geist Mono Variable"',
  hand: '"Caveat"',
}

let measureCtx
function measure(text, font) {
  measureCtx ??= document.createElement('canvas').getContext('2d')
  measureCtx.font = font
  return measureCtx.measureText(text).width
}

export function buildArt({ boost = 1 } = {}) {
  const R = rng(7)
  const j = (a) => (R() - 0.5) * 2 * a
  const b = boost

  // a hand-drawn line: nearly straight, with a slight bow and wobbly ends
  const line = (x1, y1, x2, y2, { c = INK, w = 2.6, jit = 1.3, cls = '' } = {}) => {
    const mx = (x1 + x2) / 2 + j(jit * 2), my = (y1 + y2) / 2 + j(jit * 2)
    return `<path class="dw ${cls}" d="M${f1(x1 + j(jit))} ${f1(y1 + j(jit))}Q${f1(mx)} ${f1(my)} ${f1(x2 + j(jit))} ${f1(y2 + j(jit))}" stroke="${c}" stroke-width="${w}" pathLength="1"/>`
  }
  const head = (x, y, ang, len = 11) => {
    const a = (ang * Math.PI) / 180, s = 0.5
    const p = (k) => `${f1(x - Math.cos(a + k) * len)} ${f1(y - Math.sin(a + k) * len)}`
    return `M${p(s)}L${f1(x)} ${f1(y)}L${p(-s)}`
  }
  const arrow = (x1, y1, x2, y2, o = {}) => {
    const mx = (x1 + x2) / 2 + j(2), my = (y1 + y2) / 2 + j(2)
    const ang = (Math.atan2(y2 - my, x2 - mx) * 180) / Math.PI
    const c = o.c ?? INK
    return `<path class="dw" d="M${f1(x1 + j(1))} ${f1(y1 + j(1))}Q${f1(mx)} ${f1(my)} ${f1(x2)} ${f1(y2)}${head(x2, y2, ang)}" stroke="${c}" stroke-width="${o.w ?? 2.6}" pathLength="1"/>`
  }
  // dashed line built from short segments (so the draw-on still works)
  const dashed = (x1, y1, x2, y2, o = {}) => {
    const dash = o.dash ?? 9, gap = o.gap ?? 7, L = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(L / (dash + gap))
    const ux = (x2 - x1) / L, uy = (y2 - y1) / L
    let d = ''
    for (let i = 0; i <= n; i++) {
      const s = i * (dash + gap), e = Math.min(L, s + dash)
      d += `M${f1(x1 + ux * s + j(0.6))} ${f1(y1 + uy * s + j(0.6))}L${f1(x1 + ux * e)} ${f1(y1 + uy * e)}`
    }
    if (o.head) d += head(x2, y2, (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI)
    return `<path class="dw" d="${d}" stroke="${o.c ?? INK}" stroke-width="${o.w ?? 2.2}" pathLength="1"/>`
  }
  // a hand-drawn rounded box. The path starts and ends a little apart, like a real pen stroke.
  const box = (x, y, w, h, { r = 7, c = INK, sw = 2.6, fill = null, cls = '' } = {}) => {
    const o = j(1.4), p = (v) => f1(v)
    const d = `M${p(x + r + 3 + o)} ${p(y + j(0.8))}H${p(x + w - r)}Q${p(x + w + j(1))} ${p(y)} ${p(x + w + j(0.8))} ${p(y + r)}V${p(y + h - r)}Q${p(x + w)} ${p(y + h + j(1))} ${p(x + w - r)} ${p(y + h + j(0.8))}H${p(x + r)}Q${p(x + j(1))} ${p(y + h)} ${p(x + j(0.8))} ${p(y + h - r)}V${p(y + r)}Q${p(x)} ${p(y + j(1))} ${p(x + r + 6)} ${p(y + j(0.8))}`
    const bg = fill ? `<rect class="fl" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>` : ''
    return `${bg}<path class="dw ${cls}" d="${d}" stroke="${c}" stroke-width="${sw}" pathLength="1"/>`
  }
  const poly = (pts, { c = INK, sw = 2.6 } = {}) =>
    `<path class="dw" d="M${pts.map((p) => `${f1(p[0] + j(1))} ${f1(p[1] + j(1))}`).join('L')}Z" stroke="${c}" stroke-width="${sw}" pathLength="1"/>`
  const ellipse = (cx, cy, rx, ry, { c = INK, sw = 2.4, rot = 0 } = {}) => {
    const n = 22, pts = []
    for (let i = 0; i <= n + 2; i++) {
      const t = (i / n) * Math.PI * 2 + 0.3, k = 1 + j(0.02)
      const x = Math.cos(t) * rx * k, y = Math.sin(t) * ry * k, cs = Math.cos(rot), sn = Math.sin(rot)
      pts.push(`${f1(cx + x * cs - y * sn)} ${f1(cy + x * sn + y * cs)}`)
    }
    return `<path class="dw" d="M${pts.join('L')}" stroke="${c}" stroke-width="${sw}" pathLength="1"/>`
  }
  const text = (x, y, s, { f = 'mono', size = 12, w = 400, fill = INK, rot = 0, anchor = 'start', ls = 0, cls = '' } = {}) => {
    const sz = size * (f === 'hand' || f === 'mono' ? b : 1)
    const font = `${w} ${f1(sz)}px ${FONT[f]}`
    const tr = rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''
    return `<text class="tx t-${f} ${cls}" x="${x}" y="${y}" font-size="${f1(sz)}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}${tr} data-font="${font}" data-ls="${ls}" data-anchor="${anchor}">${s}</text>`
  }
  const strike = (x1, y, x2, c = ORG) => line(x1, y, x2, y - 3, { c, w: 2.4, cls: 'strike' })
  const wob = (x1, y, x2, amp = 3, n = 8, c = TEAL) => {
    let d = `M${x1} ${y}`
    for (let i = 1; i <= n; i++) d += `Q${f1(x1 + ((x2 - x1) * (i - 0.5)) / n)} ${f1(y + (i % 2 ? -amp : amp))} ${f1(x1 + ((x2 - x1) * i) / n)} ${y}`
    return `<path class="dw" d="${d}" stroke="${c}" stroke-width="2" pathLength="1"/>`
  }

  /* ---------------- paper, grid, fold lines, tape ---------------- */
  let grid = ''
  for (let x = 20; x < ART_W; x += 20) grid += `M${x} 0V${ART_H}`
  for (let y = 20; y < ART_H; y += 20) grid += `M0 ${y}H${ART_W}`
  let major = ''
  for (let x = 100; x < ART_W; x += 100) major += `M${x} 0V${ART_H}`
  for (let y = 100; y < ART_H; y += 100) major += `M0 ${y}H${ART_W}`
  const bg = `<g class="bg">
    <rect width="${ART_W}" height="${ART_H}" fill="#fbf9f3"/>
    <path d="${grid}" stroke="rgba(10,127,138,.085)" stroke-width="1" fill="none"/>
    <path d="${major}" stroke="rgba(10,127,138,.14)" stroke-width="1.2" fill="none"/>
    <path d="M500 0V${ART_H}M0 380H${ART_W}" stroke="rgba(20,42,49,.07)" stroke-width="3" fill="none"/>
    <path d="M500 0V${ART_H}M0 380H${ART_W}" stroke="rgba(255,255,255,.7)" stroke-width="1" fill="none" transform="translate(2 2)"/>
    <rect x="16" y="16" width="${ART_W - 32}" height="${ART_H - 32}" fill="none" stroke="rgba(20,42,49,.35)" stroke-width="1.4"/>
    <path d="M16 40V16H40M${ART_W - 40} 16H${ART_W - 16}V40M${ART_W - 16} ${ART_H - 40}V${ART_H - 16}H${ART_W - 40}M40 ${ART_H - 16}H16V${ART_H - 40}" stroke="rgba(20,42,49,.6)" stroke-width="3" fill="none"/>
    <rect width="${ART_W}" height="${ART_H}" fill="url(#bpGrain)" opacity=".5"/>
    <g class="tape"><rect x="56" y="-6" width="92" height="30" rx="2" fill="rgba(222,205,160,.78)" transform="rotate(-4 100 10)"/><rect x="852" y="-6" width="92" height="30" rx="2" fill="rgba(222,205,160,.78)" transform="rotate(5 900 10)"/></g>
  </g>`

  /* ---------------- title block ---------------- */
  const title = 'PROJECT IDEA'
  const tw = measure(title, `400 54px ${FONT.serif}`) + title.length * 1.5
  const heading = [
    text(46, 100, title, { f: 'serif', size: 54, ls: 1.5 }),
    text(46 + tw + 14, 100, '— v0.1', { f: 'mono', size: 22, w: 500, fill: ORG }),
    wob(46, 116, 46 + tw + 100, 2.4, 14),
    text(48, 138, "SOFTWARE ARCHITECT'S SKETCHBOOK  ·  DRAFT  ·  NOT FOR PRODUCTION", { f: 'mono', size: 10, fill: SOFT, ls: 1.4 }),
    box(744, 36, 218, 70, { r: 3, sw: 2 }),
    line(744, 62, 962, 62, { w: 1.8 }),
    line(852, 62, 852, 106, { w: 1.8 }),
    text(754, 54, 'SHEET 01 / 01', { size: 10, fill: INK, ls: 1 }),
    text(906, 54, 'DRAFT', { size: 10, fill: ORG, ls: 1, anchor: 'middle' }),
    text(754, 88, 'SCALE: ???', { size: 11, fill: INK, ls: 1 }),
    text(862, 88, 'REV: —', { size: 11, fill: INK, ls: 1 }),
  ].join('')

  /* ---------------- app wireframe ---------------- */
  const WX = 44, WY = 156
  const wire = [
    box(WX, WY, 332, 262, { r: 10, fill: 'rgba(255,255,255,.55)' }),
    line(WX, WY + 30, WX + 332, WY + 30, { w: 2 }),
    ...[0, 1, 2].map((i) => `<path class="dw" d="M${WX + 20 + i * 16} ${WY + 15}a4 4 0 1 0 0.1 0" stroke="${INK}" stroke-width="2" pathLength="1"/>`),
    box(WX + 78, WY + 8, 200, 15, { r: 7, sw: 1.8 }),
    box(WX + 16, WY + 42, 30, 14, { r: 3, sw: 2.2, c: TEAL }),
    line(WX + 170, WY + 49, WX + 196, WY + 49, { w: 2.2 }),
    line(WX + 212, WY + 49, WX + 250, WY + 49, { w: 2.2 }),
    line(WX + 266, WY + 49, WX + 304, WY + 49, { w: 2.2 }),
    line(WX + 16, WY + 84, WX + 200, WY + 84, { w: 7.5 }),
    line(WX + 16, WY + 104, WX + 150, WY + 104, { w: 7.5 }),
    line(WX + 16, WY + 126, WX + 190, WY + 126, { w: 2, c: SOFT }),
    line(WX + 16, WY + 140, WX + 160, WY + 140, { w: 2, c: SOFT }),
    box(WX + 16, WY + 158, 98, 28, { r: 14, c: ORG, fill: ORGF }),
    text(WX + 65, WY + 176, 'GET STARTED', { size: 10, fill: ORG, w: 500, anchor: 'middle', ls: 0.8 }),
    box(WX + 206, WY + 78, 110, 108, { r: 8, sw: 2.2 }),
    line(WX + 206, WY + 78, WX + 316, WY + 186, { w: 1.5, c: SOFT }),
    line(WX + 316, WY + 78, WX + 206, WY + 186, { w: 1.5, c: SOFT }),
    ...[0, 1, 2].map((i) => {
      const cx = WX + 16 + i * 106
      return box(cx, WY + 200, 94, 50, { r: 5, sw: 2.2 }) + box(cx + 7, WY + 207, 80, 20, { r: 3, sw: 1.5, c: SOFT }) + line(cx + 8, WY + 238, cx + 70, WY + 238, { w: 1.8, c: SOFT })
    }),
    text(WX + 262, WY + 138, 'hero img?', { f: 'hand', size: 24, fill: TEAL, rot: -9, anchor: 'middle', w: 500 }),
  ].join('')

  /* ---------------- user flow ---------------- */
  const flow = [
    text(426, 174, 'USER FLOW', { size: 12, w: 500, ls: 2 }),
    dashed(426, 182, 540, 182, { dash: 5, gap: 5, w: 1.6, c: SOFT }),
    box(426, 198, 96, 34, { r: 17, fill: MINT }), text(474, 220, 'Landing', { size: 12, anchor: 'middle' }),
    box(562, 198, 96, 34, { r: 17, fill: MINT }), text(610, 220, 'Sign up', { size: 12, anchor: 'middle' }),
    poly([[740, 182], [774, 215], [740, 248], [706, 215]], { sw: 2.4 }), text(740, 219, 'auth?', { size: 11, anchor: 'middle' }),
    box(830, 198, 112, 34, { r: 17, fill: MINT }), text(886, 220, 'Dashboard', { size: 12, anchor: 'middle' }),
    arrow(522, 215, 562, 215), arrow(658, 215, 704, 215), arrow(774, 215, 828, 215),
    text(786, 206, 'yes', { f: 'hand', size: 21, fill: TEAL }),
    arrow(740, 248, 740, 290), text(750, 274, 'no', { f: 'hand', size: 21, fill: TEAL }),
    box(700, 290, 80, 30, { r: 15 }), text(740, 309, 'Login', { size: 12, anchor: 'middle' }),
    arrow(886, 232, 886, 290),
    box(836, 290, 100, 30, { r: 15, fill: MINT }), text(886, 309, 'Insights', { size: 12, anchor: 'middle' }),
    text(428, 276, 'onboarding??', { f: 'hand', size: 25, fill: TEAL, rot: -3, w: 500 }),
    wob(430, 284, 548, 2.4, 9),
    text(430, 312, 'chat (v2)', { f: 'hand', size: 22, fill: SOFT }), strike(426, 306, 508),
    ellipse(606, 308, 42, 17, { c: TEAL, rot: -0.05 }), text(606, 316, 'MVP', { f: 'hand', size: 24, fill: TEAL, anchor: 'middle', w: 500 }),
  ].join('')

  /* ---------------- data model sketch (fills the middle) ---------------- */
  const ent = (x, name) =>
    box(x, 392, 100, 50, { r: 5, sw: 2.3, fill: 'rgba(255,255,255,.5)' }) + text(x + 50, 408, name, { size: 11, w: 600, anchor: 'middle' }) +
    line(x + 6, 414, x + 94, 414, { w: 1.6, c: SOFT }) + line(x + 12, 424, x + 70, 424, { w: 1.5, c: SOFT }) + line(x + 12, 433, x + 54, 433, { w: 1.5, c: SOFT })
  const erd = [
    text(432, 374, 'DATA MODEL', { size: 12, w: 500, ls: 2 }), text(534, 374, '(wip)', { f: 'hand', size: 20, fill: SOFT }),
    ent(432, 'users'), ent(562, 'projects'), ent(692, 'insights'),
    arrow(534, 418, 560, 418, { w: 2.2 }), arrow(664, 418, 690, 418, { w: 2.2 }),
    text(540, 410, '1', { size: 9, fill: SOFT }), text(666, 410, '∞', { size: 10, fill: SOFT }),
  ].join('')

  /* ---------------- system architecture (lower left: within his reach) ---------------- */
  const FX = 62, AX = 232, BX = 402, Y1 = 470, Y2 = 622, BW = 132, BH = 54
  const mod = (x, y, label, icon) =>
    box(x, y, BW, BH, { r: 8, sw: 2.9, fill: MINT }) + icon + text(x + BW / 2 + 12, y + BH / 2 + 5, label, { size: 15, w: 600, anchor: 'middle' })
  const iconFront = `<path class="dw" d="M${FX + 14} ${Y1 + 19}h18v14h-18zM${FX + 14} ${Y1 + 24}h18" stroke="${TEAL}" stroke-width="2" fill="none" pathLength="1"/>`
  const iconApi = text(AX + 24, Y1 + 33, '{ }', { size: 17, w: 600, fill: TEAL, anchor: 'middle' })
  const iconBack = `<path class="dw" d="M${BX + 14} ${Y1 + 19}h18M${BX + 14} ${Y1 + 27}h18M${BX + 14} ${Y1 + 35}h18" stroke="${TEAL}" stroke-width="2" fill="none" pathLength="1"/>`
  const iconDb = `<path class="dw" d="M${BX + 14} ${Y2 + 21}a9 4 0 1 0 18 0a9 4 0 1 0 -18 0v14a9 4 0 0 0 18 0v-14" stroke="${TEAL}" stroke-width="2" fill="none" pathLength="1"/>`
  const iconAi = `<path class="dw" d="M${FX + 15} ${Y2 + 19}l8 8M${FX + 15} ${Y2 + 35}l8 -8M${FX + 23} ${Y2 + 27}h10M${FX + 33} ${Y2 + 27}m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" stroke="${TEAL}" stroke-width="2" fill="none" pathLength="1"/>`
  const arch = [
    text(62, 448, 'SYSTEM ARCHITECTURE', { size: 12, w: 500, ls: 2 }),
    dashed(62, 456, 236, 456, { dash: 5, gap: 5, w: 1.6, c: SOFT }),
    mod(FX, Y1, 'Frontend', iconFront), mod(AX, Y1, 'API', iconApi), mod(BX, Y1, 'Backend', iconBack),
    mod(BX, Y2, 'Database', iconDb), mod(FX, Y2, 'AI / ML', iconAi),
    arrow(FX + BW, Y1 + 27, AX - 2, Y1 + 27), text(FX + BW + 18, Y1 + 18, 'REST', { size: 9, fill: SOFT, anchor: 'middle' }),
    arrow(AX + BW, Y1 + 27, BX - 2, Y1 + 27), text(AX + BW + 18, Y1 + 18, 'JSON', { size: 9, fill: SOFT, anchor: 'middle' }),
    arrow(BX + BW / 2, Y1 + BH, BX + BW / 2, Y2 - 2), text(BX + BW / 2 + 10, Y1 + 100, 'SQL', { size: 9, fill: SOFT }),
    dashed(AX + 30, Y1 + BH + 2, FX + BW + 4, Y2 + 16, { head: true, c: TEAL }), text(AX - 4, Y1 + 100, '?', { f: 'hand', size: 30, fill: ORG, w: 500 }),
    arrow(FX + BW + 2, Y2 + BH + 4, BX - 2, Y2 + BH + 4), text(FX + BW + 72, Y2 + BH + 18, 'embeddings', { size: 9, fill: SOFT, anchor: 'middle' }),
  ].join('')

  /* ---------------- notes: the to-do list and a sticky note (lower right) ---------------- */
  const NX = 724
  const notes = [
    text(NX, 490, 'TODO', { f: 'hand', size: 34, fill: ORG, w: 600 }),
    line(NX - 2, 500, NX + 82, 498, { c: ORG, w: 2.4 }),
    ...[['auth + onboarding', 534], ['dashboard v1', 570], ['AI magic ???', 606], ['scale to 1M (lol)', 642]].map(([s, y]) =>
      box(NX + 2, y - 16, 17, 17, { r: 3, sw: 2, c: SOFT }) + text(NX + 30, y, s, { f: 'hand', size: 24, w: 500 })),
    text(NX + 30, 680, 'pixel-perfect', { f: 'hand', size: 23, fill: SOFT }), strike(NX + 26, 674, NX + 142),
    `<g transform="rotate(-3 868 366)"><rect class="fl" x="800" y="334" width="140" height="64" fill="${ORGF}" stroke="${ORG}" stroke-width="1.4"/></g>`,
    text(814, 372, 'just ship it?', { f: 'hand', size: 28, fill: ORG, rot: -3, w: 600 }),
  ].join('')

  /* ---------------- the extras that appear while it gets out of hand (hidden until the story needs them) ---------------- */
  const late = [
    text(330, 588, '?', { f: 'hand', size: 62, fill: ORG, rot: 10, w: 600 }),
    text(520, 540, '?!', { f: 'hand', size: 48, fill: ORG, rot: -8, w: 600 }),
    `<path class="dw" d="M${BX + 70} ${Y1 - 6}C${BX + 20} ${Y1 - 70} ${FX + 130} ${Y1 - 70} ${FX + 66} ${Y1 - 6}" stroke="${TEAL}" stroke-width="2.2" fill="none" pathLength="1"/>`,
    `<path class="dw" d="M${FX + 66} ${Y1 - 6}l-1 -15M${FX + 66} ${Y1 - 6}l14 -8" stroke="${TEAL}" stroke-width="2.2" fill="none" pathLength="1"/>`,
    text(250, 430, 'websocket?', { f: 'hand', size: 23, fill: TEAL, rot: 2, w: 500 }),
    `<path class="dw" d="M300 560c-30 -30 40 -44 22 -14s-52 20 -20 30 70 -10 40 -34 -30 -4 8 -14" stroke="${ORG}" stroke-width="1.8" fill="none" pathLength="1"/>`,
    text(548, 654, 'latency!!', { f: 'hand', size: 28, fill: ORG, rot: -7, w: 600 }),
    text(560, 722, 'cache?', { f: 'hand', size: 26, fill: SOFT, rot: 3 }), strike(556, 716, 638),
    `<path class="dw" d="M586 580c20 -26 -28 -26 -4 -2s46 20 18 -6" stroke="${ORG}" stroke-width="1.8" fill="none" pathLength="1"/>`,
  ].join('')

  /* ---------------- the two strokes the character draws himself ---------------- */
  const DX = FX + 66
  const drawn = `<path id="bp-drawn" class="dw drawn" d="M${DX} ${Y1 + BH + 4}C${DX - 8} ${Y1 + BH + 30} ${DX + 6} ${Y2 - 34} ${DX} ${Y2 - 8}" stroke="${ORG}" stroke-width="3.4" fill="none" pathLength="1"/>
    <path id="bp-drawn-head" class="dw drawn" d="${head(DX, Y2 - 2, 90, 13)}" stroke="${ORG}" stroke-width="3.4" fill="none" pathLength="1"/>
    <path id="bp-xout" class="dw drawn" d="M${DX - 34} ${Y1 + 76}L${DX + 30} ${Y1 + 128}M${DX + 32} ${Y1 + 74}L${DX - 36} ${Y1 + 130}M${DX - 40} ${Y1 + 104}L${DX + 36} ${Y1 + 100}" stroke="${ORG}" stroke-width="4" fill="none" pathLength="1"/>
    <text class="tx t-hand drawn" id="bp-direct" x="${DX + 22}" y="${Y1 + 90}" font-size="${f1(24 * b)}" font-weight="600" fill="${ORG}" transform="rotate(-9 ${DX + 22} ${Y1 + 90})" data-font="600 ${f1(24 * b)}px ${FONT.hand}" data-ls="0" data-anchor="start">direct?</text>`

  return `${bg}<g class="ink">${heading}${wire}${flow}${erd}${arch}${notes}</g><g class="late">${late}</g><g class="mine">${drawn}</g>`
}

// Anchor points (in design coordinates) the story refers to.
export const ANCHORS = {
  corner: [0, ART_H],
}
