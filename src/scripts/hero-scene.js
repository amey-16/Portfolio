// The hero scene, built from scratch with Three.js. No models, no textures from disk.
//
//   left    chaos: thousands of GPU particles and dark shards (raw ideas, noisy data)
//   centre  a chrome ring they are drawn through (the engineering)
//   right   order: the particles line up into lanes and run into six interface
//           layers (code, wireframe, dashboard, request log, network, product)
//
// Scrolling drives one number, `progress` (0 to 1): the row of layers lifts into an
// exploded stack, the camera circles it, then the layers collapse into the single
// product panel, which fills the screen.

import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { panelMakers, panelKinds, panelAspect } from './hero-panels.js'

const INK = new THREE.Color('#005F73')
const ACCENT = new THREE.Color('#0A9396')
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const lerp = (a, b, t) => a + (b - a) * t

// One flow function, shared by particles and threads, so threads trace the same funnel.
const FLOW = /* glsl */ `
  uniform float uTime;
  uniform float uClarity;
  uniform float uWobble;
  vec3 flowPos(float s, vec4 seed, float t, out float left) {
    float x = mix(-6.0, 6.0, s);
    left = 1.0 - smoothstep(-5.2, -0.15, x);
    float R = mix(0.10, 2.5, pow(left, 1.5)) * (1.0 - 0.6 * uClarity);
    float ang = seed.z * 6.2831 + t * (0.25 + seed.x * 0.4) * (0.3 + left) + x * 1.3;
    float rr = sqrt(seed.w);
    vec3 chaos = vec3(0.0, sin(ang) * rr * R, cos(ang) * rr * R);
    float turb = left * (1.0 - uClarity * 0.7);
    chaos.y += sin(t * 0.7 + x * 2.1 + seed.x * 30.0) * 0.35 * turb;
    chaos.z += cos(t * 0.6 + x * 1.7 + seed.y * 30.0) * 0.35 * turb;
    float lane = floor(seed.w * 12.0) / 11.0 - 0.5;
    vec3 order = vec3(0.0, lane * 2.4, 0.0);
    float k = smoothstep(-0.2, 1.1, x);
    vec3 outp = vec3(x, 0.0, 0.0) + mix(chaos, order, k);
    // scatter: while the camera is being drawn through the ring, everything wobbles and spreads
    float w = uWobble * (0.4 + 0.6 * (1.0 - k));
    outp += w * vec3(
      sin(t * 1.7 + seed.x * 40.0 + x * 1.1) * 0.35,
      sin(t * 1.3 + seed.y * 40.0 + x * 1.9) * 0.75 + (seed.z - 0.5) * 0.9,
      cos(t * 1.5 + seed.w * 40.0 + x * 1.5) * 0.75 + (seed.x - 0.5) * 0.9);
    return outp;
  }
`

