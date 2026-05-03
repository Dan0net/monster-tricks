import { memo, useEffect, useMemo } from 'react'
import { RigidBody, TrimeshCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { config } from '../config'
import type { Obstacle, Segment } from '../systems/track-gen'
import { buildObstacleGeometry, buildEdgeRibbon } from '../systems/obstacle-mesh'
import { getObstacleEdgeMaterial } from './EdgeMaterial'
import { getObstacleGridMaterial } from './GridMaterial'

function buildEdgeGeometry(o: Obstacle, side: 1 | -1, width: number): THREE.BufferGeometry {
  const { positions, uvs, indices } = buildEdgeRibbon(o, side, width)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  g.setIndex(new THREE.BufferAttribute(indices, 1))
  return g
}

export const ObstacleRenderer = memo(function ObstacleRenderer({
  segment,
  obstacle,
}: {
  segment: Segment
  obstacle: Obstacle
}) {
  const { colliderArgs, geometry, edges } = useMemo(() => {
    const { positions, indices } = buildObstacleGeometry(obstacle)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setIndex(new THREE.BufferAttribute(indices, 1))
    const nonIndexed = g.toNonIndexed()
    g.dispose()
    nonIndexed.computeVertexNormals()
    const w = config.track.obstacleEdgeWidth
    const edges = [buildEdgeGeometry(obstacle, 1, w), buildEdgeGeometry(obstacle, -1, w)]
    return {
      colliderArgs: [positions, indices] as [Float32Array, Uint16Array],
      geometry: nonIndexed,
      edges,
    }
  }, [obstacle])

  const position = useMemo<[number, number, number]>(
    () => [obstacle.xOffset, segment.startY, segment.startZ + obstacle.z],
    [obstacle, segment.startY, segment.startZ],
  )

  useEffect(
    () => () => {
      geometry.dispose()
      edges.forEach((g) => g.dispose())
    },
    [geometry, edges],
  )

  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <TrimeshCollider args={colliderArgs} />
      <mesh castShadow geometry={geometry} material={getObstacleGridMaterial()} />
      {edges.map((g, i) => (
        <mesh key={i} geometry={g} material={getObstacleEdgeMaterial()} renderOrder={1} />
      ))}
    </RigidBody>
  )
})
