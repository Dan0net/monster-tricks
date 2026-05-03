import { Fragment, useMemo } from 'react'
import * as THREE from 'three'
import { config } from '../config'

function tireProfile(rimR: number, sidewallR: number, tireR: number, hw: number) {
  return [
    new THREE.Vector2(rimR, -hw),
    new THREE.Vector2(sidewallR, -hw),
    new THREE.Vector2(tireR * 0.96, -hw * 0.92),
    new THREE.Vector2(tireR, -hw * 0.7),
    new THREE.Vector2(tireR, hw * 0.7),
    new THREE.Vector2(tireR * 0.96, hw * 0.92),
    new THREE.Vector2(sidewallR, hw),
    new THREE.Vector2(rimR, hw),
  ]
}

export function Wheel() {
  const t = config.truck
  const tireR = t.wheelRadius
  const halfW = t.wheelWidth / 2
  const rimR = tireR * 0.55
  const sidewallR = tireR * 0.85
  const treadH = tireR * 0.1
  const treadArc = ((2 * Math.PI * tireR) / t.treadBlocks) * 0.6
  const treadAxial = t.wheelWidth * t.treadAxialFrac
  const treadOffset = t.wheelWidth * t.treadAxleOffsetFrac
  const spokeLen = rimR * 0.95
  const spokeW = rimR * 0.18
  const treadR = tireR + treadH * 0.25

  const tireGeom = useMemo(() => new THREE.LatheGeometry(tireProfile(rimR, sidewallR, tireR, halfW), 28), [tireR, rimR, sidewallR, halfW])
  const treadGeom = useMemo(() => new THREE.BoxGeometry(treadH, treadAxial, treadArc), [treadH, treadAxial, treadArc])
  const rimGeom = useMemo(() => new THREE.CylinderGeometry(rimR * 1.02, rimR * 1.02, t.wheelWidth * 1.04, 20), [rimR, t.wheelWidth])
  const spokeGeom = useMemo(() => new THREE.BoxGeometry(spokeW, t.wheelWidth * 1.06, spokeLen), [spokeW, t.wheelWidth, spokeLen])

  const treadAngles = useMemo(() => Array.from({ length: t.treadBlocks }, (_, i) => (i / t.treadBlocks) * Math.PI * 2), [t.treadBlocks])
  const spokeAngles = useMemo(() => Array.from({ length: t.spokes }, (_, i) => (i / t.spokes) * Math.PI * 2), [t.spokes])

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <mesh geometry={tireGeom}>
        <meshStandardMaterial color={t.tireColor} />
      </mesh>
      <mesh geometry={rimGeom}>
        <meshStandardMaterial color={t.rimColor} emissive={t.rimGlow} emissiveIntensity={0.7} metalness={0.7} roughness={0.3} />
      </mesh>
      {spokeAngles.map((a, i) => (
        <mesh
          key={i}
          geometry={spokeGeom}
          position={[Math.sin(a) * spokeLen / 2, 0, Math.cos(a) * spokeLen / 2]}
          rotation={[0, a, 0]}
          castShadow
        >
          <meshStandardMaterial color={t.rimColor} emissive={t.rimGlow} emissiveIntensity={0.5} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {treadAngles.map((a, i) => (
        <Fragment key={i}>
          <group position={[Math.cos(a) * treadR, treadOffset, Math.sin(a) * treadR]} rotation={[0, -a, 0]}>
            <mesh geometry={treadGeom} rotation={[t.treadChevronAngle, 0, 0]}>
              <meshStandardMaterial color={t.treadColor} roughness={0.9} metalness={0.0} />
            </mesh>
          </group>
          <group position={[Math.cos(a) * treadR, -treadOffset, Math.sin(a) * treadR]} rotation={[0, -a, 0]}>
            <mesh geometry={treadGeom} rotation={[-t.treadChevronAngle, 0, 0]}>
              <meshStandardMaterial color={t.treadColor} roughness={0.9} metalness={0.0} />
            </mesh>
          </group>
        </Fragment>
      ))}
    </group>
  )
}
