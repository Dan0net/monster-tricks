import { config } from '../config'

export function wheelCs(i: number, includeWidth = false) {
  const t = config.truck
  const x = (t.chassisX / 2) * t.wheelTrack + (t.wheelWidth / 2) * (includeWidth ? 1 : 0)
  const z = (t.chassisZ / 2) * t.wheelBase
  const sx = i === 0 || i === 2 ? 1 : -1
  const sz = i === 0 || i === 1 ? 1 : -1
  return { x: sx * x, y: t.wheelY, z: sz * z }
}

export function buildEllipsoidPoints(rx: number, ry: number, rz: number): Float32Array {
  const segments = 16
  const rings = 10
  const pts: number[] = [0, ry, 0, 0, -ry, 0]
  for (let r = 1; r < rings; r++) {
    const phi = (r / rings) * Math.PI
    const y = ry * Math.cos(phi)
    const ringR = Math.sin(phi)
    for (let s = 0; s < segments; s++) {
      const theta = (s / segments) * Math.PI * 2
      pts.push(rx * ringR * Math.cos(theta), y, rz * ringR * Math.sin(theta))
    }
  }
  return new Float32Array(pts)
}
