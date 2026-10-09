/*
  Experience as a survey map. A wide topographic sheet (contours computed
  with marching squares) pans like a drone following the route. The route
  is plotted as you scroll, a cobalt marker leaves a comet trail, stops are
  surveyed pins with callouts, and a mini-map tracks the viewport.
*/

// smooth value noise
function makeNoise(seed = 3) {
  const p = new Uint8Array(512)
  let s = seed
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const perm = [...Array(256).keys()].sort(() => rnd() - 0.5)
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255]
  const fade = (t) => t * t * (3 - 2 * t)
  const h = (x, y) => p[(p[x & 255] + y) & 255] / 255
  const n = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1)
    const u = fade(xf), v = fade(yf)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }
  return (x, y) => n(x, y) * 0.55 + n(x * 2.1, y * 2.1) * 0.28 + n(x * 4.3, y * 4.3) * 0.17
}

export function initRoute(root) {
  const map = root.querySelector('.map')
  const world = root.querySelector('.map__world')
  const terrain = root.querySelector('.map__terrain')
  const svg = root.querySelector('.route__svg')
  const ghost = root.querySelector('.route__ghost')
  const line = root.querySelector('.route__line')
  const trail = root.querySelector('.route__trail')
  const car = root.querySelector('.route__car')
  const stops = [...root.querySelectorAll('.stop')]
  const mini = root.querySelector('.map__mini svg')
  const miniRoute = root.querySelector('.mini__route')
  const miniView = root.querySelector('.mini__view')
  const hud = { km: root.querySelector('.exp__km'), brg: root.querySelector('.exp__brg'), grid: root.querySelector('.exp__grid') }
  const noise = makeNoise(11)

  let VW = 0, VH = 0, WW = 0, L = 1, progress = 0, vertical = false

  const drawTerrain = () => {
    const dpr = Math.min(devicePixelRatio, 1.5)
    terrain.width = WW * dpr; terrain.height = VH * dpr
    terrain.style.width = WW + 'px'; terrain.style.height = VH + 'px'
    const ctx = terrain.getContext('2d')
    ctx.scale(dpr, dpr)
    // survey grid
    const g = 160
    ctx.strokeStyle = 'rgba(18,18,18,0.06)'
    ctx.lineWidth = 1
    for (let x = 0; x < WW; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VH); ctx.stroke() }
    for (let y = 0; y < VH; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WW, y); ctx.stroke() }
    ctx.font = '500 10px "Geist Mono", monospace'
    ctx.fillStyle = 'rgba(18,18,18,0.35)'
    for (let x = 0, c = 0; x < WW; x += g, c++) ctx.fillText(String.fromCharCode(65 + (c % 26)), x + 6, 14)
    for (let y = g, r = 1; y < VH; y += g, r++) ctx.fillText(String(r), 6, y - 6)

    // contours via marching squares
    const cell = 7
    const cols = Math.ceil(WW / cell) + 1, rows = Math.ceil(VH / cell) + 1
    const f = new Float32Array(cols * rows)
    const sc = 1 / 420
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) f[j * cols + i] = noise(i * cell * sc, j * cell * sc + 7.3)
    const levels = 16
    for (let l = 1; l < levels; l++) {
      const iso = 0.22 + (l / levels) * 0.6
      const major = l % 4 === 0
      ctx.strokeStyle = major ? 'rgba(18,18,18,0.22)' : 'rgba(18,18,18,0.09)'
      ctx.lineWidth = major ? 1.1 : 0.8
      ctx.beginPath()
      for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
        const a = f[j * cols + i], b = f[j * cols + i + 1], c = f[(j + 1) * cols + i + 1], d = f[(j + 1) * cols + i]
        const code = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0)
        if (code === 0 || code === 15) continue
        const x = i * cell, y = j * cell
        const lerp = (p, q) => (iso - p) / (q - p)
        const T = [x + cell * lerp(a, b), y], Rr = [x + cell, y + cell * lerp(b, c)]
        const B = [x + cell * lerp(d, c), y + cell], Lf = [x, y + cell * lerp(a, d)]
        const segs = {
          1: [Lf, B], 2: [B, Rr], 3: [Lf, Rr], 4: [T, Rr], 5: [Lf, T, B, Rr], 6: [T, B], 7: [Lf, T],
          8: [Lf, T], 9: [T, B], 10: [T, Rr, Lf, B], 11: [T, Rr], 12: [Lf, Rr], 13: [B, Rr], 14: [Lf, B],
        }[code]
        for (let k = 0; k < segs.length; k += 2) { ctx.moveTo(segs[k][0], segs[k][1]); ctx.lineTo(segs[k + 1][0], segs[k + 1][1]) }
      }
      ctx.stroke()
    }
    // a few spot heights
    ctx.fillStyle = 'rgba(18,18,18,0.45)'
    for (let k = 0; k < 14; k++) {
      const x = ((k * 397) % 1000) / 1000 * WW, y = 40 + ((k * 613) % 1000) / 1000 * (VH - 80)
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3)
      ctx.fillText(`${Math.round(noise(x * sc, y * sc + 7.3) * 2400)}`, x + 5, y + 3)
    }
  }

  const build = () => {
    VW = map.clientWidth
    VH = map.clientHeight
    vertical = VW < 720
    WW = vertical ? VW : Math.max(VW * 2.4, 2200)
    world.style.width = WW + 'px'
    world.style.height = VH + 'px'
    svg.setAttribute('viewBox', `0 0 ${WW} ${VH}`)
    svg.style.width = WW + 'px'
    drawTerrain()

    let d
    if (!vertical) {
      // catmull-rom through waypoints → cubic beziers
      const wp = [[0, 0.74], [0.08, 0.66], [0.14, 0.7], [0.24, 0.82], [0.34, 0.74], [0.4, 0.66], [0.5, 0.56], [0.6, 0.62], [0.66, 0.68], [0.76, 0.58], [0.86, 0.54], [0.92, 0.62], [1, 0.58]]
        .map(([x, y]) => [x * WW, y * VH])
      d = `M ${wp[0][0]} ${wp[0][1]}`
      for (let i = 0; i < wp.length - 1; i++) {
        const p0 = wp[i - 1] || wp[i], p1 = wp[i], p2 = wp[i + 1], p3 = wp[i + 2] || p2
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
        d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`
      }
    } else {
      const x = 30
      d = `M ${x} 0 C ${x + 18} ${VH * 0.15}, ${x - 18} ${VH * 0.3}, ${x} ${VH * 0.45} S ${x + 18} ${VH * 0.75}, ${x} ${VH}`
    }
    ghost.setAttribute('d', d)
    line.setAttribute('d', d)
    trail.setAttribute('d', d)
    L = line.getTotalLength()
    line.style.strokeDasharray = `${L}`
    stops.forEach((s, i) => {
      const p = line.getPointAtLength(L * parseFloat(s.dataset.at))
      s.style.left = `${p.x}px`
      s.style.top = `${p.y}px`
      s.classList.toggle('stop--below', false)
    })
    mini.setAttribute('viewBox', `0 0 ${WW} ${VH}`)
    miniRoute.setAttribute('d', d)
    set(progress)
  }

  const set = (p) => {
    progress = p
    line.style.strokeDashoffset = `${L * (1 - p)}`
    const at = L * p
    const tl = Math.min(at, 160)
    trail.style.strokeDasharray = `${tl} ${L * 2}`
    trail.style.strokeDashoffset = `${-(at - tl)}`
    const pt = line.getPointAtLength(at)
    const ahead = line.getPointAtLength(Math.min(L, at + 2))
    const ang = Math.atan2(ahead.y - pt.y, ahead.x - pt.x)
    car.style.transform = `translate(${pt.x}px, ${pt.y}px) rotate(${ang}rad)`
    stops.forEach((s) => s.classList.toggle('is-on', p >= parseFloat(s.dataset.at) - 0.005))

    // drone pan: keep the marker ~42% from the left
    const pan = vertical ? 0 : Math.min(Math.max(pt.x - VW * 0.42, 0), WW - VW)
    world.style.transform = `translate3d(${-pan}px,0,0)`
    miniView.setAttribute('x', pan); miniView.setAttribute('y', 0)
    miniView.setAttribute('width', VW); miniView.setAttribute('height', VH)

    hud.km.textContent = (p * 7).toFixed(1)
    hud.brg.textContent = String(Math.round(((ang * 180) / Math.PI + 450) % 360)).padStart(3, '0') + '°'
    hud.grid.textContent = String.fromCharCode(65 + Math.floor(pt.x / 160) % 26) + (Math.floor(pt.y / 160) + 1)
  }

  build()
  let t
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 200) })
  return { set }
}
