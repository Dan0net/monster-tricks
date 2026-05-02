import { get, set } from 'idb-keyval'
import { config } from '../config'

const KEY = 'monster-tricks/tune'

type Tune = {
  gravityY: number
  truck: typeof config.truck
  camera: typeof config.camera
}

const DEFAULTS: Tune = JSON.parse(
  JSON.stringify({
    gravityY: config.gravityY,
    truck: config.truck,
    camera: config.camera,
  }),
)

export async function loadTune(): Promise<void> {
  const saved = await get<Partial<Tune>>(KEY)
  if (!saved) return
  if (typeof saved.gravityY === 'number') config.gravityY = saved.gravityY
  if (saved.truck) Object.assign(config.truck, saved.truck)
  if (saved.camera) Object.assign(config.camera, saved.camera)
}

export async function saveTune(): Promise<void> {
  await set(KEY, {
    gravityY: config.gravityY,
    truck: { ...config.truck },
    camera: { ...config.camera },
  })
}

export function resetTune(): void {
  config.gravityY = DEFAULTS.gravityY
  Object.assign(config.truck, DEFAULTS.truck)
  Object.assign(config.camera, DEFAULTS.camera)
}
