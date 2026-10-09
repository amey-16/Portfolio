import { gsap, lenis, $, $$ } from './core.js'
import { projects } from './data.js'
import { cover } from './covers.js'

/* Case-study overlay: opens as a clip-path that grows out of the clicked frame. */
export function initCase() {
  const root = $('.qv'), clip = $('.qv__clip', root), scroller = $('.qv__scroll', root)
  const canvas = $('.qv__media canvas', root), ctx = canvas.getContext('2d')
  const closeBtn = $('.qv__x', root), nextBtn = $('.qv__next', root)
  const f = {
    n: $('.qv__n', root), t: $('.qv__title h3', root), sum: $('.qv__sum', root), desc: $('.qv-desc', root), brief: $('.qv-brief', root),
    ch: $('.qv-challenge', root), ap: $('.qv-approach', root), res: $('.qv-result', root), role: $('.qv-role', root), year: $('.qv-year', root),
    tools: $('.qv-tools', root), del: $('.qv-del', root), next: $('.qv__next-t', root),
  }
  let cur = 0, openState = false, opener = null, tl
  canvas.width = 1600; canvas.height = 1000

  const fill = (i) => {
    const p = projects[i], nx = projects[(i + 1) % projects.length]
    cur = i
    ctx.drawImage(cover(i), 0, 0)
    f.n.textContent = `${String(i + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')} · ${p.kind}`
    f.t.textContent = p.name; f.sum.textContent = p.summary; f.desc.textContent = p.description
    f.brief.textContent = p.brief; f.ch.textContent = p.challenge; f.ap.textContent = p.approach; f.res.textContent = p.result
    f.role.textContent = p.role; f.year.textContent = p.year; f.tools.textContent = p.tools; f.del.textContent = p.deliverables.join(' · ')
    f.next.textContent = nx.name
    root.setAttribute('aria-label', `${p.name} case study`)
  }
  const reveal = () => {
    const els = [f.n, f.t, f.sum, ...$$('.qv__meta > div', root), f.desc, ...$$('.qv__text section', root), nextBtn]
    gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay: 0.35 })
  }

  const open = (i, rect) => {
    if (openState) return
    openState = true
    opener = document.activeElement
    fill(i)
    scroller.scrollTop = 0
    lenis.stop()
    root.setAttribute('aria-hidden', 'false'); root.inert = false
    const r = rect || { left: innerWidth / 2 - 100, top: innerHeight / 2 - 60, right: innerWidth / 2 + 100, bottom: innerHeight / 2 + 60 }
    const from = `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 18px)`
    tl?.kill()
    gsap.set(root, { visibility: 'visible' })
    tl = gsap.timeline()
      .fromTo(clip, { clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1.15, ease: 'expo.inOut' })
      .fromTo($('.qv__media', root), { scale: 1.25 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, 0.1)
      .fromTo(closeBtn, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' }, 0.7)
      .add(reveal, 0.35)
      .add(() => closeBtn.focus({ preventScroll: true }), 0.9)
  }
  const close = () => {
    if (!openState) return
    openState = false
    root.setAttribute('aria-hidden', 'true'); root.inert = true
    tl?.kill()
    const r = opener && opener.getBoundingClientRect ? opener.getBoundingClientRect() : null
    const to = r && r.width ? `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 18px)` : 'inset(50% 50% 50% 50% round 18px)'
    tl = gsap.timeline({ onComplete: () => { gsap.set(root, { visibility: 'hidden' }); lenis.start(); opener?.focus?.({ preventScroll: true }) } })
      .to(closeBtn, { opacity: 0, duration: 0.25 })
      .to(clip, { clipPath: to, duration: 0.95, ease: 'expo.inOut' }, 0.05)
  }
  const next = () => {
    const i = (cur + 1) % projects.length
    const els = [f.n, f.t, f.sum, $('.qv__media', root)]
    gsap.timeline()
      .to(clip, { yPercent: -4, opacity: 0.2, duration: 0.35, ease: 'power2.in' })
      .add(() => { fill(i); scroller.scrollTo({ top: 0 }) })
      .to(clip, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out' })
      .add(reveal, '-=0.6')
    void els
  }
  closeBtn.addEventListener('click', close)
  nextBtn.addEventListener('click', next)
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && openState) close() })
  // keep Tab inside the dialog
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return
    const items = [closeBtn, nextBtn]
    const a = document.activeElement
    if (e.shiftKey && a === items[0]) { e.preventDefault(); items[1].focus() }
    else if (!e.shiftKey && a === items[1]) { e.preventDefault(); items[0].focus() }
  })
  return { open, close, isOpen: () => openState }
}
