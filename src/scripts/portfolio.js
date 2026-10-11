import { gsap, ScrollTrigger, lenis, tickers, reduced, fine } from './core.js'
import { initRoute } from './route.js'
import { initOrbit } from './orbit.js'

// The page is readable before this module loads. No loader locks scrolling.
lenis.start()
const exp = document.querySelector('.exp')
if (exp) {
  if (reduced) {
    const list = document.createElement('ol')
    list.className = 'exp__list'
    exp.querySelectorAll('.stop').forEach(stop => list.appendChild(stop))
    exp.querySelector('.exp__pin').appendChild(list)
    exp.classList.add('is-lite')
  } else {
    const route = initRoute(exp)
    ScrollTrigger.create({ trigger: exp, pin: '.exp__pin', start: 'top top', end: '+=280%', scrub: .8, onUpdate: s => route.set(s.progress) })
  }
}

const tool = document.querySelector('.stack__tool')
const usage = document.querySelector('.stack__use')
const orbitRoot = document.querySelector('.orbit')
if (orbitRoot) {
  const orbit = initOrbit(orbitRoot, {
    finePointer: fine,
    reducedMotion: reduced,
    onTool(name, text) {
      if (tool.textContent === name) return
      tool.textContent = name
      usage.textContent = text
      if (!reduced) gsap.fromTo([tool, usage], { y: 5, opacity: .55 }, { y: 0, opacity: 1, duration: .3, stagger: .04, overwrite: true })
    },
  })
  tickers.add(orbit)
}

if (!reduced) {
  const loop = document.querySelector('.story-loop path')
  const length = loop.getTotalLength()
  gsap.fromTo(loop, { strokeDasharray: length, strokeDashoffset: length * .75 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.story-section', start: 'top 80%', end: 'center center', scrub: 1 } })
  gsap.from('.portrait-wrap', { y: 65, rotate: -3, ease: 'none', scrollTrigger: { trigger: '.story-grid', start: 'top bottom', end: 'center center', scrub: 1 } })
  gsap.fromTo('.story-ribbon>div', { xPercent: 4 }, { xPercent: -28, ease: 'none', scrollTrigger: { trigger: '.story-section', start: 'top bottom', end: 'bottom top', scrub: 1 } })
  document.querySelectorAll('.project-feature').forEach((project, i) => {
    gsap.from(project.querySelector('.project-art'), { clipPath: `inset(0 ${i % 2 ? 0 : 15}% 0 ${i % 2 ? 15 : 0}%)`, ease: 'none', scrollTrigger: { trigger: project, start: 'top 95%', end: 'top 25%', scrub: .8 } })
  })
  gsap.fromTo('.delivery-emblem', { rotate: -35 }, { rotate: 15, ease: 'none', scrollTrigger: { trigger: '.delivery-section', start: 'top bottom', end: 'bottom top', scrub: 1 } })
  gsap.from('.collaboration-motif span', { x: (i) => (i - 1) * 35, rotate: (i) => (i - 1) * 12, ease: 'none', scrollTrigger: { trigger: '.collaboration-section', start: 'top bottom', end: 'center center', scrub: 1 } })
  gsap.from('.contact-heading h2', { clipPath: 'inset(0 0 55% 0)', y: 45, ease: 'none', scrollTrigger: { trigger: '.contact-section', start: 'top 95%', end: 'top 20%', scrub: .65 } })
  gsap.from('.contact-heading svg', { rotate: -85, scale: .5, transformOrigin: '50% 50%', ease: 'none', scrollTrigger: { trigger: '.contact-section', start: 'top 90%', end: 'top 15%', scrub: .8 } })
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]')
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  const id = link.getAttribute('href').slice(1)
  const target = document.getElementById(id)
  if (!target) return
  event.preventDefault()
  history.pushState(null, '', `#${id}`)
  lenis.scrollTo(target, { immediate: reduced, offset: -20, duration: 1.1, onComplete: () => {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  } })
})
const preference = document.querySelector('.motion-preference')
if (preference) {
  const url = new URL(location.href)
  if (new URLSearchParams(location.search).get('motion') === 'off') {
    preference.textContent = 'Use system motion setting'
    url.searchParams.delete('motion')
  } else url.searchParams.set('motion', 'off')
  preference.href = url.pathname + url.search + url.hash
}
document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', () => ScrollTrigger.refresh()))
document.fonts.ready.then(() => ScrollTrigger.refresh())
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
// Lazy React islands can change height as their controls hydrate or expand.
let refreshTimer
const observer = new ResizeObserver(() => {
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 180)
})
document.querySelectorAll('.architecture-lab,.engineering-playground,.collaboration-section,.contact-section').forEach(el => observer.observe(el))
