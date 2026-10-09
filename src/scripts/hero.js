import * as THREE from 'three'
import { $, $$, clamp, lerp, pointer, tickers, vel, gsap, watchVisible, fine } from './core.js'

/*
  Liquid type. The headline lives in the DOM (accessible, measured), then is
  painted once into a texture. A single full-screen shader displaces it with a
  flow field the pointer stirs up, splits the colour channels by speed and
  scroll velocity, and lets a vermilion lens (plus a wake behind it) invert the
  page wherever the cursor has been. Lines slide apart on scroll.
*/

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uText;
uniform sampler2D uField;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uLens, uTime, uVel;
uniform vec4 uBand[N];
uniform float uOff[N];
uniform float uRev[N];
uniform vec3 uBone, uInk, uAcc;
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}

// x: coverage, y: 1 when the pixel belongs to the accent line
vec2 textAt(vec2 p){
  vec2 res = vec2(0.);
  for (int i = 0; i < N; i++) {
    float y0 = uBand[i].x, y1 = uBand[i].y, h = y1 - y0;
    if (p.y > y0 && p.y < y1) {
      vec2 q = p;
      q.x -= uOff[i];
      q.y += (1. - uRev[i]) * h * 1.15;
      q.x += (p.y - .5) * uVel * .10 + (1. - uRev[i]) * .03 * sin(p.y * 60.);
      float m = smoothstep(y0, y0 + h * .03, p.y) * (1. - smoothstep(y1 - h * .03, y1, p.y));
      res = vec2(texture2D(uText, q).a * m, i == N - 1 ? 1. : 0.);
    }
  }
  return res;
}

void main(){
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 as = vec2(aspect, 1.);
  vec4 fld = texture2D(uField, uv);
  vec2 f = fld.xy * 2. - 1.;
  float fm = length(f);

  // vermilion lens + the wake the pointer leaves
  float d = length((uv - uMouse) * as);
  float wob = (noise(uv * as * 5. + uTime * .35) - .5) * .06;
  float lens = 1. - smoothstep(uLens - .005, uLens + .005, d + wob);
  float wake = smoothstep(.16, .5, fld.b + (noise(uv * as * 8. - uTime * .2) - .5) * .22);
  float mask = max(lens, wake);

  // liquid displacement + chroma split
  vec2 disp = f * .04;
  float split = .0012 + fm * .01 + abs(uVel) * .0035;
  vec2 tr = textAt(uv - disp * 1.0 - vec2(split, 0.));
  vec2 tg = textAt(uv - disp * .8);
  vec2 tb = textAt(uv - disp * .6 + vec2(split, 0.));
  vec3 a = vec3(tr.x, tg.x, tb.x);

  vec3 bg = mix(uBone, uAcc, mask);
  vec3 body = mix(uInk, uBone, mask);
  vec3 acc = mix(uAcc, uInk, mask);
  vec3 col = mix(body, acc, tg.y);
  vec3 outc = mix(bg, col, a);
  gl_FragColor = vec4(outc, 1.);
}
`

const VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`

const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return new THREE.Vector3((n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255) }

