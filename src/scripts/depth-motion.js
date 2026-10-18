import { gsap, ScrollTrigger, lenis, reduced, fine } from './core.js'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
gsap.registerPlugin(MorphSVGPlugin)

/** A reversible exploded view: interface, service boundary, intelligence. */
export function initDepthMotion(){
  const hero=document.querySelector('.exhibition-hero')
  let scene, progress=0, opening
  const api={connect(value){scene=value;scene.setProgress(progress)}}
  const play=hero?.querySelector('.sample-request'),status=hero?.querySelector('.system-status')
  let staticRequest=reduced||new URLSearchParams(location.search).get('graphics')==='off',requestTimers=[]
  function describeControls(){if(!play)return;status.textContent=staticRequest?'Explore how a request moves through the layers':fine?'Drag to turn · Scroll to open the system':'Scroll to open the system';if(staticRequest)play.textContent='Read the request flow'}
  describeControls();window.addEventListener('system-unavailable',()=>{staticRequest=true;describeControls()})
  play?.addEventListener('click',()=>{
    requestTimers.forEach(clearTimeout);requestTimers=[]
    if(staticRequest){status.textContent='Interface → Services → Intelligence → Response';play.textContent='Request flow explained';return}
    window.dispatchEvent(new CustomEvent('system-request'));status.textContent='Request enters the interface';play.textContent='Request in motion';play.disabled=true
    for(const [delay,text] of [[800,'Services route the request'],[1600,'Intelligence adds context'],[2400,'Response returns to the interface']])requestTimers.push(setTimeout(()=>{status.textContent=text},delay))
    requestTimers.push(setTimeout(()=>{status.textContent='Response returned · Illustrative system';play.textContent='Run the request again';play.disabled=false},3300))
  })
  if(!hero||reduced)return api
  hero.classList.add('depth-opening')
  const art=hero.querySelector('.hero-art'),panel=hero.querySelector('.depth-sequence')
  const stages=[...hero.querySelectorAll('.depth-stage')],buttons=[...hero.querySelectorAll('[data-depth-seek]')]
  const mm=gsap.matchMedia()
  mm.add({compact:'(max-width: 900px)',wide:'(min-width: 901px)'},context=>{
    const compact=context.conditions.compact
    let active=-1
    const stageTimes=[.22,.49,.75]
    function updateStage(p){
      const next=p<.4?0:p<.67?1:2
      if(active===next)return
      active=next
      buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===next)))
      hero.querySelector('.depth-count').textContent=`0${next+1} / 03`
    }
    const timeline=gsap.timeline({scrollTrigger:{id:'opening-depth',trigger:hero,start:'top top',end:()=>`+=${innerHeight*(compact?1.65:2.15)}`,pin:true,scrub:.7,anticipatePin:1,refreshPriority:30,invalidateOnRefresh:true,onUpdate:self=>{progress=self.progress;scene?.setProgress(progress);updateStage(progress)}}})
    opening=timeline.scrollTrigger
    timeline.to(hero.querySelector('h1'),{z:-550,y:-45,rotationX:7,autoAlpha:0,duration:.25,ease:'power2.in'},0)
      .to(hero.querySelectorAll('.hero-support,.hero-identity,.hero-baseline,.scroll-invitation,.system-play,.chapter-mark'),{autoAlpha:0,y:-20,duration:.16,ease:'power1.out'},0)
      .to(art,{xPercent:compact?0:-13,yPercent:compact?-21:-14,scale:compact?1.17:1.12,duration:.3,ease:'power2.inOut'},0)
      .to(panel,{autoAlpha:1,duration:.08},.14)
      .to(hero.querySelector('.depth-position b'),{scaleX:1,duration:.8,ease:'none'},.15)
    timeline.to('.system-morph path',{morphSVG:'M12 30 H35 V12 H65 V30 H88 V70 H65 V88 H35 V70 H12 Z',duration:.18,ease:'power2.inOut'},.35)
      .to('.system-morph path',{morphSVG:'M50 4 C75 4 96 25 96 50 C96 75 75 96 50 96 C25 96 4 75 4 50 C4 25 25 4 50 4 Z',rotation:90,transformOrigin:'50% 50%',duration:.2,ease:'power2.inOut'},.65)
    stages.forEach((stage,i)=>{
      const start=i===0?.16:stageTimes[i]-.065
      timeline.fromTo(stage,{autoAlpha:0,y:26,rotationX:12},{autoAlpha:1,y:0,rotationX:0,duration:.075,ease:'power2.out'},start)
      if(i<2)timeline.to(stage,{autoAlpha:0,y:-24,duration:.055},stageTimes[i+1]-.12)
    })
    timeline.to(art,{scale:compact?1.32:1.38,yPercent:compact?-35:-28,duration:.16,ease:'power2.in'},.84)
      .to(panel,{autoAlpha:0,y:-15,duration:.08},.92)
      .to(art,{autoAlpha:.25,duration:.07},.93)
    function seek(event){const button=event.target.closest('[data-depth-seek]');if(!button)return;const p=stageTimes[Number(button.dataset.depthSeek)]+.04;lenis.scrollTo(opening.start+(opening.end-opening.start)*p,{duration:1.15})}
    panel.addEventListener('click',seek)
    const invite=hero.querySelector('.scroll-invitation')
    function enter(event){event.preventDefault();event.stopPropagation();lenis.scrollTo(opening.start+(opening.end-opening.start)*.27,{duration:1.2})}
    invite.addEventListener('click',enter)
    return()=>{panel.removeEventListener('click',seek);invite.removeEventListener('click',enter)}
  })

  // The photograph arrives from behind its mount; the face itself never distorts.
  const frame=document.querySelector('.portrait-frame')
  if(frame){
    gsap.fromTo(frame,{z:-180,y:70,rotationY:-7},{z:0,y:0,rotationY:0,ease:'none',scrollTrigger:{trigger:'.portrait-section',start:'top 95%',end:'top 15%',scrub:.8}})
    gsap.fromTo('.portrait-signature',{xPercent:9},{xPercent:-6,ease:'none',scrollTrigger:{trigger:'.portrait-section',start:'top bottom',end:'bottom top',scrub:.8}})
  }
  const architecture=document.querySelector('.architecture-art')
  if(architecture)gsap.fromTo(architecture,{rotationY:-14,z:-130},{rotationY:0,z:0,ease:'none',scrollTrigger:{trigger:'.architecture-exhibit',start:'top 90%',end:'center 48%',scrub:.7}})
  const vision=document.querySelector('.vision-window')
  if(vision){
    gsap.fromTo(vision,{y:65,rotationY:8,scale:.88},{y:0,rotationY:0,scale:1,ease:'none',scrollTrigger:{trigger:'.vision-chapter',start:'top 90%',end:'center 65%',scrub:.8}})
    let shown=-1
    ScrollTrigger.create({trigger:'.vision-study',start:'top 65%',end:'bottom 35%',onUpdate:self=>{const next=Math.min(2,Math.floor(self.progress*3));if(next!==shown){shown=next;window.dispatchEvent(new CustomEvent('vision-scroll',{detail:next}))}}})
  }
  // Materials respond at section entry without taking ownership of React's controls.
  document.querySelectorAll('.scope-plates,.docking-art').forEach(el=>gsap.fromTo(el,{y:65,scale:.9},{y:0,scale:1,ease:'none',scrollTrigger:{trigger:el,start:'top 95%',end:'center 65%',scrub:.7}}))
  const scopeWire=document.querySelector('.scope-conductor path')
  if(scopeWire){scopeWire.setAttribute('pathLength','1');gsap.fromTo(scopeWire,{strokeDasharray:1,strokeDashoffset:1},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.scope-explorer',start:'top 80%',end:'center 40%',scrub:.7}})}
  const docking=document.querySelector('.docking-art')
  if(docking)gsap.fromTo(docking,{rotation:-12,x:-30},{rotation:0,x:0,ease:'none',scrollTrigger:{trigger:'.partner-chapter',start:'top 85%',end:'center 50%',scrub:.8}})
  const closing=document.querySelector('.closing-sculpture')
  if(closing)ScrollTrigger.create({trigger:closing,start:'top bottom',end:'center 65%',onUpdate:self=>window.dispatchEvent(new CustomEvent('exhibit-progress',{detail:{kind:'closing',progress:self.progress}}))})
  return api
}
