import { gsap, ScrollTrigger, lenis, tickers, reduced, fine } from './core.js'
import { initRoute } from './route.js'
import { initOrbit } from './orbit.js'
import { initDepthMotion } from './depth-motion.js'

lenis.start()
history.scrollRestoration='manual'
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)]
const depthMotion=initDepthMotion()
const orbitRoot=q('.orbit')
if(orbitRoot){const orbit=initOrbit(orbitRoot,{finePointer:fine,reducedMotion:reduced,onTool(name,text){q('.stack__tool').textContent=name;q('.stack__use').textContent=text}});tickers.add(orbit)}

// A 2.3 second name composition, with a permanent skip path and a fail-safe.
if(q('.exhibition-hero')&&!reduced&&!location.hash){
  let seen=false;try{seen=sessionStorage.getItem('amey-intro')==='seen';sessionStorage.setItem('amey-intro','seen')}catch{}
  if(!seen){
    const intro=document.createElement('div');intro.className='exhibition-intro';intro.setAttribute('role','region');intro.setAttribute('aria-label','Amey Shelar introduction')
    const origin=document.createElement('span');origin.className='intro-origin';origin.textContent='A thought. A system. A useful result.'
    const name=document.createElement('div');name.className='intro-name';name.setAttribute('aria-label','Amey Shelar')
    for(const letter of 'AMEY SHELAR'){const span=document.createElement('span');span.textContent=letter===' '?'\u00a0':letter;span.setAttribute('aria-hidden','true');name.appendChild(span)}
    const word=document.createElement('div');word.className='intro-word';word.innerHTML='<span>Engineer</span><span>Builder</span>'
    const skip=document.createElement('button');skip.className='intro-skip';skip.textContent='Skip introduction'
    const line=document.createElement('div');line.className='intro-line';intro.append(origin,name,word,skip,line);document.body.appendChild(intro)
    const main=q('main'),header=q('.exhibition-header'),footer=q('.exhibition-footer');[main,header,footer].forEach(el=>el.inert=true)
    const oldFocus=document.activeElement
    let finished=false,timeline
    function finish(){if(finished)return;finished=true;timeline?.kill();intro.remove();[main,header,footer].forEach(el=>el.inert=false);const returnFocus=oldFocus!==document.body&&oldFocus?.isConnected?oldFocus:q('.wordmark');returnFocus?.focus({preventScroll:true})}
    const safety=setTimeout(finish,3000)
    skip.addEventListener('click',finish)
    intro.addEventListener('keydown',e=>{if(e.key==='Escape')finish();if(e.key==='Tab'){e.preventDefault();skip.focus()}})
    skip.focus({preventScroll:true})
    timeline=gsap.timeline({onComplete:()=>{clearTimeout(safety);finish()}})
    timeline.fromTo(name.children,{rotationY:i=>i%2?80:-80,y:i=>i%2?35:-35,opacity:.25},{rotationY:0,y:0,opacity:1,duration:.8,stagger:.045,ease:'expo.out'},0)
    timeline.fromTo(line,{scaleX:0},{scaleX:1,duration:2.1,ease:'power2.inOut'},0)
    timeline.to(word.children,{yPercent:-100,duration:.45,ease:'expo.inOut'},1.15)
    timeline.to(name.children,{y:i=>i%2?-12:12,rotationY:i=>i%2?-6:6,duration:.3,stagger:.012},1.6)
    timeline.to(intro,{clipPath:'inset(0 0 100% 0)',duration:.55,ease:'power4.inOut'},1.75)
  }
}

// Load WebGL independently: a failed renderer never takes down the reading page.
const slots=qa('[data-assembly],[data-volume]')
if(slots.length&&new URLSearchParams(location.search).get('graphics')!=='off'){
  // React must own its server-rendered subtree before a canvas is mounted in it.
  const hydrated=slots.map(slot=>{const island=slot.closest('astro-island');return island?.hasAttribute('ssr')?new Promise(resolve=>island.addEventListener('astro:hydrate',resolve,{once:true})):Promise.resolve()})
  Promise.all(hydrated).then(()=>import('./assembly.js')).then(({initAssembly})=>{
    const assembly=initAssembly(slots,{quiet:reduced})
    depthMotion.connect(assembly)
    window.addEventListener('pagehide',()=>assembly.destroy(),{once:true})
  }).catch(()=>{window.dispatchEvent(new CustomEvent('system-unavailable'))})
}

const match=gsap.matchMedia()
match.add('(min-width: 901px)',()=>{
  if(reduced||!q('.work-pin'))return
  const section=q('.work-chapter'),track=q('.work-track'),panels=qa('.work-exhibit'),pin=q('.work-pin'),label=q('.gallery-position')
  section.classList.add('horizontal-gallery')
  const distance=()=>Math.max(0,track.scrollWidth-pin.clientWidth)
  let active=0
  const tween=gsap.to(track,{x:()=>-distance(),ease:'none',scrollTrigger:{id:'work-gallery',trigger:pin,start:'top 35px',end:()=>`+=${distance()}`,pin:true,scrub:.65,refreshPriority:20,invalidateOnRefresh:true,onUpdate:s=>{active=Math.min(2,Math.round(s.progress*2));label.textContent=`${String(active+1).padStart(2,'0')} / 03`;q('.gallery-prev').disabled=active===0;q('.gallery-next').disabled=active===2}}})
  panels.forEach(panel=>{gsap.fromTo(panel.querySelector('.exhibit-art'),{rotationY:-12,scale:.86},{rotationY:0,scale:1,ease:'none',scrollTrigger:{trigger:panel,containerAnimation:tween,start:'left 95%',end:'left 8%',scrub:true}})})
  function go(i){const st=tween.scrollTrigger;lenis.scrollTo(st.start+(st.end-st.start)*Math.max(0,Math.min(2,i))/2,{duration:.9})}
  const prev=()=>go(active-1),next=()=>go(active+1)
  q('.gallery-prev').addEventListener('click',prev);q('.gallery-next').addEventListener('click',next)
  function focus(e){const panel=e.target.closest('.work-exhibit');if(panel)go(panels.indexOf(panel))}
  track.addEventListener('focusin',focus)
  return()=>{q('.gallery-prev').removeEventListener('click',prev);q('.gallery-next').removeEventListener('click',next);track.removeEventListener('focusin',focus);section.classList.remove('horizontal-gallery')}
})

