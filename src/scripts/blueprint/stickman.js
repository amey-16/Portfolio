// A tiny, minimalist stickman with believable joints.
//
// Everything is drawn from a single state object (S) that the timeline tweens: where he stands, how he
// leans, what his face is doing, and where each hand should be. Arms and legs are solved with two-bone IK
// every frame, so a hand that is told to hold a corner of the paper really does hold it, and the elbow
// follows. Walking is procedural (the feet follow how far the body has moved), so he can be told to simply
// "go over there".
//
// Units: the rig is built about 190 units tall and scaled by `cs`. Positions in S that end in x / y are
// absolute screen pixels.

import { svgEl, ik, clamp, lerp, rad, f1 } from './util.js'

const HIP_Y = -92, SH_Y = -146, SH_W = 17, HIP_W = 8, HEAD_DY = -31
const UA = 44, FA = 43, TH = 47, SHIN = 46
const REST = { x: 9, y: 78 } // hand hanging position relative to the shoulder

export function createStickman(parent, { cs, x0, fy, ink = '#142a31', accent = '#bb3e03', paper = '#f4f0e6' }) {
  const g = svgEl('g', { class: 'bp-man', fill: 'none', stroke: ink, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent)
  const sw = Math.max(2.4, 2.9 * cs)
  const shadow = svgEl('ellipse', { fill: 'rgba(20,42,49,.13)', stroke: 'none' }, g)
  const scarfTail = svgEl('path', { stroke: accent, 'stroke-width': sw * 1.5, fill: 'none' }, g)
  const legL = svgEl('path', { 'stroke-width': sw }, g), legR = svgEl('path', { 'stroke-width': sw }, g)
  const kneeL = svgEl('circle', { r: 2 * cs, fill: paper, 'stroke-width': sw * 0.55 }, g), kneeR = svgEl('circle', { r: 2 * cs, fill: paper, 'stroke-width': sw * 0.55 }, g)
  const footL = svgEl('path', { 'stroke-width': sw }, g), footR = svgEl('path', { 'stroke-width': sw }, g)
  const torso = svgEl('path', { 'stroke-width': sw * 1.08 }, g)
  const armL = svgEl('path', { 'stroke-width': sw }, g), armR = svgEl('path', { 'stroke-width': sw }, g)
  const elbL = svgEl('circle', { r: 2 * cs, fill: paper, 'stroke-width': sw * 0.55 }, g), elbR = svgEl('circle', { r: 2 * cs, fill: paper, 'stroke-width': sw * 0.55 }, g)
  const handL = svgEl('circle', { r: 3.5 * cs, fill: ink, stroke: 'none' }, g), handR = svgEl('circle', { r: 3.5 * cs, fill: ink, stroke: 'none' }, g)
  const pencil = svgEl('g', { stroke: 'none' }, g)
  const pBody = svgEl('path', { stroke: accent, 'stroke-width': 3.1 * cs, fill: 'none' }, pencil)
  const pTip = svgEl('path', { stroke: ink, 'stroke-width': 3.1 * cs, fill: 'none' }, pencil)
  const scarf = svgEl('path', { stroke: accent, 'stroke-width': sw * 1.9, fill: 'none' }, g)
  const head = svgEl('g', {}, g)
  svgEl('circle', { r: 17 * cs, fill: paper, 'stroke-width': sw }, head)
  svgEl('path', { d: `M${-3 * cs} ${-16.5 * cs}q${2 * cs} ${-7 * cs} ${7 * cs} ${-6 * cs}M${1 * cs} ${-17 * cs}q${1 * cs} ${-6 * cs} ${5 * cs} ${-5.5 * cs}`, 'stroke-width': sw * 0.8 }, head)
  // the face is turned three-quarters towards the board (to his right), so he looks at his work, never out at the viewer
  const nose = svgEl('path', { 'stroke-width': sw * 0.72 }, head)
  const eyeL = svgEl('ellipse', { rx: 1.9 * cs, ry: 1.9 * cs, fill: ink, stroke: 'none' }, head), eyeR = svgEl('ellipse', { rx: 1.6 * cs, ry: 1.9 * cs, fill: ink, stroke: 'none' }, head)
  const browL = svgEl('path', { 'stroke-width': sw * 0.72 }, head), browR = svgEl('path', { 'stroke-width': sw * 0.72 }, head)
  const mouth = svgEl('path', { 'stroke-width': sw * 0.72 }, head)
  const sweat = svgEl('path', { fill: '#0a9396', stroke: 'none', opacity: 0 }, head)
  const bubble = svgEl('g', { stroke: ink, 'stroke-width': sw * 0.7, fill: '#fffdf7', opacity: 0 }, g)
  const dotA = svgEl('circle', {}, bubble), dotB = svgEl('circle', {}, bubble)
  const cloud = svgEl('path', {}, bubble)
  const qm = svgEl('text', { 'text-anchor': 'middle', fill: accent, stroke: 'none', 'font-family': 'Caveat, cursive', 'font-weight': 700, 'font-size': 46 * cs, opacity: 0 }, g)
  qm.textContent = '?'

  const S = {
    x: 0, lean: 0, crouch: 0, headRot: 0, look: 0, lookY: 0, brow: 0.2, mouth: 0.4, blink: 0, sweat: 0,
    lk: 0, lx: 0, ly: 0, rk: 0, rx: 0, ry: 0, pencil: 0, pang: -62, qm: 0, think: 0, vis: 0, flip: 1, shake: 0,
  }

  let prevX = 0, phase = 0, speed = 0, time = 0
  const pxy = (ux, uy, X, hipY) => [X + ux * cs, hipY + (uy - HIP_Y) * cs]

  function update(dt = 0.016) {
    time += dt
    const X = x0 + S.x
    const dx = X - prevX; prevX = X
    const v = dt > 0 ? Math.abs(dx) / dt : 0
    speed = lerp(speed, clamp(v / (110 * cs)), 1 - Math.exp(-14 * dt))
    phase += dx / (24 * cs) * Math.PI
    const bob = speed * Math.abs(Math.sin(phase)) * 2.2 * cs
    const breathe = Math.sin(time * 2.1) * 0.7 * cs
    const hipY = fy + (HIP_Y + S.crouch * 15) * cs - bob + breathe * 0.4
    const hipX = X
    g.style.opacity = S.vis
    const leanR = rad(S.lean)
    const cl = Math.cos(leanR), sl = Math.sin(leanR)
    const rot = (ux, uy) => [hipX + (ux * cl - uy * sl) * cs, hipY + (ux * sl + uy * cl) * cs] // upper body, about the hips
    const T = SH_Y - HIP_Y // negative: shoulders are above the hips

    // legs
    const A = 13 * cs * speed, lift = 9 * cs * speed
    const fx = [hipX - 13 * cs + Math.sin(phase) * A, hipX + 13 * cs - Math.sin(phase) * A]
    const fyL = fy - Math.max(0, Math.cos(phase)) * lift, fyR = fy - Math.max(0, -Math.cos(phase)) * lift
    const hl = [hipX - HIP_W * cs, hipY], hr = [hipX + HIP_W * cs, hipY]
    const lL = ik(hl[0], hl[1], fx[0], fyL, TH * cs, SHIN * cs, -1, 0, 1), lR = ik(hr[0], hr[1], fx[1], fyR, TH * cs, SHIN * cs, 1, 0, 1)
    legL.setAttribute('d', `M${f1(hl[0])} ${f1(hl[1])}L${f1(lL.jx)} ${f1(lL.jy)}L${f1(lL.ex)} ${f1(lL.ey)}`)
    legR.setAttribute('d', `M${f1(hr[0])} ${f1(hr[1])}L${f1(lR.jx)} ${f1(lR.jy)}L${f1(lR.ex)} ${f1(lR.ey)}`)
    kneeL.setAttribute('cx', f1(lL.jx)); kneeL.setAttribute('cy', f1(lL.jy)); kneeR.setAttribute('cx', f1(lR.jx)); kneeR.setAttribute('cy', f1(lR.jy))
    footL.setAttribute('d', `M${f1(lL.ex - 5 * cs)} ${f1(lL.ey)}L${f1(lL.ex + 5 * cs)} ${f1(lL.ey)}`)
    footR.setAttribute('d', `M${f1(lR.ex - 5 * cs)} ${f1(lR.ey)}L${f1(lR.ex + 5 * cs)} ${f1(lR.ey)}`)
    shadow.setAttribute('cx', f1(X)); shadow.setAttribute('cy', f1(fy + 2 * cs))
    shadow.setAttribute('rx', f1((34 + S.crouch * 6) * cs)); shadow.setAttribute('ry', f1(5 * cs))

    // torso, shoulders, neck
    const sC = rot(0, T), sL = rot(-SH_W, T), sR = rot(SH_W, T)
    torso.setAttribute('d', `M${f1(hipX)} ${f1(hipY)}L${f1(sC[0])} ${f1(sC[1])}`)
    const headC = (() => { const c = rot(0, T + HEAD_DY); return c })()

    // arms: IK from the shoulders to a point between "hanging" and the commanded target
    const hang = (s, sg) => [s[0] + (sg * REST.x * cl - REST.y * sl) * cs, s[1] + (sg * REST.x * sl + REST.y * cl) * cs]
    const hL = hang(sL, -1), hR = hang(sR, 1)
    const tL = [lerp(hL[0], S.lx, S.lk), lerp(hL[1], S.ly, S.lk)], tR = [lerp(hR[0], S.rx, S.rk), lerp(hR[1], S.ry, S.rk)]
    const aL = ik(sL[0], sL[1], tL[0], tL[1], UA * cs, FA * cs, -1), aR = ik(sR[0], sR[1], tR[0], tR[1], UA * cs, FA * cs, 1)
    armL.setAttribute('d', `M${f1(sL[0])} ${f1(sL[1])}L${f1(aL.jx)} ${f1(aL.jy)}L${f1(aL.ex)} ${f1(aL.ey)}`)
    armR.setAttribute('d', `M${f1(sR[0])} ${f1(sR[1])}L${f1(aR.jx)} ${f1(aR.jy)}L${f1(aR.ex)} ${f1(aR.ey)}`)
    elbL.setAttribute('cx', f1(aL.jx)); elbL.setAttribute('cy', f1(aL.jy)); elbR.setAttribute('cx', f1(aR.jx)); elbR.setAttribute('cy', f1(aR.jy))
    handL.setAttribute('cx', f1(aL.ex)); handL.setAttribute('cy', f1(aL.ey)); handR.setAttribute('cx', f1(aR.ex)); handR.setAttribute('cy', f1(aR.ey))
    S.handL = [aL.ex, aL.ey]; S.handR = [aR.ex, aR.ey]; S.elbowL = [aL.jx, aL.jy]; S.elbowR = [aR.jx, aR.jy]

    // pencil in the right hand
    pencil.setAttribute('opacity', f1(S.pencil))
    const pa = rad(S.pang), pc = [Math.cos(pa), Math.sin(pa)], plen = 18 * cs
    const p0 = [aR.ex - pc[0] * 3 * cs, aR.ey - pc[1] * 3 * cs], p1 = [aR.ex + pc[0] * plen, aR.ey + pc[1] * plen]
    pBody.setAttribute('d', `M${f1(p0[0])} ${f1(p0[1])}L${f1(p1[0] - pc[0] * 3 * cs)} ${f1(p1[1] - pc[1] * 3 * cs)}`)
    pTip.setAttribute('d', `M${f1(p1[0] - pc[0] * 3 * cs)} ${f1(p1[1] - pc[1] * 3 * cs)}L${f1(p1[0])} ${f1(p1[1])}`)
    S.tip = p1

    // scarf: a knot at the neck and a tail that trails behind the movement
    const nk = rot(0, T - 4)
    scarf.setAttribute('d', `M${f1(nk[0] - 8 * cs)} ${f1(nk[1] + 1)}Q${f1(nk[0])} ${f1(nk[1] + 5 * cs)} ${f1(nk[0] + 8 * cs)} ${f1(nk[1] + 1)}`)
    const sway = Math.sin(time * 3.3) * 2 * cs - clamp(dx / Math.max(dt, 0.001) / 160) * 14 * cs
    scarfTail.setAttribute('d', `M${f1(nk[0] + 5 * cs)} ${f1(nk[1] + 3 * cs)}Q${f1(nk[0] + 11 * cs + sway)} ${f1(nk[1] + 14 * cs)} ${f1(nk[0] + 8 * cs + sway * 1.6)} ${f1(nk[1] + 28 * cs)}`)

    // head: tilts about the neck
    head.setAttribute('transform', `translate(${f1(headC[0])} ${f1(headC[1])}) rotate(${f1(S.lean + S.headRot)} 0 ${f1(-HEAD_DY * cs)})`)
    const FACE = 7.5 * cs // how far the features sit towards the board
    const lk = FACE + S.look * 2.6 * cs, ly = S.lookY * 2 * cs
    const eh = 1.9 * cs * (1 - S.blink * 0.92)
    eyeL.setAttribute('cx', f1(-1.5 * cs + lk)); eyeL.setAttribute('cy', f1(-2 * cs + ly)); eyeL.setAttribute('ry', f1(eh))
    eyeR.setAttribute('cx', f1(8.5 * cs + lk)); eyeR.setAttribute('cy', f1(-2 * cs + ly)); eyeR.setAttribute('ry', f1(eh))
    nose.setAttribute('d', `M${f1(16.2 * cs)} ${f1(-3 * cs)}L${f1(20.8 * cs)} ${f1(3.2 * cs)}L${f1(16.6 * cs)} ${f1(4.4 * cs)}`)
    const t = S.brow, raise = Math.max(0, t) * 1.6, inner = -9 - raise - t * 3, outer = -9 - raise + Math.min(0, t) * -0.4
    browL.setAttribute('d', `M${f1(-7 * cs + FACE * 0.7)} ${f1(outer * cs)}L${f1(0.5 * cs + FACE * 0.7)} ${f1(inner * cs)}`)
    browR.setAttribute('d', `M${f1(5.6 * cs + FACE * 0.7)} ${f1(inner * cs)}L${f1(12.2 * cs + FACE * 0.7)} ${f1(outer * cs)}`)
    const m = S.mouth, mx = 8 * cs + FACE * 0.5
    mouth.setAttribute('d', `M${f1(mx - 3.6 * cs)} ${f1(9 * cs)}Q${f1(mx)} ${f1((9 + m * 5) * cs)} ${f1(mx + 3.6 * cs)} ${f1(9 * cs)}`)
    sweat.setAttribute('opacity', f1(S.sweat))
    const sy = (-8 + S.sweat * 7) * cs
    sweat.setAttribute('d', `M${f1(14 * cs)} ${f1(sy - 5 * cs)}q${f1(3.2 * cs)} ${f1(5 * cs)} ${f1(2.4 * cs)} ${f1(7.4 * cs)}a${f1(2.7 * cs)} ${f1(2.7 * cs)} 0 1 1 ${f1(-4.8 * cs)} 0q${f1(-0.8 * cs)} ${f1(-2.4 * cs)} ${f1(2.4 * cs)} ${f1(-7.4 * cs)}z`)

    // thought bubble: two small circles rising from the head, then a cloud holding the question mark
    const th = clamp(S.think), hx = headC[0], hy = headC[1]
    bubble.setAttribute('opacity', f1(th))
    const bc = [hx - 40 * cs, hy - 62 * cs - (1 - th) * 8 * cs + Math.sin(time * 2.4) * 1.2 * cs]
    dotA.setAttribute('cx', f1(hx - 17 * cs)); dotA.setAttribute('cy', f1(hy - 26 * cs)); dotA.setAttribute('r', f1(2.6 * cs * (0.4 + th * 0.6)))
    dotB.setAttribute('cx', f1(hx - 25 * cs)); dotB.setAttribute('cy', f1(hy - 38 * cs)); dotB.setAttribute('r', f1(4.2 * cs * (0.4 + th * 0.6)))
    const bw = 25 * cs * (0.5 + th * 0.5), bh = 17 * cs * (0.5 + th * 0.5), bx = bc[0], by = bc[1]
    cloud.setAttribute('d', `M${f1(bx - bw)} ${f1(by)}` +
      `Q${f1(bx - bw * 1.15)} ${f1(by - bh * 0.9)} ${f1(bx - bw * 0.45)} ${f1(by - bh * 0.85)}` +
      `Q${f1(bx - bw * 0.15)} ${f1(by - bh * 1.5)} ${f1(bx + bw * 0.35)} ${f1(by - bh * 0.95)}` +
      `Q${f1(bx + bw * 1.1)} ${f1(by - bh * 1.05)} ${f1(bx + bw * 1.0)} ${f1(by - bh * 0.1)}` +
      `Q${f1(bx + bw * 1.15)} ${f1(by + bh * 0.9)} ${f1(bx + bw * 0.4)} ${f1(by + bh * 0.85)}` +
      `Q${f1(bx + bw * 0.05)} ${f1(by + bh * 1.45)} ${f1(bx - bw * 0.45)} ${f1(by + bh * 0.85)}` +
      `Q${f1(bx - bw * 1.15)} ${f1(by + bh * 0.9)} ${f1(bx - bw)} ${f1(by)}Z`)
    qm.setAttribute('opacity', f1(clamp(S.qm * 1.4) * th))
    qm.setAttribute('transform', `translate(${f1(bx)} ${f1(by + 8 * cs)}) rotate(${f1(Math.sin(time * 4) * 3)}) scale(${f1(0.4 + S.qm * 0.6)})`)
    S.head = headC
    S.shoulderL = sL; S.shoulderR = sR
  }

  // a point on the body, in screen px, from rig units (before leaning): used to place hands "on the hip" etc.
  const pt = (ux, uy) => pxy(ux, uy, x0 + S.x, fy + (HIP_Y + S.crouch * 15) * cs)

  return { g, S, update, pt, cs, x0, fy, el: { head } }
}
