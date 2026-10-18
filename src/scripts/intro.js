// Loader: a samurai stands facing you against a white sun on a red sky and performs one iaido form.
//
//   kamae      hands settle on the hilt (right) and the scabbard (left)
//   koiguchi   the thumb frees the blade
//   nukitsuke  the right hand draws the blade out while the left hand pulls the scabbard back
//   jodan      the sword is raised overhead; the left hand travels up the whole way and joins the hilt
//   kirioroshi a vertical cut straight down towards you, leaving a vertical line through the screen
//   chiburi    the left hand lets go, a flick of the blade
//   noto       the left hand returns to the scabbard, the tip finds the mouth, the blade slides home, click
//   then       the screen tears along the cut: the left half slides left, the right half slides right
//
// One SVG scene in screen pixels (so it can be cloned into the two halves) driven by one seekable
// GSAP timeline. The sword is a real 3D object (grip position + direction) projected with perspective,
// so a cut towards the viewer foreshortens. The right hand is glued to the grip for the whole form; the
// left hand moves continuously between scabbard and hilt. Both arms are solved with two-bone IK.

import { gsap } from 'gsap'

const root = document.documentElement
const NS = 'http://www.w3.org/2000/svg'
const lerp = (a, b, t) => a + (b - a) * t
const rad = (d) => (d * Math.PI) / 180
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const f1 = (v) => v.toFixed(1)
const INK = '#08060a', INK2 = '#16100f', RIM = 'rgba(255,255,255,.16)', RED2 = '#960c08', SUN = '#f8f3ed'

function el(name, attrs = {}, parent) {
  const n = document.createElementNS(NS, name)
  for (const k in attrs) n.setAttribute(k, attrs[k])
  parent?.appendChild(n)
  return n
}

const DEFS = `<defs>
<radialGradient id="gRed" cx=".5" cy=".4" r=".85"><stop offset="0" stop-color="#ee2c1d"/><stop offset=".55" stop-color="#d0160e"/><stop offset="1" stop-color="#8a0b07"/></radialGradient>
<radialGradient id="gSunGlow"><stop offset=".62" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="gVig" cx=".5" cy=".5" r=".8"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>
<linearGradient id="gSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa0aa"/><stop offset=".5" stop-color="#f2f4f8"/><stop offset="1" stop-color="#7d838d"/></linearGradient>
</defs>`

// two-bone IK; the elbow takes the lower, outward solution
function ik(ax, ay, tx, ty, l1, l2, out) {
  const dx = tx - ax, dy = ty - ay, d0 = Math.hypot(dx, dy) || 0.001
  const d = clamp(d0, 30, (l1 + l2) * 0.999)
  const ux = dx / d0, uy = dy / d0
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a))
  const mx = ax + ux * a, my = ay + uy * a, px = -uy * h, py = ux * h
  const c1 = [mx + px, my + py], c2 = [mx - px, my - py]
  const sc = (c) => c[1] * 0.6 + out * (c[0] - ax) * 0.8
  const j = sc(c1) >= sc(c2) ? c1 : c2
  return { jx: j[0], jy: j[1], ex: ax + ux * d, ey: ay + uy * d }
}

function pagoda(cx, base, k, fill) {
  let s = `<path d="M${f1(cx - 34 * k)} ${base} L${f1(cx - 26 * k)} ${f1(base - 230 * k)} L${f1(cx + 26 * k)} ${f1(base - 230 * k)} L${f1(cx + 34 * k)} ${base}Z" fill="${fill}"/>`
  for (let i = 0; i < 5; i++) {
    const y = base - 40 * k - i * 48 * k, w = 104 * k * (1 - i * 0.13)
    s += `<path d="M${f1(cx - w)} ${f1(y)} Q${f1(cx - w * 0.62)} ${f1(y - 6 * k)} ${f1(cx - w * 0.42)} ${f1(y - 22 * k)} L${f1(cx + w * 0.42)} ${f1(y - 22 * k)} Q${f1(cx + w * 0.62)} ${f1(y - 6 * k)} ${f1(cx + w)} ${f1(y)}Z" fill="${fill}"/>`
  }
  s += `<path d="M${f1(cx)} ${f1(base - 260 * k)} L${f1(cx)} ${f1(base - 330 * k)}" stroke="${fill}" stroke-width="${f1(4 * k)}"/>`
  return s
}

