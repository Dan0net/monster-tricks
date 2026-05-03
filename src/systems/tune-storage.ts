import { get, set } from 'idb-keyval'
import { config } from '../config'

const KEY = 'monster-tricks/tune'
const DEFAULT_NAME = 'Default'
const TRUCK1_NAME = 'truck1'

type Tune = {
  gravityY: number
  truck: typeof config.truck
  camera: typeof config.camera
}

type Store = { active: string; profiles: Record<string, Tune> }

const DEFAULTS: Tune = clone({
  gravityY: config.gravityY,
  truck: config.truck,
  camera: config.camera,
})

const TRUCK1_TRUCK_OVERRIDES = {
  chassisY: 0.7,
  comY: -0.1,
  comZ: 0,
  inertiaPitch: 1500,
  wheelRadius: 0.9,
  wheelWidth: 0.8,
  wheelTrack: 1.13,
  wheelY: 0.5,
  peakTorque: 8000,
  topSpeedTarget: 50,
  torqueExponent: 0.5,
  ebrakeFrictionSlip: 0.4,
  steerSpeedRef: 18,
  steerExponent: 2,
}

function buildTruck1(): Tune {
  return clone({
    gravityY: DEFAULTS.gravityY,
    truck: { ...DEFAULTS.truck, ...TRUCK1_TRUCK_OVERRIDES },
    camera: DEFAULTS.camera,
  })
}

function ensureSeeds(s: Store): boolean {
  let added = false
  if (!s.profiles[TRUCK1_NAME]) {
    s.profiles[TRUCK1_NAME] = buildTruck1()
    added = true
  }
  return added
}

let store: Store = { active: DEFAULT_NAME, profiles: { [DEFAULT_NAME]: clone(DEFAULTS), [TRUCK1_NAME]: buildTruck1() } }

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v))
}

function stripArrays<T extends object>(src: T): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(src)) {
    if (Array.isArray(v)) continue
    out[k] = v
  }
  return out as T
}

function snapshot(): Tune {
  return clone({ gravityY: config.gravityY, truck: stripArrays(config.truck), camera: config.camera })
}

function apply(t: Tune): void {
  if (typeof t.gravityY === 'number') config.gravityY = t.gravityY
  if (t.truck) Object.assign(config.truck, stripArrays(t.truck))
  config.truck.ebrakeWheels = [...DEFAULTS.truck.ebrakeWheels]
  config.truck.steerWheels = [...DEFAULTS.truck.steerWheels]
  if (t.camera) Object.assign(config.camera, t.camera)
}

async function readStore(): Promise<Store> {
  const raw = await get(KEY)
  if (!raw) return { active: DEFAULT_NAME, profiles: { [DEFAULT_NAME]: clone(DEFAULTS) } }
  if (typeof raw === 'object' && 'truck' in raw && !('profiles' in raw)) {
    return { active: DEFAULT_NAME, profiles: { [DEFAULT_NAME]: raw as Tune } }
  }
  const s = raw as Store
  if (!s.profiles || Object.keys(s.profiles).length === 0) {
    return { active: DEFAULT_NAME, profiles: { [DEFAULT_NAME]: clone(DEFAULTS) } }
  }
  if (!s.profiles[s.active]) s.active = Object.keys(s.profiles)[0]
  return s
}

async function writeStore(): Promise<void> {
  await set(KEY, store)
}

export async function loadTune(): Promise<void> {
  store = await readStore()
  const seeded = ensureSeeds(store)
  apply(store.profiles[store.active])
  if (seeded) await writeStore()
}

export async function saveTune(): Promise<void> {
  store.profiles[store.active] = snapshot()
  await writeStore()
}

export function resetTune(): void {
  apply(clone(DEFAULTS))
}

export function exportTune(): string {
  const t = snapshot()
  return [
    `gravityY: ${formatValue(t.gravityY)},`,
    `truck: ${formatObject(t.truck, 2)},`,
    `camera: ${formatObject(t.camera, 2)},`,
  ].join('\n')
}

function formatValue(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(formatValue).join(', ')}]`
  if (typeof v === 'string') return JSON.stringify(v)
  return String(v)
}

function formatObject(obj: Record<string, unknown>, indent: number): string {
  const pad = '  '.repeat(indent)
  const close = '  '.repeat(indent - 1)
  const lines = Object.entries(obj).map(([k, v]) => `${pad}${k}: ${formatValue(v)},`)
  return `{\n${lines.join('\n')}\n${close}}`
}

export function listProfiles(): string[] {
  return Object.keys(store.profiles)
}

export function getActiveProfile(): string {
  return store.active
}

export async function switchProfile(name: string): Promise<void> {
  if (!store.profiles[name]) return
  store.active = name
  apply(store.profiles[name])
  await writeStore()
}

export async function createProfile(name: string): Promise<void> {
  store.profiles[name] = snapshot()
  store.active = name
  await writeStore()
}

export async function deleteProfile(name: string): Promise<void> {
  if (!store.profiles[name]) return
  if (Object.keys(store.profiles).length <= 1) return
  delete store.profiles[name]
  if (store.active === name) {
    const next = Object.keys(store.profiles)[0]
    store.active = next
    apply(store.profiles[next])
  }
  await writeStore()
}
