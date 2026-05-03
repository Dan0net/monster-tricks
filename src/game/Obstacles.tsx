import { memo, useEffect, useMemo } from 'react'
import { RigidBody, TrimeshCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { config } from '../config'
import type { Obstacle, Segment } from '../systems/track-gen'
import { buildObstacleGeometry } from '../systems/obstacle-mesh'

export const ObstacleRenderer = memo(function ObstacleRenderer({
  segment,
  obstacle,
}: {
  segment: Segment
  obstacle: Obstacle
}) {
  const { colliderArgs, geometry } = useMemo(() => {
    const { positions, indices } = buildObstacleGeometry(obstacle)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setIndex(new THREE.BufferAttribute(indices, 1))
    const nonIndexed = g.toNonIndexed()
    g.dispose()
    nonIndexed.computeVertexNormals()
    return { colliderArgs: [positions, indices] as [Float32Array, Uint16Array], geometry: nonIndexed }
  }, [obstacle])

  const position = useMemo<[number, number, number]>(
    () => [obstacle.xOffset, segment.startY, segment.startZ + obstacle.z],
    [obstacle, segment.startY, segment.startZ],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  const c = config.track.obstacleColor
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <TrimeshCollider args={colliderArgs} />
      <mesh castShadow geometry={geometry}>
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} />
      </mesh>
    </RigidBody>
  )
})
