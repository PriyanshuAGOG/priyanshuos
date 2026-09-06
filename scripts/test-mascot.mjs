import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createCharacter,poseAt,STATES } from '../src/mascot/character.js';

const {root,joints}=createCharacter();
const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3());
assert(size.z>.3,'Character must have volumetric depth');
assert(size.y>1.8 && size.y<2.2,'Full body should be about two metres tall');
root.traverse(o=>{if(o.isMesh) for(const v of o.geometry.attributes.position.array)assert(Number.isFinite(v),'Finite geometry');});
for(const state of STATES) for(let t=0;t<4;t+=.08) {
  const pose=poseAt(state,t,.7);
  assert(Number.isFinite(pose.lift));
  for(const [name,angles] of Object.entries(pose.rotations)) {assert(joints[name],`Missing joint ${name}`);assert(angles.every(Number.isFinite));}
}
const walk=poseAt('walk',.2).rotations;
assert(walk.thighR[0]*walk.thighL[0]<0,'Walking legs must alternate');
assert(poseAt('sit',0).rotations.thighR[0]<-1.3,'Sitting must bend at the hips');
for(const state of STATES)assert.deepEqual(poseAt(state,0,.2,true),poseAt(state,2,.2,true),`${state} must be static with reduced motion`);
const bytes=await readFile('public/assets/avatar/priyanshu-articulated.glb');
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
assert.deepEqual(gltf.animations.map(a=>a.name),STATES,'All gestures must survive GLB export');
const mixer=new THREE.AnimationMixer(gltf.scene);
for(const clip of gltf.animations){mixer.stopAllAction();mixer.clipAction(clip).play();mixer.update(.3);}
console.log(`PASS: volumetric geometry, ${Object.keys(joints).length} pivots, ${STATES.length} poses, reduced motion, GLB round trip and animation binding.`);
