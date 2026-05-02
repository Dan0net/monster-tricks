export const input = {
  throttle: 0,
  steer: 0,
  ebrake: 0,
  mouseDX: 0,
  mouseDY: 0,
}

const keys = new Set<string>()
let initialized = false

const update = () => {
  const fwd = keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0
  const back = keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0
  const left = keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0
  const right = keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0
  input.throttle = fwd - back
  input.steer = left - right
  input.ebrake = keys.has('Space') ? 1 : 0
}

export function initInput() {
  if (initialized) return
  initialized = true
  window.addEventListener('keydown', (e) => { keys.add(e.code); update() })
  window.addEventListener('keyup', (e) => { keys.delete(e.code); update() })
  window.addEventListener('blur', () => { keys.clear(); update() })
  window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement) {
      input.mouseDX += e.movementX
      input.mouseDY += e.movementY
    }
  })
}
