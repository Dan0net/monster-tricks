import { useEffect } from 'react'
import { useGame } from './store'
import { Game } from './game/Game'
import { HUD } from './game/HUD'
import { DebugHUD } from './game/DebugHUD'
import { TunePanel } from './game/TunePanel'
import { HighScores } from './game/HighScores'
import { OutOfTime } from './game/OutOfTime'

export default function App() {
  const phase = useGame((s) => s.phase)
  const start = useGame((s) => s.start)
  const end = useGame((s) => s.end)

  useEffect(() => {
    const onLockChange = () => {
      if (!document.pointerLockElement && useGame.getState().phase === 'playing') end()
    }
    document.addEventListener('pointerlockchange', onLockChange)
    return () => document.removeEventListener('pointerlockchange', onLockChange)
  }, [end])

  useEffect(() => {
    if (phase !== 'playing') document.exitPointerLock?.()
  }, [phase])

  const onPlay = async () => {
    await document.body.requestPointerLock?.().catch(() => {})
    start()
  }

  return (
    <>
      <Game />
      <HUD />
      <DebugHUD />
      <TunePanel />
      {phase === 'menu' && (
        <div className="menu" onClick={onPlay}>
          <div className="menu-inner">
            <p className="sub">Monster</p>
            <h1>Tricks</h1>
            <button className="play">Play</button>
          </div>
          <div className="hint">WASD / Arrows · Mouse to look · R to reset · Esc to exit</div>
        </div>
      )}
      {phase === 'finished' && <HighScores onPlayAgain={onPlay} />}
      {phase === 'expired' && <OutOfTime onPlayAgain={onPlay} />}
    </>
  )
}
