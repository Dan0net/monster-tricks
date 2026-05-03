const KEY = 'monster-tricks:highscores'
const MAX = 10

export type HighScore = { score: number; date: number }

export function loadHighScores(): HighScore[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((x) => x && typeof x.score === 'number' && typeof x.date === 'number')
      .slice(0, MAX)
  } catch {
    return []
  }
}

export function saveHighScores(list: HighScore[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    return
  }
}

export function addHighScore(list: HighScore[], score: number): { list: HighScore[]; rank: number } {
  const entry: HighScore = { score, date: Date.now() }
  const next = [...list, entry].sort((a, b) => b.score - a.score).slice(0, MAX)
  const rank = next.indexOf(entry)
  return { list: next, rank }
}
