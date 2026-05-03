import { memo, useEffect, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { config } from '../config'
import { genSegment, genSegments, type Segment } from '../systems/track-gen'
import { truckBody } from './Truck'
import { ObstacleRenderer } from './Obstacles'
import { getGridMaterial } from './GridMaterial'
import { getEdgeMaterial } from './EdgeMaterial'
import { Gates } from './Gates'
import { useGame } from '../store'

function lastSegmentIndex() {
  const t = config.track
  const finish = t.checkpoints[t.checkpoints.length - 1]
  return finish + t.postFinishSegments - 1
}

function buildInitial(): Segment[] {
  const t = config.track
  const count = Math.min(t.initialCount, lastSegmentIndex() + 1)
  return genSegments(t.seed, 0, count, 0, -t.startBuffer)
}

export function Track() {
  const t = config.track
  const phase = useGame((s) => s.phase)
  const [segments, setSegments] = useState<Segment[]>(buildInitial)

  useEffect(() => {
    if (phase !== 'playing') return
    setSegments(buildInitial())
  }, [phase])

  useFrame(() => {
    const body = truckBody.current
    if (!body) return
    const z = body.translation().z
    const maxIdx = lastSegmentIndex()
    setSegments((prev) => {
      const last = prev[prev.length - 1]
      const trimIdx = prev.findIndex((s) => s.endZ > z - t.trimBehind)
      const startIdx = trimIdx < 0 ? 0 : trimIdx
      const needAdd = z > last.endZ - t.generateAhead && last.index < maxIdx
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
      <Gates />
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
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={bodyPos}>
        <mesh receiveShadow position={surfacePos}>
          <boxGeometry args={surfaceArgs} />
          <meshStandardMaterial color={t.surfaceColor} />
        </mesh>
      </RigidBody>
      <mesh
        position={[0, segment.startY + 0.005, midZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={getGridMaterial()}
      >
        <planeGeometry args={[W, L]} />
      </mesh>
      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          position={[(s * W) / 2, segment.startY + 0.006, midZ]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={getEdgeMaterial()}
          renderOrder={1}
        >
          <planeGeometry args={[t.edgeWidth, L]} />
        </mesh>
      ))}
      {segment.obstacles.map((o, i) => (
        <ObstacleRenderer key={i} segment={segment} obstacle={o} />
      ))}
    </>
  )
})
