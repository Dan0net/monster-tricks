import { useGame } from '../store'

const fmt = (n: number) => Math.floor(n).toLocaleString()

export function HighScores({ onPlayAgain }: { onPlayAgain: () => void }) {
  const highScores = useGame((s) => s.highScores)
  const finalScore = useGame((s) => s.finalScore)
  const finalRank = useGame((s) => s.finalRank)
  const end = useGame((s) => s.end)

  const isNew = finalRank >= 0
  const onMenu = () => end()

  return (
    <div className="gameover">
      <div className="gameover-inner">
        <p className="sub">Finish</p>
        <h1>{isNew ? 'New Score!' : 'Run Complete'}</h1>
        <div className="gameover-final">
          <span className="gameover-final-label">Score</span>
          <span className="gameover-final-num">{fmt(finalScore)}</span>
        </div>
        <ol className="hs-list">
          {highScores.length === 0 && (
            <li className="hs-empty">No scores yet</li>
          )}
          {highScores.map((s, i) => (
            <li key={`${s.date}-${i}`} className={`hs-row ${i === finalRank ? 'hs-row-new' : ''}`}>
              <span className="hs-rank">{i + 1}</span>
              <span className="hs-score">{fmt(s.score)}</span>
              <span className="hs-date">{new Date(s.date).toLocaleDateString()}</span>
            </li>
          ))}
        </ol>
        <div className="gameover-actions">
          <button className="play" onClick={onPlayAgain}>Play Again</button>
          <button className="menu-btn" onClick={onMenu}>Menu</button>
        </div>
      </div>
    </div>
  )
}
