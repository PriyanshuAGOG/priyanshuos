import * as THREE from 'three';
import { createCharacter, poseAt, STATES } from './character.js';

export function createMascot(container, options={}) {
  let destroyed=false, renderer, observer, raf=0, fallback;
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const runtime={state:'idle',speaking:false,listening:false,level:0,input:0,facing:0,lookX:0,lookY:0};
  const {root,joints}=createCharacter();
  const initialY=joints.hips.position.y;
  const scene=new THREE.Scene(); scene.add(root);
  const camera=new THREE.PerspectiveCamera(28,1,.1,30);
  camera.position.set(0,1.02,4.45); camera.lookAt(0,1.02,0);
  scene.add(new THREE.HemisphereLight('#fff0df','#71798b',2));
  const key=new THREE.DirectionalLight('#fff4e6',3.1);key.position.set(-3,5,5);scene.add(key);
  const rim=new THREE.DirectionalLight('#b5d9ff',2.3);rim.position.set(3,3,-3);scene.add(rim);
  const fill=new THREE.DirectionalLight('#ffffff',.7);fill.position.set(2,1,4);scene.add(fill);
  const targetQuaternion=new THREE.Quaternion(),euler=new THREE.Euler();
  let last=0,elapsed=0,stateTime=0,jawLevel=0;
  function trigger(state) {
    if(!STATES.includes(state)) return false;
    if(runtime.state!==state) {runtime.state=state;stateTime=0;options.onStateChange?.(state);}
    return true;
  }
  function resize() {
    if(!renderer||destroyed) return;
    const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight);
    renderer.setSize(w,h,false);camera.aspect=w/h;
    camera.position.z=Math.max(4.45,3.05/camera.aspect);camera.updateProjectionMatrix();
  }
  function pointer(event) {
    const r=container.getBoundingClientRect();
    runtime.lookX=THREE.MathUtils.clamp((event.clientX-r.left)/r.width-.5,-.5,.5);
    runtime.lookY=THREE.MathUtils.clamp((event.clientY-r.top)/r.height-.5,-.5,.5);
  }
  function leave(){runtime.lookX=0;runtime.lookY=0;}
  function frame(now) {
    if(destroyed||document.hidden) return;
    const dt=Math.min(.05,(now-last)/1000||.016);last=now;elapsed+=dt;stateTime+=dt;
    const reduced=media.matches,blend=1-Math.exp(-dt*12);
    const {rotations,lift}=poseAt(runtime.state,stateTime,runtime.level,reduced);
    rotations.head[1]+=reduced?0:runtime.lookX*.4;
    rotations.head[0]+=reduced?0:runtime.lookY*.20;
    for(const [name,xyz] of Object.entries(rotations)) {
      targetQuaternion.setFromEuler(euler.set(...xyz));joints[name].quaternion.slerp(targetQuaternion,blend);
    }
    joints.hips.position.y=THREE.MathUtils.lerp(joints.hips.position.y,initialY+lift,blend);
    // Turn the actual volume, never mirror the face or accessories.
    root.rotation.y=THREE.MathUtils.lerp(root.rotation.y,runtime.state==='walk'?runtime.facing:0,blend*.6);
    const energy=runtime.speaking||runtime.state==='talk'?runtime.level:0;
    jawLevel=THREE.MathUtils.lerp(jawLevel,energy,1-Math.exp(-dt*22));
    joints.jaw.scale.y=1+jawLevel*2.8;joints.jaw.position.y=.075-jawLevel*.018;
    const blink=reduced?1:(elapsed%4.7<.16?Math.max(.08,Math.abs(elapsed%4.7-.08)/.08):1);
    joints.eyeR.scale.y=blink;joints.eyeL.scale.y=blink;
    for(const name of ['gazeR','gazeL']) {joints[name].position.x=reduced?0:runtime.lookX*.009;joints[name].position.y=reduced?0:-runtime.lookY*.007;}
    for(const side of ['R','L']) for(let n=0;n<4;n++) {
      const open=['wave','highfive','listen','talk'].includes(runtime.state);
      const bend=open?-.05:runtime.state==='point'&&n===0?0:-.4;
      joints['finger'+side+n].rotation.x=THREE.MathUtils.lerp(joints['finger'+side+n].rotation.x,bend,blend);
    }
    renderer.render(scene,camera);raf=requestAnimationFrame(frame);
  }
  function visibility(){cancelAnimationFrame(raf);last=performance.now();if(!document.hidden&&!destroyed&&renderer)raf=requestAnimationFrame(frame);}
  function showFallback(){
    if(fallback||destroyed)return;
    fallback=document.createElement('img');fallback.src='/assets/avatar/reference/front.jpg';fallback.alt='';fallback.setAttribute('aria-hidden','true');Object.assign(fallback.style,{objectFit:'contain',position:'absolute',inset:'0',width:'100%',height:'100%'});container.append(fallback);
  }
  function contextLost(e){e.preventDefault();cancelAnimationFrame(raf);showFallback();}
  function contextRestored(){fallback?.remove();fallback=null;visibility();}
  function destroy(){
    if(destroyed)return;destroyed=true;cancelAnimationFrame(raf);observer?.disconnect();
    document.removeEventListener('visibilitychange',visibility);
    container.removeEventListener('pointermove',pointer);container.removeEventListener('pointerleave',leave);
    const geometries=new Set(),materials=new Set();
    root.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);materials.add(o.material);}});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
    renderer?.domElement.removeEventListener('webglcontextlost',contextLost);
    renderer?.domElement.removeEventListener('webglcontextrestored',contextRestored);
    renderer?.dispose();renderer?.domElement.remove();fallback?.remove();
    if(window.PriyanshuAvatar3D===api)delete window.PriyanshuAvatar3D;
  }
  const api={
    trigger,goIdle:()=>trigger('idle'),supports:s=>STATES.includes(s),preload:()=>Promise.resolve(),states:[...STATES],
    setFacing:direction=>{runtime.facing=direction>0?Math.PI/2:-Math.PI/2;},
    setSpeaking:value=>{runtime.speaking=!!value;if(value)trigger('talk');else {runtime.level=0;if(runtime.state==='talk')trigger(runtime.listening?'listen':'idle');}},
    setListening:value=>{runtime.listening=!!value;if(value&&!runtime.speaking)trigger('listen');else if(!value&&runtime.state==='listen')trigger('idle');},
    setAudioLevel:value=>{runtime.level=THREE.MathUtils.clamp(Number(value)||0,0,1);},
    setInputLevel:value=>{runtime.input=THREE.MathUtils.clamp(Number(value)||0,0,1);},
    destroy,_runtime:{scene,camera,root,joints,runtime},
  };
  api.ready=Promise.resolve().then(()=>{
    if(destroyed)return;
    try {
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setClearColor(0,0);
      renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.domElement.setAttribute('aria-hidden','true');container.append(renderer.domElement);
      api._runtime.renderer=renderer;
      observer=new ResizeObserver(resize);observer.observe(container);resize();
      renderer.domElement.addEventListener('webglcontextlost',contextLost);
      renderer.domElement.addEventListener('webglcontextrestored',contextRestored);
      document.addEventListener('visibilitychange',visibility);
      container.addEventListener('pointermove',pointer);container.addEventListener('pointerleave',leave);
      if(!document.hidden)raf=requestAnimationFrame(frame);
    } catch(error){console.error('[mascot] WebGL unavailable',error);renderer?.dispose();renderer?.domElement.remove();showFallback();}
  });
  window.PriyanshuAvatar3D=api;
  return api;
}
window.MascotEngine={createMascot,GESTURES:Object.fromEntries(STATES.map(s=>[s,{label:s}]))};
