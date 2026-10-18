import * as T from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// All geometry and surface detail are generated here; no concept images or models.
export function materials(){
  const c=document.createElement('canvas');c.width=256;c.height=128
  const ctx=c.getContext('2d');ctx.fillStyle='#c0c0c0';ctx.fillRect(0,0,256,128)
  for(let y=0;y<128;y++){ctx.fillStyle=`rgba(255,255,255,${.08+((y*17)%13)/100})`;ctx.fillRect(0,y,256,1)}
  const grain=new T.CanvasTexture(c);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(1,3)
  return {
    metal:new T.MeshStandardMaterial({color:0xdce0e2,metalness:.98,roughness:.25,roughnessMap:grain,envMapIntensity:1.8}),
    dark:new T.MeshStandardMaterial({color:0x17242a,metalness:.55,roughness:.3}),
    wine:new T.MeshStandardMaterial({color:0x650f2c,metalness:.5,roughness:.25}),
    blue:new T.MeshStandardMaterial({color:0x9dbecd,metalness:.25,roughness:.3}),
    paper:new T.MeshStandardMaterial({color:0xf0ede6,roughness:.7}),
    glass:new T.MeshPhysicalMaterial({color:0xc4e0ed,transparent:true,opacity:.3,roughness:.13,metalness:.15,clearcoat:1,depthWrite:false,side:T.DoubleSide}),
    light:new T.MeshStandardMaterial({color:0xccebf6,emissive:0x82a9b9,emissiveIntensity:.45})
  }
}
function box(parent,mat,size,pos,r=.06){const o=new T.Mesh(new RoundedBoxGeometry(...size,3,r),mat);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function ball(parent,mat,r,pos){const o=new T.Mesh(new T.SphereGeometry(r,20,12),mat);o.position.set(...pos);o.castShadow=true;parent.add(o);return o}
function pipe(parent,mat,points,r=.035){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const o=new T.Mesh(new T.TubeGeometry(curve,48,r,10,false),mat);parent.add(o);return curve}
function label(parent,text,pos,width=2,color='#243039'){
  const c=document.createElement('canvas');c.width=768;c.height=100;const ctx=c.getContext('2d');ctx.font='600 38px Manrope, sans-serif';ctx.fillStyle=color;ctx.fillText(text,4,62)
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace
  const mesh=new T.Mesh(new T.PlaneGeometry(width,width*100/768),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));mesh.position.set(...pos);parent.add(mesh)
}
function panel(parent,mat,w,h){const p=box(parent,mat,[w,h,.12],[0,0,0]);p.add(new T.LineSegments(new T.EdgesGeometry(p.geometry,30),new T.LineBasicMaterial({color:0x8aabbc,transparent:true,opacity:.6})));return p}

