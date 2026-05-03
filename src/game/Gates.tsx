import { config } from '../config'
import { checkpointZ } from '../systems/checkpoints'
import { getCheckerMaterial } from './CheckerMaterial'
import { Sign } from './Sign'

const POST_HEIGHT = 8
const POST_THICKNESS = 0.8

export function Gates() {
  const list = config.track.checkpoints
  return (
    <>
      {list.map((_, i) => (
        <Gate key={i} cpIndex={i} isFinal={i === list.length - 1} />
      ))}
    </>
  )
}

function Gate({ cpIndex, isFinal }: { cpIndex: number; isFinal: boolean }) {
  return (
    <group position={[0, 0, checkpointZ(cpIndex)]}>
      {isFinal ? <FinishParts /> : <CheckpointParts />}
    </group>
  )
}

function CheckpointParts() {
  const t = config.track
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} renderOrder={1}>
        <planeGeometry args={[t.width, t.checkpointLineHaloDepth]} />
        <meshBasicMaterial
          color={t.checkpointLineColor}
          transparent
          opacity={t.checkpointLineHaloOpacity}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} renderOrder={2}>
        <planeGeometry args={[t.width, t.checkpointLineDepth]} />
        <meshBasicMaterial color={t.checkpointLineColor} />
      </mesh>
      <Sign label="CHECKPOINT" position={[0, t.checkpointSignY, 0]} />
    </>
  )
}

function FinishParts() {
  const t = config.track
  const W = t.width
  const tilesX = Math.max(1, Math.round(W / t.finishCheckerSize))
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        material={getCheckerMaterial(
          tilesX,
          Math.max(1, Math.round(t.finishLineDepth / t.finishCheckerSize)),
          t.finishCheckerDark,
          t.finishCheckerLight,
        )}
        renderOrder={2}
      >
        <planeGeometry args={[W, t.finishLineDepth]} />
      </mesh>
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[(s * W) / 2, POST_HEIGHT / 2, 0]} castShadow>
          <boxGeometry args={[POST_THICKNESS, POST_HEIGHT, POST_THICKNESS]} />
          <meshStandardMaterial
            color={t.finishPostColor}
            emissive={t.finishPostColor}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
      <mesh
        position={[0, POST_HEIGHT + t.finishBannerHeight / 2, 0]}
        material={getCheckerMaterial(
          tilesX,
          Math.max(1, Math.round(t.finishBannerHeight / t.finishCheckerSize)),
          t.finishCheckerDark,
          t.finishCheckerLight,
        )}
      >
        <planeGeometry args={[W, t.finishBannerHeight]} />
      </mesh>
      <Sign label="FINISH" position={[0, t.finishSignY, 0]} />
    </>
  )
}
