import { config } from '../config'
import type { Obstacle } from './track-gen'

export type ObstacleGeometry = {
  positions: Float32Array
  indices: Uint16Array
}

export function outlinePoints(o: Obstacle): { y: number; z: number }[] {
  const RL = o.rampLength
  const TL = o.topLength
  const H = o.height
  const N = o.shape === 'quarterpipe' ? config.obstacles.curveSegments : 1
  const map = o.shape === 'quarterpipe'
    ? (t: number) => ({ z: Math.sin((t * Math.PI) / 2) * RL, y: (1 - Math.cos((t * Math.PI) / 2)) * H })
    : (t: number) => ({ z: t * RL, y: t * H })

  const pts: { y: number; z: number }[] = []
  for (let i = 0; i <= N; i++) pts.push(map(i / N))
  pts.push({ z: RL + TL, y: H })
  for (let i = 1; i <= N; i++) {
    const p = map(1 - i / N)
    pts.push({ z: RL + TL + (RL - p.z), y: p.y })
  }
  return pts
}

export function buildObstacleGeometry(o: Obstacle): ObstacleGeometry {
  const halfW = o.width / 2
  const pts = outlinePoints(o)
  const M = pts.length
  const positions = new Float32Array(4 * M * 3)
  const groundBase = 2 * M
  for (let i = 0; i < M; i++) {
    const { y, z } = pts[i]
    positions[(2 * i) * 3 + 0] = -halfW
    positions[(2 * i) * 3 + 1] = y
    positions[(2 * i) * 3 + 2] = z
    positions[(2 * i + 1) * 3 + 0] = halfW
    positions[(2 * i + 1) * 3 + 1] = y
    positions[(2 * i + 1) * 3 + 2] = z
    positions[(groundBase + 2 * i) * 3 + 0] = -halfW
    positions[(groundBase + 2 * i) * 3 + 1] = 0
    positions[(groundBase + 2 * i) * 3 + 2] = z
    positions[(groundBase + 2 * i + 1) * 3 + 0] = halfW
    positions[(groundBase + 2 * i + 1) * 3 + 1] = 0
    positions[(groundBase + 2 * i + 1) * 3 + 2] = z
  }

  const indices: number[] = []
  for (let i = 0; i < M - 1; i++) {
    const il = 2 * i
    const ir = 2 * i + 1
    const jl = 2 * (i + 1)
    const jr = 2 * (i + 1) + 1
    indices.push(il, jl, jr, il, jr, ir)
  }

  const bl0 = groundBase
  const br0 = groundBase + 1
  const blN = groundBase + 2 * (M - 1)
  const brN = groundBase + 2 * (M - 1) + 1
  indices.push(blN, bl0, br0, blN, br0, brN)

  for (let i = 0; i < M - 1; i++) {
    const ol = 2 * i
    const olj = 2 * (i + 1)
    const gl = groundBase + 2 * i
    const glj = groundBase + 2 * (i + 1)
    indices.push(gl, glj, olj, gl, olj, ol)
  }
  for (let i = 0; i < M - 1; i++) {
    const or = 2 * i + 1
    const orj = 2 * (i + 1) + 1
    const gr = groundBase + 2 * i + 1
    const grj = groundBase + 2 * (i + 1) + 1
    indices.push(gr, or, orj, gr, orj, grj)
  }

  return { positions, indices: new Uint16Array(indices) }
}

export type EdgeRibbon = {
  positions: Float32Array
  uvs: Float32Array
  indices: Uint16Array
}

export function buildEdgeRibbon(o: Obstacle, side: 1 | -1, width: number): EdgeRibbon {
  const halfW = o.width / 2
  const pts = outlinePoints(o)
  const N = pts.length
  const w2 = width / 2
  const yLift = 0.005

  const positions = new Float32Array(N * 2 * 3)
  const uvs = new Float32Array(N * 2 * 2)

  for (let i = 0; i < N; i++) {
    const p = pts[i]

    positions[i * 6 + 0] = side * (halfW - w2)
    positions[i * 6 + 1] = p.y + yLift
    positions[i * 6 + 2] = p.z
    positions[i * 6 + 3] = side * (halfW + w2)
    positions[i * 6 + 4] = p.y + yLift
    positions[i * 6 + 5] = p.z

    const v = i / (N - 1)
    uvs[i * 4 + 0] = 0
    uvs[i * 4 + 1] = v
    uvs[i * 4 + 2] = 1
    uvs[i * 4 + 3] = v
  }

  const indices: number[] = []
  for (let i = 0; i < N - 1; i++) {
    const il = 2 * i
    const ir = 2 * i + 1
    const jl = 2 * (i + 1)
    const jr = 2 * (i + 1) + 1
    indices.push(il, jl, jr, il, jr, ir)
  }

  return { positions, uvs, indices: new Uint16Array(indices) }
}
