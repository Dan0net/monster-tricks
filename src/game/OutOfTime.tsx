import { useGame } from '../store'

const fmt = (n: number) => Math.floor(n).toLocaleString()

export function OutOfTime({ onPlayAgain }: { onPlayAgain: () => void }) {
  const finalScore = useGame((s) => s.finalScore)
  const end = useGame((s) => s.end)

  return (
    <div className="gameover">
      <div className="gameover-inner gameover-inner-warn">
        <p className="sub">Time</p>
        <h1 className="oot-title">Too slow!</h1>
        <div className="gameover-final">
          <span className="gameover-final-label">Score</span>
          <span className="gameover-final-num gameover-final-warn">{fmt(finalScore)}</span>
        </div>
        <div className="gameover-actions">
          <button className="play" onClick={onPlayAgain}>Play Again</button>
          <button className="menu-btn" onClick={() => end()}>Menu</button>
        </div>
      </div>
    </div>
  )
}
