import * as T from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { materials, productModel, networkModel, droneModel, retailModel, scopeModel, collaborationModel, ribbonModel } from './system-models.js'

// One canvas follows the visible exhibit. Rendering stops when movement settles.
export function initAssembly(slots,{quiet=false}={}){
  let renderer
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})}catch{window.dispatchEvent(new CustomEvent('system-unavailable'));return {setProgress(){},destroy(){}}}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0xf0ede6,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.VSMShadowMap;renderer.domElement.setAttribute('aria-hidden','true')
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,80),pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04)
  scene.environment=env.texture;room.dispose();pmrem.dispose();scene.add(new T.HemisphereLight(0xffffff,0x817d7a,2))
  const key=new T.DirectionalLight(0xffffff,3);key.position.set(-2,10,3);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-8,right:8,top:8,bottom:-8});key.shadow.bias=-.0005;key.shadow.radius=5;key.shadow.blurSamples=8;scene.add(key)
  const rim=new T.DirectionalLight(0xc7d9e5,2);rim.position.set(4,3,-3);scene.add(rim)
  const m=materials(),models={product:productModel(m),network:networkModel(m),vision:droneModel(m),retail:retailModel(m),scope:scopeModel(m),collaboration:collaborationModel(m),closing:ribbonModel(m)},pivot=new T.Group();scene.add(pivot)
  Object.values(models).forEach(model=>pivot.add(model.root))
  const floor=new T.Mesh(new T.PlaneGeometry(40,40),new T.ShadowMaterial({opacity:.075}));floor.rotation.x=-Math.PI/2;floor.position.y=-2.35;floor.receiveShadow=true;scene.add(floor)
  let active,kind='product',frame=0,visible=false,disposed=false,last=0,progress=0,selected=1,requestStart=-100,clock=0,drag=null
  const target={rx:0,ry:0,progress:0,stage:0},current={...target},states={vision:0,retail:0,scope:0,collaboration:0},progresses={closing:0}
  function invalidate(){if(!frame&&!disposed&&!document.hidden&&visible)frame=requestAnimationFrame(render)}
  function render(now){
    frame=0;if(disposed||!active||document.hidden||!visible)return
    const dt=Math.min((now-last)/1000||.016,.05);last=now;clock+=dt
    const ease=quiet?1:1-Math.exp(-dt*6)
    Object.keys(current).forEach(k=>current[k]+=(target[k]-current[k])*ease)
    pivot.rotation.set(current.rx,current.ry,0)
    const request=clock-requestStart,running=!quiet&&request<3.3
    models[kind].update(current.progress,kind==='product'?selected:current.stage,running?request:0)
    renderer.render(scene,camera)
    if(running||Object.keys(current).some(k=>Math.abs(current[k]-target[k])>.001))invalidate()
  }
  function resize(){if(!active)return;const r=active.getBoundingClientRect(),h=r.height*(active.classList.contains('project-scene')?.73:1);renderer.setSize(r.width,h,false);camera.aspect=r.width/Math.max(1,h);camera.position.set(kind==='closing'?0:kind==='product'?3.7:6,kind==='closing'?2:kind==='product'?2.4:4.5,camera.aspect<1.1?14:11.7);camera.lookAt(0,0,0);camera.updateProjectionMatrix();pivot.scale.setScalar(kind==='product'?1.25:kind==='collaboration'?1.5:1.12);floor.visible=kind!=='closing';invalidate()}
  function attach(slot){if(active!==slot){active?.classList.remove('has-live');active=slot;kind=slot.dataset.volume||'product';Object.entries(models).forEach(([name,model])=>model.root.visible=name===kind);active.appendChild(renderer.domElement);active.classList.add('has-live');target.progress=slot.dataset.assembly==='architecture'?.62:slot.dataset.assembly==='hero'?progress:quiet?1:progresses[kind]||0;target.stage=states[kind]||0;resize()}invalidate()}
  const ratios=new Map(slots.map(s=>[s,0])),io=new IntersectionObserver(entries=>{entries.forEach(e=>ratios.set(e.target,e.isIntersecting?e.intersectionRatio:0));const best=[...ratios].sort((a,b)=>b[1]-a[1])[0];visible=best[1]>0;if(visible)attach(best[0]);else{cancelAnimationFrame(frame);frame=0}},{threshold:[0,.05,.2,.5,.8,1]});slots.forEach(s=>io.observe(s))
  const ro=new ResizeObserver(resize);slots.forEach(s=>ro.observe(s))
  function pointer(e){if(quiet||e.pointerType==='touch'||e.currentTarget!==active)return;const r=active.getBoundingClientRect();if(drag){target.ry=T.MathUtils.clamp(drag.ry+(e.clientX-drag.x)*.006,-.85,.85);target.rx=T.MathUtils.clamp(drag.rx+(e.clientY-drag.y)*.003,-.35,.35)}else{target.ry=(e.clientX-r.left-r.width/2)/r.width*.18;target.rx=(e.clientY-r.top-r.height/2)/r.height*.08}invalidate()}
  function down(e){if(quiet||e.pointerType==='touch'||e.target.closest('button,a')||e.currentTarget!==active)return;drag={x:e.clientX,y:e.clientY,rx:target.rx,ry:target.ry};active.setPointerCapture(e.pointerId);active.classList.add('is-dragging')}
  function up(){drag=null;active?.classList.remove('is-dragging')}
  function leave(){if(drag)return;target.rx=target.ry=0;invalidate()}
  slots.forEach(s=>{s.addEventListener('pointermove',pointer);s.addEventListener('pointerdown',down);s.addEventListener('pointerup',up);s.addEventListener('pointercancel',up);s.addEventListener('pointerleave',leave)})
  function layer(e){selected=e.detail;target.progress=.28+selected*.32;invalidate()}
  function request(){requestStart=clock;invalidate()}
  function state(e){states[e.detail.kind]=e.detail.stage;if(kind===e.detail.kind){target.stage=e.detail.stage;request()}}
  function exhibitProgress(e){progresses[e.detail.kind]=quiet?1:e.detail.progress;if(kind===e.detail.kind){target.progress=progresses[kind];invalidate()}}
  window.addEventListener('assembly-layer',layer);window.addEventListener('system-request',request);window.addEventListener('exhibit-state',state)
  window.addEventListener('exhibit-progress',exhibitProgress)
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0}else invalidate()};document.addEventListener('visibilitychange',visibility)
  function lost(e){e.preventDefault();active?.classList.remove('has-live');window.dispatchEvent(new CustomEvent('system-unavailable'));visible=false;cancelAnimationFrame(frame);frame=0};renderer.domElement.addEventListener('webglcontextlost',lost)
  return {setProgress(p){progress=quiet?0:p;if(active?.dataset.assembly==='hero'){target.progress=progress;invalidate()}},destroy(){disposed=true;cancelAnimationFrame(frame);io.disconnect();ro.disconnect();slots.forEach(s=>{s.classList.remove('has-live');s.removeEventListener('pointermove',pointer);s.removeEventListener('pointerdown',down);s.removeEventListener('pointerup',up);s.removeEventListener('pointercancel',up);s.removeEventListener('pointerleave',leave)});window.removeEventListener('assembly-layer',layer);window.removeEventListener('system-request',request);window.removeEventListener('exhibit-state',state);window.removeEventListener('exhibit-progress',exhibitProgress);document.removeEventListener('visibilitychange',visibility);const textures=new Set(),materials=new Set(),geometries=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(mat=>{materials.add(mat);Object.values(mat).forEach(v=>{if(v?.isTexture)textures.add(v)})})});textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());env.dispose();renderer.dispose();renderer.domElement.remove()}}
}
