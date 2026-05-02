import { useEffect } from 'react'
import { useGame } from './store'
import { Game } from './game/Game'
import { TunePanel } from './game/TunePanel'

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

  const onPlay = async () => {
    await document.body.requestPointerLock?.().catch(() => {})
    start()
  }

  return (
    <>
      <Game />
      <TunePanel />
      {phase === 'menu' && (
        <div className="menu">
          <div className="menu-inner">
            <p className="sub">Monster</p>
            <h1>Tricks</h1>
            <button className="play" onClick={onPlay}>Play</button>
          </div>
          <div className="hint">WASD / Arrows · Mouse to look · Esc to exit</div>
        </div>
      )}
    </>
  )
}
