import { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { config } from '../config'
import { genSegment, genSegments, type Segment } from '../systems/track-gen'
import { truckBody } from './Truck'
import { ObstacleRenderer } from './Obstacles'

export function Track() {
  const t = config.track
  const [segments, setSegments] = useState<Segment[]>(() =>
    genSegments(t.seed, 0, t.initialCount, 0, -t.startBuffer),
  )

  useFrame(() => {
    const body = truckBody.current
    if (!body) return
    const z = body.translation().z
    setSegments((prev) => {
      const last = prev[prev.length - 1]
      const trimIdx = prev.findIndex((s) => s.endZ > z - t.trimBehind)
      const startIdx = trimIdx < 0 ? 0 : trimIdx
      const needAdd = z > last.endZ - t.generateAhead
      if (!needAdd && startIdx === 0) return prev
      const trimmed = startIdx > 0 ? prev.slice(startIdx) : prev
      if (!needAdd) return trimmed
      const next = genSegment(last.index + 1, last.endY, last.endZ, t.seed)
      return [...trimmed, next]
    })
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
  const L = segment.endZ - segment.startZ
  const midY = segment.startY
  const midZ = (segment.startZ + segment.endZ) / 2
  const W = t.width

  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={[0, midY, midZ]}>
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
