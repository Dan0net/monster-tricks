import { RoundedBox } from '@react-three/drei'
import { config } from '../config'

export function Chassis() {
  const t = config.truck
  const bodyW = t.chassisX * t.bodyXFrac
  const bodyH = t.chassisY
  const bodyD = t.chassisZ * t.bodyZFrac
  const cabW = t.chassisX * t.cabXFrac
  const cabH = t.cabY
  const cabD = t.chassisZ * t.cabZFrac
  const cabZ = t.chassisZ * t.cabZOffset

  return (
    <group>
      <RoundedBox args={[bodyW, bodyH, bodyD]} radius={t.bevelRadius} smoothness={3} position={[0, t.bodyY, 0]} castShadow>
        <meshStandardMaterial color={t.bodyColor} roughness={0.55} metalness={0.25} />
      </RoundedBox>
      <RoundedBox args={[cabW, cabH, cabD]} radius={t.bevelRadius * 0.7} smoothness={3} position={[0, t.bodyY + bodyH / 2 + cabH / 2, cabZ]} castShadow>
        <meshStandardMaterial color={t.cabColor} roughness={0.6} metalness={0.2} />
      </RoundedBox>
    </group>
  )
}
