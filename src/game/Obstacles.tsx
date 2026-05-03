import { useEffect, useMemo } from 'react'
import { RigidBody, TrimeshCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { config } from '../config'
import type { Obstacle, Segment } from '../systems/track-gen'
import { buildObstacleGeometry } from '../systems/obstacle-mesh'

export function ObstacleRenderer({ segment, obstacle }: { segment: Segment; obstacle: Obstacle }) {
  const { positions, indices, geometry } = useMemo(() => {
    const { positions, indices } = buildObstacleGeometry(obstacle)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setIndex(new THREE.BufferAttribute(indices, 1))
    const nonIndexed = g.toNonIndexed()
    g.dispose()
    nonIndexed.computeVertexNormals()
    return { positions, indices, geometry: nonIndexed }
  }, [obstacle])

  useEffect(() => () => geometry.dispose(), [geometry])

  const c = config.track.obstacleColor
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[obstacle.xOffset, segment.startY, segment.startZ + obstacle.z]}
    >
      <TrimeshCollider args={[positions, indices]} />
      <mesh castShadow geometry={geometry}>
        <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} />
      </mesh>
    </RigidBody>
  )
}