// Pins must refresh in document order: opening → gallery → journey.
const exp=q('.exp')
if(exp){
  if(reduced){const list=document.createElement('ol');list.className='exp__list';exp.querySelectorAll('.stop').forEach(stop=>list.appendChild(stop));exp.querySelector('.exp__pin').appendChild(list);exp.classList.add('is-lite')}
  else {const route=initRoute(exp);route.set(.12);ScrollTrigger.create({id:'journey-route',trigger:exp,pin:'.exp__pin',start:'top top',end:'+=280%',refreshPriority:10,invalidateOnRefresh:true,scrub:.8,onUpdate:s=>route.set(.12+s.progress*.8)})}
}

if(!reduced){
  const frame=q('.portrait-frame')
  if(frame){gsap.fromTo('.portrait-mount',{x:18,y:22},{x:0,y:0,ease:'none',scrollTrigger:{trigger:frame,start:'top 95%',end:'top 35%',scrub:.7}});gsap.fromTo('.portrait-copy h2',{y:20},{y:0,duration:.7,ease:'expo.out',scrollTrigger:{trigger:frame,start:'top 85%',once:true}})}
  const bridge=q('.portrait-bridge path')
  if(bridge)gsap.fromTo(bridge,{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.portrait-bridge',start:'top 92%',end:'top 45%',scrub:.8}})
  const conductor=q('.closing-conductor path')
  if(conductor)gsap.fromTo(conductor,{strokeDasharray:1,strokeDashoffset:.9},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.invitation-chapter',start:'top 80%',end:'center 40%',scrub:.8}})
  if(fine&&frame){const mount=q('.portrait-mount'),moveX=gsap.quickTo(mount,'rotationY',{duration:.5,ease:'power3.out'}),moveY=gsap.quickTo(mount,'rotationX',{duration:.5,ease:'power3.out'});frame.addEventListener('pointermove',e=>{const r=frame.getBoundingClientRect();moveX((e.clientX-r.left-r.width/2)/r.width*6);moveY((e.clientY-r.top-r.height/2)/r.height*-4)},{passive:true});frame.addEventListener('pointerleave',()=>{moveX(0);moveY(0)})}
}

const chapterNav=q('.chapter-nav'),menu=q('#chapter-menu'),chapterButton=chapterNav?.querySelector('button')
function closeChapters(){if(!menu)return;menu.hidden=true;chapterButton.setAttribute('aria-expanded','false')}
chapterButton?.addEventListener('click',()=>{menu.hidden=!menu.hidden;chapterButton.setAttribute('aria-expanded',String(!menu.hidden))})
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu?.hidden){closeChapters();chapterButton?.focus()}})
document.addEventListener('click',e=>{if(chapterNav&&!chapterNav.contains(e.target))closeChapters()})
if(chapterNav){ScrollTrigger.create({trigger:'.exhibition-hero',start:'bottom top',onEnter:()=>chapterNav.classList.add('is-visible'),onLeaveBack:()=>{chapterNav.classList.remove('is-visible');closeChapters()}})}
const reading=q('.reading-line i')
if(reading)ScrollTrigger.create({start:0,end:'max',onUpdate:s=>reading.style.transform=`scaleX(${s.progress})`})

document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return
  const id=link.getAttribute('href').slice(1),target=document.getElementById(id);if(!target)return
  event.preventDefault();closeChapters();history.pushState(null,'',`#${id}`)
  lenis.scrollTo(id==='top'?0:target,{immediate:reduced,offset:id==='top'?0:-20,duration:1.1,onComplete:()=>{if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}})
})
const preference=q('.motion-preference')
if(preference){const url=new URL(location.href);if(url.searchParams.get('motion')==='off'){preference.textContent='Use system motion';url.searchParams.delete('motion')}else url.searchParams.set('motion','off');preference.href=url.pathname+url.search+url.hash}

// Remember a scope selection if contact hydrates after the visitor chooses it.
window.addEventListener('project-scope',e=>window.__projectScope=e.detail)
let refreshTimer
function refreshLayout(){ScrollTrigger.sort();ScrollTrigger.refresh();lenis.resize()}
function refresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refreshLayout,180)}
document.fonts.ready.then(refreshLayout);window.addEventListener('load',refreshLayout,{once:true})
const observer=new ResizeObserver(refresh)
qa('.portrait-frame,.layer-controls,.scope-explorer,.partner-list,.contact-experience').forEach(el=>observer.observe(el))
// Honor deep links only after layout and pin distances have been resolved.
if(location.hash){const loaded=document.readyState==='complete'?Promise.resolve():new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));Promise.all([document.fonts.ready,loaded]).then(()=>requestAnimationFrame(()=>{refreshLayout();const id=location.hash.slice(1),target=document.getElementById(id);if(target)lenis.scrollTo(id==='top'?0:target,{immediate:true,offset:id==='top'?0:-20});ScrollTrigger.update()}))}
