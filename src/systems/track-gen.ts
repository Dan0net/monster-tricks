import { config } from '../config'

export type ObstacleShape = 'kicker' | 'quarterpipe' | 'tabletop'

type ObstacleBase = {
  z: number
  xOffset: number
  width: number
  height: number
}

export type Kicker = ObstacleBase & { shape: 'kicker'; length: number }
export type Quarterpipe = ObstacleBase & { shape: 'quarterpipe'; length: number }
export type Tabletop = ObstacleBase & { shape: 'tabletop'; rampLength: number; topLength: number }

export type Obstacle = Kicker | Quarterpipe | Tabletop

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

function pickShape(r: () => number): ObstacleShape {
  const o = config.obstacles
  const total = o.kickerProb + o.quarterpipeProb + o.tabletopProb
  const v = r() * total
  if (v < o.kickerProb) return 'kicker'
  if (v < o.kickerProb + o.quarterpipeProb) return 'quarterpipe'
  return 'tabletop'
}

function makeKicker(r: () => number, segLen: number, sideX: number, w: number): Obstacle[] {
  const k = config.obstacles.kicker
  const height = lerp(k.heightMin, k.heightMax, r())
  const length = lerp(k.lengthMin, k.lengthMax, r())
  const z = segLen / 2 - length / 2
  if (r() < config.obstacles.pairedProb) {
    return [
      { shape: 'kicker', z, xOffset: -sideX, width: w, height, length },
      { shape: 'kicker', z, xOffset: sideX, width: w, height, length },
    ]
  }
  return [{ shape: 'kicker', z, xOffset: 0, width: w, height, length }]
}

function makeQuarterpipe(r: () => number, segLen: number, sideX: number, w: number): Obstacle[] {
  const q = config.obstacles.quarterpipe
  const height = lerp(q.heightMin, q.heightMax, r())
  const length = lerp(q.lengthMin, q.lengthMax, r())
  const z = segLen / 2 - length / 2
  if (r() < config.obstacles.pairedProb) {
    return [
      { shape: 'quarterpipe', z, xOffset: -sideX, width: w, height, length },
      { shape: 'quarterpipe', z, xOffset: sideX, width: w, height, length },
    ]
  }
  return [{ shape: 'quarterpipe', z, xOffset: 0, width: w, height, length }]
}

function makeTabletop(r: () => number, segLen: number, w: number): Obstacle[] {
  const t = config.obstacles.tabletop
  const height = lerp(t.heightMin, t.heightMax, r())
  const rampLength = lerp(t.rampLengthMin, t.rampLengthMax, r())
  const topLength = lerp(t.topLengthMin, t.topLengthMax, r())
  const total = 2 * rampLength + topLength
  const z = segLen / 2 - total / 2
  return [{ shape: 'tabletop', z, xOffset: 0, width: w, height, rampLength, topLength }]
}

export function genSegment(index: number, prevEndY: number, prevEndZ: number, seed: number): Segment {
  const r = mulberry32(seed + index * 1009 + 17)
  const length = config.track.segmentLength
  const W = config.track.width
  const o = config.obstacles
  const sideW = W * o.widthFrac
  const sideX = W * o.sideXFrac
  const fullW = W * o.tabletopWidthFrac

  let obstacles: Obstacle[]
  switch (pickShape(r)) {
    case 'kicker':
      obstacles = makeKicker(r, length, sideX, sideW)
      break
    case 'quarterpipe':
      obstacles = makeQuarterpipe(r, length, sideX, sideW)
      break
    case 'tabletop':
      obstacles = makeTabletop(r, length, fullW)
      break
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
