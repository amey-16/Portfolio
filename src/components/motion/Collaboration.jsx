import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { MotionRoot, Arrow, useQuietMotion } from './shared'

const modes = [
  { name: 'Start something.', type: 'New product', audience: 'For founders with an idea worth testing.', text: 'Turn an open-ended idea into a clear first release. Start with the people, choose the smallest useful scope, and build a foundation you can keep improving.', scope: ['Product definition', 'Full-stack implementation', 'A path to launch'] },
  { name: 'Make it stronger.', type: 'Existing product', audience: 'For teams ready for their next chapter.', text: 'Bring clarity to the parts that have become difficult to change. Improve a journey, connect a service, or extend a platform with the existing team.', scope: ['Architecture review', 'Features & integrations', 'Performance & reliability'] },
  { name: 'Add useful intelligence.', type: 'AI / ML project', audience: 'For teams exploring what AI can really do.', text: 'Choose a concrete task, establish a useful baseline, and test the approach against real examples. Keep sources, evaluation and human judgment in the loop.', scope: ['Use-case exploration', 'AI-enabled workflows', 'Evaluation & iteration'] },
]
function Collaborate({ email = '', github = 'https://github.com/amey-16', linkedin = '' }) {
  const [selected, setSelected] = useState(0)
  const [status, setStatus] = useState('')
  const [fields, setFields] = useState({ name: '', email: '', project: '' })
  const quiet = useQuietMotion()
  const mode = modes[selected]
  function brief() { return `Project inquiry for Amey Shelar\n\nName: ${fields.name}\nEmail: ${fields.email}\nProject type: ${mode.type}\n\n${fields.project}` }
  async function submit(e) {
    e.preventDefault()
    if (email) {
      const subject = encodeURIComponent(`${mode.type} — ${fields.name}`)
      location.href = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(brief())}`
      setStatus('Your email app will open with the brief. Review it and send when ready.')
    } else {
      try { await navigator.clipboard.writeText(brief()); setStatus('Project brief copied. It is ready to share in your conversation with Amey.') }
      catch { setStatus('Clipboard access is unavailable. Use “Save brief” to keep your inquiry.') }
    }
  }
  function save() {
    const blob = new Blob([brief()], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob), link = document.createElement('a')
    link.href = url; link.download = 'project-brief-for-amey.txt'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatus('Your project brief has been saved. Nothing has been sent.')
  }
  return <>
    <section className="collaboration-section chapter" id="collaborate" aria-labelledby="collaboration-title"><div className="collaboration-layout"><div><h2 id="collaboration-title" className="display-heading">A partner.<br />Not another<br /><em>handoff.</em></h2><p className="section-intro">Bring the context. Ask the difficult questions. Make the important decisions together.</p><div className="collaboration-motif" aria-hidden="true"><span /><span /><span /></div></div><div className="engagement-list">{modes.map((entry, i) => <div className={`engagement ${selected === i ? 'is-selected' : ''}`} key={entry.type}><h3><button onClick={() => setSelected(i)} aria-expanded={selected === i} aria-controls={`engagement-${i}`}><span>{entry.name}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={selected === i ? 'M4 12h16' : 'M4 12h16M12 4v16'} /></svg></button></h3><AnimatePresence initial={false}>{selected === i && <m.div id={`engagement-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: quiet ? 0 : .3 }}><div className="engagement-content"><strong>{entry.audience}</strong><p>{entry.text}</p><ul>{entry.scope.map(s => <li key={s}>{s}</li>)}</ul><a className="text-link" href="#contact">Start this conversation <Arrow /></a></div></m.div>}</AnimatePresence></div>)}</div></div></section>
    <section className="contact-section chapter" id="contact" aria-labelledby="contact-title"><div className="contact-heading"><h2 id="contact-title">LET’S MAKE<br />IT <em>WORK.</em><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="9" aria-hidden="true"><path d="M15 85 85 15M15 15h70v70" /></svg></h2><span className="contact-opener">Your next chapter starts with a conversation.</span></div><div className="contact-grid"><div className="contact-copy"><p>Have a product, a problem,<br />or a useful question?</p><span>Tell me what you’re working on and where you want to take it.</span>{email && <a className="contact-email" href={`mailto:${email}`}>{email}<Arrow /></a>}<div className="social-links">{github && <a href={github} target="_blank" rel="noreferrer">GitHub<Arrow /></a>}{linkedin && <a href={linkedin} target="_blank" rel="noreferrer">LinkedIn<Arrow /></a>}</div></div><form className="inquiry-form" onSubmit={submit}><div className="form-pair"><label>Your name<input autoComplete="name" name="name" required maxLength={100} value={fields.name} onChange={e => setFields({ ...fields, name: e.target.value })} placeholder="What should I call you?" /></label><label>Email address<input type="email" autoComplete="email" name="email" required value={fields.email} onChange={e => setFields({ ...fields, email: e.target.value })} placeholder="you@company.com" /></label></div><label>I’m thinking about<select value={selected} onChange={e => setSelected(Number(e.target.value))}>{modes.map((entry, i) => <option value={i} key={entry.type}>{entry.type}</option>)}</select></label><label>A little context<textarea name="project" required minLength={10} maxLength={5000} rows={3} value={fields.project} onChange={e => setFields({ ...fields, project: e.target.value })} placeholder="The idea, the challenge, and what a good outcome looks like…" /></label><div className="form-actions"><button type="submit" className="solid-link">{email ? 'Prepare an email' : 'Copy project brief'}<Arrow /></button><button type="button" className="text-link" onClick={save}>Save brief</button></div><p className="form-note">{email ? 'Opens your email app. You review and send the message.' : 'Create a brief to share with Amey. Your details stay in this browser.'}</p><p className="form-status" role="status">{status}</p></form></div></section>
  </>
}
export default function Collaboration(props) { return <MotionRoot><Collaborate {...props} /></MotionRoot> }
