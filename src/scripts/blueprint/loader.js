// THE BROKEN BLUEPRINT: from idea to working software.
//
// A five-scene short film that plays over the page while it loads, then flows straight into the hero.
//
//   1  The idea           (0.0 - 1.0)  a big blueprint is drawn; a tiny stickman is mid-sketch
//   2  The struggle       (1.0 - 2.2)  he stops and thinks (chin on hand, eyes on the board, a thought bubble), draws a connection, crosses it out
//   3  The breaking point (2.2 - 3.2)  he steps back, decides, tears the sheet apart and throws it down
//   4  The transformation (3.2 - 4.2)  the fallen paper dissolves: ink becomes data points and vector lines
//   5  Raw data to software (4.2 - 5.0) the data funnels into the hero's own particle stream; the hero is revealed
//
// One GSAP timeline (seekable, driven by our own clamped clock) choreographs everything. The particle layer is
// a real-time simulation that is *scheduled* by that timeline. The hand-off to the hero is a contract with
// hero-ui.js / hero-scene.js:
//
//   window.__heroEntry()   -> { x, y, r } screen position of the mouth of the hero's particle stream
//   window.__flowHandoff   -> tells the hero its stream is already being fed, so it reveals right away
//   window.__preDone()     -> releases the hero's own intro (this was already how the old loader handed over)
//
// Cleanup: every ticker callback, listener and tween created here is removed in finish().

import { gsap } from 'gsap'
import { svgEl, clamp, lerp, rad, f1, rng, fontsReady } from './util.js'
import { buildArt, ART_W, ART_H } from './art.js'
import { createPaper, geometry } from './paper.js'
import { sampleInk } from './sample.js'
import { createStickman } from './stickman.js'
import { createFx } from './fx.js'

const root = document.documentElement
const params = new URLSearchParams(location.search)

// Story clock (seconds). Everything below refers to these.
const T = {
  rip1: 2.66, swap: 3.0, dissolve: 3.2, converge: 3.5, handoff: 4.05, hold: 4.0, end: 5.0,
}

// How much slower than the story clock the film plays, by story time (1 = the original pace). The whole film runs
// about two seconds longer than before; the thinking beat gets the most room so it can be read.
const SLOW_PTS = [[0, 1.15], [0.95, 1.15], [1.1, 2.5], [1.6, 2.5], [1.75, 1.5], [2.2, 1.5], [2.4, 1.15], [99, 1.15]]
function slowAt(c) {
  for (let i = 0; i < SLOW_PTS.length - 1; i++) {
    const a = SLOW_PTS[i], b = SLOW_PTS[i + 1]
    if (c <= b[0]) return lerp(a[1], b[1], clamp((c - a[0]) / (b[0] - a[0])))
  }
  return SLOW_PTS[SLOW_PTS.length - 1][1]
}

const CAPTIONS = [
  [0, '01', 'The idea'],
  [1.0, '02', 'The struggle'],
  [2.2, '03', 'The breaking point'],
  [3.2, '04', 'The idea survives, as data'],
  [4.2, '05', 'Raw data → working software'],
]

function makeGrain() {
  const R = rng(3), c = document.createElement('canvas')
  c.width = c.height = 160
  const x = c.getContext('2d'), d = x.createImageData(160, 160)
  for (let i = 0; i < d.data.length; i += 4) { const v = 140 + R() * 100; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = R() * 34 }
  x.putImageData(d, 0, 0)
  return c.toDataURL()
}

