import { config } from '../config'

export type SegmentKind = 'straight' | 'ramp'

export type ObstacleShape = 'kicker'

export type Obstacle = {
  shape: ObstacleShape
  z: number
  xOffset: number
  width: number
  height: number
  length: number
}

export type Segment = {
  index: number
  kind: SegmentKind
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

function pickKind(r: () => number, index: number): SegmentKind {
  if (index < 2) return 'straight'
  return r() < 0.5 ? 'straight' : 'ramp'
}

export function genSegment(index: number, prevEndY: number, prevEndZ: number, seed: number): Segment {
  const r = mulberry32(seed + index * 1009 + 17)
  const length = config.track.segmentLength
  const W = config.track.width
  const startZ = prevEndZ
  const endZ = prevEndZ + length
  const startY = prevEndY
  const endY = startY
  const kind = pickKind(r, index)
  const obstacles: Obstacle[] = []

  if (kind === 'ramp') {
    const z = length * 0.4 + r() * length * 0.15
    const height = 1.5 + r() * 1.2
    const len = 4 + r() * 2
    const w = W * 0.2
    if (r() < 0.5) {
      obstacles.push({ shape: 'kicker', z, xOffset: -W / 4, width: w, height, length: len })
      obstacles.push({ shape: 'kicker', z, xOffset: W / 4, width: w, height, length: len })
    } else {
      obstacles.push({ shape: 'kicker', z, xOffset: 0, width: w, height, length: len })
    }
  }

  return { index, kind, startZ, endZ, startY, endY, obstacles }
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
