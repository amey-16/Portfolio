import { useState, useEffect, useRef } from 'react'
import { m } from 'motion/react'
import { MotionRoot, Arrow, useQuietMotion } from './shared'

const stages = [
  ['Build', 'Turn the implementation into a reproducible artifact.'],
  ['Test', 'Check behavior, edge cases and the critical user journey.'],
  ['Review', 'See the complete product in a preview environment.'],
  ['Release', 'Ship with visibility and a way back if something goes wrong.'],
]
function Release() {
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)
  const timers = useRef([])
  const quiet = useQuietMotion()
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  function run() {
    timers.current.forEach(clearTimeout); setRunning(true); setStep(0)
    if (quiet) { setStep(3); setRunning(false); return }
    timers.current = [1, 2, 3].map(i => setTimeout(() => setStep(i), i * 800))
    timers.current.push(setTimeout(() => setRunning(false), 2600))
  }
  return <div className="release-lab"><div className="release-visual" aria-hidden="true"><div className="release-conveyor"/><div className="release-stations">{stages.map(([label]) => <span key={label}/>)}</div><m.div className="release-artifact" animate={{ left: `${12.5 + Math.max(0, step) * 25}%`, x: '-50%', rotateY: running ? -15 : 0, rotateZ: running ? -5 : 0 }} transition={{ duration: quiet ? 0 : .7, ease: [.65, 0, .35, 1] }}><svg viewBox="0 0 48 48"><path d={step === 3 ? 'm10 25 9 9 20-22' : step === 2 ? 'M8 12h32v24H8zM8 19h32M18 25h14m-14 5h9' : step === 1 ? 'm16 14-9 10 9 10m16-20 9 10-9 10m-5-22-6 24' : 'm24 5 17 10v18L24 43 7 33V15Zm0 20v18M7 15l17 10 17-10'}/></svg></m.div><span className="release-label">ONE ARTIFACT. FOUR CHECKPOINTS.</span></div><div className="release-track">{stages.map(([label, text], i) => <div className={`release-step ${step >= i ? 'is-complete' : ''}`} key={label}><div className="release-step-top"><span className="release-number">{String(i + 1).padStart(2, '0')}</span><m.span className="release-mark" animate={{ rotate: step >= i ? 0 : -45, scale: step === i ? 1.16 : 1 }} transition={{ type: 'spring', stiffness: 170, damping: 15 }} aria-hidden="true">{step >= i ? <svg viewBox="0 0 24 24"><path d="m4 12 5 5L20 6" /></svg> : <svg viewBox="0 0 24 24"><path d="M12 4v16M4 12h16" /></svg>}</m.span></div><h3>{label}</h3><p>{text}</p><div className="release-progress"><m.i animate={{ scaleX: step >= i ? 1 : 0 }} transition={{ duration: quiet ? 0 : .65 }} /></div></div>)}</div><div className="release-control"><button className="solid-link" onClick={run} disabled={running}>{running ? 'Moving through the checks' : step === 3 ? 'Replay the release' : 'Run the release'}<Arrow direction="right" /></button><p role="status">{step < 0 ? 'An interactive walkthrough of a careful release.' : running ? `${stages[step][0]}: ${stages[step][1]}` : 'Release complete. This is a simulation; no software was deployed.'}</p></div></div>
}
export default function ReleaseLab() { return <MotionRoot><Release /></MotionRoot> }
