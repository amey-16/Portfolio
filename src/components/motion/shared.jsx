import { LazyMotion, domMax, MotionConfig, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

export function MotionRoot({ children }) {
  const [off, setOff] = useState(false)
  useEffect(() => { setOff(new URLSearchParams(location.search).get('motion') === 'off') }, [])
  return <LazyMotion features={domMax}><MotionConfig reducedMotion={off ? 'always' : 'user'}>{children}</MotionConfig></LazyMotion>
}
export function useQuietMotion() {
  const reduced = useReducedMotion()
  const [off, setOff] = useState(false)
  useEffect(() => { setOff(new URLSearchParams(location.search).get('motion') === 'off') }, [])
  return reduced || off
}
export function Arrow({ direction = 'up', ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}><path d={direction === 'right' ? 'M4 12h16M13 5l7 7-7 7' : direction === 'down' ? 'M12 3v18m-6-6 6 6 6-6' : 'M5 19 19 5M5 5h14v14'} /></svg>
}
