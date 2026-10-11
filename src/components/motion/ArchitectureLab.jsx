import { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { MotionRoot, Arrow, useQuietMotion } from './shared'

const layers = [
  { title: 'Start with a person.', label: 'Understand', heading: 'A useful action, not another feature.', text: 'Who is this for? What are they trying to get done? The first architecture decision is understanding the journey.', nodes: ['A person', 'A problem', 'A useful outcome'], detail: 'Define the job. Map the journey. Agree on what good looks like.' },
  { title: 'Give the idea structure.', label: 'Structure', heading: 'Clear boundaries. Connected thinking.', text: 'Separate the interface, application logic and data. Connect the pieces through small, explicit contracts.', nodes: ['Interface', 'Application API', 'Data & services'], detail: 'A change to one layer should not become a rewrite of everything.' },
  { title: 'Make the connections work.', label: 'Build', heading: 'One request. A complete journey.', text: 'A request travels from the screen through validation and business logic to the data it needs, then back to the user.', nodes: ['User action', 'Validate & execute', 'Read / write data'], detail: 'Trace the request to see the boundaries in action.' },
  { title: 'Design for the real world.', label: 'Validate', heading: 'Failure is part of the architecture.', text: 'Consider slow networks, invalid inputs and unavailable services. Build visible feedback and recovery into the experience.', nodes: ['Useful feedback', 'Error boundary', 'Retry & recover'], detail: 'Test the edges. Measure the result. Make recovery understandable.' },
]

function Lab() {
  const [active, setActive] = useState(1)
  const [run, setRun] = useState(0)
  const [tracing, setTracing] = useState(false)
  const [result, setResult] = useState('Select a stage to explore the thinking behind a system.')
  const timer = useRef(null)
  const quiet = useQuietMotion()
  useEffect(() => () => clearTimeout(timer.current), [])
  const current = layers[active]
  function select(i) { clearTimeout(timer.current); setActive(i); setTracing(false); setResult(layers[i].detail) }
  function trace() {
    clearTimeout(timer.current); setRun(v => v + 1); setTracing(true)
    setResult('Request: interface → application → data → response.')
    timer.current = setTimeout(() => { setTracing(false); setResult('Response returned. Each layer has one clear responsibility.') }, quiet ? 0 : 2600)
  }
  return <div className="architecture-lab">
    <div className="architecture-tabs" role="group" aria-label="Architecture stages">{layers.map((l, i) => <button key={l.label} aria-pressed={i === active} onClick={() => select(i)}><span>{String(i + 1).padStart(2, '0')}</span>{l.label}<span className="stage-dot" /></button>)}</div>
    <div className="architecture-stage">
      <div className="system-diagram" aria-label={current.nodes.join(' connects to ')}>
        <div className="diagram-caption"><span>A product, from the inside.</span><span>Interactive architecture study</span></div>
        <svg className="system-paths" viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden="true"><path d="M140 150H660" /><path d="M140 180V245H660V180" className="return-path" />{tracing && <m.circle key={run} r="7" fill="var(--coral)" initial={{ cx: 140, cy: 150 }} animate={{ cx: [140, 400, 660, 660, 140, 140], cy: [150, 150, 150, 245, 245, 180] }} transition={{ duration: quiet ? 0 : 2.5, ease: 'linear' }} />}</svg>
        {current.nodes.map((node, i) => <m.div className={`system-node system-node-${i}`} key={i} layout transition={{ type: 'spring', stiffness: 160, damping: 22 }} animate={{ y: active === 0 ? [0, -8, 0][i] : 0 }}><div className="node-symbol" aria-hidden="true">{i === 0 ? <svg viewBox="0 0 80 64"><rect x="8" y="7" width="64" height="43" rx="3" /><path d="M8 18h64M28 58h24M40 50v8" /><path d="M16 12h2m5 0h2" /></svg> : i === 1 ? <svg viewBox="0 0 80 64"><path d="m40 4 31 17-31 17L9 21 40 4Zm-31 29 31 17 31-17M9 45l31 17 31-17" /></svg> : <svg viewBox="0 0 80 64"><ellipse cx="40" cy="12" rx="26" ry="9" /><path d="M14 12v39c0 12 52 12 52 0V12M14 31c0 12 52 12 52 0" /></svg>}</div><AnimatePresence mode="wait"><m.span key={node} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}>{node}</m.span></AnimatePresence><small>{['Experience', 'Logic', 'Foundation'][i]}</small></m.div>)}
        <span className="response-caption">A clear path back to the person.</span>
      </div>
      <div className="architecture-explanation"><AnimatePresence mode="wait"><m.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: quiet ? 0 : .22 }}><h3>{current.heading}</h3><p>{current.text}</p></m.div></AnimatePresence><button className="solid-link" onClick={trace} disabled={tracing}>{tracing ? 'Following the request' : 'Trace a request'}<Arrow direction="right" /></button><p className="diagram-status" role="status">{result}</p></div>
    </div>
  </div>
}
export default function ArchitectureLab() { return <MotionRoot><Lab /></MotionRoot> }
