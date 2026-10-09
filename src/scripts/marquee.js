import { tickers, vel, watchVisible, reduced, $ } from './core.js'

/* Endless row that speeds up and leans into the scroll direction. */
export function makeMarquee(root, { speed = 60, dir = 1, lean = 8 } = {}) {
  const row = $('.marquee__row, .words__marq', root) || root.firstElementChild
  const base = row.innerHTML
  // enough copies to cover the viewport twice, then loop by one copy's width
  row.innerHTML = base + base
  const w1 = () => row.scrollWidth / 2
  let n = 2
  const fill = () => { while (row.scrollWidth < innerWidth * 2 + w1() && n < 12) { row.insertAdjacentHTML('beforeend', base); n++ } }
  fill()
  row.style.willChange = 'transform'
  let x = 0
  const vis = watchVisible(root, null, '200px')
  const copyW = () => row.scrollWidth / n
  if (reduced) return
  tickers.add((dt) => {
    if (!vis.on) return
    x -= dir * (speed + vel.v * 900) * dt
    const cw = copyW()
    x = ((x % cw) - cw) % cw
    row.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${(-vel.v * lean * dir).toFixed(2)}deg)`
  })
}
