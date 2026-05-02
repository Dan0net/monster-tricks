# monster-tricks

Arcade monster truck game in the browser. Drive a 4x4 truck with simulated suspension down a procedurally generated track of straights, curves, and ramps. Chain jumps, flips, and sustained speed to grow a score multiplier; bad landings or stalls reset it.

Stack: React + Vite + TypeScript, react-three-fiber, @react-three/rapier (raycast vehicle), drei, zustand.

## Run

```
npm install
npm run dev
```

## Milestones

### M1 — Scaffold
- [x] Vite + R3F + Rapier wired up
- [x] Full-screen menu with PLAY button
- [x] Click PLAY → pointer lock → empty 3D scene
- [x] ESC → release lock → back to menu

### M2 — Truck & driving
- [ ] Chassis + 4 raycast wheels (rapier vehicle controller)
- [ ] WASD / arrows: throttle, brake/reverse, steer
- [ ] Mouse free-look that re-centers when idle (chase cam)
- [ ] Suspension tuned to feel bouncy on landings

### M3 — Track, jumps & scoring
- [ ] Procedural segment-based track (straights, curves, ramps)
- [ ] Airtime / flip detection
- [ ] Multiplier from sustained speed and tricks
- [ ] Reset on bad landing, off-track, or speed drop
- [ ] HUD: speed, multiplier, score

## Style

Solid primitives, emissive materials, dark fog. Beat-Saber-ish neon, no textures.
