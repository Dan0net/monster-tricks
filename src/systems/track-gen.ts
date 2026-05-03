import { config } from '../config'

export type ObstacleShape = 'quarterpipe' | 'tabletop'

type ObstacleBase = {
  z: number
  xOffset: number
  width: number
  height: number
  rampLength: number
  topLength: number
}

export type Quarterpipe = ObstacleBase & { shape: 'quarterpipe' }
export type Tabletop = ObstacleBase & { shape: 'tabletop' }

export type Obstacle = Quarterpipe | Tabletop

export type Segment = {
  index: number
  startZ: number
  endZ: number
  startY: number
  endY: number
  obstacles: Obstacle[]
}

function mulberry32(seed: number) {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function snap(v: number, step: number) {
  return Math.round(v / step) * step
}

function pickShape(r: () => number): ObstacleShape {
  const o = config.obstacles
  const total = o.quarterpipeProb + o.tabletopProb
  const v = r() * total
  if (v < o.quarterpipeProb) return 'quarterpipe'
  return 'tabletop'
}

type BumpDims = { heightMin: number; heightMax: number; rampLengthMin: number; rampLengthMax: number; topLengthMin: number; topLengthMax: number }

function genBumpSize(r: () => number, dims: BumpDims) {
  const cell = config.track.surfaceGridSize
  const height = lerp(dims.heightMin, dims.heightMax, r())
  const rampLength = Math.max(cell, snap(lerp(dims.rampLengthMin, dims.rampLengthMax, r()), cell))
  const topLength = Math.max(cell, snap(lerp(dims.topLengthMin, dims.topLengthMax, r()), cell))
  return { height, rampLength, topLength, total: 2 * rampLength + topLength }
}

export function genSegment(index: number, prevEndY: number, prevEndZ: number, seed: number): Segment {
  const r = mulberry32(seed + index * 1009 + 17)
  const baseLen = config.track.segmentLength
  const W = config.track.width
  const o = config.obstacles
  const cell = config.track.surfaceGridSize
  const sideW = Math.max(2 * cell, snap(W * o.widthFrac, 2 * cell))
  const sideX = snap(W * o.sideXFrac, cell)

  const finishIdx = config.track.checkpoints[config.track.checkpoints.length - 1]
  let obstacles: Obstacle[] = []
  let length = baseLen
  if (index >= config.track.startEmptySegments && index < finishIdx) {
    const shape = pickShape(r)
    const dims = shape === 'quarterpipe' ? o.quarterpipe : o.tabletop
    const { height, rampLength, topLength, total } = genBumpSize(r, dims)
    length = Math.max(baseLen, snap(total + 2 * o.gapZ, cell))
    const z = snap(length / 2 - total / 2, cell)
    const paired = r() < o.pairedProb
    const base = { shape, z, height, rampLength, topLength }
    obstacles = paired
      ? [
          { ...base, xOffset: -sideX, width: sideW } as Obstacle,
          { ...base, xOffset: sideX, width: sideW } as Obstacle,
        ]
      : [{ ...base, xOffset: 0, width: sideW } as Obstacle]
  }

  return {
    index,
    startZ: prevEndZ,
    endZ: prevEndZ + length,
    startY: prevEndY,
    endY: prevEndY,
    obstacles,
  }
}

export function genSegments(
  seed: number,
  fromIndex: number,
  count: number,
  prevEndY: number,
  prevEndZ: number,
): Segment[] {
  const out: Segment[] = []
  let py = prevEndY
  let pz = prevEndZ
  for (let i = 0; i < count; i++) {
    const s = genSegment(fromIndex + i, py, pz, seed)
    out.push(s)
    py = s.endY
    pz = s.endZ
  }
  return out
}