export async function startBlueprintLoader() {
  const overlay = document.querySelector('.intro')
  if (!overlay || !root.classList.contains('is-loading')) { window.__preDone?.(); return }
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
  const slow = +(params.get('introSlow') || 1)
  const debug = params.has('bpdebug')
  scrollTo(0, 0)

  /* ------------------------------------------------------------------ layout ------------------------------------------------------------------ */
  const W = Math.max(320, innerWidth), H = Math.max(480, innerHeight)
  const portrait = W / H < 0.82
  const lite = matchMedia('(max-width: 899px), (pointer: coarse)').matches
  const aspect = ART_W / ART_H
  const ph = portrait ? Math.min(W * 0.97, H * 0.52 * aspect) / aspect : Math.min(H * 0.66, (W * 0.62) / aspect)
  const pw = ph * aspect
  const sh = ph * (portrait ? 0.36 : 0.42) // the stickman's height
  const cs = sh / 190
  const lift = sh * 0.3 // how high the sheet hangs above the floor
  const top = portrait ? (H - (ph + lift)) / 2 - H * 0.02 : (H - (ph + lift)) / 2 - H * 0.012
  const view = { px: (W - pw) / 2, py: top, pw, ph }
  const fy = view.py + ph + lift
  const sx = pw / ART_W, sy = ph / ART_H
  const P = (lx, ly) => [view.px + lx * sx, view.py + ly * sy]
  // he stands just outside the paper's lower-left edge, right beside the corner he will tear (on the paper on small screens)
  const standX = portrait ? view.px + pw * 0.035 : view.px - pw * 0.025

  const q = (s) => overlay.querySelector(s)
  const layer = q('.bp__wall'), stage = q('.bp__stage'), crackSvg = q('.bp__cracks'), canvas = q('.bp__fx'), cap = q('.bp__cap'), skipBtn = q('.intro__skip'), bg = q('.bp__bg')
  for (const s of [stage, crackSvg]) s.setAttribute('viewBox', `0 0 ${W} ${H}`)
  overlay.style.setProperty('--bp-grain', `url(${makeGrain()})`)

  // shared paper grain for the drawing, referenced from inside every clone
  const defs = svgEl('svg', { width: 0, height: 0, 'aria-hidden': 'true' })
  defs.style.position = 'absolute'
  defs.innerHTML = `<defs><pattern id="bpGrain" width="160" height="160" patternUnits="userSpaceOnUse"><image href="${makeGrain()}" width="160" height="160"/></pattern></defs>`
  overlay.prepend(defs)

  const floor = document.createElement('div')
  floor.className = 'bp__floor'
  floor.style.top = `${fy + 2 * cs}px`
  layer.before(floor)

  await Promise.race([fontsReady(), new Promise((r) => setTimeout(r, 2200))])

  /* ------------------------------------------------------------------ the cast ------------------------------------------------------------------ */
  const paper = createPaper(layer, view, buildArt({ boost: portrait ? 1.28 : 1 }))
  const { sheet, geo } = paper
  const art = sheet.art
  gsap.set(sheet.el, { transformPerspective: 1500 })
  const man = createStickman(stage, { cs, x0: standX, fy, paper: '#f6f3ea' })
  const S = man.S
  const tmp = [0, 0]

  const dws = [...art.querySelectorAll('.ink .dw')]
  const txs = [...art.querySelectorAll('.ink .tx')]
  const lates = [...art.querySelectorAll('.late > *')]
  const posOrder = (el) => { const b = el.getBBox(); return b.x + b.width / 2 + (b.y + b.height / 2) * 0.9 }
  dws.sort((a, b) => posOrder(a) - posOrder(b))
  txs.sort((a, b) => posOrder(a) - posOrder(b))

  // every stroke of ink on the sheet, sampled now while it can still be measured
  const samples = sampleInk(art.ownerSVGElement, lite ? 700 : 1500)
  const pieceIdx = (x, y) => {
    if (inPoly(geo.A.poly, x, y)) return 0
    for (let i = 0; i < geo.rest.length; i++) if (inPoly(geo.rest[i].poly, x, y)) return i + 1
    let best = 1, bd = 1e9
    geo.rest.forEach((g, i) => { const d = Math.hypot(g.cx - x, g.cy - y); if (d < bd) { bd = d; best = i + 1 } })
    return best
  }
  const dpr = Math.min(devicePixelRatio || 1, lite ? 1.5 : 2)
  const fx = createFx(canvas, { W, H, dpr, scale: sx })
  fx.load(samples, pieceIdx)

  const drawn = { path: art.querySelector('#bp-drawn'), head: art.querySelector('#bp-drawn-head'), x: art.querySelector('#bp-xout'), label: art.querySelector('#bp-direct') }
  const drawnLen = drawn.path.getTotalLength(), xLen = drawn.x.getTotalLength()
  const pathPt = (el, len, p) => { const pt = el.getPointAtLength(clamp(p) * len); return P(pt.x, pt.y) }

  // cracks that run along the tear lines (drawn in screen space, over the sheet)
  const crackG = svgEl('g', {}, crackSvg)
  const cracks = {}
  for (const id of [1, 2, 3]) {
    const pts = [...geo.cracks[id]].reverse() // the tear starts at the end he is pulling and runs away from it
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${f1(P(p[0], p[1])[0])} ${f1(P(p[0], p[1])[1])}`).join('')
    const w = svgEl('path', { d, fill: 'none', stroke: '#fffdf7', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, crackG)
    const k = svgEl('path', { d, fill: 'none', stroke: '#3a2f1c', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }, crackG)
    cracks[id] = [w, k]
  }
  const setCrack = (id, p) => cracks[id].forEach((n) => n.setAttribute('stroke-dashoffset', f1(1 - p)))
  const crackTip = (id, p) => {
    const pts = [...geo.cracks[id]].reverse(), i = clamp(p) * (pts.length - 1), a = pts[Math.floor(i)], b = pts[Math.min(pts.length - 1, Math.ceil(i))]
    return P(lerp(a[0], b[0], i % 1), lerp(a[1], b[1], i % 1))
  }

  /* ------------------------------------------------------------------ hand-off with the hero ------------------------------------------------------------------ */
  const heroEntry = () => { try { return window.__heroEntry?.() ?? null } catch { return null } }
  // the hero is ready to receive the data as soon as its scene exists (or has definitively failed); a position that
  // cannot be projected falls back to a sensible default instead of making the film wait
  const heroReady = () => typeof window.__heroEntry === 'function' || window.__heroFailed === true
  const fallbackEntry = { x: W * (portrait ? 0.5 : 0.52), y: H * (portrait ? 0.66 : 0.5), r: H * 0.05 }
  let entryNow = heroEntry() ?? fallbackEntry

  /* ------------------------------------------------------------------ state ------------------------------------------------------------------ */
  let clock = 0, fxClock = 0, waited = 0
  let started = false, conv = false, handed = false, done = false, skipping = false
  const drive = { L: null, R: null } // functions that return where a hand should be, this frame
  // when a hand is given a new job it glides there instead of jumping
  const handSwap = { L: { fn: null, t: 1, from: [0, 0], first: true }, R: { fn: null, t: 1, from: [0, 0], first: true } }
  let handDur = 0.32
  let carry = null // a piece that follows the left hand
  let yank = 0, sheetX = 0
  let pieces = [] // [A, P0..P3]
  let flap = null
  const fxList = [null, null, null, null, null]

  /* ------------------------------------------------------------------ the timeline ------------------------------------------------------------------ */
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } })

  // caption
  const capSpan = document.createElement('span')
  cap.append(capSpan)
  const setCap = ([, n, label]) => {
    capSpan.innerHTML = `<b>${n}</b>&nbsp;&nbsp;${label}`
    gsap.fromTo(capSpan, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', overwrite: true })
  }
  CAPTIONS.forEach((c) => tl.call(() => setCap(c), [], c[0]))

  // Tweens whose values depend on what the scene looks like at that moment are created when the story
  // reaches them, but slotted into the story clock so they stay in step with it (and wait when it waits).
  const inStory = (time, build) => tl.call(() => { const c = gsap.timeline(); build(c); tl.add(c, time) }, [], time)

  /* ---- scene 1: the idea ---- */
  gsap.set(sheet.el, { opacity: 0 })
  tl.fromTo(sheet.el, { opacity: 0, y: 30, rotationX: -8, scale: 0.965 }, { opacity: 1, y: 0, rotationX: 0, scale: 1, duration: 0.55, ease: 'power3.out', immediateRender: false }, 0)
  tl.to(S, { vis: 1, duration: 0.3, ease: 'none' }, 0.06)
  dws.forEach((el, i) => tl.to(el, { strokeDashoffset: 0, duration: 0.3, ease: 'power1.inOut' }, 0.1 + (i / dws.length) * 0.62))
  txs.forEach((el, i) => tl.to(el, { opacity: 1, duration: 0.18, ease: 'none' }, 0.18 + (i / txs.length) * 0.66))
  const fls = [...art.querySelectorAll('.ink .fl')].sort((a, b) => posOrder(a) - posOrder(b))
  fls.forEach((el, i) => tl.to(el, { opacity: 1, duration: 0.25, ease: 'none' }, 0.22 + (i / fls.length) * 0.6))
  // he is mid-sketch: pencil in his right hand, left hand on his hip, scribbling on the to-do list
  S.pencil = 0; S.pang = -28
  tl.to(S, { pencil: 1, rk: 1, lk: 1, duration: 0.22, ease: 'power2.out' }, 0.08)
  tl.to(S, { lookY: -0.2, look: 0.9, brow: 0.25, mouth: 0.55, duration: 0.3 }, 0.1)
  drive.L = () => man.pt(-26, -86)
  const tipTo = (x, y) => { const a = rad(S.pang), r = 18 * cs; return [x - Math.cos(a) * r, y - Math.sin(a) * r] }
  drive.R = (t) => { const x = P(120 + (0.5 + 0.5 * Math.sin(t * 15)) * 40, 0)[0], y = P(0, 606 + Math.sin(t * 9) * 12)[1]; return tipTo(x, y) }
  tl.to(S, { blink: 1, duration: 0.07, yoyo: true, repeat: 1, ease: 'none' }, 0.62)

  /* ---- scene 2: the struggle ---- */
  // He stops sketching and thinks: left hand to the chin, right arm relaxed at his side, eyes travelling over the
  // board, a thought bubble with a question mark. Then he tries a connection and it fails.
  const chin = (t) => [S.head[0] + (11 + Math.sin(t * 34) * 0.6) * cs, S.head[1] + 17.5 * cs]
  const hip = () => man.pt(-26, -86)
  tl.call(() => { drive.L = chin; drive.R = null }, [], 1.0)
  tl.to(S, { rk: 0, pang: 100, duration: 0.25, ease: 'power2.inOut' }, 1.0) // the pencil hangs from the relaxed hand
  tl.to(S, { lean: 3, headRot: 6, crouch: 0.08, brow: 0.5, mouth: 0.05, blink: 0, duration: 0.2, ease: 'power2.inOut' }, 1.0)
  tl.to(S, { x: pw * 0.012, duration: 0.3, ease: 'power2.inOut' }, 1.05)
  tl.to(S, { think: 1, duration: 0.22, ease: 'back.out(1.8)' }, 1.08)
  // the eyes read the board: the title and wireframe, then across to the flow, then down to the architecture
  tl.to(S, { look: 1, lookY: -0.9, duration: 0.14, ease: 'sine.inOut' }, 1.05)
  tl.to(S, { look: 0.5, lookY: -0.2, duration: 0.14, ease: 'sine.inOut' }, 1.22)
  tl.to(S, { look: 1, lookY: 0.55, brow: 0.15, mouth: -0.15, headRot: 4, duration: 0.16, ease: 'sine.inOut' }, 1.38)
  tl.to(S, { qm: 1, duration: 0.18, ease: 'back.out(3)' }, 1.3)
  tl.to(S, { blink: 1, duration: 0.07, yoyo: true, repeat: 1, ease: 'none' }, 1.5)
  // an idea: the bubble pops, the brow lifts, hand off the chin and back to drawing
  tl.to(S, { think: 0, qm: 0, duration: 0.1, ease: 'power2.in' }, 1.6)
  tl.to(S, { brow: 0.9, mouth: 0.6, headRot: 0, lookY: 0.1, look: 1, pang: -28, rk: 1, duration: 0.1 }, 1.6)
  // draws a connecting arrow from the front end straight to the model
  const dp = { p: 0 }, dpHead = { p: 0 }
  tl.call(() => { drive.L = hip; drive.R = () => { const t = pathPt(drawn.path, drawnLen, dp.p); return tipTo(t[0], t[1]) } }, [], 1.66)
  tl.to(S, { brow: 0.2, duration: 0.14 }, 1.66)
  tl.fromTo(drawn.label, { opacity: 0 }, { opacity: 1, duration: 0.15, immediateRender: false }, 1.78)
  tl.to(dp, { p: 1, duration: 0.24, ease: 'power1.inOut', onUpdate: () => drawn.path.style.strokeDashoffset = 1 - dp.p }, 1.7)
  tl.to(S, { x: pw * 0.03, lean: 6, lookY: 0.55, duration: 0.24, ease: 'power1.inOut' }, 1.7)
  tl.to(dpHead, { p: 1, duration: 0.05, ease: 'none', onUpdate: () => drawn.head.style.strokeDashoffset = 1 - dpHead.p }, 1.94)
  // it does not work: he freezes, the blueprint gets more tangled, sweat
  tl.to(S, { brow: -0.5, mouth: -0.45, lookY: 0.25, sweat: 1, lean: 2, duration: 0.14 }, 1.98)
  lates.forEach((el, i) => {
    tl.set(el.parentNode, { opacity: 1 }, 1.98)
    if (el.classList.contains('tx')) tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.14, ease: 'none', immediateRender: false }, 2.0 + i * 0.02)
    else tl.fromTo(el, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.18, ease: 'power1.out', immediateRender: false }, 2.0 + i * 0.02)
  })
  // crossing it out
  const xp = { p: 0 }
  tl.call(() => { drive.R = () => { const t = pathPt(drawn.x, xLen, xp.p); return tipTo(t[0], t[1]) } }, [], 2.04)
  tl.to(xp, { p: 1, duration: 0.15, ease: 'none', onUpdate: () => drawn.x.style.strokeDashoffset = 1 - xp.p }, 2.06)
  tl.to(S, { crouch: 0.3, lean: -3, duration: 0.2, ease: 'power2.inOut' }, 2.08)
  tl.to(S, { rk: 0, pencil: 0.0, duration: 0.14 }, 2.2)
  tl.call(() => { drive.R = null }, [], 2.22)

  /* ---- scene 3: the breaking point ---- */
  // the hands hold things by following points on pieces; defaults until a piece exists
  const grips = { R: { piece: sheet, lx: 0, ly: ART_H, dx: 0, dy: 0 }, L: { piece: sheet, lx: 0, ly: 470, dx: 0, dy: 0 } }
  const hand = (side) => { const g = grips[side]; g.piece.map(g.lx, g.ly, tmp); return [tmp[0] + g.dx, tmp[1] + g.dy] }

  tl.call(() => { handDur = 0.1 }, [], 2.2) // from here the hands grab and throw: hand-offs are quick
  // steps back and stares
  tl.to(S, { x: -pw * 0.03, lean: -3, crouch: 0, sweat: 0, look: 0.3, lookY: -0.6, brow: -0.25, mouth: -0.2, duration: 0.26, ease: 'power2.inOut' }, 2.2)
  tl.to(S, { lk: 0, duration: 0.2 }, 2.2)
  tl.call(() => { drive.L = null }, [], 2.22)
  // a decision: the brow drops, the jaw sets, a small nod
  tl.to(S, { brow: -1, mouth: -0.9, headRot: 9, duration: 0.1, ease: 'power2.in' }, 2.46)
  tl.to(S, { headRot: 0, crouch: 0.35, lean: 12, lk: 1, rk: 1, pang: -20, duration: 0.16, ease: 'power2.out' }, 2.54)
  tl.call(() => { drive.L = () => hand('L'); drive.R = () => hand('R') }, [], 2.54)

  // rip 1: a corner flap peels away. The crack runs from the bottom edge towards the hinge on the left edge.
  const rip1 = { p: 0, th: 0 }
  tl.call(() => {
    const A = paper.makePiece(geo.A)
    gsap.set(A.el, { transformPerspective: 1100 })
    paper.clipSheet(geo.R1)
    flap = A; pieces[0] = A; fxList[0] = A; fx.setPieces(fxList)
    grips.R = { piece: A, lx: 0, ly: ART_H, dx: 0, dy: 0 }
    shake(5, 0.18)
  }, [], T.rip1)
  tl.to(rip1, {
    p: 1, th: 1, duration: 0.17, ease: 'power2.in',
    onUpdate: () => {
      setCrack(1, rip1.p)
      if (flap) hingeFlap(flap, rip1.th * 27)
      const tip = crackTip(1, rip1.p)
      if (Math.random() < 0.8) fx.burst(tip[0], tip[1], 2, { dx: -1, dy: -0.4, speed: 260, spread: 1.4 })
    },
  }, T.rip1 + 0.02)
  tl.to(S, { lean: -18, crouch: 0.5, brow: -1, duration: 0.17, ease: 'power2.in' }, T.rip1 + 0.02)
  tl.to(sheet.el, { x: 4, duration: 0.03, repeat: 5, yoyo: true, ease: 'none' }, T.rip1 + 0.02)

  // rip 2: a hard yank splits the rest of the sheet along two more lines at once
  const rip2 = { p: 0 }
  tl.to(rip2, {
    p: 1, duration: 0.14, ease: 'power3.in',
    onUpdate: () => {
      setCrack(2, rip2.p); setCrack(3, rip2.p)
      yank = rip2.p * 22; sheetX = -rip2.p * 8
      applySheetShift()
      const t2 = crackTip(2, rip2.p), t3 = crackTip(3, rip2.p)
      fx.burst(t2[0], t2[1], 2, { dx: 0.4, dy: -1, speed: 300, spread: 1.4 }); fx.burst(t3[0], t3[1], 2, { dx: 0.4, dy: -1, speed: 300, spread: 1.4 })
    },
  }, T.rip1 + 0.2)
  tl.to(S, { crouch: 0.75, lean: -10, duration: 0.14, ease: 'power3.in' }, T.rip1 + 0.2)
  // the right hand lifts the torn flap up and over his head, ready to throw
  tl.call(() => { carry = flap; drive.R = () => man.pt(30, -228) }, [], T.rip1 + 0.2)
  tl.call(() => { grips.R = { piece: flap, lx: 0, ly: ART_H, dx: 0, dy: 0 } }, [], T.rip1 + 0.34)

  // the break: swap the sheet for four pieces, and let everything fall
  tl.call(() => {
    const rest = geo.rest.map((g) => paper.makePiece(g))
    rest.forEach((pc, i) => {
      gsap.set(pc.el, { transformPerspective: 1100, x: sheetX, y: yank })
      pieces[i + 1] = pc; fxList[i + 1] = pc
    })
    fx.setPieces(fxList)
    sheet.el.style.visibility = 'hidden'
    cracks[1][0].parentNode.remove()
    flash(); shake(11, 0.3)
    const c = P(ART_W / 2, ART_H / 2)
    fx.burst(c[0], c[1], lite ? 26 : 50, { dx: 0, dy: 1, speed: 520, spread: 3.14 })
    // gravity (power2.in), tumble, and a little toward the viewer; each piece lands flat-ish and in view
    const R = rng(21)
    const fall = gsap.timeline()
    rest.forEach((pc, i) => {
      const [cx, cy] = pc.center(tmp.slice())
      const tx = clamp(cx + (R() - 0.5) * W * 0.18 + (i - 1.5) * W * 0.035, W * 0.22, W * 0.78)
      const ty = H * (0.76 + R() * 0.06)
      const dur = 0.44 + R() * 0.1, delay = i * 0.03
      const rx = (46 + R() * 16) * (R() < 0.8 ? 1 : -1), ry = (R() < 0.5 ? -1 : 1) * (14 + R() * 70), rz = (R() - 0.5) * 50
      fall.to(pc.el, { y: yank + (ty - cy), duration: dur, ease: 'power2.in' }, delay)
      fall.to(pc.el, { x: sheetX + (tx - cx), duration: dur + 0.06, ease: 'power1.out' }, delay)
      fall.to(pc.el, { rotationX: rx, rotationY: ry, rotation: rz, z: 50 + R() * 90, duration: dur + 0.05, ease: 'power1.inOut' }, delay)
      fall.to(pc.el, { scale: 0.9, duration: dur, ease: 'none' }, delay)
      fall.call(() => { fx.puff(tx, ty + 30, 90); fx.burst(tx, ty, lite ? 6 : 12, { dx: 0, dy: -1, speed: 260, spread: 1.6 }); if (i === 1) shake(4, 0.2) }, [], delay + dur)
    })
    tl.add(fall, T.swap)
  }, [], T.swap)
  // and the flap: thrown downwards, hard
  inStory(T.swap + 0.12, (c) => {
    carry = null
    drive.R = () => hand('R')
    const [cx, cy] = flap.center(tmp.slice())
    c.to(flap.el, { y: `+=${H * 0.8 - cy}`, x: `+=${W * 0.52 - cx}`, rotation: 52, rotationX: 55, rotationY: 150, z: 90, scale: 0.92, duration: 0.34, ease: 'power3.in' }, 0)
    c.call(() => { fx.puff(W * 0.52, H * 0.8 + 30, 80); fx.burst(W * 0.52, H * 0.8, lite ? 8 : 16, { dx: 0, dy: -1, speed: 300, spread: 1.6 }); shake(7, 0.25) }, [], 0.34)
  })
  // the throw: the arm whips down, the whole body follows through
  tl.call(() => { drive.R = () => man.pt(36, -34) }, [], T.swap + 0.1)
  tl.to(S, { lean: 20, crouch: 0.85, headRot: 16, brow: -0.2, mouth: -0.3, lookY: 0.8, look: 0.5, duration: 0.14, ease: 'power3.in' }, T.swap + 0.08)
  tl.to(S, { lk: 0, rk: 0, duration: 0.18 }, T.swap + 0.24)
  tl.call(() => { drive.L = null; drive.R = null }, [], T.swap + 0.3)
  tl.to(S, { lean: 0, crouch: 0, headRot: 0, brow: 0.1, mouth: 0.15, duration: 0.5, ease: 'power2.inOut' }, T.swap + 0.34)

  /* ---- scene 4: the transformation ---- */
  tl.call(() => { fx.dissolve(fxClock, 0.62) }, [], T.dissolve)
  inStory(T.dissolve, (c) => {
    for (const pc of pieces) {
      if (!pc) continue
      const ink = pc.art.querySelectorAll(':scope > .ink, :scope > .late, :scope > .mine')
      c.to(ink, { opacity: 0, duration: 0.3, ease: 'none' }, 0)
      c.to(pc.shadow, { opacity: 0, duration: 0.22, ease: 'none' }, 0)
      c.to([pc.front, pc.back], { opacity: 0, duration: 0.5, ease: 'power1.in' }, 0.22)
      c.to(pc.el, { scale: '*=0.94', duration: 0.7, ease: 'power1.in' }, 0)
    }
  })
  tl.to(S, { lookY: 0.9, look: 0, brow: 0.3, mouth: 0.35, duration: 0.3 }, 3.3)

  /* ---- scene 5: raw data to working software ---- */
  // the whole stage lets go at once: the backdrop (including the overlay's own colour) dissolves into the hero underneath
  tl.to([bg, stage, crackSvg, floor, cap, skipBtn], { opacity: 0, duration: 0.75, ease: 'power1.inOut' }, 4.2)
  tl.to(overlay, { backgroundColor: 'rgba(241,238,228,0)', duration: 0.75, ease: 'power1.inOut' }, 4.2)
  tl.to({}, { duration: 0.01 }, T.end)

  /* ------------------------------------------------------------------ helpers used by the timeline ------------------------------------------------------------------ */
  function inPoly(poly, x, y) {
    let r = false
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j]
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) r = !r
    }
    return r
  }
  function hingeFlap(pc, deg) {
    // rotate about the far end of the tear (so the flap opens like a page), plus a little lift out of the wall
    const th = rad(deg), c = Math.cos(th), s = Math.sin(th)
    const hx = (geo.hinge1[0] - pc.g.cx) * sx, hy = (geo.hinge1[1] - pc.g.cy) * sy
    gsap.set(pc.el, { rotation: deg, x: hx - (c * hx - s * hy), y: hy - (s * hx + c * hy), rotationX: deg * 0.5, rotationY: -deg * 0.35 })
  }
  function applySheetShift() { gsap.set(sheet.el, { y: yank, x: sheetX }); gsap.set(crackG, { y: yank, x: sheetX }) }
  function shake(px, dur) {
    gsap.fromTo([layer, stage, crackSvg], { x: px, y: -px * 0.6 }, { x: 0, y: 0, duration: dur, ease: 'elastic.out(1.2, 0.25)', overwrite: 'auto' })
  }
  function flash() {
    const f = document.createElement('div')
    f.style.cssText = 'position:absolute;inset:0;background:#fffdf6;pointer-events:none;opacity:.5'
    overlay.appendChild(f)
    gsap.to(f, { opacity: 0, duration: 0.22, ease: 'power2.out', onComplete: () => f.remove() })
  }

  /* ------------------------------------------------------------------ the frame loop ------------------------------------------------------------------ */
  let prev = performance.now()
  function frame() {
    const now = performance.now()
    const dt = Math.min(34, now - prev) / 1000
    prev = now
    if (!started || done) return
    fxClock += dt

    // the story clock only waits while it must: at the end, for the hero scene to be ready to receive the data
    const ready = heroReady() || waited >= 7 // after 7s of waiting we go on without the hero rather than stall the page
    const holding = clock >= T.hold && !ready
    if (holding) waited += dt
    else clock = Math.min(clock + dt / (slow * slowAt(clock)), tl.duration())
    tl.time(clock, false)

    // keep hands, carried piece and lighting in step with the 3D transforms that were just applied
    if (conv || clock > T.converge - 0.2) { const e = heroEntry(); if (e) entryNow = e }
    for (const pc of [sheet, ...pieces]) if (pc && pc.el.isConnected && pc.el.style.visibility !== 'hidden') pc.refreshMatrix()
    if (carry && drive.R) {
      const h = drive.R(clock)
      carry.map(0, ART_H, tmp)
      gsap.set(carry.el, { x: `+=${h[0] - tmp[0]}`, y: `+=${h[1] - tmp[1]}` })
      carry.refreshMatrix()
    }
    for (const side of ['L', 'R']) {
      const fn = drive[side], hs = handSwap[side]
      if (!fn) { hs.fn = null; continue }
      const p = fn(clock)
      if (fn !== hs.fn) {
        hs.fn = fn
        hs.from = side === 'L' ? [S.lx, S.ly] : [S.rx, S.ry]
        hs.t = hs.first ? 1 : 0 // the very first target is taken as is
        hs.first = false
      }
      hs.t = Math.min(1, hs.t + dt / handDur)
      const k = hs.t * hs.t * (3 - 2 * hs.t)
      const x = lerp(hs.from[0], p[0], k), y = lerp(hs.from[1], p[1], k)
      if (side === 'L') { S.lx = x; S.ly = y } else { S.rx = x; S.ry = y }
    }
    for (const pc of [sheet, ...pieces]) {
      if (!pc || !pc.el.isConnected) continue
      const rx = gsap.getProperty(pc.el, 'rotationX') || 0, ry = gsap.getProperty(pc.el, 'rotationY') || 0
      pc.setShade((1 - Math.abs(Math.cos(rad(rx)) * Math.cos(rad(ry)))) * 0.3)
    }
    man.update(dt)

    if (!conv && clock >= T.converge && ready) { conv = true; fx.converge(fxClock) }
    fx.step(dt, fxClock, conv ? entryNow : null)
    if (!handed && conv && clock >= T.handoff) { handed = true; window.__flowHandoff = true; window.__preDone?.() }
    if (clock >= tl.duration() && handed && fx.alive() === 0) finish()
    if (clock >= tl.duration() && fxClock > T.end + 12) finish()
  }

  /* ------------------------------------------------------------------ ending ------------------------------------------------------------------ */
  function finish() {
    if (done) return
    done = true
    gsap.ticker.remove(frame)
    removeEventListener('keydown', onKey); removeEventListener('resize', onResize)
    tl.kill()
    gsap.killTweensOf([layer, stage, crackSvg, bg, floor, cap, skipBtn, capSpan, sheet.el, ...pieces.filter(Boolean).map((p) => p.el)])
    fx.dispose()
    overlay.remove()
    root.classList.remove('is-loading')
    try { sessionStorage.setItem('amey-bp-seen', '1') } catch {}
    if (!handed) { window.__flowHandoff = false }
    window.__preDone?.()
    if (debug) delete window.__bp
  }
  // skip: no data flow, a quick fade straight into the hero
  function skip() {
    if (done || skipping) return
    skipping = true
    if (!handed) window.__flowHandoff = false
    window.__preDone?.()
    gsap.to(overlay, { opacity: 0, duration: 0.45, ease: 'power1.out', onComplete: finish })
  }
  const onKey = (e) => { if (e.key === 'Escape') skip() }
  const onResize = () => { if (Math.abs(innerWidth - W) > 40 || Math.abs(innerHeight - H) > H * 0.2) skip() }
  addEventListener('keydown', onKey)
  addEventListener('resize', onResize)
  skipBtn?.addEventListener('click', skip)

  /* ------------------------------------------------------------------ calm version (reduced motion) ------------------------------------------------------------------ */
  if (calm) {
    overlay.classList.add('is-calm')
    gsap.set(sheet.el, { opacity: 1 })
    gsap.set([...dws, drawn.path, drawn.head, drawn.x], { strokeDashoffset: 0 })
    gsap.set([...txs, drawn.label], { opacity: 1 })
    gsap.set(art.querySelectorAll('.late'), { opacity: 1 })
    gsap.set(art.querySelectorAll('.late .dw'), { strokeDashoffset: 0 })
    gsap.set(art.querySelectorAll('.late .tx'), { opacity: 1 })
    gsap.set(art.querySelectorAll('.fl'), { opacity: 1 })
    S.vis = 1; S.lk = 1; S.rk = 0; S.brow = -0.5; S.mouth = -0.4; S.lookY = -0.4; S.look = 0.6; S.sweat = 1
    S.lx = man.pt(-26, -86)[0]; S.ly = man.pt(-26, -86)[1]
    man.update(0.016)
    capSpan.innerHTML = '<b>—</b>&nbsp;&nbsp;Every working product begins as a messy idea'
    gsap.fromTo(overlay.querySelector('.bp__wall'), { opacity: 0 }, { opacity: 1, duration: 0.45 })
    gsap.delayedCall(1.5, () => { window.__flowHandoff = false; window.__preDone?.() })
    gsap.to(overlay, { opacity: 0, duration: 0.5, delay: 1.45, onComplete: finish })
    return
  }

  /* ------------------------------------------------------------------ go ------------------------------------------------------------------ */
  // Start once the page has settled (the same rule the old loader used), so a busy main thread cannot eat the opening.
  const settled = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })))
  await Promise.race([settled, new Promise((r) => setTimeout(r, 2500))])
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  if (done || skipping) return
  prev = performance.now()
  started = true
  gsap.ticker.add(frame)
  if (debug) window.__bp = { tl, get clock() { return clock }, fx, man, pieces, sheet, hold: (v) => { started = !v }, seek: (t) => { clock = t }, entry: () => entryNow, state: () => ({ conv, handed, waited }) }
}
