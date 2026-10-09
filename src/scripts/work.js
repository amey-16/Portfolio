import * as THREE from 'three'
import { gsap, ScrollTrigger, SplitText, lenis, tickers, $, $$, clamp, lerp, smooth, pointer, vel, watchVisible, fine, reduced, small } from './core.js'
import { projects } from './data.js'
import { cover, COVER_ASPECT } from './covers.js'

/*
  Selected work. One pinned stage, five projects. A WebGL plane shows the
  covers; scrolling runs them past like a conveyor of slats (each column
  with its own delay), with a chroma split at the seam, a bend that follows
  scroll velocity and a ripple under the cursor. Titles are masked chars.
*/

const VERT = /* glsl */ `
uniform float uBend, uSkew;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec3 p = position;
  p.y += sin(uv.x * 3.14159) * uBend;
  p.x += (uv.y - .5) * uSkew;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uA, uB;
uniform float uProg, uTime, uHover, uOpen, uAspect;
uniform vec2 uPlane, uMouse;
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

vec2 cover(vec2 uv){
  float pa = uPlane.x / uPlane.y;
  vec2 s = pa > uAspect ? vec2(1., uAspect / pa) : vec2(pa / uAspect, 1.);
  uv = (uv - .5) * s * (1. - .05 * uHover) + .5;
  return uv;
}
vec3 pick(vec2 uv, float e){
  // a conveyor: A leaves upward, B arrives from below
  float y = uv.y - e;
  return y >= 0. ? texture2D(uA, cover(vec2(uv.x, y))).rgb : texture2D(uB, cover(vec2(uv.x, y + 1.))).rgb;
}
float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }

void main(){
  vec2 uv = vUv;
  float cols = 12.;
  float col = floor(uv.x * cols);
  float delay = hash(vec2(col, 4.1)) * .32 + (col / cols) * .12;
  float t = clamp((uProg - delay) / .56, 0., 1.);
  float e = t * t * (3. - 2. * t);
  float seam = sin(e * 3.14159);

  // cursor ripple
  vec2 m = uMouse; vec2 dv = (uv - m) * vec2(uPlane.x / uPlane.y, 1.);
  float md = length(dv);
  vec2 rip = normalize(dv + 1e-4) * sin(md * 38. - uTime * 3.) * .006 * uHover * exp(-md * 3.5);
  uv += rip;
  uv.x += sin(uv.y * 9. + uTime * 1.5) * .004 * seam;

  float sp = .004 + seam * .02;
  vec3 c = vec3(pick(uv + vec2(sp, 0.), e).r, pick(uv, e).g, pick(uv - vec2(sp, 0.), e).b);
  // column seams catch a little light while moving
  c *= 1. - seam * .12 * step(.94, fract(uv.x * cols));
  c += seam * .05;

  // rounded corners + curtain open
  vec2 pp = (vUv - .5) * uPlane;
  float d = sdRound(pp, uPlane * .5, 18.);
  float a = 1. - smoothstep(-1., 1., d);
  float open = smoothstep(0., .02, uOpen * .5 + .0005 - abs(vUv.y - .5));
  gl_FragColor = vec4(c, a * open);
}`

