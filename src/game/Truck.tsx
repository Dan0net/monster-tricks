import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  RigidBody,
  CuboidCollider,
  useRapier,
  useBeforePhysicsStep,
  type RapierRigidBody,
} from '@react-three/rapier'
import type RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import { config } from '../config'
import { input } from '../systems/input'
import { useGame } from '../store'

const susDir = { x: 0, y: -1, z: 0 }
const axleDir = { x: -1, y: 0, z: 0 }
const identityQ = { x: 0, y: 0, z: 0, w: 1 }

export const truckBody = { current: null as RapierRigidBody | null }

export function Truck() {
  const { world } = useRapier()
  const chassisRef = useRef<RapierRigidBody>(null!)
  const ctrlRef = useRef<RAPIER.DynamicRayCastVehicleController | null>(null)
  const wheelRefs = useRef<(THREE.Group | null)[]>([])
  const applied = useRef(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyR') return
      const chassis = chassisRef.current
      if (!chassis) return
      const [x, y, z] = config.truck.spawn
      chassis.setTranslation({ x, y, z }, true)
      chassis.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      chassis.setLinvel({ x: 0, y: 0, z: 0 }, true)
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true)
      applied.current = 0
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const chassis = chassisRef.current
    if (!chassis) return
    truckBody.current = chassis
    const t = config.truck
    const ctrl = world.createVehicleController(chassis)
    t.wheels.forEach((w) => {
      ctrl.addWheel(w, susDir, axleDir, t.suspensionRest, t.wheelRadius)
    })
    ctrlRef.current = ctrl
    return () => {
      world.removeVehicleController(ctrl)
      ctrlRef.current = null
      truckBody.current = null
    }
  }, [world])

  useBeforePhysicsStep((w) => {
    const ctrl = ctrlRef.current
    const chassis = chassisRef.current
    if (!ctrl || !chassis) return
    const t = config.truck
    const dt = w.timestep
    const playing = useGame.getState().phase === 'playing'

    chassis.setLinearDamping(t.linearDamping)
    chassis.setAngularDamping(t.angularDamping)

    const raw = playing ? input.throttle : 0
    const target = raw >= 0 ? raw : raw * t.reverseScale
    applied.current = THREE.MathUtils.damp(applied.current, target, t.accelRate, dt)

    const force = applied.current * t.engineForce
    const brake = (playing ? input.brake : 0) * t.brakeForce
    const steer = (playing ? input.steer : 0) * t.maxSteer

    for (let i = 0; i < t.wheels.length; i++) {
      ctrl.setWheelEngineForce(i, force)
      ctrl.setWheelBrake(i, brake)
      ctrl.setWheelSuspensionStiffness(i, t.stiffness)
      ctrl.setWheelMaxSuspensionTravel(i, t.maxTravel)
      ctrl.setWheelFrictionSlip(i, t.frictionSlip)
      ctrl.setWheelSuspensionCompression(i, t.compression)
      ctrl.setWheelSuspensionRelaxation(i, t.relaxation)
      ctrl.setWheelSuspensionRestLength(i, t.suspensionRest)
      ctrl.setWheelRadius(i, t.wheelRadius)
    }
    for (const i of t.steerWheels) ctrl.setWheelSteering(i, steer)
    ctrl.updateVehicle(dt)
  })

  useFrame(() => {
    const ctrl = ctrlRef.current
    if (!ctrl) return
    for (let i = 0; i < config.truck.wheels.length; i++) {
      const g = wheelRefs.current[i]
      if (!g) continue
      const cp = config.truck.wheels[i]
      const sus = ctrl.wheelSuspensionLength(i) ?? config.truck.suspensionRest
      g.position.set(cp.x, cp.y - sus, cp.z)
      g.rotation.set(ctrl.wheelRotation(i) ?? 0, ctrl.wheelSteering(i) ?? 0, 0, 'YXZ')
      g.scale.set(config.truck.wheelWidth, config.truck.wheelRadius, config.truck.wheelRadius)
    }
  })

  const t = config.truck
  return (
    <RigidBody
      ref={chassisRef}
      colliders={false}
      position={t.spawn}
      angularDamping={t.angularDamping}
      linearDamping={t.linearDamping}
      ccd
    >
      <CuboidCollider
        args={[t.chassis[0] / 2, t.chassis[1] / 2, t.chassis[2] / 2]}
        friction={0.5}
        massProperties={{
          mass: t.mass,
          centerOfMass: t.centerOfMass,
          principalAngularInertia: t.principalAngularInertia,
          angularInertiaLocalFrame: identityQ,
        }}
      />
      <mesh castShadow>
        <boxGeometry args={t.chassis} />
        <meshStandardMaterial color={t.color} emissive={t.color} emissiveIntensity={0.35} />
      </mesh>
      <mesh castShadow position={[0, t.chassis[1] / 2 + 0.3, -0.3]}>
        <boxGeometry args={[t.chassis[0] * 0.7, 0.6, t.chassis[2] * 0.45]} />
        <meshStandardMaterial color="#1a1a2e" emissive={t.wheelGlow} emissiveIntensity={0.15} />
      </mesh>
      {t.wheels.map((_, i) => (
        <group key={i} ref={(el) => { wheelRefs.current[i] = el }}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[1, 1, 1, 18]} />
            <meshStandardMaterial color={t.wheelColor} emissive={t.wheelGlow} emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}
    </RigidBody>
  )
}
