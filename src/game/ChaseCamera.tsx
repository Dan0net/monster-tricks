import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { config } from '../config'
import { input } from '../systems/input'
import { truckBody } from './Truck'
import { useGame } from '../store'

const fwd = new THREE.Vector3()
const desired = new THREE.Vector3()
const q = new THREE.Quaternion()

export function ChaseCamera() {
  const { camera } = useThree()
  const yaw = useRef(0)
  const pitch = useRef(0)

  useFrame((state) => {
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

    const tr = body.translation()
    const ro = body.rotation()
    q.set(ro.x, ro.y, ro.z, ro.w)
    fwd.set(0, 0, 1).applyQuaternion(q)
    fwd.y = 0
    if (fwd.lengthSq() < 1e-4) fwd.set(0, 0, 1)
    fwd.normalize()
    const truckYaw = Math.atan2(fwd.x, fwd.z)
    const a = truckYaw + yaw.current
    const cp = Math.cos(pitch.current)

    desired.set(
      tr.x - Math.sin(a) * c.distance * cp,
      tr.y + c.height + Math.sin(pitch.current) * c.distance,
      tr.z - Math.cos(a) * c.distance * cp,
    )
    camera.position.lerp(desired, c.lerp)
    camera.lookAt(tr.x, tr.y + c.lookHeight, tr.z)
  })

  return null
}