function cloud(x, y, w, h, fill, op) {
  return `<path d="M${f1(x)} ${f1(y)} q${f1(w * 0.08)} ${f1(-h)} ${f1(w * 0.22)} ${f1(-h * 0.4)} q${f1(w * 0.12)} ${f1(-h * 0.9)} ${f1(w * 0.3)} ${f1(-h * 0.2)} q${f1(w * 0.18)} ${f1(-h * 0.5)} ${f1(w * 0.3)} ${f1(h * 0.1)} q${f1(w * 0.1)} ${f1(h * 0.2)} ${f1(w * 0.18)} ${f1(h * 0.5)}Z" fill="${fill}" opacity="${op}"/>`
}

export function startIntro() {
  const overlay = document.querySelector('.intro')
  if (!overlay || !root.classList.contains('is-loading')) { window.__preDone?.(); return }
  const skipBtn = overlay.querySelector('.intro__skip')
  scrollTo(0, 0)

  const W = Math.max(320, innerWidth), H = Math.max(480, innerHeight)
  const portrait = W / H < 0.85
  const s = portrait ? Math.min((0.5 * H) / 860, (0.84 * W) / 520) : (0.66 * H) / 860
  const X0 = W / 2, Y0 = portrait ? H * 0.76 : H * 0.82
  const scr = (x, y) => [X0 + (x - 300) * s, Y0 + (y - 960) * s]

  const defs = el('svg', { width: 0, height: 0, 'aria-hidden': 'true' })
  defs.style.position = 'absolute'
  defs.innerHTML = DEFS
  overlay.prepend(defs)
  const svg = el('svg', { class: 'intro__stage', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' })
  overlay.insertBefore(svg, skipBtn)

  /* ---- backdrop: red sky, white sun with a brushed ring, clouds, pagodas, the rock ---- */
  const [sunX, sunY] = scr(300, 330)
  const R = portrait ? W * 0.46 : H * 0.33
  let rings = ''
  for (let i = 0; i < 6; i++) {
    const r = R * (1.035 + i * 0.022), c = 2 * Math.PI * r
    rings += `<circle cx="${f1(sunX)}" cy="${f1(sunY)}" r="${f1(r)}" fill="none" stroke="${SUN}" stroke-width="${2 + (i % 3) * 2.2}" stroke-linecap="round" stroke-dasharray="${f1(c * (0.18 + (i % 4) * 0.09))} ${f1(c * (0.05 + (i % 3) * 0.06))} ${f1(c * 0.3)} ${f1(c * 0.08)}" transform="rotate(${i * 67} ${f1(sunX)} ${f1(sunY)})" opacity="${0.55 + (i % 2) * 0.35}"/>`
  }
  const pk = H / 900
  const rock = `<path d="M${f1(X0 - 560 * s)} ${H + 2} C${f1(X0 - 470 * s)} ${f1(Y0 + 150 * s)} ${f1(X0 - 360 * s)} ${f1(Y0 + 28 * s)} ${f1(X0 - 190 * s)} ${f1(Y0 + 6 * s)} C${f1(X0 - 80 * s)} ${f1(Y0 - 4 * s)} ${f1(X0 + 80 * s)} ${f1(Y0 - 4 * s)} ${f1(X0 + 190 * s)} ${f1(Y0 + 6 * s)} C${f1(X0 + 360 * s)} ${f1(Y0 + 28 * s)} ${f1(X0 + 470 * s)} ${f1(Y0 + 150 * s)} ${f1(X0 + 560 * s)} ${H + 2}Z" fill="${INK}"/>`
  const branch = (x, y, dir) => `<path d="M${f1(x)} ${f1(y)} q${f1(dir * 60 * s)} ${f1(-30 * s)} ${f1(dir * 120 * s)} ${f1(-20 * s)} m${f1(-dir * 70 * s)} ${f1(-4 * s)} q${f1(dir * 20 * s)} ${f1(-26 * s)} ${f1(dir * 44 * s)} ${f1(-30 * s)}" stroke="${INK}" stroke-width="${f1(7 * s)}" fill="none" stroke-linecap="round"/><ellipse cx="${f1(x + dir * 118 * s)}" cy="${f1(y - 24 * s)}" rx="${f1(34 * s)}" ry="${f1(12 * s)}" fill="${INK}"/><ellipse cx="${f1(x + dir * 70 * s)}" cy="${f1(y - 40 * s)}" rx="${f1(26 * s)}" ry="${f1(10 * s)}" fill="${INK}"/>`
  svg.innerHTML = `
  <g class="bg">
    <rect width="${W}" height="${H}" fill="url(#gRed)"/>
    <circle cx="${f1(sunX)}" cy="${f1(sunY)}" r="${f1(R * 1.35)}" fill="url(#gSunGlow)"/>
    <circle class="sun" cx="${f1(sunX)}" cy="${f1(sunY)}" r="${f1(R)}" fill="${SUN}"/>
    <g class="rings">${rings}</g>
    <g class="cl1">${cloud(W * 0.02, H * 0.36, W * 0.34, H * 0.05, '#7c0a07', 0.92)}${cloud(W * 0.62, H * 0.5, W * 0.4, H * 0.06, '#7c0a07', 0.9)}</g>
    <g class="cl2">${cloud(W * 0.18, H * 0.58, W * 0.3, H * 0.045, '#8f0c08', 0.85)}${cloud(W * 0.7, H * 0.22, W * 0.26, H * 0.04, '#8f0c08', 0.8)}</g>
    ${pagoda(W * (portrait ? 0.08 : 0.1), H, pk * (portrait ? 0.7 : 1), RED2)}
    ${pagoda(W * (portrait ? 0.92 : 0.9), H, pk * (portrait ? 0.62 : 0.86), RED2)}
    ${rock}
    ${branch(X0 - 330 * s, Y0 + 66 * s, -1)}${branch(X0 + 330 * s, Y0 + 66 * s, 1)}
    <g class="petals"></g>
  </g>
  <g class="cam"><g transform="translate(${f1(X0)} ${f1(Y0)}) scale(${s.toFixed(4)}) translate(-300 -960)"><g class="fm"></g></g></g>
  <g class="fx">
    <path class="cutGlow" fill="none" stroke="#fff" stroke-width="${portrait ? 9 : 14}" stroke-linecap="round" opacity=".55" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
    <path class="cutCore" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
    <rect class="flash" width="${W}" height="${H}" fill="#fff" opacity="0"/>
    <rect width="${W}" height="${H}" fill="url(#gVig)"/>
    <rect class="fade" width="${W}" height="${H}" fill="#000"/>
  </g>`
  const $ = (q) => svg.querySelector(q)
  const fm = $('.fm'), cam = $('.cam'), flash = $('.flash'), fade = $('.fade'), cutCore = $('.cutCore'), cutGlow = $('.cutGlow')

  // the cut: a vertical line through the middle of the screen (a hair off true, like a real stroke)
  const tx = H * 0.012
  const xT = W / 2 + tx, xB = W / 2 - tx
  const cutD = `M${f1(xT)} -10L${f1(xB)} ${H + 10}`
  cutCore.setAttribute('d', cutD); cutGlow.setAttribute('d', cutD)

  // ambient: clouds drift, petals blow across
  const ambient = gsap.timeline()
  ambient.to($('.cl1'), { x: -W * 0.06, duration: 14, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0)
  ambient.to($('.cl2'), { x: W * 0.05, duration: 11, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0)
  ambient.to($('.rings'), { rotation: 8, svgOrigin: `${f1(sunX)} ${f1(sunY)}`, duration: 12, ease: 'none' }, 0)
  const petals = $('.petals')
  for (let i = 0; i < 16; i++) {
    const p = el('ellipse', { cx: W * (0.55 + ((i * 0.137) % 0.6)), cy: H * ((i * 0.211) % 0.9), rx: 3 + (i % 3), ry: 1.6, fill: i % 3 ? INK : '#5e0806', opacity: 0.8 }, petals)
    ambient.fromTo(p, { x: 0, y: 0, rotation: 0 }, { x: -W * (0.7 + (i % 4) * 0.12), y: H * (0.15 + (i % 5) * 0.06), rotation: 360 * (i % 2 ? 1 : -1), duration: 6 + (i % 5), ease: 'none', repeat: -1 }, 0)
  }

  /* ---- the figure, facing the viewer (local space: x right, y down, z towards the viewer; feet at y 960) ---- */
  const hakama = el('path', { fill: INK }, fm)
  const feet = el('path', { fill: INK }, fm)
  const upper = el('g', {}, fm)
  const torso = el('g', {}, upper)
  torso.innerHTML = `
    <path d="M236 268 Q300 246 364 268 L356 474 L244 474Z" fill="${INK}"/>
    <path d="M268 252 L300 350 L332 252" fill="none" stroke="${RIM}" stroke-width="3"/>
    <path d="M280 252 L300 318 L320 252" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="2"/>
    <rect x="286" y="212" width="28" height="44" fill="${INK}"/>
    <rect x="243" y="446" width="114" height="34" rx="4" fill="#120d0e" stroke="${RIM}" stroke-width="1.6"/>
    <rect x="288" y="452" width="26" height="24" rx="3" fill="#0a0708" stroke="${RIM}" stroke-width="1.2"/>`
  const hat = el('g', {}, upper)
  hat.innerHTML = `
    <ellipse cx="300" cy="226" rx="30" ry="28" fill="${INK}"/>
    <path d="M142 218 Q300 40 458 218 Q300 198 142 218Z" fill="${INK}" stroke="${RIM}" stroke-width="1.4"/>
    <path d="M300 112 Q220 150 168 212M300 112 Q260 150 232 207M300 112 L300 200M300 112 Q340 150 368 207M300 112 Q380 150 432 212" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="1.4"/>
    <path d="M268 214 Q262 244 280 262M332 214 Q338 244 320 262" fill="none" stroke="#6b1210" stroke-width="2.4" stroke-linecap="round"/>`
  const cords = el('path', { fill: 'none', stroke: INK, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, upper)
  const saya = el('path', { fill: '#0b0809', stroke: 'rgba(255,255,255,.2)', 'stroke-width': 1.2 }, upper)
  const sageo = el('path', { fill: 'none', stroke: '#6b1210', 'stroke-width': 3, 'stroke-linecap': 'round' }, upper)
  const trail = el('path', { fill: '#fff', opacity: 0 }, upper)
  const bladeP = el('path', { fill: 'url(#gSteel)', stroke: '#0a0a0c', 'stroke-width': 1.1, 'stroke-linejoin': 'round' }, upper)
  const edge = el('path', { fill: 'none', stroke: '#fff', 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: 0 }, upper)
  const tsukaP = el('path', { fill: '#17100f', stroke: 'rgba(255,255,255,.2)', 'stroke-width': 1 }, upper)
  const wrapP = el('path', { fill: 'none', stroke: 'rgba(255,255,255,.34)', 'stroke-width': 3, 'stroke-dasharray': '1.6 5.5' }, upper)
  const tsubaP = el('path', { fill: 'none', stroke: '#1b1415', 'stroke-width': 5, 'stroke-linecap': 'round' }, upper)
  const tsubaR = el('path', { fill: 'none', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 1, 'stroke-linecap': 'round' }, upper)
  const arm = () => ({
    sleeveO: el('path', { fill: RIM }, upper),
    sleeve: el('path', { fill: INK2 }, upper),
    upO: el('path', { fill: 'none', stroke: RIM, 'stroke-width': 35.5, 'stroke-linecap': 'round' }, upper),
    up: el('path', { fill: 'none', stroke: INK2, 'stroke-width': 33, 'stroke-linecap': 'round' }, upper),
    foO: el('path', { fill: 'none', stroke: RIM, 'stroke-width': 30.5, 'stroke-linecap': 'round' }, upper),
    fo: el('path', { fill: 'none', stroke: INK2, 'stroke-width': 28, 'stroke-linecap': 'round' }, upper),
    hand: el('circle', { r: 15, fill: '#1d1514', stroke: RIM, 'stroke-width': 1.2 }, upper),
  })
  const armR = arm(), armL = arm() // armR: his right arm, on the left of the picture; armL: his left arm
  const click = el('g', { opacity: 0 }, upper)
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; el('line', { x1: Math.cos(a) * 6, y1: Math.sin(a) * 6, x2: Math.cos(a) * (k % 2 ? 16 : 28), y2: Math.sin(a) * (k % 2 ? 16 : 28), stroke: '#fff', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, click) }

  /* ---- 3D helpers and state ---- */
  const FOC = 1800
  const proj = (x, y, z) => { const k = FOC / (FOC - z); return [300 + (x - 300) * k, 470 + (y - 470) * k, k] }
  const nrm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l] }
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]
  const dirOf = (L, al) => nrm([L, -Math.sin(rad(al)), Math.cos(rad(al))])
  const AX = nrm([0.7, 0.25, -0.67]) // scabbard axis, hilt -> tip (the tip points back and to his left)
  const M0 = [322, 464, 30] // koiguchi, the scabbard mouth, in front of the belly
  const G0 = add(M0, AX, -30) // grip, with the guard touching the mouth
  const AL0 = 199.3, L0 = 0.98 // the same axis expressed as (lateral, elevation) for tweening
  const S = { gx: G0[0], gy: G0[1], gz: G0[2], al: AL0, L: L0, sb: 0, rr: 0, lr: 0, th: 0, crouch: 0, shine: 0, trail: 0, trailOp: 0, click: 0 }
  const trailPts = []
  let wt = 0, last = performance.now()
  const SH_R = [240, 268], SH_L = [360, 268]
  const REST_R = [226, 540], REST_L = [374, 540]

  function setArm(a, sx, sy, tx2, ty2, out, flutterSeed) {
    const r = ik(sx, sy, tx2, ty2, 150, 140, out)
    const up = `M${f1(sx)} ${f1(sy)}L${f1(r.jx)} ${f1(r.jy)}`, fo = `M${f1(r.jx)} ${f1(r.jy)}L${f1(r.ex)} ${f1(r.ey)}`
    a.up.setAttribute('d', up); a.upO.setAttribute('d', up); a.fo.setAttribute('d', fo); a.foO.setAttribute('d', fo)
    a.hand.setAttribute('cx', f1(r.ex)); a.hand.setAttribute('cy', f1(r.ey))
    // the wide kimono sleeve hangs from the forearm and drapes under it
    const A = [lerp(sx, r.jx, 0.45), lerp(sy, r.jy, 0.45)], F = [lerp(r.jx, r.ex, 0.62), lerp(r.jy, r.ey, 0.62)]
    const fl = Math.sin(wt * 3 + flutterSeed) * 5, dep = 84, lowY = Math.max(r.jy, F[1], A[1])
    const d = `M${f1(A[0])} ${f1(A[1])}L${f1(r.jx)} ${f1(r.jy)}L${f1(F[0])} ${f1(F[1])}Q${f1(F[0] + out * 22 + fl)} ${f1(lowY + dep * 0.8)} ${f1(r.jx + out * 4 + fl)} ${f1(lowY + dep)}Q${f1(A[0] - out * 26 + fl)} ${f1(lowY + dep * 0.7)} ${f1(A[0])} ${f1(A[1])}Z`
    a.sleeve.setAttribute('d', d); a.sleeveO.setAttribute('d', d)
  }

  function draw() {
    const now = performance.now(); wt += Math.min(0.05, (now - last) / 1000); last = now
    const cr = S.crouch * 10 + Math.sin(wt * 1.6) * 1.2
    upper.setAttribute('transform', `translate(0 ${f1(cr)})`)
    // trousers: they stay planted, the hem moves in the wind
    const fl = Math.sin(wt * 2.3) * 5, fl2 = Math.sin(wt * 2.9 + 1) * 5
    hakama.setAttribute('d', `M${f1(254)} ${f1(468 + cr)} L${f1(170 + fl)} 944 L${f1(292)} 944 L300 906 L308 944 L${f1(430 + fl2)} 944 L${f1(346)} ${f1(468 + cr)}Z`)
    feet.setAttribute('d', 'M196 940 h86 l6 22 h-98Z M318 940 h86 l6 22 h-98Z')
    // hat strap tails
    const wind = Math.sin(wt * 7) * 3
    cords.setAttribute('d', `M272 258 q${f1(-8 + wind)} 40 ${f1(-6 + wind * 2)} 78 M328 258 q${f1(8 + wind)} 40 ${f1(6 + wind * 2)} 70`)
    // scabbard, pulled back along its axis by `sb`
    const M = add(M0, AX, S.sb)
    const sA = proj(...M), sB = proj(...add(M, AX, 300))
    let nx = -(sB[1] - sA[1]), ny = sB[0] - sA[0]
    const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl
    saya.setAttribute('d', `M${f1(sA[0] + nx * 8 * sA[2])} ${f1(sA[1] + ny * 8 * sA[2])}L${f1(sB[0] + nx * 6 * sB[2])} ${f1(sB[1] + ny * 6 * sB[2])}L${f1(sB[0] - nx * 6 * sB[2])} ${f1(sB[1] - ny * 6 * sB[2])}L${f1(sA[0] - nx * 8 * sA[2])} ${f1(sA[1] - ny * 8 * sA[2])}Z`)
    const sg = proj(...add(M, AX, 60))
    sageo.setAttribute('d', `M${f1(sg[0])} ${f1(sg[1])}q${f1(-6 + wind)} 28 ${f1(-18 + wind)} 46`)
    // the sword
    const G = [S.gx, S.gy, S.gz], d = dirOf(S.L, S.al)
    const P = (t) => proj(G[0] + d[0] * t, G[1] + d[1] * t, G[2] + d[2] * t)
    const pm = P(-68), ts = P(30), tb = P(330), tip = P(344)
    const vx = tip[0] - pm[0], vy = tip[1] - pm[1], vl = Math.hypot(vx, vy) || 1
    const qx = -vy / vl, qy = vx / vl
    const off = (p, w) => `${f1(p[0] + qx * w * p[2])} ${f1(p[1] + qy * w * p[2])}`
    bladeP.setAttribute('d', `M${off(ts, 4.6)}L${off(tb, 3.2)}L${f1(tip[0])} ${f1(tip[1])}L${off(tb, -3.2)}L${off(ts, -4.6)}Z`)
    const e1 = P(44), e2 = P(322)
    edge.setAttribute('d', `M${off(e1, 1.7)}L${off(e2, 1.2)}`)
    edge.setAttribute('opacity', f1(S.shine * 0.95))
    tsukaP.setAttribute('d', `M${off(pm, 5.2)}L${off(ts, 5.2)}L${off(ts, -5.2)}L${off(pm, -5.2)}Z`)
    wrapP.setAttribute('d', `M${f1(pm[0])} ${f1(pm[1])}L${f1(ts[0])} ${f1(ts[1])}`)
    tsubaP.setAttribute('d', `M${off(ts, 14)}L${off(ts, -14)}`)
    tsubaR.setAttribute('d', `M${off(ts, 14)}L${off(ts, -14)}`)
    if (S.trail) {
      trailPts.push([tip, P(150)])
      if (trailPts.length > 11) trailPts.shift()
      if (trailPts.length > 1) trail.setAttribute('d', `M${trailPts.map((p) => `${f1(p[0][0])} ${f1(p[0][1])}`).join('L')}L${[...trailPts].reverse().map((p) => `${f1(p[1][0])} ${f1(p[1][1])}`).join('L')}Z`)
    }
    trail.setAttribute('opacity', f1(S.trailOp * 0.85))
    // hands: the right hand is the grip; the left hand slides between the scabbard and the pommel
    const grip = P(0), pom = P(-46), hold = proj(...add(M, AX, 44))
    const lt = [lerp(hold[0], pom[0], S.th), lerp(hold[1], pom[1], S.th)]
    setArm(armR, SH_R[0], SH_R[1], lerp(REST_R[0], grip[0], S.rr), lerp(REST_R[1], grip[1], S.rr), -1, 0)
    setArm(armL, SH_L[0], SH_L[1], lerp(REST_L[0], lt[0], S.lr), lerp(REST_L[1], lt[1], S.lr), 1, 2)
    click.setAttribute('opacity', f1(S.click))
    click.setAttribute('transform', `translate(${f1(sA[0])} ${f1(sA[1])}) scale(${f1(0.6 + S.click * 0.6)})`)
  }
  gsap.ticker.add(draw)

  /* ================= TIMELINE (seconds) ================= */
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } })
  const tg = (v, t, dur, ease) => tl.to(S, { gx: v[0], gy: v[1], gz: v[2], duration: dur, ease: ease || 'power2.out' }, t)
  const td = (L, al, t, dur, ease) => tl.to(S, { L, al, duration: dur, ease: ease || 'power2.out' }, t)
  tl.to(fade, { opacity: 0, duration: 1.1, ease: 'power1.out' }, 0)
  // kamae: both hands settle on the sword, the stance sinks
  tl.to(S, { rr: 1, duration: 0.7, ease: 'power2.inOut' }, 1.1)
  tl.to(S, { lr: 1, duration: 0.7, ease: 'power2.inOut' }, 1.2)
  tl.to(S, { crouch: 1, duration: 0.6, ease: 'power2.inOut' }, 1.75)
  // koiguchi: the thumb frees the blade
  tg(add(G0, AX, -10), 2.25, 0.1, 'power2.out')
  tl.fromTo(S, { click: 1 }, { click: 0, duration: 0.3, immediateRender: false }, 2.25)
  // nukitsuke: draw, scabbard pulled back
  const G1 = add(G0, AX, -200)
  tg(G1, 2.4, 0.5, 'power2.in')
  tl.to(S, { sb: 120, duration: 0.5, ease: 'power2.in' }, 2.4)
  tl.to(S, { shine: 1, duration: 0.3 }, 2.75)
  // jodan: raise overhead. The left hand leaves the scabbard and travels up to the pommel.
  tg([300, 128, 100], 2.95, 0.65, 'power2.inOut')
  td(0, 131, 2.95, 0.65, 'power2.inOut')
  tl.to(S, { th: 1, duration: 0.55, ease: 'power2.inOut' }, 3.05)
  // wind up
  tg([300, 108, 70], 3.75, 0.25, 'power2.out')
  td(0, 142, 3.75, 0.25, 'power2.out')
  // kirioroshi: the vertical cut straight down towards the viewer
  const cutAt = 4.02
  tl.set(S, { trail: 1 }, cutAt - 0.03)
  tl.to(S, { trailOp: 1, duration: 0.05 }, cutAt - 0.02)
  tg([300, 338, 178], cutAt, 0.2, 'power3.in')
  td(0, -17, cutAt, 0.2, 'power3.in')
  tl.fromTo([cutGlow, cutCore], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.1, ease: 'none', immediateRender: false }, cutAt + 0.1)
  tl.fromTo(flash, { opacity: 0 }, { opacity: 0.5, duration: 0.04, immediateRender: false }, cutAt + 0.17)
  tl.to(flash, { opacity: 0, duration: 0.4 }, cutAt + 0.21)
  tl.to(cam, { x: 0, y: 8, duration: 0.04, repeat: 5, yoyo: true, ease: 'none' }, cutAt + 0.19)
  tl.set(S, { trail: 0 }, cutAt + 0.3)
  tl.to(S, { trailOp: 0, duration: 0.3 }, cutAt + 0.3)
  tg([300, 352, 184], cutAt + 0.2, 0.12, 'power2.out')
  tl.to(cutGlow, { opacity: 0.1, duration: 0.7 }, cutAt + 0.45)
  tl.to(cutCore, { opacity: 0.55, duration: 0.7 }, cutAt + 0.45)
  // zanshin: hold, then the left hand lets go and returns to the scabbard
  tl.to(S, { th: 0, duration: 0.5, ease: 'power2.inOut' }, 4.7)
  // chiburi: a flick
  tg([322, 348, 168], 4.75, 0.12, 'power3.out')
  td(0.3, -45, 4.75, 0.12, 'power3.out')
  tl.to(S, { shine: 0.5, duration: 0.2 }, 4.9)
  // noto: bring the tip to the scabbard mouth
  const Mb = add(M0, AX, 120)
  const G5 = add(Mb, AX, -342)
  tg(G5, 4.9, 0.45, 'power2.inOut')
  td(L0, AL0 - 360, 4.9, 0.45, 'power2.inOut')
  // ...and slide the blade home while the scabbard comes forward
  tg(G0, 5.5, 0.75, 'power1.inOut')
  tl.to(S, { sb: 0, duration: 0.75, ease: 'power1.inOut' }, 5.5)
  tl.to(S, { shine: 0, duration: 0.5 }, 5.6)
  const shut = 6.28
  tl.fromTo(S, { click: 1 }, { click: 0, duration: 0.35, immediateRender: false }, shut)
  tl.to(S, { crouch: 0, duration: 0.5, ease: 'power2.inOut' }, shut + 0.05)
  tl.to(S, { rr: 0, lr: 0, duration: 0.55, ease: 'power2.inOut' }, shut + 0.15)
  tl.to(cutCore, { opacity: 1, duration: 0.08 }, shut)
  tl.to(cutGlow, { opacity: 0.6, duration: 0.08 }, shut)

  /* ---- hand-off: the screen tears along the cut ---- */
  let splitDone = false
  let stopClock = () => {}
  const split = (quick = false) => {
    if (splitDone) return
    splitDone = true
    stopClock()
    tl.pause()
    gsap.ticker.remove(draw)
    ambient.kill()
    skipBtn?.remove()
    if (quick) { cutCore.setAttribute('stroke-dashoffset', 0); cutGlow.setAttribute('stroke-dashoffset', 0); cutCore.setAttribute('opacity', 1) }
    // one ragged edge shared by both halves, so they mate exactly
    const N = 16, edgePts = []
    for (let i = 0; i <= N; i++) {
      const y = (i / N) * (H + 20) - 10
      const x = lerp(xT, xB, (y + 10) / (H + 20)) + (i === 0 || i === N ? 0 : ((i * 7919) % 13 - 6) * 1.6)
      edgePts.push([x, y])
    }
    const ragged = edgePts.map((p) => `${f1(p[0])}px ${f1(p[1])}px`)
    const mk = (clip) => {
      const d = document.createElement('div')
      d.className = 'intro__half'
      d.style.clipPath = clip
      d.appendChild(svg.cloneNode(true))
      overlay.appendChild(d)
      return d
    }
    const Lh = mk(`polygon(-10px -10px, ${ragged.join(', ')}, -10px ${H + 10}px)`)
    const Rh = mk(`polygon(${W + 10}px -10px, ${ragged.join(', ')}, ${W + 10}px ${H + 10}px)`)
    svg.remove()
    overlay.style.background = 'transparent'
    const k = quick ? 0.6 : 1
    const out = gsap.timeline({ paused: true, onComplete: finish })
    // the crack opens and trembles first, then the halves tear away
    out.to(Lh, { x: -10, duration: 0.35 * k, ease: 'power1.out' }, 0)
    out.to(Rh, { x: 10, duration: 0.35 * k, ease: 'power1.out' }, 0)
    out.to(Lh, { x: -4, duration: 0.05 * k, repeat: 3, yoyo: true, ease: 'none' }, 0.35 * k)
    out.to(Rh, { x: 4, duration: 0.05 * k, repeat: 3, yoyo: true, ease: 'none' }, 0.35 * k)
    out.to(Lh, { x: -W * 0.62, y: H * 0.02, rotate: -1.6, transformOrigin: '0% 100%', duration: 1.05 * k, ease: 'power3.in' }, 0.6 * k)
    out.to(Rh, { x: W * 0.62, y: -H * 0.02, rotate: 1.6, transformOrigin: '100% 0%', duration: 1.05 * k, ease: 'power3.in' }, 0.6 * k)
    out.call(() => window.__preDone?.(), [], 0.55 * k)
    // clamped clock: one long frame must not make the halves jump to the end
    let oc = 0
    const ostep = (_t, dt) => { oc += Math.min(dt, 34) / 1000; out.time(Math.min(oc, out.duration()), false); if (oc >= out.duration()) gsap.ticker.remove(ostep) }
    gsap.ticker.add(ostep)
  }
  function finish() {
    stopClock()
    gsap.ticker.remove(draw)
    ambient.kill()
    overlay.remove()
    root.classList.remove('is-loading')
    document.removeEventListener('keydown', onKey)
    window.__preDone?.()
  }
  const onKey = (e) => { if (e.key === 'Escape') split(true) }
  document.addEventListener('keydown', onKey)
  skipBtn?.addEventListener('click', () => split(true))

  tl.call(() => split(), [], shut + 0.45)
  tl.to({}, { duration: 0.01 }, shut + 0.5)
  draw()
  window.__introTL = tl
  const params = new URLSearchParams(location.search)
  const speedF = 1 / +(params.get('introSlow') || 1)

  // Drive the timeline from our own clock: wait until the page has settled, then advance by at most
  // 1/30 s per frame, so a stall pauses the show instead of skipping it (site.js turns lag smoothing off).
  let clock = 0
  const step = (_t, dt) => {
    clock += (Math.min(dt, 34) / 1000) * speedF
    tl.time(clock, false)
    if (clock >= tl.duration()) gsap.ticker.remove(step)
  }
  stopClock = () => gsap.ticker.remove(step)
  const settled = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })))
  Promise.race([settled, new Promise((r) => setTimeout(r, 3500))])
    .then(() => Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 700))]))
    .then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    .then(() => { if (!splitDone) gsap.ticker.add(step) })
}

startIntro()
