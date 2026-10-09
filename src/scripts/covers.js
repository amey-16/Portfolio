// Local project schematics, shared by the gallery and project details.
// These are diagrams of each project's focus, rather than product screenshots.
const W = 1600, H = 1000
const INK = '#0e0e0d', BONE = '#ece9e1', ACC = '#ff4b26'
const DISPLAY = '"Anton", sans-serif', MONO = '"Geist Mono", monospace'
const SANS = 'Geist, system-ui, sans-serif'

function text(c, value, x, y, size, color = BONE, font = MONO) {
  c.fillStyle = color; c.font = `400 ${size}px ${font}`; c.fillText(value, x, y)
}
function panel(c, x, y, w, h, title, detail, accent = ACC) {
  c.fillStyle = '#171c23'; c.beginPath(); c.roundRect(x, y, w, h, 16); c.fill()
  c.strokeStyle = '#485563'; c.lineWidth = 2; c.stroke()
  c.fillStyle = accent; c.fillRect(x + 24, y + 24, 8, 8)
  text(c, title, x + 24, y + 78, 30, BONE, SANS)
  text(c, detail, x + 24, y + 124, 19, '#c0cbd4')
}
function link(c, ax, ay, bx, by, color = ACC) {
  c.strokeStyle = color; c.lineWidth = 4; c.beginPath()
  c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke()
  const angle = Math.atan2(by - ay, bx - ax)
  c.beginPath(); c.moveTo(bx, by); c.lineTo(bx - 15 * Math.cos(angle - 0.5), by - 15 * Math.sin(angle - 0.5)); c.moveTo(bx, by); c.lineTo(bx - 15 * Math.cos(angle + 0.5), by - 15 * Math.sin(angle + 0.5)); c.stroke()
}
function base(c, title, focus, color) {
  c.fillStyle = INK; c.fillRect(0, 0, W, H)
  text(c, 'AMEY SHELAR / PROJECT SCHEMATIC', 70, 78, 20, '#b7bfc8')
  text(c, title, 70, 205, 100, color, DISPLAY)
  text(c, focus, 74, 270, 26, BONE, SANS)
  c.strokeStyle = '#485563'; c.lineWidth = 1; c.beginPath(); c.moveTo(70, 870); c.lineTo(1530, 870); c.stroke()
}
const covers = [
  (c) => {
    base(c, 'VPN TUNNELING', 'Network monitoring / React.js / REST APIs', '#c6dcf3')
    panel(c, 90, 410, 360, 180, 'VPN tunnels', 'IKE + Child SAs', '#c6dcf3')
    panel(c, 620, 410, 360, 180, 'REST APIs', 'Real-time network data', '#c6dcf3')
    panel(c, 1150, 410, 360, 180, 'Dashboard', 'Charts + tables', '#c6dcf3')
    link(c, 450, 500, 620, 500, '#c6dcf3'); link(c, 980, 500, 1150, 500, '#c6dcf3')
    text(c, 'OBSERVE', 90, 720, 44, '#c6dcf3', DISPLAY)
    text(c, 'Structure tunnel data. Make network information readable.', 90, 774, 26, BONE, SANS)
    text(c, 'VPN TUNNELING DASHBOARD', 70, 936, 22, '#c6dcf3')
  },
  (c) => {
    base(c, 'JATAYU', 'Autonomous UAV / Computer vision / Hardware integration', '#dce4ca')
    panel(c, 90, 400, 350, 170, 'Stereo vision', 'Depth estimation', '#dce4ca')
    panel(c, 625, 400, 350, 170, 'NanoDet + OpenCV', 'Human detection', '#dce4ca')
    panel(c, 1160, 400, 350, 170, 'MAVLink', 'Navigation + control', '#dce4ca')
    link(c, 440, 485, 625, 485, '#dce4ca'); link(c, 975, 485, 1160, 485, '#dce4ca')
    text(c, 'DETECT / TRACK / NAVIGATE', 90, 720, 46, '#dce4ca', DISPLAY)
    text(c, 'Python + Flask + Raspberry Pi', 90, 774, 26, BONE, SANS)
    text(c, 'JATAYU AUTONOMOUS UAV', 70, 936, 22, '#dce4ca')
  },
  (c) => {
    base(c, 'RETAIL OPTIMIZATION', 'Full-stack platform / Analytics / Inventory tracking', '#d9d8f0')
    panel(c, 90, 410, 360, 180, 'React.js', 'Retail interface', '#d9d8f0')
    panel(c, 620, 410, 360, 180, 'Node + Express', 'Application backend', '#d9d8f0')
    panel(c, 1150, 410, 360, 180, 'Supabase', 'Application data', '#d9d8f0')
    link(c, 450, 500, 620, 500, '#d9d8f0'); link(c, 980, 500, 1150, 500, '#d9d8f0')
    text(c, 'ANALYTICS / INVENTORY', 90, 720, 46, '#d9d8f0', DISPLAY)
    text(c, 'Project stack also includes YOLO, OpenCV and Stripe.', 90, 774, 26, BONE, SANS)
    text(c, 'RETAIL OPTIMIZATION PLATFORM', 70, 936, 22, '#d9d8f0')
  },
]
const cache = []
export function cover(i) {
  if (cache[i]) return cache[i]
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H
  covers[i % covers.length](cv.getContext('2d')); cache[i] = cv
  return cv
}
export function redrawCovers() {
  covers.forEach((draw, i) => { const cv = cover(i); draw(cv.getContext('2d')) })
}
export const COVER_COUNT = covers.length
export const COVER_ASPECT = W / H
