import {
  siFigma, siReact, siNextdotjs, siThreedotjs, siGsap, siTypescript, siBlender, siWebgl, siTailwindcss,
  siFramer, siNodedotjs, siVercel, siAstro, siSvelte, siWebflow, siCinema4d, siNotion, siGithub, siVite,
  siSanity, siShopify, siStorybook, siSupabase, siRive, siLottiefiles, siLinear, siOpengl, siMiro,
} from 'simple-icons'

/*
  Tech stack on a wireframe sphere. DOM logos (crisp, accessible to hover)
  projected from 3D each frame; a canvas draws the globe's meridians with
  the same rotation so it reads as one object.
*/

const TOOLS = [
  [siFigma, 'Where every project starts. Components, variables, prototypes.'],
  [siReact, 'Default for product UI. Hooks, server components, small bundles.'],
  [siNextdotjs, 'Marketing sites and apps that need to be fast on day one.'],
  [siThreedotjs, 'Real-time 3D on the web. Custom shaders, not templates.'],
  [siGsap, 'Scroll choreography and every eased curve you see here.'],
  [siTypescript, 'Types on everything. Fewer surprises at 2am.'],
  [siBlender, 'Modelling and lookdev for product shots and WebGL assets.'],
  [siWebgl, 'The layer under the layer. GLSL when nothing else will do.'],
  [siTailwindcss, 'Quick, consistent UI when the design system is settled.'],
  [siFramer, 'Fast marketing pages and interactive prototypes.'],
  [siNodedotjs, 'APIs, build scripts and the occasional CLI.'],
  [siVercel, 'Previews for every pull request, deploys in seconds.'],
  [siAstro, 'Content-heavy sites that should ship zero JavaScript.'],
  [siSvelte, 'Small, fast interactive pieces.'],
  [siWebflow, 'Handing marketing teams something they can edit.'],
  [siCinema4d, 'Motion stills and product loops.'],
  [siNotion, 'Briefs, research and the decision log.'],
  [siGithub, 'Code review, issues and handover.'],
  [siVite, 'The build tool behind this page.'],
  [siSanity, 'Structured content for editorial sites.'],
  [siShopify, 'Headless commerce for brands with taste.'],
  [siStorybook, 'Documenting components so the system outlives me.'],
  [siSupabase, 'Auth and Postgres for prototypes that become products.'],
  [siRive, 'Interactive animation for product UI.'],
  [siLottiefiles, 'Lightweight motion for apps.'],
  [siLinear, 'Planning sprints without the ceremony.'],
  [siOpengl, 'Graphics fundamentals, still useful.'],
  [siMiro, 'Workshops, journey maps and sticky notes.'],
]

export function initOrbit(root, { onTool, finePointer }) {
  const stage = root.querySelector('.orbit__stage')
  const wire = document.createElement('canvas')
  wire.className = 'orbit__wire'
  root.prepend(wire)
  const ctx = wire.getContext('2d')

  const items = TOOLS.map(([icon, use], i) => {
    const el = document.createElement('button')
    el.className = 'orbit__item'
    el.setAttribute('aria-label', icon.title)
    el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icon.path}"/></svg>`
    stage.appendChild(el)
    const n = TOOLS.length
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = Math.PI * (3 - Math.sqrt(5)) * i
    const item = { el, icon, use, p: [Math.cos(th) * r, y, Math.sin(th) * r], hover: false }
    el.addEventListener('pointerenter', () => { item.hover = true; onTool?.(icon.title, use) })
    el.addEventListener('pointerleave', () => { item.hover = false })
    el.addEventListener('focus', () => onTool?.(icon.title, use))
    return item
  })

  let ax = -0.35, ay = 0, vx = 0, vy = 0.004
  let drag = null
  let R = 200, W = 0, H = 0, dpr = 1
  const resize = () => {
    const r = root.getBoundingClientRect()
    W = r.width; H = r.height
    R = Math.min(W, H) * 0.38
    dpr = Math.min(devicePixelRatio, 2)
    wire.width = W * dpr; wire.height = H * dpr
    wire.style.width = W + 'px'; wire.style.height = H + 'px'
  }
  resize()
  window.addEventListener('resize', resize)

  root.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; root.setPointerCapture?.(e.pointerId) })
  root.addEventListener('pointermove', (e) => {
    if (!drag) return
    vy = (e.clientX - drag.x) * 0.006
    vx = -(e.clientY - drag.y) * 0.006
    drag = { x: e.clientX, y: e.clientY }
  })
  const up = () => (drag = null)
  root.addEventListener('pointerup', up)
  root.addEventListener('pointercancel', up)

  const rot = (p) => {
    // rotate around Y then X
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax)
    const x1 = p[0] * cy + p[2] * sy
    const z1 = -p[0] * sy + p[2] * cy
    const y2 = p[1] * cx - z1 * sx
    const z2 = p[1] * sx + z1 * cx
    return [x1, y2, z2]
  }
  const F = 3.2 // perspective (in radii)
  const project = (q) => {
    const s = F / (F - q[2])
    return [W / 2 + q[0] * R * s, H / 2 - q[1] * R * s, s, q[2]]
  }

  let visible = false
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(root)

  return function update() {
    if (!visible) return
    ay += vy
    ax += vx
    if (!drag) {
      vy += (0.0035 - vy) * 0.02
      vx *= 0.94
      ax += (-0.35 - ax) * 0.01
    }

    // wireframe globe
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.lineWidth = 1
    const drawLine = (pts) => {
      for (let k = 1; k < pts.length; k++) {
        const a = pts[k - 1], b = pts[k]
        const front = (a[3] + b[3]) / 2
        ctx.strokeStyle = `rgba(18,18,18,${0.05 + Math.max(0, front) * 0.12})`
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke()
      }
    }
    for (let m = 0; m < 12; m++) {
      const lon = (m / 12) * Math.PI
      const pts = []
      for (let k = 0; k <= 48; k++) {
        const lat = (k / 48) * Math.PI * 2
        pts.push(project(rot([Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)])))
      }
      drawLine(pts)
    }
    for (let l = 1; l < 6; l++) {
      const lat = -Math.PI / 2 + (l / 6) * Math.PI
      const pts = []
      for (let k = 0; k <= 64; k++) {
        const lon = (k / 64) * Math.PI * 2
        pts.push(project(rot([Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)])))
      }
      drawLine(pts)
    }

    // logos
    for (const it of items) {
      const q = rot(it.p)
      const [x, y, s, z] = project(q)
      const front = z * 0.5 + 0.5
      const scale = s * (0.7 + front * 0.5) * (it.hover ? 1.35 : 1)
      it.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
      it.el.style.opacity = (0.18 + front * 0.82).toFixed(3)
      it.el.style.zIndex = String(Math.round(front * 100))
      it.el.style.pointerEvents = front > 0.45 ? 'auto' : 'none'
    }
  }
}
