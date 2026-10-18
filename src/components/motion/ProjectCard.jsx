// Selected-work card, animated with Motion (the framer-motion engine).
//   rise      scroll-linked: the card tips up out of the page in 3D as it arrives, and leans away as it leaves
//   tilt      spring-damped 3D tilt toward the pointer, with a soft light that follows it
//   stagger   label, title and thesis rise in one after another when the card first comes into view
//   press     the card sinks slightly under a click, then the iris curtain (director.js) takes over
// Until the island hydrates (or when motion is off) the card renders flat and fully visible.

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

const arrow = (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
)

const item = {
  hidden: { opacity: 0, y: 34, transition: { duration: 0 } },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20, mass: 0.9 } },
}
const artItem = {
  hidden: { opacity: 0, scale: 0.95, transition: { duration: 0 } },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 90, damping: 20, mass: 1 } },
}
const group = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } } }

export default function ProjectCard({ index, total, slug, name, kind, discipline, title, intro, tools, theme, wipeBg, wipeFg, children }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [armed, setArmed] = useState(false)
  const armedMV = useMotionValue(0)
  const inView = useInView(ref, { once: true, amount: 0.25 })

  useEffect(() => {
    const quiet = document.documentElement.classList.contains('is-quiet')
    if (reduce || quiet) return
    setArmed(true)
    armedMV.set(1)
  }, [reduce, armedMV])

  // ---- scroll-linked rise / exit ----
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const lerp = (p, keys, vals) => {
    for (let i = 1; i < keys.length; i++) {
      if (p <= keys[i]) { const t = (p - keys[i - 1]) / (keys[i] - keys[i - 1]); return vals[i - 1] + (vals[i] - vals[i - 1]) * t }
    }
    return vals[vals.length - 1]
  }
  const KEYS = [0, 0.26, 0.74, 1]
  const driven = (vals, neutral) => useTransform([scrollYProgress, armedMV], ([p, a]) => (a ? lerp(p, KEYS, vals) : neutral))
  const rotateX = driven([15, 0, 0, -6], 0)
  const y = driven([80, 0, 0, -30], 0)
  const scale = driven([0.94, 1, 1, 0.965], 1)
  const opacity = driven([0.25, 1, 1, 0.7], 1)

  // ---- pointer tilt + light ----
  const mx = useMotionValue(0.5), my = useMotionValue(0.5)
  const spring = { stiffness: 170, damping: 19, mass: 0.6 }
  const tiltY = useSpring(useTransform(mx, [0, 1], [-4.5, 4.5]), spring)
  const tiltX = useSpring(useTransform(my, [0, 1], [3.5, -3.5]), spring)
  const titleX = useSpring(useTransform(mx, [0, 1], [10, -10]), spring)
  const artX = useSpring(useTransform(mx, [0, 1], [-12, 12]), spring)
  const artY = useSpring(useTransform(my, [0, 1], [-8, 8]), spring)
  const lx = useTransform(mx, (v) => `${v * 100}%`), ly = useTransform(my, (v) => `${v * 100}%`)
  const glare = useMotionTemplate`radial-gradient(520px circle at ${lx} ${ly}, rgba(255,255,255,0.09), transparent 62%)`
  const glow = useSpring(0, { stiffness: 120, damping: 20 })

  const onMove = (e) => {
    if (!armed || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width); my.set((e.clientY - r.top) / r.height)
  }
  const onEnter = (e) => { if (armed && e.pointerType === 'mouse') glow.set(1) }
  const onLeave = () => { mx.set(0.5); my.set(0.5); glow.set(0) }

  const pad = (n) => String(n).padStart(2, '0')
  const show = armed ? (inView ? 'show' : 'hidden') : undefined

  return (
    <motion.article
      ref={ref}
      className={`proj proj--${kind} ${theme}`}
      style={{ '--i': index, transformPerspective: 1300, transformOrigin: '50% 100%', rotateX, y, scale, opacity }}
    >
      <motion.a
        className="proj__inner"
        href={`/work/${slug}/`}
        data-iris=""
        data-wipe={name}
        data-wipe-bg={wipeBg}
        data-wipe-fg={wipeFg}
        aria-label={`${name}: view case study`}
        style={{ transformPerspective: 1300, rotateX: tiltX, rotateY: tiltY }}
        initial={false}
        variants={group}
        animate={show}
        whileTap={armed ? { scale: 0.985 } : undefined}
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
      >
        <motion.span className="proj__glare" aria-hidden="true" style={{ background: glare, opacity: glow }} />
        <motion.div className="proj__top" variants={item}><span className="mono">{pad(index + 1)} / {pad(total)}</span><span>{discipline}</span></motion.div>
        <motion.h3 className="proj__title" variants={item} style={{ x: armed ? titleX : 0 }}>{name}</motion.h3>
        <div className="proj__grid">
          <div className="proj__text">
            <motion.p className="proj__thesis" variants={item}>{title}</motion.p>
            <p>{intro}</p>
            <ul className="tags">{tools.map((t) => <li key={t}>{t}</li>)}</ul>
            <span className="proj__go">View case study{arrow}</span>
          </div>
          <motion.div className="proj__artwrap" variants={artItem} style={{ x: armed ? artX : 0, y: armed ? artY : 0 }}>{children}</motion.div>
        </div>
      </motion.a>
    </motion.article>
  )
}