export function productModel(m){
  const root=new T.Group(),layers=[new T.Group(),new T.Group(),new T.Group()];root.add(...layers)
  const [ui,services,ai]=layers
  panel(ui,m.metal,5.8,3.65);box(ui,m.paper,[5.6,3.45,.07],[0,0,.1]);box(ui,m.dark,[5.5,.46,.06],[0,1.45,.16])
  for(let i=0;i<3;i++)ball(ui,i===0?m.wine:m.blue,.045,[-2.48+i*.15,1.45,.21])
  label(ui,'PRODUCT / SYSTEM STUDY',[-.45,1.44,.21],2.7,'#e9eff1')
  box(ui,m.blue,[1.08,2.8,.06],[-2.18,-.18,.16]);for(let i=0;i<5;i++)box(ui,m.paper,[.65,.045,.03],[-2.18,.73-i*.29,.2],.01)
  label(ui,'Make complex work clear.',[-.05,.9,.2],3.1)
  const bars=[]
  for(let i=0;i<9;i++){const h=.35+((i*7)%9)*.085;bars.push(box(ui,i%3?m.blue:m.wine,[.23,h,.16],[-1.21+i*.42,-.33+h/2,.22]))}
  for(let i=0;i<3;i++){box(ui,m.glass,[1.08,.57,.08],[-.95+i*1.25,-1.02,.2]);label(ui,['INTERFACE','SERVICES','INSIGHT'][i],[-.99+i*1.25,-1.02,.26],.98)}
  panel(services,m.glass,5.65,3.5);label(services,'02 / SERVICES + DATA',[-.15,1.38,.13],3.6)
  const nodes=[[-1.8,.35],[0,.35],[1.8,.35],[0,-.95]]
  nodes.forEach(([x,y],i)=>{box(services,m.metal,[1.05,.68,.35],[x,y,.2]);label(services,['API','AUTH','DATA','EVENTS'][i],[x,y,.39],.8);ball(services,m.wine,.065,[x+.4,y+.22,.41])})
  pipe(services,m.wine,[[-2.8,.35,.3],[-1.8,.35,.3],[0,.35,.3],[1.8,.35,.3],[2.8,.35,.3]],.055)
  pipe(services,m.wine,[[0,.35,.3],[0,-.3,.3],[0,-.95,.3]],.045)
  panel(ai,m.glass,5.5,3.4);label(ai,'03 / APPLIED INTELLIGENCE',[-.15,1.36,.13],3.8)
  const cloud=new T.InstancedMesh(new T.SphereGeometry(.043,8,6),m.wine,144);ai.add(cloud);const dummy=new T.Object3D()
  const packetMaterial=m.wine.clone();packetMaterial.emissive.set(0x65152b);packetMaterial.emissiveIntensity=.35
  const packet=ball(root,packetMaterial,.14,[0,0,0])
  const connectors=[0,1].map(()=>{const mesh=new T.Mesh(new T.CylinderGeometry(.025,.025,1,10),m.wine);root.add(mesh);return mesh})
  const up=new T.Vector3(0,1,0),direction=new T.Vector3()
  return {root,update(p,selected,request){
    // A request opens its own explainer even before the visitor starts scrolling.
    if(request>0)p=Math.max(p,Math.sin(Math.min(1,request/3.2)*Math.PI)*.85)
    const split=T.MathUtils.clamp(p*1.6,0,1)
    layers.forEach((l,i)=>{l.position.set((i-1)*split*3.65,(i-1)*split*.38,(1-i)*(.4+split*.7));l.rotation.y=(i-1)*split*.16})
    root.scale.setScalar(1-split*.3)
    root.rotation.set(-.04+p*.12,-.4+Math.sin(p*Math.PI)*.16,Math.sin(p*Math.PI)*.04)
    const morph=T.MathUtils.smoothstep(p,.42,.86)
    for(let i=0;i<144;i++){const y=1-2*(i+.5)/144,r=Math.sqrt(1-y*y),a=i*2.39996;dummy.position.set(T.MathUtils.lerp((i%12-5.5)*.23,Math.cos(a)*r*1.25,morph),T.MathUtils.lerp((Math.floor(i/12)-5.5)*.19,y*1.12,morph),T.MathUtils.lerp(.2,Math.sin(a)*r*1.25,morph));dummy.updateMatrix();cloud.setMatrixAt(i,dummy.matrix)}cloud.instanceMatrix.needsUpdate=true
    const anchors=layers.map((layer,i)=>new T.Vector3(0,i===2?0:.35,.43).applyEuler(layer.rotation).add(layer.position))
    connectors.forEach((wire,i)=>{direction.subVectors(anchors[i+1],anchors[i]);wire.visible=split>.05;wire.position.copy(anchors[i]).add(anchors[i+1]).multiplyScalar(.5);wire.scale.y=direction.length();wire.quaternion.setFromUnitVectors(up,direction.normalize())})
    const t=T.MathUtils.clamp(request/3.2,0,1),step=Math.min(3,Math.floor(t*4)),route=[0,1,2,1,0],along=t*4-step
    packet.visible=request>0&&t<1;packet.position.lerpVectors(anchors[route[step]],anchors[route[step+1]],along)
    packetMaterial.color.set(t<.5?0x650f2c:0x4c829d)
    bars.forEach((b,i)=>b.scale.y=1+(request>0?Math.sin(t*Math.PI*2+i*.4)*.18:0))
  }}
}

