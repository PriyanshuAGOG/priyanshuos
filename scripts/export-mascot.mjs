import { writeFile, mkdir } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createCharacter, poseAt, STATES } from '../src/mascot/character.js';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(value=>{this.result=value;this.onloadend?.();}); }
  readAsDataURL(blob) { blob.arrayBuffer().then(value=>{this.result=`data:${blob.type};base64,${Buffer.from(value).toString('base64')}`;this.onloadend?.();}); }
};
const {root,joints}=createCharacter();
const durations={idle:4,wave:2.4,highfive:1.8,walk:Math.PI*2/7.8,groove:Math.PI*2/5,sit:2,think:3,listen:3,talk:3,point:2};
const animations=STATES.map(state=>{
  const duration=durations[state],count=Math.ceil(duration*30),times=[],values={},positions=[];
  for(let i=0;i<=count;i++) {
    const t=i/count*duration;times.push(t);
    const pose=poseAt(state,t);
    positions.push(0,.91+pose.lift,0);
    for(const [joint,xyz] of Object.entries(pose.rotations)) {
      values[joint]??=[];
      const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(...xyz));values[joint].push(...q.toArray());
    }
  }
  const tracks=Object.entries(values).map(([joint,data])=>new THREE.QuaternionKeyframeTrack(`${joints[joint].name}.quaternion`,times,data));
  tracks.push(new THREE.VectorKeyframeTrack('hips.position',times,positions));
  return new THREE.AnimationClip(state,duration,tracks);
});
const data=await new GLTFExporter().parseAsync(root,{binary:true,animations,onlyVisible:false});
await mkdir('public/assets/avatar',{recursive:true});
await writeFile('public/assets/avatar/priyanshu-articulated.glb',Buffer.from(data));
console.log(`Exported ${animations.length} clips, ${(data.byteLength/1024/1024).toFixed(2)} MB`);