const POINT_VERT = /* glsl */ `
  uniform float uPx, uReveal;
  uniform vec2 uMouse;
  attribute vec4 aSeed;
  varying float vA;
  varying float vAccent;
  varying float vMix;
  ${FLOW}
  void main() {
    // every particle travels at one speed; on the output side they sit on a shared lattice
    // (same columns in every row), so the data reads as aligned records.
    float spd = 0.045;
    float colN = 96.0, rowId = floor(aSeed.w * 12.0);
    float col = floor(aSeed.y * colN);
    float s = fract(col / colN + uTime * spd);
    float left;
    vec3 p = flowPos(s, aSeed, uTime, left);
    float kk = smoothstep(-0.2, 1.1, p.x);
    float keep = step(0.3 + 0.25 * fract(rowId * 0.37), fract(sin(dot(vec2(col, rowId), vec2(12.9898, 78.233))) * 43758.5453));
    float nodeCol = step(0.5, fract(col / 6.0 + rowId * 0.17)) * step(fract(col / 6.0), 0.17);
    vec2 d = p.xy - uMouse;
    float m = exp(-dot(d, d) * 1.1) * 0.9;
    p.xy += normalize(d + 1e-4) * m * (0.35 + left);
    float revealX = mix(-6.5, 6.5, uReveal);
    vA = smoothstep(0.0, 0.06, s) * (1.0 - smoothstep(0.9, 1.0, s)) * (1.0 - smoothstep(revealX - 1.0, revealX, p.x));
    vAccent = step(0.935, aSeed.x) * (1.0 - kk);
    vMix = clamp(aSeed.z * 0.55 + (p.x + 6.0) / 12.0 * 0.6, 0.0, 1.0);
    vA *= mix(1.0, keep, kk);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float szChaos = 1.0 + aSeed.x * 2.3, szOrder = 1.15 + nodeCol * 1.6 + step(0.8, fract(rowId * 0.31 + col * 0.07)) * 0.5;
    gl_PointSize = uPx * mix(szChaos, szOrder, kk) * (10.5 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vA *= smoothstep(-0.12, 0.3, gl_Position.x / gl_Position.w);
  }
`
const POINT_FRAG = /* glsl */ `
  uniform vec3 uInk, uAccent;
  uniform float uOpacity;
  varying float vA;
  varying float vAccent;
  varying float vMix;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.12, d) * vA * 0.95 * uOpacity;
    // deep cobalt -> bright blue across the flow
    vec3 c1 = vec3(0.0, 0.37, 0.45), c2 = vec3(0.04, 0.58, 0.59), c3 = vec3(0.58, 0.82, 0.74), cw = vec3(0.73, 0.24, 0.01);
    vec3 col = vMix < 0.5 ? mix(c1, c2, vMix * 2.0) : mix(c2, c3, (vMix - 0.5) * 2.0);
    gl_FragColor = vec4(mix(col, cw, vAccent), a);
  }
`
const LINE_VERT = /* glsl */ `
  uniform float uReveal;
  attribute vec4 aSeed;
  attribute float aT;
  varying float vA;
  ${FLOW}
  void main() {
    float left;
    vec3 p = flowPos(aT, aSeed, uTime * 0.6, left);
    float revealX = mix(-6.5, 6.5, uReveal);
    vA = smoothstep(0.0, 0.08, aT) * (1.0 - smoothstep(0.82, 1.0, aT)) * (1.0 - smoothstep(revealX - 1.0, revealX, p.x));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vA *= smoothstep(-0.12, 0.3, gl_Position.x / gl_Position.w);
  }
`
const LINE_FRAG = /* glsl */ `
  uniform vec3 uInk;
  uniform float uOpacity;
  varying float vA;
  void main() { gl_FragColor = vec4(uInk, vA * 0.32 * uOpacity); }
`

