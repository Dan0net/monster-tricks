import { config } from '../config'

export type SegmentKind = 'straight' | 'ramp' | 'tabletop' | 'slopeDown' | 'dropJump'

export type ObstacleShape = 'kicker' | 'tabletop' | 'block'

export type Obstacle = {
  shape: ObstacleShape
  z: number
  width: number
  height: number
  length: number
  topY?: number
  dir?: 1 | -1
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
  const v = r()
  if (v < 0.30) return 'straight'
  if (v < 0.50) return 'ramp'
  if (v < 0.70) return 'tabletop'
  if (v < 0.85) return 'slopeDown'
  return 'dropJump'
}

export function genSegment(index: number, prevEndY: number, prevEndZ: number, seed: number): Segment {
  const r = mulberry32(seed + index * 1009 + 17)
  const length = config.track.segmentLength
  const W = config.track.width
  const startZ = prevEndZ
  const endZ = prevEndZ + length
  const startY = prevEndY
  const kind = pickKind(r, index)
  let endY = startY
  const obstacles: Obstacle[] = []

  switch (kind) {
    case 'straight':
      break
    case 'ramp':
      obstacles.push({
        shape: 'kicker',
        z: length * 0.4 + r() * length * 0.15,
        width: W * 0.7,
        height: 1.5 + r() * 1.2,
        length: 4 + r() * 2,
      })
      break
    case 'tabletop': {
      const H = 1.6 + r() * 0.9
      const kL = 4.5 + r() * 1.5
      const tL = length * 0.2 + r() * length * 0.1
      const w = W * 0.85
      const z0 = (length - (2 * kL + tL)) / 2
      obstacles.push({ shape: 'kicker', z: z0, width: w, height: H, length: kL })
      obstacles.push({ shape: 'tabletop', z: z0 + kL, width: w, height: H, length: tL })
      obstacles.push({ shape: 'kicker', z: z0 + kL + tL, width: w, height: H, length: kL, dir: -1 })
      break
    }
    case 'slopeDown':
      endY = startY - (3 + r() * 4)
      break
    case 'dropJump': {
      endY = startY - (4 + r() * 4)
      const obsZ = length * 0.25 + r() * length * 0.15
      const obsLen = 5 + r() * 3
      const floorYatStart = startY + (obsZ / length) * (endY - startY)
      obstacles.push({
        shape: 'block',
        z: obsZ,
        width: W,
        height: 0,
        length: obsLen,
        topY: floorYatStart + 0.4,
      })
      break
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
