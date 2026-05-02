import { get, set } from 'idb-keyval'
import { config } from '../config'

const KEY = 'monster-tricks/tune'
const DEFAULT_NAME = 'Default'

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

let store: Store = { active: DEFAULT_NAME, profiles: { [DEFAULT_NAME]: clone(DEFAULTS) } }

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v))
}

function snapshot(): Tune {
  return clone({ gravityY: config.gravityY, truck: config.truck, camera: config.camera })
}

function apply(t: Tune): void {
  if (typeof t.gravityY === 'number') config.gravityY = t.gravityY
  if (t.truck) Object.assign(config.truck, t.truck)
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
  apply(store.profiles[store.active])
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
