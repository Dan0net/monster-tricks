import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { config } from '../config'
import { initInput } from '../systems/input'
import { Track } from './Track'
import { Truck } from './Truck'
import { ChaseCamera } from './ChaseCamera'

export function Game() {
  useEffect(() => { initInput() }, [])
  return (
    <Canvas shadows camera={{ fov: config.camera.fov, position: [0, 8, -16] }}>
      <color attach="background" args={[config.fog.color]} />
      <fog attach="fog" args={[config.fog.color, config.fog.near, config.fog.far]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[20, 30, 10]} intensity={1.2} castShadow />
      <Physics gravity={[0, config.gravityY, 0]} timeStep={1 / 240}>
        <Track />
        <Truck />
      </Physics>
      <ChaseCamera />
    </Canvas>
  )
}
