import { config } from '../config'
import { checkpointZ } from '../systems/checkpoints'
import { getCheckerMaterial } from './CheckerMaterial'

const POST_HEIGHT = 8
const BEAM_HEIGHT = 0.6
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
  const t = config.track
  const z = checkpointZ(cpIndex)
  const W = t.width
  const tilesX = Math.max(1, Math.round(W / t.finishCheckerSize))

  return (
    <group position={[0, 0, z]}>
      {isFinal && (
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
      )}
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
      {isFinal ? (
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
      ) : (
        <mesh position={[0, POST_HEIGHT + BEAM_HEIGHT / 2, 0]}>
          <boxGeometry args={[W, BEAM_HEIGHT, BEAM_HEIGHT]} />
          <meshStandardMaterial
            color={t.finishPostColor}
            emissive={t.finishPostColor}
            emissiveIntensity={2}
          />
        </mesh>
      )}
    </group>
  )
}
