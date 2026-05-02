# monster-tricks

Monster truck arcade game. React + Vite + TS, react-three-fiber, @react-three/rapier, drei, zustand.

## Rules

- KISS / DRY / SOLID. One concept = one file.
- **No comments.** Code must explain itself; rename before commenting.
- All tunables (physics, sizes, gravity, multiplier rates) live in `src/config.ts`. Never inline magic numbers.
- Pure logic (track gen, scoring) lives under `src/systems/` — no React, no three.js imports.
- React components stay thin: read store, render, dispatch. No game logic in JSX files.
- Global state via zustand store in `src/store.ts`. No prop-drilling, no contexts.
- Keep files short. If a file passes ~120 lines, split it.
- **Never start the dev server.** The user runs `npm run dev` themselves. To verify code, only run `npx tsc -b --noEmit` (or `npm run build`).

## Layout

```
src/
  App.tsx          menu ↔ game, pointer lock
  store.ts         zustand: phase, score, multiplier
  config.ts        all tunables
  game/            r3f scene + components
  systems/         pure logic (track-gen, scoring, input)
```
