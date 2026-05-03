import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { config } from '../config'

const yAxis = new THREE.Vector3(0, 1, 0)
const dirV = new THREE.Vector3()
const fromV = new THREE.Vector3()

function orient(mesh: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3, radius: number) {
  dirV.subVectors(to, from)
  const len = dirV.length()
  if (len < 1e-4) return
  mesh.position.copy(from).add(to).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(yAxis, dirV.divideScalar(len))
  mesh.scale.set(radius, len, radius)
}

type Props = { wheelRefs: { current: (THREE.Group | null)[] } }

export function Suspension({ wheelRefs }: Props) {
  const f = config.truck.frame
  const axleRefs = useRef<(THREE.Mesh | null)[]>([])
  const armRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(() => {
    const wRefs = wheelRefs.current
    if (!wRefs) return
    const w0 = wRefs[0], w1 = wRefs[1], w2 = wRefs[2], w3 = wRefs[3]
    if (axleRefs.current[0] && w0 && w1) orient(axleRefs.current[0], w1.position, w0.position, f.axleRadius)
    if (axleRefs.current[1] && w2 && w3) orient(axleRefs.current[1], w3.position, w2.position, f.axleRadius)
    for (let i = 0; i < 4; i++) {
      const wg = wRefs[i]
      const arm = armRefs.current[i]
      if (!wg || !arm) continue
      const sx = i === 0 || i === 2 ? 1 : -1
      const sz = i === 0 || i === 1 ? 1 : -1
      fromV.set(sx * f.insetX, f.armMountY, sz * f.zSpan / 2)
      orient(arm, fromV, wg.position, f.armRadius)
    }
  })

  return (
    <group>
      <mesh position={[-f.insetX, f.y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[f.railRadius, f.railRadius, f.zSpan, 8]} />
        <meshStandardMaterial color={f.color} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[f.insetX, f.y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[f.railRadius, f.railRadius, f.zSpan, 8]} />
        <meshStandardMaterial color={f.color} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, f.y, f.zSpan / 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[f.railRadius, f.railRadius, 2 * f.insetX, 8]} />
        <meshStandardMaterial color={f.color} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, f.y, -f.zSpan / 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[f.railRadius, f.railRadius, 2 * f.insetX, 8]} />
        <meshStandardMaterial color={f.color} metalness={0.6} roughness={0.4} />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} ref={(el) => { axleRefs.current[i] = el }} castShadow>
          <cylinderGeometry args={[1, 1, 1, 12]} />
          <meshStandardMaterial color={f.color} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} ref={(el) => { armRefs.current[i] = el }} castShadow>
          <cylinderGeometry args={[1, 1, 1, 8]} />
          <meshStandardMaterial color={f.color} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}