export function networkModel(m){
  const root=new T.Group();box(root,m.metal,[7.4,.12,3], [0,-1.25,0])
  for(let i=0;i<6;i++){const x=-2.75+i*1.1;const arch=new T.Mesh(new T.TorusGeometry(1.2,.055,8,32,Math.PI),m.metal);arch.rotation.y=Math.PI/2;arch.position.x=x;root.add(arch);box(root,m.glass,[.05,1.2,2.4],[x,-.6,0]);for(const z of [-1.2,1.2])box(root,m.metal,[.075,1.2,.075],[x,-.6,z])}
  const curve=pipe(root,m.wine,[[-3.8,-.45,0],[-1.8,-.3,0],[0,-.4,0],[2,-.25,0],[3.8,-.4,0]],.07),packet=ball(root,m.metal,.24,[-3.8,-.45,0]);root.rotation.y=-.2
  return {root,update(p,stage,request){packet.position.copy(curve.getPoint(T.MathUtils.clamp(request/3.1,0,1)))}}
}
export function droneModel(m){
  const root=new T.Group(),drone=new T.Group();root.add(drone);drone.position.y=.95
  box(drone,m.dark,[.86,.24,1.2],[0,0,0]);box(drone,m.metal,[.64,.08,.86],[0,.16,0]);const rotors=[]
  for(const x of [-1,1])for(const z of [-1,1]){const arm=box(drone,m.metal,[1.65,.06,.09],[x*.64,0,z*.56]);arm.rotation.y=-x*z*.72;const motor=new T.Mesh(new T.CylinderGeometry(.12,.13,.22,16),m.dark);motor.position.set(x*1.26,.05,z*1.08);drone.add(motor);const blade=box(drone,m.dark,[1.15,.025,.11],[x*1.26,.19,z*1.08]);rotors.push(blade)}
  ball(drone,m.metal,.18,[0,-.25,.42]);ball(drone,m.blue,.1,[0,-.26,.55]);for(const x of [-.42,.42])pipe(drone,m.metal,[[x,-.1,-.35],[x,-.48,-.35],[x,-.5,.4],[x,-.1,.4]])
  for(let j=0;j<24;j++){const points=[];for(let i=0;i<49;i++){const x=(i-24)*.18,z=(j-12)*.2;points.push(new T.Vector3(x,-1.3+Math.sin(x*1.4+z)*.17+Math.cos(z*2)*.11,z))}root.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0x87aabd,transparent:true,opacity:.45})))}
  const cone=new T.Mesh(new T.ConeGeometry(1.2,1.9,4,1,true),new T.MeshBasicMaterial({color:0xc7d9e5,wireframe:true,transparent:true,opacity:.25}));cone.position.y=-.25;root.add(cone)
  const target=ball(root,m.wine,.11,[0,-1.12,0]);pipe(root,m.wine,[[0,-1.12,0],[.9,-1.05,.4],[2,-1.15,-.3]],.025)
  return {root,update(p,stage,request){rotors.forEach((r,i)=>r.rotation.y=request*(i%2?18:-18));cone.material.opacity=stage===2?.1:.3;target.position.x=stage===2?1.6:0;drone.rotation.z=request?Math.sin(request*2)*.025:0}}
}
export function retailModel(m){
  const root=new T.Group();box(root,m.metal,[6.8,.15,2.7],[0,-1.2,0]);const bars=[]
  for(let i=0;i<12;i++)bars.push(box(root,i%3?m.blue:m.wine,[.38,.75,.38],[0,0,0]))
  const shelf=box(root,m.glass.clone(),[6.5,2,.07],[0,-.12,-.8]);root.rotation.y=-.3
  return {root,update(p,stage){bars.forEach((b,i)=>{const h=.5+((i*7)%11)*.15;b.position.set(T.MathUtils.lerp((i%6-2.5)*.9,(i-5.5)*.49,stage),T.MathUtils.lerp(-.8+Math.floor(i/6)*1.0,-1.1+h/2,stage),T.MathUtils.lerp(Math.floor(i/6)*.65,.1,stage));b.scale.y=T.MathUtils.lerp(1,h/.75,stage)});shelf.material.opacity=.3*(1-stage)}}
}