export function initHero(root) {
  const canvas = $('.hero__gl', root)
  const lines = $$('.hero__line', root)
  const N = lines.length
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' })
  } catch (e) { console.warn('hero: WebGL unavailable', e); return null }
  if (!renderer.getContext()) return null

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const textCanvas = document.createElement('canvas')
  const textTex = new THREE.CanvasTexture(textCanvas)
  textTex.minFilter = textTex.magFilter = THREE.LinearFilter
  textTex.generateMipmaps = false

  const uniforms = {
    uText: { value: textTex }, uField: { value: null },
    uRes: { value: new THREE.Vector2(1, 1) }, uMouse: { value: new THREE.Vector2(0.62, 0.5) },
    uLens: { value: 0 }, uTime: { value: 0 }, uVel: { value: 0 },
    uBand: { value: Array.from({ length: N }, () => new THREE.Vector4(0, 0, 0, 0)) },
    uOff: { value: new Array(N).fill(0) },
    uRev: { value: new Array(N).fill(0) },
    uBone: { value: rgb('#ece9e1') }, uInk: { value: rgb('#0e0e0d') }, uAcc: { value: rgb('#ff4b26') },
  }
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, defines: { N }, depthTest: false, depthWrite: false })
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat))

  /* ---- flow field: a small RGBA texture the CPU stirs ---- */
  let gw = 0, gh = 0, vx, vy, en, fdata, ftex
  const buildField = (w, h) => {
    gw = 96; gh = Math.max(24, Math.round(96 * h / w))
    vx = new Float32Array(gw * gh); vy = new Float32Array(gw * gh); en = new Float32Array(gw * gh)
    fdata = new Uint8Array(gw * gh * 4)
    ftex?.dispose()
    ftex = new THREE.DataTexture(fdata, gw, gh, THREE.RGBAFormat)
    ftex.minFilter = ftex.magFilter = THREE.LinearFilter
    ftex.needsUpdate = true
    uniforms.uField.value = ftex
  }
  const splat = (nx, ny, svx, svy, amt) => {
    const cx = nx * gw, cy = ny * gh
    const R = 5.5
    const x0 = Math.max(0, Math.floor(cx - R * 2)), x1 = Math.min(gw - 1, Math.ceil(cx + R * 2))
    const y0 = Math.max(0, Math.floor(cy - R * 2)), y1 = Math.min(gh - 1, Math.ceil(cy + R * 2))
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const d2 = ((x - cx) ** 2 + (y - cy) ** 2) / (R * R)
      const w = Math.exp(-d2 * 1.4)
      const i = y * gw + x
      vx[i] += svx * w; vy[i] += svy * w
      en[i] = Math.min(1, en[i] + amt * w)
    }
  }

  /* ---- text -> texture ---- */
  let W = 0, H = 0, dpr = 1
  const draw = () => {
    const rect = canvas.getBoundingClientRect()
    W = Math.max(1, Math.round(rect.width)); H = Math.max(1, Math.round(rect.height))
    dpr = Math.min(devicePixelRatio || 1, 2)
    textCanvas.width = Math.round(W * dpr); textCanvas.height = Math.round(H * dpr)
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75))
    renderer.setSize(W, H, false)
    uniforms.uRes.value.set(W, H)
    buildField(W, H)
    const ctx = textCanvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#fff'
    ctx.textBaseline = 'middle'
    lines.forEach((line, i) => {
      const target = line.querySelector('em') || line
      const cs = getComputedStyle(target)
      const lr = line.getBoundingClientRect()
      const tr = target.getBoundingClientRect()
      const fs = parseFloat(cs.fontSize)
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`
      ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing
      const txt = cs.textTransform === 'uppercase' ? target.textContent.toUpperCase() : target.textContent
      const y = lr.top - rect.top + lr.height / 2 + fs * (target === line ? 0.045 : 0.05)
      ctx.fillText(txt, tr.left - rect.left, y)
      const pad = lr.height * 0.1
      uniforms.uBand.value[i].set(0, 0, 0, 0)
      uniforms.uBand.value[i].x = 1 - (lr.bottom - rect.top + pad) / H
      uniforms.uBand.value[i].y = 1 - (lr.top - rect.top - pad) / H
    })
    textTex.needsUpdate = true
  }

  /* ---- state ---- */
  const S = { lens: 0, lensTarget: 0, mx: 0.62, my: 0.5, intro: 0, ready: false }
  let lastX = 0.5, lastY = 0.5, wander = 0
  const state = watchVisible(root, null, '100px')

  const offsets = [-1, 1, -1.15]
  const update = (dt, t) => {
    if (!S.ready || !state.on) return
    const r = canvas.getBoundingClientRect()
    // pointer in canvas uv (y up)
    let px = (pointer.x - r.left) / r.width, py = 1 - (pointer.y - r.top) / r.height
    let active = pointer.inside && pointer.moved && px >= 0 && px <= 1 && py >= 0 && py <= 1 && r.top < innerHeight * 0.6 && r.bottom > innerHeight * 0.3
    if (!fine) { // touch: a slow wandering lens keeps the page alive
      wander += dt * 0.35
      px = 0.5 + Math.sin(wander * 1.3) * 0.32; py = 0.5 + Math.cos(wander * 0.9) * 0.18
      active = true
    }
    S.lensTarget = active ? (fine ? 0.17 : 0.13) : 0
    S.lens += (S.lensTarget - S.lens) * Math.min(1, dt * 5)
    S.mx += (px - S.mx) * Math.min(1, dt * (fine ? 9 : 3)); S.my += (py - S.my) * Math.min(1, dt * (fine ? 9 : 3))

    // stir the field along the pointer's path
    const dx = S.mx - lastX, dy = S.my - lastY
    const sp = Math.hypot(dx * (W / H), dy)
    if (active && sp > 0.0002) {
      const steps = Math.min(8, Math.ceil(sp * 60))
      for (let s = 1; s <= steps; s++) {
        const k = s / steps
        splat(lastX + dx * k, lastY + dy * k, clamp(dx * 5, -1, 1), clamp(dy * 5 * (W / H), -1, 1), clamp(sp * 14, 0, 0.5) / steps * 1.6)
      }
    }
    lastX = S.mx; lastY = S.my
    const dv = Math.pow(0.04, dt), de = Math.pow(0.22, dt)
    for (let i = 0; i < en.length; i++) {
      vx[i] *= dv; vy[i] *= dv; en[i] *= de
      const j = i * 4
      fdata[j] = clamp(vx[i] * 0.5 + 0.5, 0, 1) * 255
      fdata[j + 1] = clamp(vy[i] * 0.5 + 0.5, 0, 1) * 255
      fdata[j + 2] = clamp(en[i], 0, 1) * 255
      fdata[j + 3] = 255
    }
    ftex.needsUpdate = true

    // scroll: lines slide apart
    const p = clamp(-r.top / Math.max(1, r.height), 0, 1)
    const e = p * p
    for (let i = 0; i < N; i++) uniforms.uOff.value[i] = offsets[i % offsets.length] * e * 1.05
    uniforms.uVel.value = vel.v
    uniforms.uMouse.value.set(S.mx, S.my)
    uniforms.uLens.value = S.lens * (1 + p * 0.5)
    uniforms.uTime.value = t
    renderer.render(scene, camera)
  }
  tickers.add(update)

  let rt
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { draw(); }, 180) })

  return {
    draw,
    start() { draw(); S.ready = true; root.classList.add('gl-on') },
    reveal() {
      const tl = gsap.timeline()
      for (let i = 0; i < N; i++) tl.to(uniforms.uRev.value, { [i]: 1, duration: 1.5, ease: 'expo.out' }, i * 0.12)
      return tl
    },
    hideText() { uniforms.uRev.value.fill(0) },
  }
}
