// Procedural interface "layers" for the hero scene. Each one is drawn with the
// 2D canvas API at load time, so the scene needs no image files. They stand for
// the layers of a product: structure, interface, logic, data, intelligence, result.

const W = 1024, H = 640
const INK = '#001219', PAPER = '#E9F2EE', ACC = '#0A9396', CY = '#BB3E03'
const MONO = '500 17px "Geist Mono Variable", ui-monospace, monospace'
const SERIF = '"Instrument Serif", "Bodoni Moda", Georgia, serif'

function make() {
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  return [c, c.getContext('2d')]
}
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r) }
function dots(g, x, y, col) { [0, 1, 2].forEach((i) => { g.fillStyle = col; g.beginPath(); g.arc(x + i * 18, y, 5, 0, 7); g.fill() }) }
function frame(g, dark, glass) {
  rr(g, 2, 2, W - 4, H - 4, 26)
  g.fillStyle = dark ? '#00202B' : glass ? 'rgba(246,251,248,.72)' : '#F4F9F6'
  g.fill()
  g.lineWidth = 3
  g.strokeStyle = dark ? 'rgba(148,210,189,.4)' : 'rgba(0,18,25,.22)'
  g.stroke()
}

// 0 — code, the logic layer
function code() {
  const [c, g] = make(); frame(g, true)
  dots(g, 44, 44, 'rgba(234,244,241,.35)')
  g.font = MONO
  const lines = [
    ['#8B8782', 'async def '], [ACC, 'resolve'], ['#EAF4F1', '(signal):'],
  ]
  const rows = [
    [[ACC, 'from '], ['#EAF4F1', 'pipeline '], [ACC, 'import '], ['#EAF4F1', 'clean, model']],
    [],
    [['#8B8782', '@app.post("/predict")']],
    [[ACC, 'async def '], ['#EAF4F1', 'predict(frame):']],
    [['#8B8782', '    # noise in'], ],
    [['#EAF4F1', '    x = clean(frame)']],
    [['#EAF4F1', '    boxes = '], [ACC, 'await '], ['#EAF4F1', 'model(x)']],
    [['#EAF4F1', '    return {'], [ACC, '"signal"'], ['#EAF4F1', ': boxes}']],
    [],
    [[ACC, 'export const '], ['#EAF4F1', 'useTunnels = () =>']],
    [['#EAF4F1', '  useSWR('], [ACC, '"/api/tunnels"'], ['#EAF4F1', ')']],
  ]
  g.textBaseline = 'middle'
  rows.forEach((row, i) => {
    let x = 90
    g.fillStyle = 'rgba(234,244,241,.22)'; g.fillText(String(i + 1).padStart(2, '0'), 44, 110 + i * 40)
    row.forEach(([col, t]) => { g.fillStyle = col; g.fillText(t, x, 110 + i * 40); x += g.measureText(t).width })
  })
  void lines
  return c
}

// 1 — wireframe interface, the front layer
function wire() {
  const [c, g] = make(); frame(g, false, true)
  g.strokeStyle = 'rgba(0,18,25,.55)'; g.lineWidth = 3
  rr(g, 40, 40, W - 80, 64, 14); g.stroke()
  g.fillStyle = INK; g.beginPath(); g.arc(78, 72, 9, 0, 7); g.fill()
  ;[420, 520, 620, 720].forEach((x) => { g.fillStyle = 'rgba(0,18,25,.35)'; rr(g, x, 66, 70, 12, 6); g.fill() })
  g.fillStyle = ACC; rr(g, W - 190, 54, 110, 36, 18); g.fill()
  g.strokeStyle = 'rgba(0,18,25,.5)'
  rr(g, 40, 130, 250, 470, 16); g.stroke()
  for (let i = 0; i < 6; i++) { g.fillStyle = i === 1 ? 'rgba(10,147,150,.9)' : 'rgba(0,18,25,.25)'; rr(g, 64, 160 + i * 62, 170 - (i % 3) * 24, 14, 7); g.fill() }
  for (let i = 0; i < 3; i++) {
    rr(g, 320 + i * 224, 130, 204, 140, 16); g.stroke()
    g.fillStyle = 'rgba(0,18,25,.3)'; rr(g, 340 + i * 224, 154, 90, 12, 6); g.fill()
    g.fillStyle = INK; g.font = `400 54px ${SERIF}`; g.fillText(['98', '12k', '3.2'][i], 340 + i * 224, 226)
  }
  rr(g, 320, 296, 664, 304, 16); g.stroke()
  g.beginPath(); g.moveTo(350, 560)
  ;[[420, 500], [500, 530], [580, 430], [660, 460], [740, 380], [820, 400], [900, 340], [960, 320]].forEach(([x, y]) => g.lineTo(x, y))
  g.strokeStyle = INK; g.lineWidth = 4; g.stroke()
  return c
}

