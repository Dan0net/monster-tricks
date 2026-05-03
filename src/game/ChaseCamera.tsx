import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { config } from '../config'
import { input } from '../systems/input'
import { truckBody } from './Truck'
import { useGame } from '../store'

const desired = new THREE.Vector3()

const cameraSnapSignal = { pending: false }
export function requestCameraSnap() {
  cameraSnapSignal.pending = true
}

export function ChaseCamera() {
  const { camera } = useThree()
  const yaw = useRef(0)
  const pitch = useRef(0)
  const lastTruckYaw = useRef(0)
  const snapNext = useRef(false)
  const phase = useGame((s) => s.phase)

  useEffect(() => {
    if (phase === 'playing') snapNext.current = true
  }, [phase])

  useFrame((state, dt) => {
    const body = truckBody.current
    if (!body) return
    const c = config.camera
    const g = useGame.getState()
    const persp = camera as THREE.PerspectiveCamera
    if (persp.isPerspectiveCamera && persp.fov !== c.fov) {
      persp.fov = c.fov
      persp.updateProjectionMatrix()
    }

    if (g.phase === 'menu' && !g.hasPlayed) {
      const tr0 = body.translation()
      const a = state.clock.elapsedTime * c.orbitSpeed
      camera.position.set(
        tr0.x + Math.cos(a) * c.orbitDistance,
        tr0.y + c.orbitHeight,
        tr0.z + Math.sin(a) * c.orbitDistance,
      )
      camera.lookAt(tr0.x, tr0.y + c.orbitLookHeight, tr0.z)
      return
    }

    const ro = body.rotation()
    const tr = body.translation()
    const tw2 = ro.y * ro.y + ro.w * ro.w
    const truckYaw = tw2 > c.yawHoldThreshold ? 2 * Math.atan2(ro.y, ro.w) : lastTruckYaw.current

    let snapping = false
    if (snapNext.current || cameraSnapSignal.pending) {
      snapNext.current = false
      cameraSnapSignal.pending = false
      snapping = true
      yaw.current = 0
      pitch.current = 0
      lastTruckYaw.current = truckYaw
      input.mouseDX = 0
      input.mouseDY = 0
    }

    if (input.mouseDX !== 0 || input.mouseDY !== 0) {
      yaw.current -= input.mouseDX * c.sensitivity
      pitch.current -= input.mouseDY * c.sensitivity
      pitch.current = THREE.MathUtils.clamp(pitch.current, c.pitchMin, c.pitchMax)
      input.mouseDX = 0
      input.mouseDY = 0
    } else {
      yaw.current *= c.decay
      pitch.current *= c.decay
    }

    const TAU = Math.PI * 2
    let delta = (truckYaw - lastTruckYaw.current + Math.PI) % TAU
    if (delta < 0) delta += TAU
    delta -= Math.PI
    lastTruckYaw.current += delta * (1 - Math.exp(-c.yawDampSpeed * dt))
    const a = lastTruckYaw.current + yaw.current
    const cp = Math.cos(pitch.current)

    desired.set(
      tr.x - Math.sin(a) * c.distance * cp,
      tr.y + c.height + Math.sin(pitch.current) * c.distance,
      tr.z - Math.cos(a) * c.distance * cp,
    )
    if (snapping) camera.position.copy(desired)
    else camera.position.lerp(desired, c.lerp)
    camera.lookAt(tr.x, tr.y + c.lookHeight, tr.z)
  })

  return null
}
