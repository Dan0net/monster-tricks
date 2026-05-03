import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  RigidBody,
  ConvexHullCollider,
  useRapier,
  useBeforePhysicsStep,
  useAfterPhysicsStep,
  type RapierRigidBody,
} from '@react-three/rapier'
import type RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import { config } from '../config'
import { input } from '../systems/input'
import { initScoring, manualReset, updateScoring, type ScoringEvents, type ScoringState } from '../systems/scoring'
import { initCheckpoints, updateCheckpoints, type CheckpointState } from '../systems/checkpoints'
import { useGame } from '../store'
import { Chassis } from './Chassis'
import { Wheel } from './Wheel'
import { Suspension } from './Suspension'
import { wheelCs, buildEllipsoidPoints } from '../systems/truck-geometry'

const susDir = { x: 0, y: -1, z: 0 }
const axleDir = { x: -1, y: 0, z: 0 }
const identityQ = { x: 0, y: 0, z: 0, w: 1 }
const wheelCount = 4

export const truckBody = { current: null as RapierRigidBody | null }

const wheelWorld = new THREE.Vector3()
const chassisP = new THREE.Vector3()
const chassisQ = new THREE.Quaternion()
const invChassisQ = new THREE.Quaternion()
const wheelLocal = new THREE.Vector3()
const shapeRot = new THREE.Quaternion()
const steerYawQ = new THREE.Quaternion()
const baseRotZ90 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)
const yAxis = new THREE.Vector3(0, 1, 0)
const castVel = { x: 0, y: -1, z: 0 }
const angvelLocal = new THREE.Vector3()
const linvelV = new THREE.Vector3()
const angvelV = new THREE.Vector3()
const rVec = new THREE.Vector3()
const velAtHub = new THREE.Vector3()
const fwdWorldV = new THREE.Vector3()

