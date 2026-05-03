import { memo, useMemo, useState } from 'react'
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

const SegmentRenderer = memo(function SegmentRenderer({ segment }: { segment: Segment }) {
  const t = config.track
  const L = segment.endZ - segment.startZ
  const W = t.width
  const midZ = (segment.startZ + segment.endZ) / 2

  const bodyPos = useMemo<[number, number, number]>(
    () => [0, segment.startY, midZ],
    [segment.startY, midZ],
  )
  const surfacePos = useMemo<[number, number, number]>(
    () => [0, -t.thickness / 2, 0],
    [t.thickness],
  )
  const surfaceArgs = useMemo<[number, number, number]>(
    () => [W, t.thickness, L],
    [W, t.thickness, L],
  )
  const rightWallPos = useMemo<[number, number, number]>(
    () => [W / 2 + t.wallThickness / 2, t.wallHeight / 2, 0],
    [W, t.wallThickness, t.wallHeight],
  )
  const leftWallPos = useMemo<[number, number, number]>(
    () => [-(W / 2 + t.wallThickness / 2), t.wallHeight / 2, 0],
    [W, t.wallThickness, t.wallHeight],
  )
  const wallArgs = useMemo<[number, number, number]>(
    () => [t.wallThickness, t.wallHeight, L],
    [t.wallThickness, t.wallHeight, L],
  )

  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={bodyPos}>
        <mesh receiveShadow position={surfacePos}>
          <boxGeometry args={surfaceArgs} />
          <meshStandardMaterial color={t.surfaceColor} />
        </mesh>
        <mesh castShadow position={rightWallPos}>
          <boxGeometry args={wallArgs} />
          <meshStandardMaterial color={t.wallColor} emissive={t.wallGlow} emissiveIntensity={0.35} />
        </mesh>
        <mesh castShadow position={leftWallPos}>
          <boxGeometry args={wallArgs} />
          <meshStandardMaterial color={t.wallColor} emissive={t.wallGlow} emissiveIntensity={0.35} />
        </mesh>
      </RigidBody>
      {segment.obstacles.map((o, i) => (
        <ObstacleRenderer key={i} segment={segment} obstacle={o} />
      ))}
    </>
  )
})