export function initWork(root, { onOpen }) {
  const pin = $('.work__pin', root)
  const frame = $('.work__frame', root)
  const titlesEl = $('.work__titles', root)
  const metaEl = $('.work__meta', root)
  const indexEl = $('.work__index', root)
  const liteEl = $('.work__lite', root)
  const N = projects.length
  const pad2 = (n) => String(n).padStart(2, '0')

  /* ---- DOM from data ---- */
  projects.forEach((p, i) => {
    titlesEl.insertAdjacentHTML('beforeend', `<h3 class="wt" data-i="${i}"><span class="wt__t">${p.name.toUpperCase()}</span></h3>`)
    indexEl.insertAdjacentHTML('beforeend', `<li><button type="button" class="wi" data-i="${i}" data-cursor="hover"><span class="wi__n">${pad2(i + 1)}</span><span class="wi__t">${p.name}</span></button></li>`)
  })
  metaEl.innerHTML = `<div class="wm"><span class="k">Project</span><p class="wm__kind"></p></div><div class="wm"><span class="k">Role</span><p class="wm__role"></p></div><div class="wm"><span class="k">Tools</span><p class="wm__tools"></p></div><div class="wm wm--sum"><span class="k">In short</span><p class="wm__sum"></p></div>`
  $$('.wl canvas', liteEl).forEach((cv, i) => cv.getContext('2d').drawImage(cover(i), 0, 0, 800, 500))
  $$('.wl', liteEl).forEach((b) => b.addEventListener('click', () => onOpen(+b.dataset.i, b.getBoundingClientRect())))

  const titles = $$('.wt', titlesEl)
  const splits = titles.map((t) => SplitText.create($('.wt__t', t), { type: 'chars', mask: 'chars', charsClass: 'wch' }))
  const idxBtns = $$('.wi', indexEl)
  const kindEl = $('.wm__kind', metaEl), roleEl = $('.wm__role', metaEl), toolsEl = $('.wm__tools', metaEl), sumEl = $('.wm__sum', metaEl)
  const countOdo = $('.work__count .odo', root)._odo
  const bar = $('.work__bar i', root)

  let act = -1
  const setMeta = (i, first) => {
    const p = projects[i]
    const els = [kindEl, roleEl, toolsEl, sumEl]
    const apply = () => { kindEl.textContent = p.kind; roleEl.textContent = p.role; toolsEl.textContent = p.tools; sumEl.textContent = p.summary }
    if (first) { apply(); return }
    gsap.to(els, { y: -10, opacity: 0, duration: 0.25, ease: 'power2.in', stagger: 0.03, overwrite: true, onComplete: () => { apply(); gsap.fromTo(els, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05 }) } })
  }
  const activate = (i, first = false) => {
    if (i === act) return
    const prev = act
    act = i
    const dir = prev < 0 ? 1 : i > prev ? 1 : -1
    splits.forEach((s, k) => {
      if (k === i) {
        titles[k].classList.add('is-on')
        gsap.fromTo(s.chars, { yPercent: 115 * dir }, { yPercent: 0, duration: first ? 1.4 : 1.0, ease: 'expo.out', stagger: { each: 0.025, from: dir > 0 ? 'start' : 'end' }, delay: first ? 0 : 0.15, overwrite: true })
      } else if (k === prev) {
        gsap.to(s.chars, { yPercent: -115 * dir, duration: 0.55, ease: 'expo.in', stagger: { each: 0.015, from: dir > 0 ? 'start' : 'end' }, overwrite: true, onComplete: () => titles[k].classList.remove('is-on') })
      }
    })
    idxBtns.forEach((b, k) => b.classList.toggle('is-on', k === i))
    countOdo.set(pad2(i + 1), { duration: 0.9, stagger: 0.05 })
    setMeta(i, first)
    frame.setAttribute('aria-label', `Open the ${projects[i].name} case study`)
    titlesEl.setAttribute('data-active', projects[i].name)
  }

  const goTo = (i) => {
    if (!st) return
    lenis.scrollTo(st.start + (st.end - st.start) * (i / (N - 1)), { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) })
  }
  idxBtns.forEach((b) => b.addEventListener('click', () => goTo(+b.dataset.i)))
  frame.addEventListener('click', () => onOpen(act, frame.getBoundingClientRect()))
  frame.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(act, frame.getBoundingClientRect()) } })

  /* ---- reduced motion: a plain list, no pin, no GL ---- */
  if (reduced) { root.classList.add('is-lite'); return { goTo, lite: true } }

  /* ---- WebGL ---- */
  const canvas = $('.work__gl', root)
  let renderer
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }) }
  catch (e) { console.warn('work: WebGL unavailable', e); root.classList.add('is-lite'); return { goTo, lite: true } }
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10)
  const texs = projects.map((_, i) => {
    const t = new THREE.CanvasTexture(cover(i))
    t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = true
    t.anisotropy = renderer.capabilities.getMaxAnisotropy()
    return t
  })
  const U = {
    uA: { value: texs[0] }, uB: { value: texs[1] }, uProg: { value: 0 }, uTime: { value: 0 }, uHover: { value: 0 }, uOpen: { value: 0 },
    uAspect: { value: COVER_ASPECT }, uPlane: { value: new THREE.Vector2(100, 100) }, uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uBend: { value: 0 }, uSkew: { value: 0 },
  }
  const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 24, 1), mat)
  scene.add(mesh)

  let W = 0, H = 0
  const resize = () => {
    const r = pin.getBoundingClientRect()
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height))
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2))
    renderer.setSize(W, H, false)
    camera.right = W; camera.top = H; camera.updateProjectionMatrix()
  }
  resize()
  addEventListener('resize', resize)

  const S = { p: 0, hover: 0, hoverT: 0, mx: 0.5, my: 0.5, prog: 0, bend: 0 }
  frame.addEventListener('pointerenter', () => (S.hoverT = 1))
  frame.addEventListener('pointerleave', () => (S.hoverT = 0))
  const vis = watchVisible(root, null, '50px')

  tickers.add((dt, t) => {
    if (!vis.on) return
    const pr = pin.getBoundingClientRect()
    if (Math.abs(pr.width - W) > 1 || Math.abs(pr.height - H) > 1) resize()
    const fr = frame.getBoundingClientRect()
    mesh.scale.set(fr.width, fr.height, 1)
    mesh.position.set(fr.left - pr.left + fr.width / 2, H - (fr.top - pr.top) - fr.height / 2, 0)
    U.uPlane.value.set(fr.width, fr.height)
    S.hover += (S.hoverT - S.hover) * Math.min(1, dt * 6)
    const mx = clamp((pointer.x - fr.left) / fr.width, 0, 1), my = clamp(1 - (pointer.y - fr.top) / fr.height, 0, 1)
    S.mx += (mx - S.mx) * Math.min(1, dt * 8); S.my += (my - S.my) * Math.min(1, dt * 8)
    U.uMouse.value.set(S.mx, S.my)
    U.uHover.value = S.hover
    U.uTime.value = t
    const v = vel.v
    U.uBend.value = clamp(-v * 0.07, -0.12, 0.12) + (small() ? 0 : 0)
    U.uSkew.value = clamp(v * 0.035, -0.07, 0.07)
    renderer.render(scene, camera)
  })

  /* ---- scroll: pin, map progress to (index, transition) ---- */
  let st
  const apply = (p) => {
    const f = p * (N - 1)
    const i = clamp(Math.floor(f + 1e-6), 0, N - 2)
    const local = f - i
    const tr = p >= 1 ? 1 : smooth(0.08, 0.92, local)
    const a = texs[i], b = texs[i + 1]
    if (U.uA.value !== a) U.uA.value = a
    if (U.uB.value !== b) U.uB.value = b
    U.uProg.value = tr
    activate(clamp(Math.round(f), 0, N - 1))
    bar.style.transform = `scaleX(${p})`
  }
  st = ScrollTrigger.create({
    trigger: root, pin, start: 'top top', end: () => '+=' + innerHeight * (N - 1) * 1.15, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
    snap: { snapTo: 1 / (N - 1), duration: { min: 0.35, max: 0.9 }, delay: 0.06, ease: 'power2.inOut' },
    onUpdate: (s) => apply(s.progress),
  })
  activate(0, true)
  apply(0)
  // the plane opens like a curtain as the section arrives
  ScrollTrigger.create({ trigger: root, start: 'top 85%', end: 'top 10%', scrub: true, onUpdate: (s) => (U.uOpen.value = s.progress) })

  return { goTo, resize, texs }
}