export function Truck() {
  const { rapier, world } = useRapier()
  const chassisRef = useRef<RapierRigidBody>(null!)
  const ctrlRef = useRef<RAPIER.DynamicRayCastVehicleController | null>(null)
  const wheelRefs = useRef<(THREE.Group | null)[]>([])
  const applied = useRef(0)
  const appliedSteer = useRef(0)
  const wheelOmega = useRef<number[]>([0, 0, 0, 0])
  const spinAccum = useRef<number[]>([0, 0, 0, 0])
  const wheelRollSpeed = useRef<number[]>([0, 0, 0, 0])
  const prevLinvel = useRef({ x: 0, y: 0, z: 0 })
  const debugRef = useRef({ slip: [0, 0, 0, 0], yawRate: 0, pitchRate: 0, rollRate: 0, lateralG: 0, groundedCount: 0 })
  const wheelShape = useMemo(
    () => new rapier.Cylinder(config.truck.wheelWidth / 2, config.truck.wheelRadius),
    [rapier],
  )
  const scoringRef = useRef<ScoringState | null>(null)
  if (!scoringRef.current) scoringRef.current = initScoring()
  const checkpointsRef = useRef<CheckpointState | null>(null)
  if (!checkpointsRef.current) checkpointsRef.current = initCheckpoints()
  const chassisColliderRef = useRef<RAPIER.Collider | null>(null)
  const phase = useGame((s) => s.phase)
  useGame((s) => s.tuneRev)

  const respawn = (toSpawn = false) => {
    const chassis = chassisRef.current
    if (!chassis) return
    const t = config.truck
    const cur = chassis.translation()
    const x = toSpawn ? t.spawnX : cur.x
    const z = toSpawn ? t.spawnZ : cur.z
    chassis.setTranslation({ x, y: t.spawnY, z }, true)
    chassis.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
    chassis.setLinvel({ x: 0, y: 0, z: 0 }, true)
    chassis.setAngvel({ x: 0, y: 0, z: 0 }, true)
    applied.current = 0
    appliedSteer.current = 0
  }
  const respawnRef = useRef(respawn)
  respawnRef.current = respawn

  const dispatchEvents = (ev: ScoringEvents) => {
    const g = useGame.getState()
    if (ev.flips > 0) g.pulseFlip()
    if (ev.landed) g.pulseLand(ev.landAmount)
    if (ev.crashed) g.pulseLoss(ev.lossAmount, ev.lossMul)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyR') return
      respawnRef.current()
      dispatchEvents(manualReset(scoringRef.current!))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return
    Object.assign(scoringRef.current!, initScoring())
    Object.assign(checkpointsRef.current!, initCheckpoints())
    respawnRef.current(true)
  }, [phase])

  useEffect(() => {
    const chassis = chassisRef.current
    if (!chassis) return
    truckBody.current = chassis
    const t = config.truck
    chassis.setAdditionalMassProperties(
      t.mass,
      { x: t.comX, y: t.comY, z: t.comZ },
      { x: t.inertiaPitch, y: t.inertiaYaw, z: t.inertiaRoll },
      identityQ,
      true,
    )
    const ctrl = world.createVehicleController(chassis)
    for (let i = 0; i < wheelCount; i++) {
      ctrl.addWheel(wheelCs(i), susDir, axleDir, t.suspensionRest, t.wheelRadius)
    }
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

    w.gravity.y = config.gravityY

    chassis.setAdditionalMassProperties(
      t.mass,
      { x: t.comX, y: t.comY, z: t.comZ },
      { x: t.inertiaPitch, y: t.inertiaYaw, z: t.inertiaRoll },
      identityQ,
      false,
    )
    chassis.setLinearDamping(t.linearDamping)
    chassis.setAngularDamping(t.angularDamping)

    const raw = playing ? input.throttle : 0
    const shaped = raw * Math.abs(raw)
    const target = shaped >= 0 ? shaped : shaped * t.reverseScale
    applied.current = THREE.MathUtils.damp(applied.current, target, t.accelRate, dt)

    const lv = chassis.linvel()
    const cq = chassis.rotation()
    chassisQ.set(cq.x, cq.y, cq.z, cq.w)
    fwdWorldV.set(0, 0, 1).applyQuaternion(chassisQ)
    const fwdSpeed = lv.x * fwdWorldV.x + lv.y * fwdWorldV.y + lv.z * fwdWorldV.z
    const sa = Math.sign(applied.current)
    const torqueScale = sa === 0 ? 0 : THREE.MathUtils.clamp(1 - (sa * fwdSpeed) / t.topSpeedTarget, 0, 1)
    const force = applied.current * t.peakTorque * torqueScale
    const ebrakeOn = playing && input.ebrake > 0
    const speed = Math.hypot(lv.x, lv.z)
    const k = THREE.MathUtils.clamp(speed / t.steerSpeedRef, 0, 1)
    const effectiveMaxSteer = t.maxSteer + (t.maxSteerHighSpeed - t.maxSteer) * k
    const steerTarget = (playing ? input.steer : 0) * effectiveMaxSteer
    appliedSteer.current = THREE.MathUtils.damp(appliedSteer.current, steerTarget, t.steerRate, dt)
    const steer = appliedSteer.current

    for (let i = 0; i < wheelCount; i++) {
      const ebrakeWheel = ebrakeOn && t.ebrakeWheels.includes(i)
      ctrl.setWheelChassisConnectionPointCs(i, wheelCs(i, true))
      ctrl.setWheelEngineForce(i, ebrakeWheel ? 0 : force)
      ctrl.setWheelBrake(i, ebrakeWheel ? t.ebrakeForce : 0)
      ctrl.setWheelSuspensionStiffness(i, t.stiffness)
      ctrl.setWheelMaxSuspensionTravel(i, t.maxTravel)
      ctrl.setWheelFrictionSlip(i, ebrakeWheel ? t.ebrakeFrictionSlip : t.frictionSlip)
      ctrl.setWheelSuspensionCompression(i, t.compression)
      ctrl.setWheelSuspensionRelaxation(i, t.relaxation)
      ctrl.setWheelSuspensionRestLength(i, t.suspensionRest)
      ctrl.setWheelRadius(i, t.wheelRadius)
      ctrl.setWheelMaxSuspensionForce(i, t.maxSuspensionForce)
    }
    for (const i of t.steerWheels) {
      const phase = i >= 2 ? t.rearSteerPhase : 1
      ctrl.setWheelSteering(i, phase * steer)
    }
    ctrl.updateVehicle(dt)
  })

  useAfterPhysicsStep((w) => {
    const ctrl = ctrlRef.current
    const chassis = chassisRef.current
    if (!ctrl || !chassis) return
    ctrl.updateVehicle(0)
    const t = config.truck

    const ct = chassis.translation()
    const cq = chassis.rotation()
    chassisP.set(ct.x, ct.y, ct.z)
    chassisQ.set(cq.x, cq.y, cq.z, cq.w)
    invChassisQ.copy(chassisQ).invert()

    let groundedCount = 0
    for (let i = 0; i < wheelCount; i++) if (ctrl.wheelIsInContact(i)) groundedCount++
    const ebrakeOn = useGame.getState().phase === 'playing' && input.ebrake > 0

    const lv = chassis.linvel()
    const av = chassis.angvel()
    linvelV.set(lv.x, lv.y, lv.z)
    angvelV.set(av.x, av.y, av.z)
    angvelLocal.set(av.x, av.y, av.z).applyQuaternion(invChassisQ)

    for (let i = 0; i < wheelCount; i++) {
      const cp = wheelCs(i)
      rVec.set(cp.x, cp.y, cp.z).applyQuaternion(chassisQ)
      velAtHub.copy(angvelV).cross(rVec).add(linvelV)
      const steer = ctrl.wheelSteering(i) ?? 0
      fwdWorldV.set(Math.sin(steer), 0, Math.cos(steer)).applyQuaternion(chassisQ)
      const rollSpeed = velAtHub.dot(fwdWorldV)
      wheelRollSpeed.current[i] = rollSpeed
      const isEbrakeWheel = ebrakeOn && t.ebrakeWheels.includes(i)
      if (isEbrakeWheel) {
        wheelOmega.current[i] = 0
      } else if (ctrl.wheelIsInContact(i)) {
        const targetOmega = Math.abs(rollSpeed) > 0.1 ? rollSpeed / t.wheelRadius : 0
        wheelOmega.current[i] = THREE.MathUtils.damp(wheelOmega.current[i], targetOmega, 12, w.timestep)
      } else {
        wheelOmega.current[i] = THREE.MathUtils.damp(wheelOmega.current[i], 0, t.airSpinDamp, w.timestep)
      }
      spinAccum.current[i] += wheelOmega.current[i] * w.timestep
    }

    const dbg = debugRef.current
    dbg.groundedCount = groundedCount
    dbg.yawRate = (angvelLocal.y * 180) / Math.PI
    dbg.pitchRate = (angvelLocal.x * 180) / Math.PI
    dbg.rollRate = (angvelLocal.z * 180) / Math.PI
    const dt = w.timestep
    const ax = (lv.x - prevLinvel.current.x) / dt
    const az = (lv.z - prevLinvel.current.z) / dt
    fwdWorldV.set(1, 0, 0).applyQuaternion(chassisQ)
    dbg.lateralG = (ax * fwdWorldV.x + az * fwdWorldV.z) / 9.81
    prevLinvel.current.x = lv.x
    prevLinvel.current.y = lv.y
    prevLinvel.current.z = lv.z
    for (let i = 0; i < wheelCount; i++) {
      const v = wheelRollSpeed.current[i]
      const wheelLinear = wheelOmega.current[i] * t.wheelRadius
      dbg.slip[i] = (wheelLinear - v) / Math.max(Math.abs(v), 0.5)
    }

    let topContact = false
    const chassisCollider = chassisColliderRef.current
    if (chassisCollider) {
      w.contactPairsWith(chassisCollider, (other) => {
        if (topContact) return
        w.contactPair(chassisCollider, other, (manifold, flipped) => {
          if (topContact) return
          const n = manifold.numContacts()
          for (let i = 0; i < n; i++) {
            const p = flipped ? manifold.localContactPoint2(i) : manifold.localContactPoint1(i)
            if (p && p.y > 0) { topContact = true; return }
          }
        })
      })
    }

    const ev = updateScoring(scoringRef.current!, {
      dt: w.timestep,
      speed: Math.hypot(lv.x, lv.y, lv.z),
      fullyAirborne: groundedCount === 0,
      fullyGrounded: groundedCount === wheelCount,
      topContact,
      yPos: ct.y,
      angvelLocalX: angvelLocal.x,
      angvelLocalZ: angvelLocal.z,
      playing: useGame.getState().phase === 'playing',
    })
    dispatchEvents(ev)

    for (let i = 0; i < wheelCount; i++) {
      const g = wheelRefs.current[i]
      if (!g) continue
      const cp = wheelCs(i)
      const sus = ctrl.wheelSuspensionLength(i) ?? t.suspensionRest
      g.position.set(cp.x, cp.y - sus, cp.z)
      g.rotation.set(spinAccum.current[i], ctrl.wheelSteering(i) ?? 0, 0, 'YXZ')

      wheelWorld.copy(g.position).applyQuaternion(chassisQ).add(chassisP)
      wheelShape.halfHeight = t.wheelWidth / 2
      wheelShape.radius = t.wheelRadius
      const steer = ctrl.wheelSteering(i) ?? 0
      steerYawQ.setFromAxisAngle(yAxis, steer)
      shapeRot.copy(chassisQ).multiply(steerYawQ).multiply(baseRotZ90)
      const shapePos = { x: wheelWorld.x, y: wheelWorld.y + t.wheelRadius, z: wheelWorld.z }
      const hit = world.castShape(
        shapePos, shapeRot, castVel, wheelShape,
        0, t.wheelRadius * 2, true,
        undefined, undefined, undefined, chassis,
      )
      if (hit) {
        const minCenterY = wheelWorld.y + t.wheelRadius - hit.time_of_impact
        if (wheelWorld.y < minCenterY) {
          wheelLocal.set(wheelWorld.x, minCenterY, wheelWorld.z).sub(chassisP).applyQuaternion(invChassisQ)
          g.position.copy(wheelLocal)
        }
      }
    }
  })

  useFrame((_, dt) => {
    const s = scoringRef.current!
    const cp = checkpointsRef.current!
    const g = useGame.getState()

    let result: 'finished' | 'expired' | null = null
    if (g.phase === 'playing') {
      const body = chassisRef.current
      if (body) {
        const tick = updateCheckpoints(cp, body.translation().z, dt)
        if (tick.finished) {
          s.score += s.pendingAirScore
          s.pendingAirScore = 0
          s.airborne = false
          result = 'finished'
        } else if (tick.expired) {
          s.score += s.pendingAirScore
          s.pendingAirScore = 0
          s.airborne = false
          result = 'expired'
        } else if (tick.hit) {
          g.pulseCpHit()
        }
      }
    }

    const dbg = debugRef.current
    g.setLive({
      score: s.score,
      multiplier: s.multiplier,
      pendingAirScore: s.pendingAirScore,
      speed: s.speed,
      maxSpeed: s.maxSpeed,
      flips: s.flipsThisRun,
      airborne: s.airborne,
      pitchDeg: (s.pitchAccum * 180) / Math.PI,
      rollDeg: (s.rollAccum * 180) / Math.PI,
      timeRemaining: cp.timeRemaining,
      checkpointIndex: cp.nextIndex,
      slip0: dbg.slip[0],
      slip1: dbg.slip[1],
      slip2: dbg.slip[2],
      slip3: dbg.slip[3],
      yawRate: dbg.yawRate,
      pitchRate: dbg.pitchRate,
      rollRate: dbg.rollRate,
      lateralG: dbg.lateralG,
      groundedCount: dbg.groundedCount,
    })

    if (result === 'finished') g.finish(s.score)
    else if (result === 'expired') g.timeOut(s.score)
  })

  const t = config.truck
  const domeHalfY = (t.chassisY + t.cabY) / 2
  const domeCenterY = t.bodyY + t.cabY / 2
  const bodyPts = useMemo(
    () => buildEllipsoidPoints(t.chassisX / 2, domeHalfY, t.chassisZ / 2),
    [t.chassisX, t.chassisZ, domeHalfY],
  )
  return (
    <RigidBody
      ref={chassisRef}
      colliders={false}
      position={[t.spawnX, t.spawnY, t.spawnZ]}
      angularDamping={t.angularDamping}
      linearDamping={t.linearDamping}
      ccd
    >
      <ConvexHullCollider
        ref={chassisColliderRef}
        args={[bodyPts]}
        position={[0, domeCenterY, 0]}
        friction={0.5}
        density={0}
      />
      <Chassis />
      <Suspension wheelRefs={wheelRefs} />
      {Array.from({ length: wheelCount }, (_, i) => (
        <group key={i} ref={(el) => { wheelRefs.current[i] = el }}>
          <Wheel />
        </group>
      ))}
    </RigidBody>
  )
}
