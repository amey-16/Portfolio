import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { MotionRoot, Arrow, useQuietMotion } from './shared'

const examples = [
  { title: 'A product that holds together.', type: 'Full-stack systems', description: 'A usable interface is the beginning. Permissions, data models and clear APIs make it a dependable product.', tags: ['Interface', 'API contracts', 'Data modelling'] },
  { title: 'Answers with something behind them.', type: 'Applied AI', description: 'Useful AI needs context and boundaries. Explore how a question retrieves a relevant source before an answer is composed.', tags: ['Retrieval', 'Source context', 'Evaluation'] },
  { title: 'Less handover. More flow.', type: 'Workflow automation', description: 'Connect the tools a team already uses. Make repeatable work observable, and keep people in control of consequential decisions.', tags: ['Events', 'Integrations', 'Human review'] },
]
const knowledge = [
  { question: 'How are releases checked?', source: 'Release guide · Testing', text: 'Changes pass automated checks and a preview review before production. A rollback path is prepared before the release.' },
  { question: 'What happens when a service fails?', source: 'Operations guide · Recovery', text: 'Use a bounded retry for transient failures. Keep the user informed, record the failure and provide a manual recovery path.' },
  { question: 'When should we use AI?', source: 'Product notes · AI decisions', text: 'Use AI when the task benefits from interpreting unstructured information. Prefer deterministic rules when the outcome needs to be exact.' },
]
function Playground() {
  const [active, setActive] = useState(0)
  const [view, setView] = useState('interface')
  const [question, setQuestion] = useState(0)
  const [answer, setAnswer] = useState(false)
  const [busy, setBusy] = useState(false)
  const [approved, setApproved] = useState(false)
  const quiet = useQuietMotion()
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  function ask() { clearTimeout(timer.current); setBusy(true); setAnswer(false); timer.current = setTimeout(() => { setBusy(false); setAnswer(true) }, quiet ? 0 : 650) }
  return <div className="engineering-playground">
    <div className="playground-select" role="group" aria-label="Engineering examples">{examples.map((example, i) => <button key={example.type} aria-pressed={active === i} onClick={() => { clearTimeout(timer.current); setBusy(false); setActive(i) }}><span>{example.type}</span><Arrow direction="right" /></button>)}</div>
    <div className={`playground-body example-${active}`}>
      <div className="playground-copy"><h3>{examples[active].title}</h3><span className="example-label">Interactive example</span><p>{examples[active].description}</p><ul className="inline-tags">{examples[active].tags.map(t => <li key={t}>{t}</li>)}</ul><a className="text-link" href="#contact">Build something like this <Arrow /></a></div>
      <div className="playground-demo"><AnimatePresence mode="wait"><m.div className="demo-inner" key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: quiet ? 0 : .25 }}>
        {active === 0 && <><div className="demo-toolbar"><span>Product, inside out</span><div className="segmented" role="group" aria-label="Product view"><button aria-pressed={view === 'interface'} onClick={() => setView('interface')}>Interface</button><button aria-pressed={view === 'architecture'} onClick={() => setView('architecture')}>Architecture</button></div></div><div className="product-example">{view === 'interface' ? <m.div className="mini-app" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="mini-app-side"><b>Workspace</b><span className="selected">Overview</span><span>Projects</span><span>Members</span></div><div className="mini-app-main"><div className="mini-app-heading">Make room for<br /><b>the important work.</b></div><div className="task-row"><span className="task-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg></span><span>Define the product</span><small>Done</small></div><div className="task-row"><span className="task-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg></span><span>Connect the system</span><small>Done</small></div><div className="task-row"><span className="task-check pending" /><span>Review together</span><small>Next</small></div><div className="app-members"><i>A</i><i>B</i><i>C</i><span>A shared view of progress.</span></div></div></m.div> : <m.div className="mini-architecture" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="arch-row"><span>Browser</span><i /><span>Typed API</span></div><div className="arch-branch" /><div className="arch-row"><span>Authentication</span><span>Business rules</span><span>Database</span></div><p>Access checked. Inputs validated. Data kept consistent.</p></m.div>}</div><p className="demo-note">Illustrative product UI · switch views to see its foundations.</p></>}
        {active === 1 && <><div className="demo-toolbar"><span>Question → context → answer</span><span className="local-tag">Local demo</span></div><div className="retrieval-demo"><label htmlFor="demo-question">Ask the example knowledge base</label><select id="demo-question" value={question} onChange={e => { clearTimeout(timer.current); setBusy(false); setQuestion(Number(e.target.value)); setAnswer(false) }}>{knowledge.map((k, i) => <option key={k.question} value={i}>{k.question}</option>)}</select><button className="solid-link" onClick={ask} disabled={busy}>{busy ? 'Retrieving context…' : 'Find a grounded answer'}<Arrow direction="right" /></button><div className={`answer-panel ${answer ? 'has-answer' : ''}`} role="status">{answer ? <><span className="source-label">SOURCE · {knowledge[question].source}</span><p>{knowledge[question].text}</p></> : <><div className="retrieval-nodes" aria-hidden="true"><i /><i /><i /><i /><i /></div><p>{busy ? 'Matching your question to the supplied reference…' : 'Every useful answer starts with relevant context.'}</p></>}</div></div><p className="demo-note">Curated sample documents and answers. No live model or external request.</p></>}
        {active === 2 && <><div className="demo-toolbar"><span>An event becomes an action.</span><span className="local-tag">Workflow study</span></div><div className="workflow-demo"><div className="flow-event"><span className="flow-dot" />New project request</div><div className="flow-connector" /><div className="flow-event">Validate &amp; organize context</div><div className="flow-connector" /><div className="flow-event flow-review"><span>Human review</span><button onClick={() => setApproved(v => !v)} aria-pressed={approved}>{approved ? 'Reset example' : 'Approve example'}<Arrow /></button></div><div className="flow-connector" /><m.div className="flow-event flow-result" animate={{ opacity: approved ? 1 : .45, scale: approved ? 1 : .96 }} role="status">{approved ? 'Approved → create the next task' : 'Waiting for a person to decide'}</m.div></div><p className="demo-note">A local simulation. Your click does not send or create anything externally.</p></>}
      </m.div></AnimatePresence></div>
    </div>
  </div>
}
export default function EngineeringPlayground() { return <MotionRoot><Playground /></MotionRoot> }
