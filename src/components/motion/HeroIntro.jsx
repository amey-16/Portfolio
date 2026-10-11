import { useEffect, useRef, useState } from 'react'
import { m, AnimatePresence, useMotionValue, useSpring, useScroll, useTransform } from 'motion/react'
import { MotionRoot, Arrow, useQuietMotion } from './shared'

function Intro() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState(0)
  const quiet = useQuietMotion()
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).get('motion') === 'off') return
    try { if (sessionStorage.getItem('amey-intro')) return; sessionStorage.setItem('amey-intro', '1') } catch {}
    setOpen(true)
    const a = setTimeout(() => setRole(1), 750)
    const b = setTimeout(() => setRole(2), 1350)
    const end = setTimeout(() => setOpen(false), 2200)
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(end) }
  }, [])
  useEffect(() => { if (quiet) setOpen(false) }, [quiet])
  return <AnimatePresence>{open && <m.div className="kinetic-intro" initial={{ y: 0 }} exit={{ y: '-105%' }} transition={{ duration: .48, ease: [.76, 0, .24, 1] }}>
    <span className="intro-corner">An introduction, by Amey.</span>
    <div className="intro-name" aria-label="Amey Shelar">{'AMEY SHELAR'.split('').map((c, i) => <m.span key={i} aria-hidden="true" initial={{ rotateX: i % 2 ? 90 : -90, y: 75, opacity: 0 }} animate={{ rotateX: 0, y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 190, damping: 16, delay: i * .035 }}>{c === ' ' ? '\u00a0' : c}</m.span>)}</div>
    <div className="intro-role"><AnimatePresence mode="wait"><m.span key={role} initial={{ y: 35, rotateX: -70 }} animate={{ y: 0, rotateX: 0 }} exit={{ y: -35, rotateX: 70 }} transition={{ duration: .22 }}>{['Developer.', 'Engineer.', 'Builder.'][role]}</m.span></AnimatePresence></div>
    <button className="intro-skip text-link" onClick={() => setOpen(false)}>Skip intro <Arrow /></button>
  </m.div>}</AnimatePresence>
}

function Hero() {
  const stage = useRef(null)
  const dragArea = useRef(null)
  const quiet = useQuietMotion()
  const [assembled, setAssembled] = useState(false)
  const [dragging, setDragging] = useState(false)
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 90, damping: 18 }), sy = useSpring(y, { stiffness: 90, damping: 18 })
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start start', 'end start'] })
  const nameX = useTransform(scrollYProgress, [0, 1], [0, -70])
  const bottomX = useTransform(scrollYProgress, [0, 1], [0, 60])
  function move(e) {
    if (quiet || e.pointerType !== 'mouse' || dragging) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * .07)
    y.set((e.clientY - r.top - r.height / 2) * .07)
  }
  const piece = { type: 'spring', stiffness: 180, damping: 17 }
  return <>
    <Intro />
    <section className="build-hero" id="top" ref={stage} aria-labelledby="hero-name" onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0) }}>
      <div className="hero-composition">
        <h1 id="hero-name" className="name-lockup" aria-label="Amey Shelar"><m.span className="name-first" style={{ x: quiet ? 0 : nameX }} aria-hidden="true">AMEY</m.span><m.span className="name-last" style={{ x: quiet ? 0 : bottomX }} aria-hidden="true">SHELAR</m.span></h1>
        <p className="hero-role">Senior Full Stack<br />Developer &amp;<br />AI/ML Engineer</p>
        <svg className="hero-signal" viewBox="0 0 1440 480" preserveAspectRatio="none" aria-hidden="true"><m.path d="M-20 166H240M341 166H498Q530 166 530 202V257Q530 288 565 288H1165Q1275 288 1275 196Q1275 101 1182 101H1135Q1070 101 1100 169L1120 210" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: quiet ? 0 : 1.4, delay: .2 }} /></svg>
        <svg className="hero-signal hero-signal--mobile" viewBox="0 0 346 415" preserveAspectRatio="none" aria-hidden="true"><m.path d="M207 225H281Q338 225 338 277V326Q338 359 305 359H227" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: quiet ? 0 : 1.4, delay: .2 }} /></svg>
        <div className="hero-object-area" ref={dragArea}>
          <m.div className="assembly-object" style={{ x: sx, y: sy }} drag={!quiet} dragConstraints={dragArea} dragElastic={.12} dragSnapToOrigin onDragStart={() => setDragging(true)} onDragEnd={() => { setDragging(false); setAssembled(v => !v) }} aria-hidden="true">
            <m.i className="a-piece a-piece-one" initial={false} animate={{ rotate: assembled ? 28 : -22, x: assembled ? 0 : -12, y: assembled ? 6 : -14 }} transition={piece} />
            <m.i className="a-piece a-piece-two" initial={false} animate={{ rotate: assembled ? -28 : 22, x: assembled ? 50 : 62, y: assembled ? 6 : 6 }} transition={piece} />
            <m.i className="a-piece a-piece-three" initial={false} animate={{ rotate: assembled ? 0 : -12, x: assembled ? 12 : 17, y: assembled ? 48 : 82 }} transition={piece} />
          </m.div>
          <button className="assembly-button" onClick={() => setAssembled(v => !v)} aria-pressed={assembled}>{assembled ? 'Take it apart' : 'Put it together'}<span className="drag-hint">or drag the pieces</span></button>
        </div>
      </div>
      <div className="hero-bottom"><p>Ideas into systems.<br className="mobile-only" /> Systems into products.</p><div className="hero-actions"><a className="solid-link" href="#work">Explore the work <Arrow /></a><a className="text-link" href="#contact">Start a project <Arrow /></a></div></div>
      <div className="hero-footnote"><span>Thoughtful interfaces. Dependable foundations.</span><a href="#story" aria-label="Scroll to my story"><span>Keep going</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 3v18m-6-6 6 6 6-6" /></svg></a></div>
    </section>
  </>
}
export default function HeroIntro() { return <MotionRoot><Hero /></MotionRoot> }