// Interface layers arrive as a field of loose squares and snap into one aligned surface.
const GX = 16, GY = 10
const PANEL_VERT = /* glsl */ `
  uniform float uDistort, uTime, uSeed;
  uniform vec2 uSize;
  attribute vec2 aCell;
  varying vec2 vUv;
  varying float vR;
  float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vUv = uv;
    vec2 id = aCell + uSeed;
    float r1 = h(id), r2 = h(id + 7.3), r3 = h(id + 19.1), r4 = h(id + 3.7);
    vR = r1;
    vec2 centre = ((aCell + 0.5) / vec2(${GX}.0, ${GY}.0) - 0.5) * uSize;
    vec2 local = position.xy - centre;
    float ang = (r2 - 0.5) * 2.4 * uDistort + sin(uTime * 2.0 + r3 * 20.0) * 0.08 * uDistort;
    float cs = cos(ang), sn = sin(ang);
    local = mat2(cs, sn, -sn, cs) * local * (1.0 - 0.38 * uDistort * r4);
    vec2 drift = (vec2(r1, r2) - 0.5) * vec2(1.7, 1.2) * uDistort + vec2(sin(uTime * 1.4 + r3 * 30.0), cos(uTime * 1.2 + r4 * 30.0)) * 0.05 * uDistort;
    vec3 p = vec3(centre + local + drift, (r3 - 0.5) * 1.8 * uDistort);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const PANEL_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity, uDistort, uTime;
  varying vec2 vUv;
  varying float vR;
  float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec2 uv = vUv;
    float band = floor(uv.y * 38.0 + uTime * 6.0);
    float tear = (h(vec2(band, floor(uTime * 8.0))) - 0.5) * 0.06 * uDistort * step(0.55, h(vec2(band, 3.0)));
    uv.x += tear;
    float split = 0.012 * uDistort;
    vec4 c = vec4(texture2D(uMap, uv + vec2(split, 0.0)).r, texture2D(uMap, uv).g, texture2D(uMap, uv - vec2(split, 0.0)).b, texture2D(uMap, uv).a);
    c.rgb = mix(c.rgb, c.rgb * (0.55 + vR * 0.9) + vec3(0.05, 0.08, 0.2) * vR, uDistort);
    c.a *= uOpacity;
    gl_FragColor = linearToOutputTexel(c);
  }
`

