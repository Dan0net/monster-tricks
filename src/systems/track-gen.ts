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

function makeBump<S extends ObstacleShape>(
  shape: S,
  r: () => number,
  segLen: number,
  sideX: number,
  sideW: number,
  dims: { heightMin: number; heightMax: number; rampLengthMin: number; rampLengthMax: number; topLengthMin: number; topLengthMax: number },
): Obstacle[] {
  const cell = config.track.surfaceGridSize
  const height = lerp(dims.heightMin, dims.heightMax, r())
  const rampLength = Math.max(cell, snap(lerp(dims.rampLengthMin, dims.rampLengthMax, r()), cell))
  const topLength = Math.max(cell, snap(lerp(dims.topLengthMin, dims.topLengthMax, r()), cell))
  const total = 2 * rampLength + topLength
  const z = snap(segLen / 2 - total / 2, cell)
  if (r() < config.obstacles.pairedProb) {
    return [
      { shape, z, xOffset: -sideX, width: sideW, height, rampLength, topLength } as Obstacle,
      { shape, z, xOffset: sideX, width: sideW, height, rampLength, topLength } as Obstacle,
    ]
  }
  return [{ shape, z, xOffset: 0, width: sideW, height, rampLength, topLength } as Obstacle]
}

export function genSegment(index: number, prevEndY: number, prevEndZ: number, seed: number): Segment {
  const r = mulberry32(seed + index * 1009 + 17)
  const length = config.track.segmentLength
  const W = config.track.width
  const o = config.obstacles
  const cell = config.track.surfaceGridSize
  const sideW = Math.max(2 * cell, snap(W * o.widthFrac, 2 * cell))
  const sideX = snap(W * o.sideXFrac, cell)

  const finishIdx = config.track.checkpoints[config.track.checkpoints.length - 1]
  let obstacles: Obstacle[] = []
  if (index >= config.track.startEmptySegments && index < finishIdx) {
    const shape = pickShape(r)
    const dims = shape === 'quarterpipe' ? o.quarterpipe : o.tabletop
    obstacles = makeBump(shape, r, length, sideX, sideW, dims)
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
