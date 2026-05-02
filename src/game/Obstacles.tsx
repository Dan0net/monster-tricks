import { RigidBody } from '@react-three/rapier'
import { config } from '../config'
import type { Obstacle, Quarterpipe, Segment, Tabletop } from '../systems/track-gen'

type Vec3 = [number, number, number]
type Piece = { pos: Vec3; rot?: Vec3; size: Vec3 }

function RampMaterial() {
  const c = config.track.obstacleColor
  return <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} />
}

export function ObstacleRenderer({ segment, obstacle }: { segment: Segment; obstacle: Obstacle }) {
  const curve = obstacle.shape === 'quarterpipe'
  return <BumpRenderer segment={segment} obstacle={obstacle} curve={curve} />
}

function BumpRenderer({
  segment, obstacle, curve,
}: {
  segment: Segment
  obstacle: Quarterpipe | Tabletop
  curve: boolean
}) {
  const o = config.obstacles
  const N = o.curveSegments
  const thickness = o.thickness
  const baseZ = segment.startZ + obstacle.z
  const baseY = segment.startY
  const W = obstacle.width
  const H = obstacle.height
  const RL = obstacle.rampLength
  const TL = obstacle.topLength
  const total = 2 * RL + TL

  const map = curve
    ? (t: number) => ({ z: Math.sin(t * Math.PI / 2), y: 1 - Math.cos(t * Math.PI / 2) })
    : (t: number) => ({ z: t, y: t })

  const pieces: Piece[] = []

  for (let i = 0; i < N; i++) {
    const p0 = map(i / N)
    const p1 = map((i + 1) / N)
    const z0 = p0.z * RL, z1 = p1.z * RL
    const y0 = p0.y * H, y1 = p1.y * H
    const dz = z1 - z0
    const dy = y1 - y0
    const segLen = Math.hypot(dz, dy)
    const pitch = Math.atan2(dy, dz)
    const cyAvg = (y0 + y1) / 2
    const cz = (z0 + z1) / 2
    const minY = Math.min(y0, y1)
    const slantCy = baseY + cyAvg - (thickness / 2) * Math.cos(pitch)
    const fillCy = baseY + minY / 2

    pieces.push({ pos: [obstacle.xOffset, slantCy, baseZ + cz], rot: [-pitch, 0, 0], size: [W, thickness, segLen] })
    pieces.push({ pos: [obstacle.xOffset, slantCy, baseZ + (total - cz)], rot: [pitch, 0, 0], size: [W, thickness, segLen] })
    if (minY > 0) {
      pieces.push({ pos: [obstacle.xOffset, fillCy, baseZ + cz], size: [W, minY, dz] })
      pieces.push({ pos: [obstacle.xOffset, fillCy, baseZ + (total - cz)], size: [W, minY, dz] })
    }
  }

  pieces.push({
    pos: [obstacle.xOffset, baseY + H / 2, baseZ + RL + TL / 2],
    size: [W, H, TL],
  })

  return (
    <RigidBody type="fixed" colliders="cuboid">
      {pieces.map((p, i) => (
        <mesh key={i} castShadow position={p.pos} rotation={p.rot}>
          <boxGeometry args={p.size} />
          <RampMaterial />
        </mesh>
      ))}
    </RigidBody>
  )
}
