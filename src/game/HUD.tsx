import { useEffect, useState } from 'react'
import { config } from '../config'
import { useGame } from '../store'

const fmt = (n: number) => Math.floor(n).toLocaleString()
const sgn = (n: number) => Math.round(n)

function usePulse(counter: number, ms: number) {
  const [active, setActive] = useState(false)
  useEffect(() => {
    if (counter === 0) return
    setActive(true)
    const t = setTimeout(() => setActive(false), ms)
    return () => clearTimeout(t)
  }, [counter, ms])
  return active
}

export function HUD() {
  const phase = useGame((s) => s.phase)
  const speed = useGame((s) => s.speed)
  const maxSpeed = useGame((s) => s.maxSpeed)
  const flips = useGame((s) => s.flips)
  const score = useGame((s) => s.score)
  const multiplier = useGame((s) => s.multiplier)
  const pendingAirScore = useGame((s) => s.pendingAirScore)
  const airborne = useGame((s) => s.airborne)
  const pitchDeg = useGame((s) => s.pitchDeg)
  const rollDeg = useGame((s) => s.rollDeg)
  const flipPulse = useGame((s) => s.flipPulse)
  const landPulse = useGame((s) => s.landPulse)
  const lossPulse = useGame((s) => s.lossPulse)
  const lastLand = useGame((s) => s.lastLand)
  const lastLoss = useGame((s) => s.lastLoss)
  const lastLossMul = useGame((s) => s.lastLossMul)

  const timeRemaining = useGame((s) => s.timeRemaining)
  const checkpointIndex = useGame((s) => s.checkpointIndex)

  const flipping = usePulse(flipPulse, 400)
  const landing = usePulse(landPulse, 800)
  const losing = usePulse(lossPulse, 700)

  if (phase !== 'playing') return null

  const showRun = losing ? lastLoss : pendingAirScore
  const showMul = losing ? lastLossMul : multiplier
  const speedMul = Math.floor(maxSpeed / config.scoring.speedPerMul)
  const flipMul = flips * config.scoring.flipMulBonus
  const totalCheckpoints = config.track.checkpoints.length
  const timerLow = timeRemaining < 5
  const cpDisplay = Math.min(checkpointIndex + 1, totalCheckpoints)
  const isFinalCp = cpDisplay === totalCheckpoints

  return (
    <div className={`hud ${losing ? 'hud-shake' : ''}`}>
      <div className="hud-stats">
        <div className="hud-stat-row">
          <span className="hud-num">{Math.floor(speed)}</span>
          <span className="hud-label">m/s</span>
          <span className="hud-stat-mul">×{speedMul}</span>
        </div>
        <div className="hud-stat-row">
          <span className="hud-num hud-num-sm">{flips}</span>
          <span className="hud-label">flips</span>
          <span className="hud-stat-mul">×{flipMul}</span>
        </div>
        {airborne && (
          <>
            <div className="hud-rot"><span className="hud-rot-key">P</span><span className="hud-rot-val">{sgn(pitchDeg)}°</span></div>
            <div className="hud-rot"><span className="hud-rot-key">R</span><span className="hud-rot-val">{sgn(rollDeg)}°</span></div>
          </>
        )}
      </div>

      <div className="hud-total-wrap">
        <div className={`hud-total ${landing ? 'hud-total-pump' : ''}`}>{fmt(score)}</div>
        <div className="hud-label">total</div>
      </div>

      <div className="hud-run-wrap">
        <div className={`hud-run ${losing ? 'hud-run-crash' : ''}`}>
          {showRun > 0 && (
            <span key={`run-${flipPulse}`} className={`hud-running ${flipping && !losing ? 'hud-running-pop' : ''}`}>
              +{fmt(showRun)}
            </span>
          )}
          {showMul > 0 && (
            <span key={`mul-${showMul}-${lossPulse}`} className={`hud-mul ${flipping && !losing ? 'hud-mul-pop' : ''}`}>
              <span className="hud-mul-x">×</span>
              <span className="hud-mul-num">{showMul}</span>
            </span>
          )}
        </div>
      </div>

      {landing && lastLand > 0 && (
        <>
          <div key={`bank-${landPulse}`} className="hud-bank">+{fmt(lastLand)}</div>
          <div key={`ring-${landPulse}`} className="hud-bank-ring" />
        </>
      )}

      <div className="hud-timer-wrap">
        <div className={`hud-timer ${timerLow ? 'hud-timer-low' : ''}`}>
          {timeRemaining.toFixed(1)}
        </div>
        <div className="hud-timer-label">
          {isFinalCp ? 'Finish' : `Checkpoint ${cpDisplay}/${totalCheckpoints}`}
        </div>
      </div>
    </div>
  )
}
