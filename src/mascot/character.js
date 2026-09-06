import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// Authored, volumetric character. Coordinates are metres, Y up, face toward +Z.
// Every moving part belongs to an anatomical pivot; no pose cards or billboards.
export function createCharacter() {
  const root = new THREE.Group(); root.name = 'Priyanshu';
  const joints = {};
  const mat = (color, roughness = .65, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const materials = {
    skin: mat('#d99057', .58), innerEar: mat('#b96943'), lip: mat('#99533b'),
    hair: mat('#101116', .68), strand: mat('#181a20', .72), jacket: mat('#303239', .83),
    seam: mat('#45474d', .85), cuff: mat('#25272c', .91), trousers: mat('#22242b', .88),
    white: mat('#f5f2ec', .68), sole: mat('#dfdedb', .84), blue: mat('#087dc0', .4),
    glasses: mat('#14181c', .26), metal: mat('#a0a6ae', .3, .8), eye: mat('#fff8e9', .25),
    iris: mat('#60321e', .28), pupil: mat('#09090b', .17), mouth: mat('#3b1518', .9),
  };
  const sphere = new THREE.SphereGeometry(1, 24, 16);
  function mesh(parent, name, geo, material, xyz = [0, 0, 0], scale = [1, 1, 1]) {
    const m = new THREE.Mesh(geo, material); m.name = name; m.position.set(...xyz); m.scale.set(...scale);
    m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  const oval = (p, n, m, xyz, s) => mesh(p, n, sphere, m, xyz, s);
  function pivot(parent, name, xyz) {
    const g = new THREE.Group(); g.name = name; g.position.set(...xyz); parent.add(g); joints[name] = g; return g;
  }
  function tube(parent, name, points, radius, material, segments = 24) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return mesh(parent, name, new THREE.TubeGeometry(curve, segments, radius, 7, false), material);
  }
  function box(parent, name, xyz, size, material, radius = .015) {
    // Rounded cross-section with true depth and bevels, for eyewear/accessories.
    const [w,h,d] = size, r = Math.min(radius,w/2,h/2);
    const shape = new THREE.Shape();
    shape.moveTo(-w/2+r,-h/2); shape.lineTo(w/2-r,-h/2);
    shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r); shape.lineTo(w/2,h/2-r);
    shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2); shape.lineTo(-w/2+r,h/2);
    shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r); shape.lineTo(-w/2,-h/2+r);
    shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const geo = new THREE.ExtrudeGeometry(shape, {depth:d,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2,steps:1,curveSegments:6});
    geo.translate(0,0,-d/2); return mesh(parent,name,geo,material,xyz);
  }
  // Continuous tailored forms use elliptical lofts, rather than stacks of balls.
  function loft(parent, name, rings, material) {
    const vertices=[], indices=[], count=48;
    rings.forEach(([y,rx,rz,cx=0,cz=0]) => {
      for(let k=0;k<count;k++) { const a=k/count*Math.PI*2; vertices.push(cx+rx*Math.cos(a),y,cz+rz*Math.sin(a)); }
    });
    for(let j=0;j<rings.length-1;j++) for(let k=0;k<count;k++) {
      const a=j*count+k,b=j*count+(k+1)%count,c=a+count,d=b+count;
      indices.push(a,c,b,b,c,d);
    }
    for(let k=1;k<count-1;k++) { indices.push(0,k,(k+1)); const a=(rings.length-1)*count; indices.push(a,a+k+1,a+k); }
    if(rings[1][0]<rings[0][0]) for(let i=0;i<indices.length;i+=3) [indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); geo.setIndex(indices); geo.computeVertexNormals();
    return mesh(parent,name,geo,material);
  }
  const hips = pivot(root, 'hips', [0, .91, 0]);
  loft(hips,'trouser-seat',[[-.10,.195,.115],[0,.21,.125],[.10,.18,.12]],materials.trousers);
  const chest = pivot(hips,'chest',[0,.10,0]);
  loft(chest,'jacket',[[-.03,.207,.126],[.02,.218,.134],[.13,.21,.137],[.29,.245,.145],[.36,.215,.122],[.40,.13,.10]],materials.jacket);
  // Shirt is a convex tailored inset; centre stays visible between jacket fronts.
  loft(chest,'shirt',[[-.055,.090,.020,0,.131],[.02,.091,.023,0,.132],[.24,.095,.021,0,.145],[.37,.087,.020,0,.111]],materials.white);
  for(const side of [-1,1]) {
    tube(chest,'zipper',[[side*.102,-.02,.146],[side*.105,.12,.153],[side*.113,.28,.155],[side*.080,.39,.105]],.006,materials.metal);
    for(let i=0;i<25;i++) box(chest,'zip-tooth',[side*(.104+Math.sin(i/25*Math.PI)*.008),i*.012,.16],[.012,.003,.006],materials.metal,.001);
    const collar=box(chest,'shirt-collar',[side*.060,.351,.132],[.074,.096,.014],materials.white); collar.rotation.z=side*.32;
    tube(chest,'jacket-collar',[[side*.07,.365,.105],[side*.105,.407,.06],[side*.105,.409,-.06],[side*.035,.41,-.1]],.022,materials.cuff);
    tube(chest,'pocket-welt',[[side*.142,.035,.136],[side*.181,.112,.13]],.009,materials.cuff);
    tube(chest,'shoulder-seam',[[side*.125,.362,.096],[side*.205,.330,.124],[side*.235,.275,.06]],.003,materials.seam);
  }
  for(let i=0;i<5;i++) oval(chest,'shirt-button',materials.sole,[.007,.015+i*.064,.157],[.007,.007,.003]);
  box(chest,'chest-pocket',[.164,.26,.142],[.079,.016,.009],materials.cuff,.003);
  box(chest,'blue-zip-pull',[.134,.222,.157],[.012,.056,.009],materials.blue,.004);
  oval(chest,'zip-ring',materials.metal,[.134,.255,.155],[.008,.011,.004]);
  loft(chest,'jacket-hem',[[-.026,.214,.132],[.003,.217,.136],[.020,.213,.132]],materials.cuff);
  // Neck, jaw and cranium, sculpted as one continuous head surface.
  oval(chest,'neck',materials.skin,[0,.435,0],[.075,.13,.074]);
  const head = pivot(chest,'head',[0,.50,0]);
  const headGeo = new THREE.SphereGeometry(1,64,48);
  const p = headGeo.attributes.position;
  for(let i=0;i<p.count;i++) {
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const jaw = y < -.18 ? 1 + (y+.18)*.19 : 1;
    p.setXYZ(i,x*.205*jaw,y*.255+.175,z*.173 + (z>0 ? .024*(1-y*y) : 0));
  }
  headGeo.computeVertexNormals(); mesh(head,'face',headGeo,materials.skin);
  for(const s of [-1,1]) {
    oval(head,'ear',materials.skin,[s*.207,.142,-.003],[.043,.071,.028]);
    oval(head,'ear-concha',materials.innerEar,[s*.218,.148,.020],[.024,.044,.010]);
    tube(head,'ear-fold',[[s*.214,.117,.029],[s*.228,.163,.029],[s*.216,.180,.027]],.008,materials.skin);
    oval(head,'ear-stud',materials.metal,[s*.220,.097,.021],[.009,.009,.006]);
    const eye=pivot(head,s<0?'eyeR':'eyeL',[s*.084,.190,.157]);
    oval(eye,'sclera',materials.eye,[0,0,0],[.060,.038,.029]);
    const gaze=pivot(eye,s<0?'gazeR':'gazeL',[0,0,.025]);
    oval(gaze,'iris',materials.iris,[0,0,0],[.025,.026,.009]);
    oval(gaze,'pupil',materials.pupil,[0,0,.008],[.013,.016,.004]);
    oval(gaze,'catchlight',materials.eye,[-.007,.009,.012],[.005,.005,.002]);
    tube(head,'upper-eyelid',[[s*.084-.058,.19,.168],[s*.084-.03,.221,.179],[s*.084+.025,.222,.179],[s*.084+.058,.19,.162]],.006,materials.skin);
    const brow=pivot(head,s<0?'browR':'browL',[s*.085,.255,.15]);
    tube(brow,'eyebrow',[[-.059,-.002,0],[-.030,.009,.006],[.009,.012,.010],[.052,.001,0]],.011,materials.hair);
    const framePoints=[[-.065,.035,0],[.060,.035,0],[.069,.021,0],[.056,-.041,0],[.024,-.048,0],[-.037,-.044,0],[-.060,-.032,0],[-.071,.018,0],[-.065,.035,0]];
    tube(head,'spectacle-frame',framePoints.map(([x,y,z])=>[x+s*.086,y+.194,z+.202]),.0065,materials.glasses,40);
    tube(head,'spectacle-temple',[[s*.158,.216,.200],[s*.205,.212,.085],[s*.221,.18,-.015]],.006,materials.glasses);
    oval(head,'nostril',materials.innerEar,[s*.025,.121,.214],[.009,.005,.003]);
  }
  tube(head,'glasses-bridge',[[-.020,.213,.208],[0,.224,.218],[.020,.213,.208]],.006,materials.glasses);
  oval(head,'nose-bridge',materials.skin,[0,.170,.173],[.027,.057,.029]);
  oval(head,'nose-tip',materials.skin,[0,.133,.202],[.037,.024,.029]);
  const jaw=pivot(head,'jaw',[0,.075,.172]);
  oval(jaw,'mouth-interior',materials.mouth,[0,0,0],[.063,.019,.009]);
  box(jaw,'upper-teeth',[0,.010,.009],[.088,.013,.006],materials.eye,.006);
  tube(jaw,'lower-lip',[[-.059,0,.005],[-.025,-.018,.013],[.025,-.016,.013],[.059,.004,.002]],.006,materials.lip);
  // Swept locks have changing thickness and fine parallel ridges, modeled all around.
  oval(head,'hair-cap',materials.hair,[0,.330,-.034],[.218,.126,.173]);
  for(let row=0;row<4;row++) for(let col=0;col<5;col++) {
    const x=-.175+col*.063, z=-.12+row*.072;
    const y=.326+.051*Math.sqrt(Math.max(0,1-(x/.24)**2));
    const pts=[[x-.015,y-.026,z],[x-.025,y+.025,z+.020],[x+.03,y+.050,z+.040],[x+.073,y+.01,z+.029]];
    const curve=new THREE.CatmullRomCurve3(pts.map(v=>new THREE.Vector3(...v)));
    const geo=new THREE.TubeGeometry(curve,20,.025,8,false);
    const pos=geo.attributes.position; const frames=curve.computeFrenetFrames(20,false);
    for(let j=0;j<=20;j++) {
      const centre=curve.getPointAt(j/20), radius=.041*Math.sin(Math.PI*(.15+.79*j/20));
      for(let k=0;k<=8;k++) { const a=k/8*Math.PI*2, v=centre.clone().addScaledVector(frames.normals[j],Math.cos(a)*radius).addScaledVector(frames.binormals[j],Math.sin(a)*radius*.65); pos.setXYZ(j*9+k,v.x,v.y,v.z); }
    }
    geo.computeVertexNormals(); mesh(head,'swept-lock',geo,materials.hair);
    for(let r=0;r<2;r++) tube(head,'hair-ridge',pts.map(([a,b,c])=>[a,b+.022,c+r*.009]),.0014,materials.strand,18);
  }
  for(const s of [-1,1]) oval(head,'sideburn',materials.hair,[s*.189,.251,-.017],[.024,.094,.080]);
  // Arms are jointed at shoulder, elbow, wrist, and each finger.
  for(const [side,s] of [['R',-1],['L',1]]) {
    const arm=pivot(chest,'arm'+side,[s*.233,.295,0]);
    loft(arm,'upper-sleeve',[[.045,.034,.035],[.028,.060,.063],[0,.078,.079],[-.05,.081,.08],[-.14,.073,.074],[-.215,.063,.063],[-.229,.055,.054]],materials.jacket);
    const elbow=pivot(arm,'elbow'+side,[0,-.215,0]);
    loft(elbow,'fore-sleeve',[[.020,.063,.063],[-.08,.069,.065],[-.17,.056,.055],[-.20,.048,.051]],materials.jacket);
    loft(elbow,'ribbed-cuff',[[-.166,.057,.056],[-.196,.054,.054],[-.207,.047,.049]],materials.cuff);
    for(let i=0;i<3;i++) tube(elbow,'sleeve-fold',[[-.048,-.03-i*.045,.028],[0,-.045-i*.045,.063],[.046,-.02-i*.045,.025]],.003,materials.seam);
    const hand=pivot(elbow,'hand'+side,[0,-.224,0]);
    oval(hand,'palm',materials.skin,[0,-.035,0],[.045,.058,.026]);
    for(let finger=0;finger<4;finger++) {
      const f=pivot(hand,'finger'+side+finger,[-.031+finger*.021,-.067,0]);
      const length=[.048,.060,.055,.043][finger];
      oval(f,'finger',materials.skin,[0,-length*.38,.003],[.011,length*.66,.013]);
      oval(f,'nail',materials.skin,[0,-length*.75,.014],[.007,.012,.002]);
    }
    const thumb=pivot(hand,'thumb'+side,[-s*.039,-.013,.003]); thumb.rotation.z=-s*.53;
    oval(thumb,'thumb',materials.skin,[0,-.024,.003],[.014,.034,.016]);
    if(side==='L') {
      loft(hand,'watch-strap',[[.015,.049,.034],[-.010,.049,.034]],materials.glasses);
      box(hand,'watch-case',[0,.002,.038],[.065,.051,.014],materials.metal,.013);
      box(hand,'watch-screen',[0,.002,.048],[.055,.043,.008],materials.glasses,.009);
    }
    const thigh=pivot(hips,'thigh'+side,[s*.107,-.052,0]);
    loft(thigh,'trouser-thigh',[[.037,.10,.111],[-.10,.092,.096],[-.27,.076,.079],[-.37,.071,.075],[-.386,.061,.066]],materials.trousers);
    const knee=pivot(thigh,'knee'+side,[0,-.365,0]);
    loft(knee,'trouser-calf',[[.026,.069,.074],[-.10,.074,.072],[-.24,.062,.061],[-.35,.057,.058]],materials.trousers);
    tube(knee,'outer-leg-seam',[[s*.07,0,0],[s*.074,-.1,0],[s*.057,-.34,0]],.002,materials.seam);
    const foot=pivot(knee,'foot'+side,[0,-.35,.006]);
    oval(foot,'blue-heel',materials.blue,[0,-.009,-.025],[.059,.047,.062]);
    oval(foot,'sneaker',materials.white,[0,-.050,.052],[.078,.058,.136]);
    box(foot,'rubber-sole',[0,-.087,.053],[.157,.035,.266],materials.sole,.055);
    oval(foot,'shoe-tongue',materials.white,[0,-.013,.060],[.041,.020,.070]);
    tube(foot,'toe-stitch',[[-.065,-.060,.118],[0,-.045,.158],[.065,-.060,.118]],.002,materials.sole);
    for(let k=0;k<5;k++) for(const sign of [-1,1]) tube(foot,'lace',[[sign*.035,-.008-k*.005,.017+k*.021],[-sign*.030,-.009-k*.005,.037+k*.021]],.003,materials.white,4);
  }
  // Batch static siblings within each joint. The joint hierarchy remains editable.
  const groups=[],originalGeometries=new Set();root.traverse(o=>{if(o.isGroup)groups.push(o);if(o.isMesh)originalGeometries.add(o.geometry);});
  for(const group of groups) {
    const buckets=new Map();
    for(const child of group.children) if(child.isMesh) {
      if(!buckets.has(child.material))buckets.set(child.material,[]);
      buckets.get(child.material).push(child);
    }
    for(const [material,children] of buckets) if(children.length>1) {
      const geometries=children.map(child=>{child.updateMatrix();const g=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();g.deleteAttribute('uv');g.applyMatrix4(child.matrix);return g;});
      const combined=mergeGeometries(geometries,false);
      geometries.forEach(g=>g.dispose());
      if(combined){const indexed=mergeVertices(combined);combined.dispose();children.forEach(c=>group.remove(c));mesh(group,group.name+'-details',indexed,material);}
    }
  }
  root.traverse(o=>{if(o.isMesh)originalGeometries.delete(o.geometry);});originalGeometries.forEach(g=>g.dispose());
  root.userData = { author:'Priyanshu OS', type:'Volumetric articulated mascot', units:'metres', forward:'+Z' };
  return {root,joints,materials};
}

