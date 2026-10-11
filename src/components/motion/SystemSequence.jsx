import { useEffect, useRef, useState } from 'react'
import { m, AnimatePresence, animate, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { MotionRoot, useQuietMotion, Arrow } from './shared'

const chapters = [
  { word: 'ASSEMBLE.', title: 'Start with the pieces.', description: 'An interface. Application logic. A place for data. Each part has a job before it becomes a system.', note: 'Give each layer one clear responsibility.' },
  { word: 'CONNECT.', title: 'Make the boundaries work.', description: 'Clear contracts turn independent parts into one connected product. A request has a path—and so does the response.', note: 'Follow the signal across the layers.' },
  { word: 'REFINE.', title: 'Think beyond the happy path.', description: 'Validation, feedback and recovery are part of the architecture. What happens between the layers matters.', note: 'An understandable system is easier to improve.' },
  { word: 'DELIVER.', title: 'Bring it back to the person.', description: 'The complexity settles into a useful experience. The person using it should feel the clarity, not the machinery.', note: 'The system becomes the experience.' },
]

function Sequence() {
  const root = useRef(null)
  const quiet = useQuietMotion()
  const [compact, setCompact] = useState(false)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end end'] })
  const progress = useMotionValue(0)
  const manualAnimation = useRef(null)
  useEffect(() => {
    const query = matchMedia('(max-width: 800px), (max-height: 600px)')
    const update = () => setCompact(query.matches)
    update(); query.addEventListener('change', update)
    return () => { query.removeEventListener('change', update); manualAnimation.current?.stop() }
  }, [])
  useMotionValueEvent(scrollYProgress, 'change', value => { if (!compact && !quiet) progress.set(value) })
  useMotionValueEvent(progress, 'change', value => setActive(Math.min(3, Math.floor(value * 3.999))))
  const spin = useTransform(progress, [0, .2, .48, .72, 1], [-32, -32, -17, -12, 0])
  const tilt = useTransform(progress, [0, .35, .7, 1], [58, 58, 43, 0])
  const scale = useTransform(progress, [0, .35, .7, 1], [.76, .88, .88, .92])
  const topZ = useTransform(progress, [0, .26, .65, 1], [22, 150, 150, 0])
  const middleZ = useTransform(progress, [0, .26, .65, 1], [0, 0, 0, -10])
  const bottomZ = useTransform(progress, [0, .26, .65, 1], [-22, -150, -150, -20])
  const behindOpacity = useTransform(progress, [.7, .92, 1], [1, .25, 0])
  const traceOpacity = useTransform(progress, [0, .18, .28, .73, .88], [0, 0, 1, 1, 0])
  const traceLength = useTransform(progress, [.2, .56], [0, 1])
  const screenOpacity = useTransform(progress, [.72, .91], [0, 1])
  const wireOpacity = useTransform(progress, [.7, .9], [1, 0])
  const backdropX = useTransform(progress, [0, 1], ['0%', '-28%'])
  const signalX = useTransform(progress, [.22, .45, .6, .73], [95, 255, 375, 375])
  const signalY = useTransform(progress, [.22, .45, .6, .73], [170, 170, 80, 80])
  const topLabel = useTransform(progress, [0, .28, .72, 1], [5, -70, -70, 5])
  const bottomLabel = useTransform(progress, [0, .28, .72, 1], [5, 70, 70, 5])

  function select(index) {
    const value = index === 3 ? 1 : index / 4 + .08
    if (compact || quiet) {
      manualAnimation.current?.stop()
      manualAnimation.current = animate(progress, value, { duration: quiet ? 0 : .9, ease: [.16, 1, .3, 1] })
    } else {
      const bounds = root.current.getBoundingClientRect()
      window.scrollTo({ top: window.scrollY + bounds.top + value * (bounds.height - window.innerHeight), behavior: 'instant' })
    }
  }
  return <section ref={root} className={`system-sequence ${compact || quiet ? 'sequence-manual' : ''}`} id="architecture" aria-labelledby="sequence-title">
    <div className="sequence-sticky">
      <m.div className="sequence-ghost" style={{ x: quiet ? 0 : backdropX }} aria-hidden="true">THINK IN SYSTEMS</m.div>
      <div className="sequence-top"><h2 id="sequence-title">Think in systems.<br /><em>Build for people.</em></h2><a href="#architecture-lab" className="sequence-skip">Explore the architecture <Arrow /></a></div>
      <div className="sequence-main">
        <div className="sequence-copy"><div className="sequence-counter"><span>{String(active + 1).padStart(2, '0')}</span><span>/ 04</span><i /></div><div className="sequence-word"><AnimatePresence mode="wait" initial={false}><m.p key={active} initial={{ y: quiet ? 0 : '110%', rotate: quiet ? 0 : 5 }} animate={{ y: 0, rotate: 0 }} exit={{ y: quiet ? 0 : '-110%', rotate: quiet ? 0 : -5 }} transition={{ duration: quiet ? 0 : .4, ease: [.76, 0, .24, 1] }}>{chapters[active].word}</m.p></AnimatePresence></div><AnimatePresence mode="wait" initial={false}><m.div className="sequence-description" key={active} initial={{ opacity: .4 }} animate={{ opacity: 1 }} exit={{ opacity: .4 }} transition={{ duration: .18 }}><h3>{chapters[active].title}</h3><p>{chapters[active].description}</p></m.div></AnimatePresence></div>
        <div className="system-theatre" aria-label={`Architecture stage: ${chapters[active].word.toLowerCase()}`}>
          <div className="theatre-coordinate theatre-coordinate-a" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 12h16M12 4v16"/></svg></div><div className="theatre-coordinate theatre-coordinate-b" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 12h16M12 4v16"/></svg></div>
          <m.div className="layer-label layer-label-top" style={{ y: topLabel, opacity: wireOpacity }}><i />Interface<span>Experience</span></m.div>
          <m.div className="layer-label layer-label-bottom" style={{ y: bottomLabel, opacity: wireOpacity }}><i />Data<span>Foundation</span></m.div>
          <div className="system-perspective"><m.div className="system-sculpture" style={{ rotateX: tilt, rotateZ: spin, scale }}>
            <m.div className="system-plane plane-data" style={{ z: bottomZ, opacity: behindOpacity }}><div className="plane-edge" /><div className="plane-grid" /><div className="database-array">{Array.from({ length: 9 }, (_, i) => <span key={i} />)}</div><b>DATA</b><span className="plane-id">Persistent. Structured. Accessible.</span></m.div>
            <m.div className="system-plane plane-logic" style={{ z: middleZ, opacity: behindOpacity }}><div className="plane-edge" /><svg viewBox="0 0 480 300" fill="none" aria-hidden="true"><path className="plane-path" d="M65 80h115v140h120V80h115M65 220h65V150h245"/><rect x="200" y="104" width="80" height="84" rx="10"/><path d="m225 130-12 16 12 16m30-32 12 16-12 16m-8-32-14 32"/><circle cx="65" cy="80" r="8"/><circle cx="415" cy="80" r="8"/></svg><b>LOGIC</b><span className="plane-id">Validate → execute → respond</span></m.div>
            <m.div className="system-plane plane-interface" style={{ z: topZ }}><div className="plane-edge" /><m.div className="wireframe-interface" style={{ opacity: wireOpacity }}><div className="wireframe-header"><span /><span /><span /><i /></div><div className="wireframe-layout"><div className="wireframe-nav"><i /><i /><i /></div><div className="wireframe-content"><div className="wireframe-title"/><div className="wireframe-blocks"><i/><i/><i/></div><div className="wireframe-lines"><i/><i/></div></div></div><b>INTERFACE</b></m.div><m.div className="resolved-product" style={{ opacity: screenOpacity }}><div className="resolved-top"><span>Workspace</span><span>Built to work together <i /></span></div><div className="resolved-body"><h4>A clear view.<br />A useful next step.</h4><div className="resolved-layout"><div className="resolved-chart"><i/><i/><i/><i/><i/><i/></div><div className="resolved-status"><span><i/>Interface</span><span><i/>Application</span><span><i/>Data</span></div></div><span className="resolved-bottom">The complexity is doing its job.</span></div></m.div></m.div>
          </m.div></div>
          <m.svg className="theatre-trace" viewBox="0 0 480 300" style={{ opacity: traceOpacity }} fill="none" aria-hidden="true"><m.path d="M95 170H255V80H375" stroke="var(--coral)" strokeWidth="2" style={{ pathLength: traceLength }}/><m.circle r="5" fill="var(--pollen)" style={{ cx: signalX, cy: signalY }}/></m.svg>
          <div className="theatre-caption"><span className="live-dot" />{chapters[active].note}</div>
        </div>
      </div>
      <div className="sequence-bottom"><div className="sequence-navigation" role="group" aria-label="Build sequence chapters">{chapters.map((chapter, i) => <StageButton key={chapter.word} index={i} chapter={chapter} progress={progress} active={active === i} select={select} />)}</div><p>{compact || quiet ? 'Choose a stage to unfold the system.' : 'Scroll to unfold the system.'}<Arrow direction="down"/></p></div>
    </div>
  </section>
}
function StageButton({ index, chapter, progress, active, select }) {
  const fill = useTransform(progress, [index / 4, (index + 1) / 4], [0, 1])
  return <button aria-pressed={active} onClick={() => select(index)}><span>{chapter.word.replace('.', '')}</span><i><m.b style={{ scaleX: fill }} /></i></button>
}
export default function SystemSequence() { return <MotionRoot><Sequence /></MotionRoot> }
