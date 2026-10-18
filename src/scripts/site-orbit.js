import {
  siReact, siNextdotjs, siTypescript, siJavascript, siHtml5, siCss, siTailwindcss, siBootstrap,
  siNodedotjs, siExpress, siFastapi, siFlask, siPostman, siStripe,
  siPostgresql, siMongodb, siMysql, siSqlite, siSupabase, siQdrant,
  siPython, siCplusplus, siOpencv, siYolo, siHuggingface, siLangchain, siRaspberrypi,
  siGit, siGithub, siGithubactions, siDocker, siAstro, siGsap,
} from 'simple-icons'

/*
  Tech stack on a wireframe sphere (carried over from the earlier site).
  DOM logos stay crisp and focusable; a canvas draws the meridians with the
  same rotation so the two read as one object. Every tool and note here is
  from Amey's resume, plus the two tools this page is built with.
*/

export const GROUPS = { front: 'Frontend', back: 'Backend', data: 'Data', ai: 'AI / ML', ops: 'Tooling' }

const TOOLS = [
  [siReact, 'front', 'Default for product UI. The VPN dashboard and the retail platform.'],
  [siNextdotjs, 'front', 'React apps that need routing and server rendering from day one.'],
  [siTypescript, 'front', 'Types on the interface and the services behind it.'],
  [siJavascript, 'front', 'The language under every interface I ship.'],
  [siHtml5, 'front', 'Semantic structure first, so the page works before the styling does.'],
  [siCss, 'front', 'Layout and motion, written by hand when it matters.'],
  [siTailwindcss, 'front', 'Quick, consistent UI once a design system is settled.'],
  [siBootstrap, 'front', 'Fast, dependable layouts for internal tools.'],
  [siNodedotjs, 'back', 'APIs and services. The retail platform backend.'],
  [siExpress, 'back', 'Routing and middleware for Node services.'],
  [siFastapi, 'back', 'Typed Python APIs, a natural fit next to ML code.'],
  [siFlask, 'back', 'The application layer on JATAYU, the autonomous UAV.'],
  [siPostman, 'back', 'Testing and documenting every endpoint.'],
  [siStripe, 'back', 'Payments in the retail platform stack.'],
  [siPostgresql, 'data', 'Relational data with real constraints.'],
  [siMongodb, 'data', 'Document storage and aggregation pipelines.'],
  [siMysql, 'data', 'Classic relational workloads.'],
  [siSqlite, 'data', 'Local, embedded data for prototypes and devices.'],
  [siSupabase, 'data', 'Auth and Postgres behind the retail platform.'],
  [siQdrant, 'data', 'Vector search for retrieval and AI features.'],
  [siPython, 'ai', 'Models, data work and the perception pipeline on JATAYU.'],
  [siCplusplus, 'ai', 'Fundamentals, and performance when it counts.'],
  [siOpencv, 'ai', 'Computer vision on JATAYU and the retail analytics workflow.'],
  [siYolo, 'ai', 'Object detection in the retail analytics workflow.'],
  [siHuggingface, 'ai', 'Pretrained models and model evaluation.'],
  [siLangchain, 'ai', 'Wiring language models into real workflows.'],
  [siRaspberrypi, 'ai', 'On-board compute for JATAYU’s hardware integration.'],
  [siGit, 'ops', 'Version control on everything.'],
  [siGithub, 'ops', 'Code, reviews and every project on this page.'],
  [siGithubactions, 'ops', 'CI that runs before anything ships.'],
  [siDocker, 'ops', 'Reproducible environments for services.'],
  [siAstro, 'ops', 'The framework this portfolio is built with.'],
  [siGsap, 'ops', 'Every scroll animation on this page.'],
]

export function initOrbit(root, { onTool, reducedMotion = false }) {
  const stage = root.querySelector('.orbit__stage')
  const wire = document.createElement('canvas')
  wire.className = 'orbit__wire'
  wire.setAttribute('aria-hidden', 'true')
  root.prepend(wire)
  const ctx = wire.getContext('2d')
  let filter = null

  const items = TOOLS.map(([icon, group, use], i) => {
    const el = document.createElement('button')
    el.type = 'button'
    el.className = 'orbit__item'
    el.dataset.group = group
    el.setAttribute('aria-label', `${icon.title}: ${use}`)
    el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icon.path}"/></svg>`
    stage.appendChild(el)
    const n = TOOLS.length
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = Math.PI * (3 - Math.sqrt(5)) * i
    const item = { el, icon, group, use, p: [Math.cos(th) * r, y, Math.sin(th) * r], hover: false }
    const show = () => onTool?.(icon.title, use, GROUPS[group])
    el.addEventListener('pointerenter', () => { item.hover = true; show() })
    el.addEventListener('pointerleave', () => { item.hover = false })
    el.addEventListener('focus', () => { item.hover = true; show() })
    el.addEventListener('blur', () => { item.hover = false })
    el.addEventListener('click', show)
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
  addEventListener('resize', resize)

  root.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.orbit__item')) return
    drag = { x: e.clientX, y: e.clientY }
    root.setPointerCapture?.(e.pointerId)
    root.classList.add('is-dragging')
  })
  root.addEventListener('pointermove', (e) => {
    if (!drag) return
    vy = (e.clientX - drag.x) * 0.006
    vx = -(e.clientY - drag.y) * 0.006
    drag = { x: e.clientX, y: e.clientY }
  })
  const up = () => { drag = null; root.classList.remove('is-dragging') }
  root.addEventListener('pointerup', up)
  root.addEventListener('pointercancel', up)

  const rot = (p) => {
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax)
    const x1 = p[0] * cy + p[2] * sy
    const z1 = -p[0] * sy + p[2] * cy
    return [x1, p[1] * cx - z1 * sx, p[1] * sx + z1 * cx]
  }
  const F = 3.2
  const project = (q) => {
    const s = F / (F - q[2])
    return [W / 2 + q[0] * R * s, H / 2 - q[1] * R * s, s, q[2]]
  }

  let visible = false
  // A fast scroll can deliver several entries in one callback; only the newest says where the globe is now.
  new IntersectionObserver((entries) => (visible = entries[entries.length - 1].isIntersecting)).observe(root)

  function update() {
    if (!visible) return
    if (!reducedMotion || drag) { ay += vy; ax += vx }
    if (!drag && !reducedMotion) {
      vy += (0.0032 - vy) * 0.02
      vx *= 0.94
      ax += (-0.35 - ax) * 0.01
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.lineWidth = 1
    const drawLine = (pts) => {
      for (let k = 1; k < pts.length; k++) {
        const a = pts[k - 1], b = pts[k]
        const front = (a[3] + b[3]) / 2
        ctx.strokeStyle = `rgba(247,243,233,${0.1 + Math.max(0, front) * 0.22})`
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

    for (const it of items) {
      const [x, y, s, z] = project(rot(it.p))
      const front = z * 0.5 + 0.5
      const picked = !filter || it.group === filter
      const scale = s * (0.7 + front * 0.5) * (it.hover ? 1.32 : 1) * (filter && picked ? 1.12 : 1)
      it.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
      it.el.style.opacity = ((0.16 + front * 0.84) * (picked ? 1 : 0.18)).toFixed(3)
      it.el.style.zIndex = String(Math.round(front * 100))
      it.el.style.pointerEvents = front > 0.45 ? 'auto' : 'none'
      it.el.classList.toggle('is-picked', !!filter && picked)
    }
  }

  return {
    update,
    setFilter(g) { filter = g || null },
  }
}
