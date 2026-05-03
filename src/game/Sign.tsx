import * as THREE from 'three'
import { Text } from '@react-three/drei'
import { config } from '../config'

export function Sign({
  label,
  position,
  width = config.track.signWidth,
  height = config.track.signHeight,
}: {
  label: string
  position: [number, number, number]
  width?: number
  height?: number
}) {
  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <Text
        position={[0, 0, 0.02]}
        fontSize={height * 0.62}
        color={config.track.signTextColor}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
        outlineWidth={0.04}
        outlineColor={config.track.signTextColor}
      >
        {label}
      </Text>
    </group>
  )
}
