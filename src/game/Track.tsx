import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { config } from '../config'
import { genSegments, type Segment, type Obstacle } from '../systems/track-gen'
import { truckBody } from './Truck'

export function Track() {
  const t = config.track
  const [segments, setSegments] = useState<Segment[]>(() =>
    genSegments(t.seed, 0, t.initialCount, 0, -t.startBuffer),
  )
  const lastEndZ = useRef(segments[segments.length - 1].endZ)

  useFrame(() => {
    const body = truckBody.current
    if (!body) return
    const z = body.translation().z
    if (z > lastEndZ.current - t.generateAhead) {
      setSegments((prev) => {
        const last = prev[prev.length - 1]
        const more = genSegments(t.seed, last.index + 1, t.batchCount, last.endY, last.endZ)
        lastEndZ.current = more[more.length - 1].endZ
        return [...prev, ...more]
      })
    }
  })

  return (
    <>
      {segments.map((s) => (
        <SegmentRenderer key={s.index} segment={s} />
      ))}
    </>
  )
}

function SegmentRenderer({ segment }: { segment: Segment }) {
  const t = config.track
  const dy = segment.endY - segment.startY
  const dz = segment.endZ - segment.startZ
  const L = Math.sqrt(dy * dy + dz * dz)
  const pitch = Math.atan2(dy, dz)
  const midY = (segment.startY + segment.endY) / 2
  const midZ = (segment.startZ + segment.endZ) / 2
  const W = t.width

  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={[0, midY, midZ]} rotation={[pitch, 0, 0]}>
        <mesh receiveShadow position={[0, -t.thickness / 2, 0]}>
          <boxGeometry args={[W, t.thickness, L]} />
          <meshStandardMaterial color={t.surfaceColor} />
        </mesh>
        <mesh castShadow position={[W / 2 + t.wallThickness / 2, t.wallHeight / 2, 0]}>
          <boxGeometry args={[t.wallThickness, t.wallHeight, L]} />
          <meshStandardMaterial color={t.wallColor} emissive={t.wallGlow} emissiveIntensity={0.35} />
        </mesh>
        <mesh castShadow position={[-(W / 2 + t.wallThickness / 2), t.wallHeight / 2, 0]}>
          <boxGeometry args={[t.wallThickness, t.wallHeight, L]} />
          <meshStandardMaterial color={t.wallColor} emissive={t.wallGlow} emissiveIntensity={0.35} />
        </mesh>
      </RigidBody>
      {segment.obstacles.map((o, i) => (
        <ObstacleRenderer key={i} segment={segment} obstacle={o} />
      ))}
    </>
  )
}

function ObstacleRenderer({ segment, obstacle: o }: { segment: Segment; obstacle: Obstacle }) {
  const t = config.track
  const segLen = segment.endZ - segment.startZ
  const frac = o.z / segLen
  const floorY = segment.startY + frac * (segment.endY - segment.startY)
  const dy = segment.endY - segment.startY
  const dz = segment.endZ - segment.startZ
  const segPitch = Math.atan2(dy, dz)

  if (o.shape === 'block') {
    const topY = o.topY ?? floorY + 1
    const blockHeight = topY - floorY + 4
    const centerY = topY - blockHeight / 2
    const centerZ = segment.startZ + o.z + o.length / 2
    return (
      <RigidBody type="fixed" colliders="cuboid" position={[0, centerY, centerZ]}>
        <mesh castShadow>
          <boxGeometry args={[o.width, blockHeight, o.length]} />
          <meshStandardMaterial color={t.obstacleColor} emissive={t.obstacleColor} emissiveIntensity={0.3} />
        </mesh>
      </RigidBody>
    )
  }

  if (o.shape === 'tabletop') {
    const centerZ = segment.startZ + o.z + o.length / 2
    const centerY = floorY + o.height / 2
    return (
      <RigidBody type="fixed" colliders="cuboid" position={[0, centerY, centerZ]} rotation={[segPitch, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[o.width, o.height, o.length]} />
          <meshStandardMaterial color={t.obstacleColor} emissive={t.obstacleColor} emissiveIntensity={0.3} />
        </mesh>
      </RigidBody>
    )
  }

  const rampPitch = Math.atan2(o.height, o.length)
  const slantLen = Math.sqrt(o.length * o.length + o.height * o.height)
  const thickness = 0.4
  const dir = o.dir ?? 1
  const centerZ = segment.startZ + o.z + o.length / 2
  const centerY = floorY + o.height / 2 - (thickness / 2) * Math.cos(rampPitch)
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, centerY, centerZ]} rotation={[dir * -rampPitch + segPitch, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[o.width, thickness, slantLen]} />
        <meshStandardMaterial color={t.obstacleColor} emissive={t.obstacleColor} emissiveIntensity={0.3} />
      </mesh>
    </RigidBody>
  )
}