export function createHeroScene(canvas, { animate = true, lite = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  const maxDpr = lite ? 1.25 : 1.75

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  const camera = new THREE.PerspectiveCamera(32, 1.6, 0.1, 60)
  const key = new THREE.DirectionalLight('#ffffff', 2.2)
  key.position.set(-3, 5, 6)
  scene.add(key)

  const world = new THREE.Group()
  scene.add(world)

  const uniforms = {
    uTime: { value: 0 }, uClarity: { value: 0 }, uWobble: { value: 0 }, uReveal: { value: animate ? 0 : 1 }, uOpacity: { value: 1 },
    uPx: { value: 2.3 }, uMouse: { value: new THREE.Vector2(99, 99) },
    uInk: { value: INK }, uAccent: { value: ACCENT },
  }

  /* ---- particles ---- */
  const N = lite ? 5000 : 11000
  const seeds = new Float32Array(N * 4)
  for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random()
  const pg = new THREE.BufferGeometry()
  pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
  pg.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
  const points = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms, vertexShader: POINT_VERT, fragmentShader: POINT_FRAG, transparent: true, depthWrite: false,
  }))
  points.frustumCulled = false
  world.add(points)

  /* ---- threads: fine lines that trace the same funnel ---- */
  const T = lite ? 24 : 48, SEG = 140
  const tp = [], ts = [], tt = []
  for (let k = 0; k < T; k++) {
    const sd = [Math.random(), Math.random(), Math.random(), ((k % 12) + 0.5) / 12]
    for (let j = 0; j < SEG; j++) {
      for (const jj of [j, j + 1]) { tp.push(0, 0, 0); ts.push(...sd); tt.push(jj / SEG) }
    }
  }
  const lg = new THREE.BufferGeometry()
  lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tp), 3))
  lg.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(ts), 4))
  lg.setAttribute('aT', new THREE.BufferAttribute(new Float32Array(tt), 1))
  const threads = new THREE.LineSegments(lg, new THREE.ShaderMaterial({
    uniforms, vertexShader: LINE_VERT, fragmentShader: LINE_FRAG, transparent: true, depthWrite: false,
  }))
  threads.frustumCulled = false
  world.add(threads)

  /* ---- shards: dark faceted rocks that get consumed by the ring ---- */
  const SH = lite ? 10 : 22
  const shardGeo = new THREE.IcosahedronGeometry(1, 0)
  const shardMat = new THREE.MeshStandardMaterial({ color: '#0B4F5C', metalness: 0.55, roughness: 0.3, flatShading: true, emissive: '#0B4F5C', emissiveIntensity: 0.25 })
  const shards = new THREE.InstancedMesh(shardGeo, shardMat, SH)
  const sd = Array.from({ length: SH }, () => ({
    o: Math.random(), a: Math.random() * 6.28, r: Math.sqrt(Math.random()), size: 0.06 + Math.random() * 0.14,
    spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(1.2),
    rot: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6), warm: Math.random() > 0.8,
  }))
  const col = new THREE.Color()
  sd.forEach((s, i) => shards.setColorAt(i, col.set(s.warm ? '#AE2012' : '#0B4F5C')))
  shards.frustumCulled = false
  world.add(shards)
  const dummy = new THREE.Object3D()

  /* ---- the ring ---- */
  const ring = new THREE.Group()
  ring.position.x = 0.15
  const chrome = new THREE.MeshStandardMaterial({ color: '#eef2f8', metalness: 1, roughness: 0.14, envMapIntensity: 1.5 })
  const outer = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.17, 48, 160), chrome)
  const outer2 = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.05, 24, 160), chrome)
  outer2.position.z = 0.34
  const seam = new THREE.Mesh(new THREE.TorusGeometry(1.31, 0.018, 16, 160), new THREE.MeshBasicMaterial({ color: '#0A9396' }))
  const glowIn = new THREE.Mesh(new THREE.TorusGeometry(1.31, 0.09, 16, 160), new THREE.MeshBasicMaterial({ color: '#0A9396', transparent: true, opacity: 0.45, depthWrite: false }))
  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.34, 24, 160), new THREE.MeshBasicMaterial({ color: '#0A9396', transparent: true, opacity: 0.2, depthWrite: false }))
  ring.add(outer, outer2, seam, glowIn, halo)
  ring.rotation.y = Math.PI / 2 + 0.18
  world.add(ring)

  /* ---- layers ---- */
  const PW = 1.6, PH = PW / panelAspect
  const panels = []
  const panelGroup = new THREE.Group()
  world.add(panelGroup)
  const loadFonts = document.fonts
    ? Promise.race([Promise.all([document.fonts.load('400 40px "Instrument Serif"'), document.fonts.load('italic 400 40px "Instrument Serif"'), document.fonts.load('500 17px "Geist Mono Variable"')]), new Promise((r) => setTimeout(r, 1500))])
    : Promise.resolve()
  const geo = new THREE.PlaneGeometry(PW, PH, GX, GY).toNonIndexed()
  const cells = new Float32Array(geo.attributes.position.count * 2)
  for (let v = 0; v < geo.attributes.position.count; v++) { const q = Math.floor(v / 6); cells[v * 2] = q % GX; cells[v * 2 + 1] = Math.floor(q / GX) }
  geo.setAttribute('aCell', new THREE.BufferAttribute(cells, 2))
  const edgeGeo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(PW, PH))
  panelMakers.forEach((make, i) => {
    const tex = new THREE.CanvasTexture(make())
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    const mat = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: tex }, uOpacity: { value: 1 }, uDistort: { value: 1 }, uTime: uniforms.uTime, uSeed: { value: i * 5.17 }, uSize: { value: new THREE.Vector2(PW, PH) } },
      vertexShader: PANEL_VERT, fragmentShader: PANEL_FRAG, transparent: true, side: THREE.DoubleSide, depthWrite: false,
    })
    const mesh = new THREE.Mesh(geo, mat)
    const edge = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: '#005F73', transparent: true, opacity: panelKinds[i] === 'dark' ? 0 : 0.25 }))
    mesh.add(edge)
    panelGroup.add(mesh)
    panels.push({ mesh, mat, edge, tex, make, kind: panelKinds[i], base: panelKinds[i] === 'dark' ? 1 : 0.86 })
  })
  loadFonts.then(() => { panels.forEach((p) => { p.tex.image = p.make(); p.tex.needsUpdate = true }); dirty = true; kick() }).catch(() => {})

  // a plain dark plane in front of the product panel, so the last frame fills any screen shape
  const cover = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), new THREE.MeshBasicMaterial({ color: '#057984', transparent: true, opacity: 0, toneMapped: false }))
  cover.visible = false
  world.add(cover)

  /* ---- state ---- */
  let width = 1, height = 1, aspect = 1.6, dirty = true
  const S = { target: 0, p: 0 }
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, on: false }
  let running = false, raf = 0
  // Scene time advances by a clamped step each frame, so a stalled tab, a resize or a stop/start can never make it leap forward.
  let simTime = 0, lastTick = performance.now()
  const v = new THREE.Vector3()
  const axis = new THREE.Vector3(), ringC = new THREE.Vector3(), camPos = new THREE.Vector3(), camLook = new THREE.Vector3()
  const pathPts = Array.from({ length: 6 }, () => new THREE.Vector3())
  const lookPts = Array.from({ length: 6 }, () => new THREE.Vector3())
  const pathCurve = new THREE.CatmullRomCurve3(pathPts, false, 'centripetal')
  const lookCurve = new THREE.CatmullRomCurve3(lookPts, false, 'centripetal')
  const CAM_END = new THREE.Vector3(3.2, 0, 2.4), LOOK_END = new THREE.Vector3(3.2, 0, 0)
  const PATH_CROSS_U = 3 / 5 // the ring centre is the 4th of 6 spline knots
  const CROSS_P = 0.29 // scroll progress at which smooth(0, 0.52, p) reaches PATH_CROSS_U

  function resize() {
    const r = canvas.getBoundingClientRect()
    width = Math.max(1, r.width); height = Math.max(1, r.height)
    aspect = width / height
    const dpr = Math.min(devicePixelRatio || 1, maxDpr)
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height, false)
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    uniforms.uPx.value = (lite ? 2.2 : 2.5) * dpr * Math.min(1.2, Math.max(0.7, aspect / 1.6))
    dirty = true
  }

  function layout(time) {
    const p = S.p
    const portrait = aspect < 1
    const zf = portrait ? 1.45 : aspect < 1.5 ? Math.min(1.5, Math.pow(1.5 / aspect, 0.85)) : 1
    // 0.00-0.30  fly through the ring while everything wobbles and scatters
    // 0.28-0.58  the layers arrive as loose squares and align into an exploded stack
    // 0.78-0.93  the stack collapses into the product panel
    const wob = smooth(0.02, 0.12, p) * (1 - smooth(0.25, 0.42, p))
    const e = smooth(0.3, 0.58, p)
    const c = smooth(0.78, 0.93, p)
    const appear = smooth(0.26, 0.36, p)
    const w2 = smooth(0.78, 0.97, p)
    const gy = lerp(portrait ? -1.1 : -0.1, 0, smooth(0.08, 0.3, p))
    world.position.y = gy
    uniforms.uClarity.value = smooth(0.0, 0.7, p)
    uniforms.uWobble.value = wob * 1.15

    panels.forEach((pn, i) => {
      const m = pn.mesh
      const last = i === 5
      const rowS = 0.6 + i * 0.07
      const rx = 1.5 + i * 0.6, ry = Math.sin(time * 0.6 + i) * 0.04 + (i % 2 ? 0.1 : -0.1), rz = (i % 2 ? 0.2 : -0.2)
      const spread = 1.05 * (1 - c)
      const sz = (Math.min(i, 4) - 4) * spread + (last ? 0.04 : 0)
      const sy = (Math.min(i, 4) - 2) * 0.08 * (1 - c)
      m.position.set(lerp(rx, 3.2, e), lerp(ry, sy, e), lerp(rz, sz, e))
      m.rotation.set(lerp(0, 0.14, e) * (1 - c), lerp(-0.72, lerp(-1.0, 0, c), e), 0)
      m.scale.setScalar(lerp(rowS, lerp(1.25, 1.4, c), e))
      const fade = last ? 1 : 1 - smooth(0.84, 0.95, p)
      const own = last ? Math.max(1 - e, smooth(0.7, 0.86, p)) : 1
      // staggered arrival: each layer's squares settle a little after the one before
      const dist = 1 - smooth(0.34 + i * 0.015, 0.62 + i * 0.015, p)
      pn.mat.uniforms.uDistort.value = dist
      pn.mat.uniforms.uOpacity.value = pn.base * fade * own * appear
      pn.edge.material.opacity = (pn.kind === 'dark' ? 0 : 0.28) * fade * own * appear * (1 - dist)
      m.visible = pn.mat.uniforms.uOpacity.value > 0.01
    })
    panelGroup.rotation.y = pointer.sx * 0.05 * (1 - c)
    panelGroup.rotation.x = -pointer.sy * 0.03 * (1 - c)

    // camera path: rest -> swing round to the ring's axis -> through the ring -> the stack -> push into the product panel
    const ax = portrait ? 1.9 : 0.4
    const R0 = 0.15
    // The ring's axis is the line the camera has to travel along to pass cleanly through the hole.
    // Ring wobble, camera shake and pointer parallax are damped while the camera is inside the ring.
    const calmYaw = Math.PI / 2 + 0.18 + Math.sin(time * 0.4) * 0.08
    axis.set(Math.sin(calmYaw), 0, Math.cos(calmYaw))
    const near = 1 - smooth(0, 0.09, Math.abs(p - CROSS_P))
    const wk = wob * (1 - 0.92 * near)
    ringC.set(R0, gy, 0)
    // one continuous spline (no stop between segments): A -> arc -> axis entry -> ring centre -> out along the axis -> stack
    pathPts[0].set(ax, 0.1, 14.4 * zf)
    pathPts[1].set(portrait ? -3.4 : -4.7, 0.5, 9.6 * zf)
    pathPts[2].copy(ringC).addScaledVector(axis, -7.0 * zf)
    pathPts[3].copy(ringC)
    pathPts[4].copy(ringC).addScaledVector(axis, 3.4)
    pathPts[5].set(0.9, 0.7, 6.3 * zf)
    lookPts[0].set(ax, -0.1, 0)
    lookPts[1].copy(ringC).lerp(lookPts[0], 0.3)
    lookPts[2].copy(ringC)
    lookPts[3].copy(ringC).addScaledVector(axis, 3.05)
    lookPts[4].set(3.2, gy * 0.5, 0)
    lookPts[5].set(3.2, 0, 0)
    const u = smooth(0, 0.52, p)
    pathCurve.getPoint(u, camPos)
    lookCurve.getPoint(u, camLook)
    camPos.lerp(CAM_END, w2); camLook.lerp(LOOK_END, w2)
    const par = (1 - w2) * (1 - near)
    const sh1 = Math.sin(time * 5.1) * 0.09 * wk, sh2 = Math.cos(time * 4.3) * 0.07 * wk
    camera.position.set(camPos.x + pointer.sx * 0.4 * par + sh1, camPos.y + pointer.sy * 0.2 * par + sh2, camPos.z)
    camera.lookAt(camLook)
    camera.rotateZ(Math.sin(Math.PI * clamp(u / PATH_CROSS_U)) * 0.1 * (1 - w2) + Math.sin(time * 3.1) * 0.05 * wk)
    const shift = portrait ? 0 : 0.17 * (1 - smooth(0.03, 0.18, p)) + 0.09 * smooth(0.36, 0.58, p) * (1 - w2)
    if (shift > 0.0005) camera.setViewOffset(width, height, -width * shift, 0, width, height)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    // the ring: holds its place while the camera is drawn through it, wobbling, then falls away behind
    const rs = 1 - smooth(0.36, 0.5, p)
    ring.position.x = R0
    ring.scale.setScalar(Math.max(0.001, rs) * (1 + Math.sin(time * 2.6) * 0.03 * wob))
    ring.rotation.y = calmYaw + Math.sin(time * 2.2) * 0.22 * wk
    ring.rotation.z = Math.sin(time * 0.3) * 0.05 + Math.sin(time * 1.9 + 1.0) * 0.2 * wk
    ring.rotation.x = Math.sin(time * 1.6) * 0.14 * wk
    ring.visible = rs > 0.01

    // shards
    for (let i = 0; i < SH; i++) {
      const s = sd[i]
      const u = (s.o + time * 0.018) % 1
      const x = -2.9 + u * 2.4
      const left = 1 - smooth(-2.9, -0.15, x)
      const R = lerp(0.2, 1.9, Math.pow(left, 1.2)) * (1 - 0.5 * uniforms.uClarity.value)
      const ang = s.a + time * 0.18 + x * 0.8
      dummy.position.set(x, Math.sin(ang) * s.r * R, Math.cos(ang) * s.r * R * 0.8)
      dummy.rotation.set(s.rot.x + time * s.spin.x, s.rot.y + time * s.spin.y, s.rot.z + time * s.spin.z)
      dummy.scale.setScalar(s.size * 0.8 * (1 - smooth(0.78, 1, u)) * (0.6 + left) * rs * smooth(-2.6, -1.6, x))
      dummy.updateMatrix()
      shards.setMatrixAt(i, dummy.matrix)
    }
    shards.instanceMatrix.needsUpdate = true
    shards.visible = rs > 0.01
    points.visible = threads.visible = p < 0.9
    uniforms.uOpacity.value = lerp(1, 0.16, smooth(0.3, 0.55, p)) * (1 - smooth(0.6, 0.8, p))

    cover.position.set(3.2, 0, 0.1)
    cover.material.opacity = smooth(0.86, 0.95, p)
    cover.visible = p > 0.84

    // pointer in flow space
    const halfH = Math.tan(THREE.MathUtils.degToRad(16)) * camera.position.z
    uniforms.uMouse.value.set(pointer.on ? camera.position.x + (pointer.x - shift * 2) * halfH * aspect : 99, pointer.on ? pointer.y * halfH - gy : 99)
  }

  function frame() {
    raf = 0
    if (!running) return
    const now = performance.now()
    const dt = Math.min((now - lastTick) / 1000, 1 / 30)
    lastTick = now
    if (animate) simTime += dt
    const time = animate ? simTime : 3
    // frame-rate independent easing: same feel at 60, 120 or a dropped 30 fps
    const kp = 1 - Math.exp(-9 * dt), kc = 1 - Math.exp(-3.7 * dt)
    S.p += (S.target - S.p) * kp
    pointer.sx += (pointer.x - pointer.sx) * kc
    pointer.sy += (pointer.y - pointer.sy) * kc
    uniforms.uTime.value = time
    layout(time)
    renderer.render(scene, camera)
    dirty = false
    if (animate || dirty || Math.abs(S.target - S.p) > 0.0005) raf = requestAnimationFrame(frame)
  }
  const kick = () => { if (running && !raf) raf = requestAnimationFrame(frame) }

  const onMove = (e) => {
    const r = canvas.getBoundingClientRect()
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1
    pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1)
    pointer.on = true
    kick()
  }
  const onLeave = () => { pointer.on = false; pointer.x = 0; pointer.y = 0 }
  addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  const ro = new ResizeObserver(() => { resize(); kick() })
  ro.observe(canvas)
  resize()

  return {
    uniforms,
    setProgress(p) { S.target = p; kick() },
    start() { if (running) return; running = true; lastTick = performance.now(); kick() },
    stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0 },
    renderOnce() { running = true; frame(); running = false },
    dispose() {
      this.stop(); ro.disconnect(); removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave)
      renderer.dispose(); pg.dispose(); lg.dispose()
    },
  }
}