export const STATES = ['idle','wave','highfive','point','sit','think','listen','talk','groove','walk'];

// Pure pose generator shared by the realtime rig, exported clips, and tests.
export function poseAt(state, t, level=0, reduced=false) {
  const p={ hips:[0,0,0],chest:[0,0,0],head:[0,0,0],armR:[0,0,-.10],armL:[0,0,.10],elbowR:[-.14,0,0],elbowL:[-.14,0,0],handR:[0,0,0],handL:[0,0,0],thighR:[0,0,0],thighL:[0,0,0],kneeR:[0,0,0],kneeL:[0,0,0] };
  const clock=reduced?0:t, swing=Math.sin(clock*7.8);
  let lift=0;
  if(state==='walk') {
    p.thighR[0]=swing*.55; p.thighL[0]=-swing*.55;
    p.kneeR[0]=Math.max(0,-swing)*.75; p.kneeL[0]=Math.max(0,swing)*.75;
    p.armR[0]=-swing*.38; p.armL[0]=swing*.38;
    lift=Math.abs(Math.sin(clock*7.8))*.018;
  } else if(state==='sit') {
    p.thighR=[-1.45,0,-.08]; p.thighL=[-1.45,0,.08]; p.kneeR[0]=1.48; p.kneeL[0]=1.48;
    p.armR=[-.18,0,-.20]; p.armL=[-.18,0,.20]; lift=-.02;
  } else if(state==='wave'||state==='highfive') {
    p.armR=[-.18,0,-1.15]; p.elbowR=[0,0,-1.55];
    p.handR=[0,state==='wave'?Math.sin(clock*9)*.30:0,-.10];
    p.head[2]=-.08;
    if(state==='highfive') {p.armR[0]=-.45;p.handR[0]=-.20;lift=reduced?0:Math.sin(Math.min(t,1)*Math.PI)*.05;}
  } else if(state==='listen') {
    p.armR=[-.15,0,-.88];p.elbowR=[-.25,0,-1.86];p.handR=[0,-.35,-.1];p.head=[0,.14,-.10];
  } else if(state==='think') {
    p.armR=[-.70,0,-.15];p.elbowR=[-1.60,0,-.48];p.handR=[0,.20,0];
    p.armL=[-.30,0,.30];p.elbowL=[-1.10,0,1.15];p.head=[.08,-.15,.07];
  } else if(state==='point'||state==='talk') {
    p.armR=[-.55,0,-.34];p.elbowR=[-.8,0,-.45];p.handR=[0,0,-.4];
    if(state==='talk'){p.elbowR[0]+=.12*Math.sin(clock*3);p.head[0]=.04*Math.sin(clock*4);p.armL[0]=-.12-.15*level;}
  } else if(state==='groove') {
    p.hips[2]=Math.sin(clock*5)*.09;p.chest[1]=Math.sin(clock*5)*.15;
    p.armR=[-.3,0,-.5];p.armL=[-.3,0,.5];p.elbowR[0]=-1+Math.sin(clock*5)*.3;p.elbowL[0]=-1-Math.sin(clock*5)*.3;
    lift=Math.abs(Math.sin(clock*5))*.025;
  }
  if(!reduced&&state!=='walk') p.chest[0]+=.012*Math.sin(t*1.7);
  return {rotations:p,lift};
}
