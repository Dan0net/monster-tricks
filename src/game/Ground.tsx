import { RigidBody } from '@react-three/rapier'
import { config } from '../config'

export function Ground() {
  const { size, color } = config.ground
  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" friction={1}>
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[size, 1, size]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </RigidBody>
      <gridHelper args={[size, 40, '#2dd4ff', '#1a1a2e']} position={[0, 0.01, 0]} />
    </>
  )
}