// 2 — dashboard
function dash() {
  const [c, g] = make(); frame(g, false, true)
  g.fillStyle = 'rgba(0,18,25,.4)'; g.font = MONO; g.fillText('TUNNEL STATUS · LIVE', 48, 66)
  for (let i = 0; i < 18; i++) {
    const h = 90 + Math.abs(Math.sin(i * 1.3) * 190) + (i % 5) * 14
    g.fillStyle = i === 11 ? CY : i % 3 === 0 ? ACC : 'rgba(0,18,25,.7)'
    rr(g, 60 + i * 50, 560 - h, 30, h, 6); g.fill()
  }
  g.strokeStyle = 'rgba(0,18,25,.2)'; g.lineWidth = 2
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(48, 140 + i * 105); g.lineTo(W - 48, 140 + i * 105); g.stroke() }
  g.fillStyle = INK; g.font = `400 84px ${SERIF}`; g.fillText('99.4%', 48, 150)
  return c
}

// 3 — request log, the data layer
function logs() {
  const [c, g] = make(); frame(g, true)
  dots(g, 44, 44, 'rgba(234,244,241,.35)')
  g.font = MONO; g.textBaseline = 'middle'
  const st = [['200', '#7CF2D0'], ['200', '#7CF2D0'], ['201', '#7CF2D0'], ['429', CY], ['200', '#7CF2D0'], ['500', ACC], ['200', '#7CF2D0'], ['200', '#7CF2D0'], ['204', '#7CF2D0']]
  st.forEach(([code2, col], i) => {
    const y = 112 + i * 56
    g.fillStyle = 'rgba(234,244,241,.06)'; if (i % 2) { rr(g, 28, y - 24, W - 56, 48, 8); g.fill() }
    g.fillStyle = col; g.fillText(code2, 56, y)
    g.fillStyle = '#EAF4F1'; g.fillText(['GET  /api/tunnels', 'POST /api/predict', 'POST /api/auth', 'GET  /api/stock', 'GET  /api/tunnels', 'POST /api/detect', 'GET  /api/health', 'GET  /api/route', 'PUT  /api/config'][i], 150, y)
    g.fillStyle = 'rgba(234,244,241,.4)'; g.fillText(`${(12 + i * 7) % 90 + 8}ms`, W - 140, y)
  })
  return c
}

// 4 — a small network, the intelligence layer
function net() {
  const [c, g] = make(); frame(g, false, true)
  const cols = [4, 6, 6, 3], xs = [150, 380, 640, 880]
  const pts = cols.map((n, ci) => Array.from({ length: n }, (_, i) => [xs[ci], 320 + (i - (n - 1) / 2) * 76]))
  g.lineWidth = 2
  for (let a = 0; a < pts.length - 1; a++) pts[a].forEach((p, i) => pts[a + 1].forEach((q, j) => {
    g.strokeStyle = (i + j * 2 + a) % 7 === 0 ? 'rgba(10,147,150,.8)' : 'rgba(0,18,25,.16)'
    g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke()
  }))
  pts.flat().forEach(([x, y], i) => { g.fillStyle = i % 9 === 4 ? ACC : INK; g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill() })
  g.fillStyle = 'rgba(0,18,25,.45)'; g.font = MONO; g.fillText('MODEL · EVALUATION · 0.94 F1', 48, 66)
  return c
}

// 5 — the product: what the stack resolves into
function product() {
  const [c, g] = make(); frame(g, true)
  const gr = g.createLinearGradient(0, 0, W, H)
  gr.addColorStop(0, '#005F73'); gr.addColorStop(1, '#0A9396')
  rr(g, 2, 2, W - 4, H - 4, 26); g.fillStyle = gr; g.fill()
  g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.35)'; g.stroke()
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = MONO; g.textBaseline = 'alphabetic'
  g.fillText('AMEY SHELAR  /  PRODUCT  /  2026', 56, 70)
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(W - 70, 64, 9, 0, 7); g.fill()
  g.fillStyle = '#FFFFFF'; g.font = `400 150px ${SERIF}`
  g.fillText('Built end', 52, 250)
  g.font = `italic 400 150px ${SERIF}`; g.fillStyle = '#E9D8A6'
  g.fillText('to end', 52, 388)
  const rows = ['Interface', 'Services', 'Model']
  rows.forEach((r, i) => {
    const y = 466 + i * 52
    g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(56, y - 36); g.lineTo(W - 56, y - 36); g.stroke()
    g.fillStyle = 'rgba(255,255,255,.7)'; g.font = MONO; g.fillText(`0${i + 1}`, 56, y)
    g.fillStyle = '#FFFFFF'; g.font = `400 34px ${SERIF}`; g.fillText(r, 130, y + 2)
    g.font = MONO; g.fillStyle = '#E9D8A6'; g.fillText('shipped', W - 150, y)
  })
  return c
}

export const panelMakers = [code, wire, dash, logs, net, product]
export const panelKinds = ['dark', 'glass', 'glass', 'dark', 'glass', 'dark']
export const panelAspect = W / H
