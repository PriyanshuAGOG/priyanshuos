# Articulated mascot

This replaces the shallow reference-image relief with a fully volumetric, procedurally authored character. It is a stylized draft, not a sculpt matching the cinematic detail of the supplied renders. There are no image planes in the character. The original reference and legacy assets remain for fallback and comparison.

## Inspect and edit

Run `npm ci` then `npm run dev`; open `/mascot-studio.html`. Inspect all ten gestures, rotate through 360 degrees, and vary speech energy. The studio does not open the microphone. `/assets/avatar/priyanshu-articulated.glb` is a portable glTF 2.0 asset with ten named animation clips and an editable joint hierarchy. This is a rigid articulated rig, not a smoothly weighted skin; close-up elbow and knee deformation remains an art improvement area.

`src/mascot/character.js` is the authoritative geometry and pose source used both by the site and the exporter. Edit it, then run `node scripts/export-mascot.mjs` to regenerate the GLB. The live site generates the same model in memory to avoid downloading a second geometry asset. Static meshes sharing a material are batched within each joint.

## Runtime

The existing mascot API and section choreography are retained. Walking rotates the character in 3D instead of mirroring it. Sitting uses the hip position as the page-element anchor. High five is keyboard and touch accessible through its button, and is also available to the existing `avatar_gesture` ElevenLabs client tool. Add `highfive` and `walk` to that tool's allowed enum in the ElevenLabs dashboard if the agent has a restricted enum there; the repository cannot change the hosted agent definition.

The ElevenLabs bridge supplies output volume to the jaw and speaking/listening state to the pose controller. This is amplitude-based mouth motion, not phoneme-accurate lip sync. Disconnect clears energy and state. The temporary permission stream is stopped before the SDK opens its managed stream. The existing server token route and environment variables are preserved. A live call requires the configured server endpoint, credentials, and microphone permission; local Vite alone does not serve the serverless API.

Reduced motion freezes ambient motion and pose cycles while retaining explicit gestures and speech energy. Hidden tabs pause rendering; WebGL failure shows the existing reference fallback. The 3D engine exposes `destroy()` to release renderer, geometry, materials, observers and its listeners.

## Validation

`node scripts/test-mascot.mjs` checks finite volumetric geometry, anatomical pose bindings, alternating gait, reduced motion and GLB import with all animation clips. `npm run build` bundles the portfolio and studio. Browser checks cover poses, rotation, speech energy, and the portfolio's scroll integration. Live ElevenLabs conversation needs separate verification on the configured host.

For the requested reference-level finish, the remaining art work is a bespoke facial/hair sculpt, garment detailing, retopology, and smooth skin weights. This draft establishes the actual 3D asset and integration without claiming that visual fidelity has been achieved.