export function scopeModel(m){
  const root=new T.Group(),plates=[]
  for(let i=0;i<3;i++){
    const group=new T.Group();root.add(group);plates.push(group)
    const material=i===1?m.metal:m.glass.clone();if(i!==1)material.opacity=.56
    panel(group,material,2.25,3.5)
    label(group,['PRODUCT INTERFACES','CONNECTED SYSTEMS','APPLIED INTELLIGENCE'][i],[0,1.3,.13],2)
    if(i===0){
      const outline=[[-.8,.7,.14],[.8,.7,.14],[.8,-1.05,.14],[-.8,-1.05,.14],[-.8,.7,.14]]
      pipe(group,m.blue,outline,.018);pipe(group,m.blue,[[-.8,.28,.14],[.8,.28,.14]],.018)
      for(let j=0;j<3;j++)box(group,m.paper,[.65,.075,.055],[.17,-.05-j*.3,.16],.015)
      box(group,m.blue,[.33,1.0,.05],[-.52,-.38,.15])
    }else if(i===1){
      const nodes=[[-.68,.52,.18],[.65,.25,.18],[-.1,-.85,.18],[-.55,-.2,.18]]
      nodes.forEach(p=>ball(group,m.wine,.075,p));pipe(group,m.dark,[nodes[0],nodes[1],nodes[2],nodes[3],nodes[0]],.018);pipe(group,m.dark,[nodes[0],nodes[2]],.018)
    }else{
      for(let j=0;j<64;j++){const y=1-2*(j+.5)/64,r=Math.sqrt(1-y*y),a=j*2.39996;ball(group,m.wine,.028,[Math.cos(a)*r*.8,y*.85-.15,Math.sin(a)*r*.35+.13])}
    }
  }
  pipe(root,m.wine,[[-4.8,-.35,.18],[-2.6,-.35,.18],[0,-.35,.18],[2.6,-.35,.18],[4.8,-.35,.18]],.045)
  const couplers=[-2.6,0,2.6].map(x=>ball(root,m.metal,.12,[x,-.35,.18]))
  return {root,update(p,stage){plates.forEach((plate,i)=>{const focus=Math.max(0,1-Math.abs(stage-i));plate.position.set((i-1)*2.6,focus*.16,focus*.35);plate.rotation.y=-.12+(i-1)*.09;couplers[i].position.z=.18+focus*.35});root.rotation.set(-.03,-.12,0)}}
}

export function collaborationModel(m){
  const root=new T.Group(),links=[]
  for(let i=0;i<2;i++){const ring=new T.Mesh(new T.TorusGeometry(1.15,.19,16,64),m.metal);ring.castShadow=true;ring.receiveShadow=true;root.add(ring);links.push(ring)}
  const connector=pipe(root,m.wine,[[-3.3,-.35,.05],[-1.5,-.15,.15],[0,.05,-.1],[1.5,.25,.1],[3.3,.4,0]],.06)
  const joint=ball(root,m.wine,.2,[0,.05,-.1])
  return {root,update(p,stage,request){const join=request>0?1-Math.exp(-request*4):1;links.forEach((link,i)=>{link.position.set((i?1:-1)*(1.48-join*.68),0,0);link.rotation.set(i?Math.PI/2+.15:0,(i?-.25:.3)+stage*.1,(i?1:-1)*.16)});joint.scale.setScalar(.8+join*.2);root.rotation.y=-.1;root.rotation.z=.08}}
}

export function ribbonModel(m){
  const root=new T.Group(),curve=new T.CatmullRomCurve3([new T.Vector3(-6,-.5,0),new T.Vector3(-3,-.1,.2),new T.Vector3(-1,-.1,0),new T.Vector3(.8,.6,-.1),new T.Vector3(1.1,1.5,.5),new T.Vector3(-.6,1.7,.1),new T.Vector3(-1.2,.6,-.7),new T.Vector3(.8,-.25,.3),new T.Vector3(3,.1,.1),new T.Vector3(6,.5,0)])
  const positions=[],indices=[],steps=180,normal=new T.Vector3(),side=new T.Vector3(),up=new T.Vector3(0,0,1)
  for(let i=0;i<=steps;i++){
    const t=i/steps,point=curve.getPoint(t),tangent=curve.getTangent(t)
    side.crossVectors(tangent,up).normalize();normal.crossVectors(side,tangent).normalize()
    const twist=Math.sin(t*Math.PI*3)*.85;side.multiplyScalar(Math.cos(twist)).addScaledVector(normal,Math.sin(twist))
    for(const sign of [-1,1])positions.push(point.x+side.x*.2*sign,point.y+side.y*.2*sign,point.z+side.z*.2*sign)
    if(i<steps){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2)}
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals()
  const material=m.metal.clone();material.side=T.DoubleSide;material.roughness=.24
  const band=new T.Mesh(geometry,material);band.castShadow=true;root.add(band)
  return {root,update(p){geometry.setDrawRange(0,Math.max(6,Math.floor((.12+p*.88)*steps)*6));root.rotation.x=-.1}}
}
