import { RigidBody } from '@react-three/rapier'
import { config } from '../config'
import type {
  Kicker,
  Obstacle,
  Quarterpipe,
  Segment,
  Tabletop,
} from '../systems/track-gen'

function RampMaterial() {
  const c = config.track.obstacleColor
  return <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} />
}

export function ObstacleRenderer({ segment, obstacle }: { segment: Segment; obstacle: Obstacle }) {
  switch (obstacle.shape) {
    case 'kicker':
      return <KickerRenderer segment={segment} obstacle={obstacle} />
    case 'quarterpipe':
      return <QuarterpipeRenderer segment={segment} obstacle={obstacle} />
    case 'tabletop':
      return <TabletopRenderer segment={segment} obstacle={obstacle} />
  }
}

function KickerRenderer({ segment, obstacle }: { segment: Segment; obstacle: Kicker }) {
  const thickness = config.obstacles.thickness
  const pitch = Math.atan2(obstacle.height, obstacle.length)
  const slantLen = Math.hypot(obstacle.length, obstacle.height)
  const centerZ = segment.startZ + obstacle.z + obstacle.length / 2
  const centerY = segment.startY + obstacle.height / 2 - (thickness / 2) * Math.cos(pitch)
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[obstacle.xOffset, centerY, centerZ]} rotation={[-pitch, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[obstacle.width, thickness, slantLen]} />
        <RampMaterial />
      </mesh>
    </RigidBody>
  )
}

function QuarterpipeRenderer({ segment, obstacle }: { segment: Segment; obstacle: Quarterpipe }) {
  const thickness = config.obstacles.thickness
  const N = config.obstacles.curveSegments
  const baseZ = segment.startZ + obstacle.z
  const pieces = []
  for (let i = 0; i < N; i++) {
    const t0 = (i / N) * (Math.PI / 2)
    const t1 = ((i + 1) / N) * (Math.PI / 2)
    const z0 = obstacle.length * Math.sin(t0)
    const z1 = obstacle.length * Math.sin(t1)
    const y0 = obstacle.height * (1 - Math.cos(t0))
    const y1 = obstacle.height * (1 - Math.cos(t1))
    const dz = z1 - z0
    const dy = y1 - y0
    const segLen = Math.hypot(dz, dy)
    const pitch = Math.atan2(dy, dz)
    const cz = baseZ + (z0 + z1) / 2
    const cy = segment.startY + (y0 + y1) / 2 - (thickness / 2) * Math.cos(pitch)
    pieces.push({ cz, cy, pitch, segLen })
  }
  return (
    <RigidBody type="fixed" colliders="cuboid">
      {pieces.map((p, i) => (
        <mesh key={i} castShadow position={[obstacle.xOffset, p.cy, p.cz]} rotation={[-p.pitch, 0, 0]}>
          <boxGeometry args={[obstacle.width, thickness, p.segLen]} />
          <RampMaterial />
        </mesh>
      ))}
    </RigidBody>
  )
}

function TabletopRenderer({ segment, obstacle }: { segment: Segment; obstacle: Tabletop }) {
  const thickness = config.obstacles.thickness
  const baseZ = segment.startZ + obstacle.z
  const pitch = Math.atan2(obstacle.height, obstacle.rampLength)
  const slantLen = Math.hypot(obstacle.rampLength, obstacle.height)
  const upZ = baseZ + obstacle.rampLength / 2
  const upY = segment.startY + obstacle.height / 2 - (thickness / 2) * Math.cos(pitch)
  const topZ = baseZ + obstacle.rampLength + obstacle.topLength / 2
  const topY = segment.startY + obstacle.height - thickness / 2
  const downZ = baseZ + obstacle.rampLength + obstacle.topLength + obstacle.rampLength / 2
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh castShadow position={[obstacle.xOffset, upY, upZ]} rotation={[-pitch, 0, 0]}>
        <boxGeometry args={[obstacle.width, thickness, slantLen]} />
        <RampMaterial />
      </mesh>
      <mesh castShadow position={[obstacle.xOffset, topY, topZ]}>
        <boxGeometry args={[obstacle.width, thickness, obstacle.topLength]} />
        <RampMaterial />
      </mesh>
      <mesh castShadow position={[obstacle.xOffset, upY, downZ]} rotation={[pitch, 0, 0]}>
        <boxGeometry args={[obstacle.width, thickness, slantLen]} />
        <RampMaterial />
      </mesh>
    </RigidBody>
  )
}
