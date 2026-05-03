import { useGame } from '../store'

function fmt(n: number, digits = 1) {
  return n.toFixed(digits)
}

function slipColor(s: number) {
  const a = Math.abs(s)
  if (a > 0.3) return '#ff5577'
  if (a > 0.1) return '#ffcc55'
  return '#5fd9a8'
}

export function DebugHUD() {
  const phase = useGame((s) => s.phase)
  const speed = useGame((s) => s.speed)
  const groundedCount = useGame((s) => s.groundedCount)
  const yawRate = useGame((s) => s.yawRate)
  const pitchRate = useGame((s) => s.pitchRate)
  const rollRate = useGame((s) => s.rollRate)
  const lateralG = useGame((s) => s.lateralG)
  const slip0 = useGame((s) => s.slip0)
  const slip1 = useGame((s) => s.slip1)
  const slip2 = useGame((s) => s.slip2)
  const slip3 = useGame((s) => s.slip3)

  if (phase !== 'playing') return null

  return (
    <div className="debug-hud">
      <div className="row"><span>spd</span><b>{fmt(speed)}</b><span>m/s</span></div>
      <div className="row"><span>grnd</span><b>{groundedCount}/4</b></div>
      <div className="row"><span>latG</span><b>{fmt(lateralG, 2)}</b></div>
      <div className="row"><span>yaw</span><b>{fmt(yawRate, 0)}</b><span>°/s</span></div>
      <div className="row"><span>ptch</span><b>{fmt(pitchRate, 0)}</b><span>°/s</span></div>
      <div className="row"><span>roll</span><b>{fmt(rollRate, 0)}</b><span>°/s</span></div>
      <div className="slip-grid">
        <div style={{ color: slipColor(slip1) }}>{fmt(slip1, 2)}</div>
        <div style={{ color: slipColor(slip0) }}>{fmt(slip0, 2)}</div>
        <div style={{ color: slipColor(slip3) }}>{fmt(slip3, 2)}</div>
        <div style={{ color: slipColor(slip2) }}>{fmt(slip2, 2)}</div>
      </div>
    </div>
  )
}
