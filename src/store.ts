import { create } from 'zustand'
import { addHighScore, loadHighScores, saveHighScores, type HighScore } from './systems/highscores'
import { config } from './config'

export type Phase = 'menu' | 'playing' | 'finished' | 'expired'

type Live = {
  score: number
  multiplier: number
  pendingAirScore: number
  speed: number
  maxSpeed: number
  flips: number
  airborne: boolean
  pitchDeg: number
  rollDeg: number
  timeRemaining: number
  checkpointIndex: number
  slip0: number
  slip1: number
  slip2: number
  slip3: number
  yawRate: number
  pitchRate: number
  rollRate: number
  lateralG: number
  groundedCount: number
}

type State = Live & {
  phase: Phase
  hasPlayed: boolean
  tuneRev: number
  flipPulse: number
  landPulse: number
  lossPulse: number
  cpHitPulse: number
  lastLand: number
  lastLoss: number
  lastLossMul: number
  highScores: HighScore[]
  finalScore: number
  finalRank: number
  start: () => void
  end: () => void
  finish: (finalScore: number) => void
  timeOut: (finalScore: number) => void
  setLive: (data: Live) => void
  bumpTune: () => void
  pulseFlip: () => void
  pulseLand: (amount: number) => void
  pulseLoss: (amount: number, mul: number) => void
  pulseCpHit: () => void
}

const liveZero: Live = {
  score: 0,
  multiplier: 0,
  pendingAirScore: 0,
  speed: 0,
  maxSpeed: 0,
  flips: 0,
  airborne: false,
  pitchDeg: 0,
  rollDeg: 0,
  timeRemaining: config.track.checkpointSecondsList[0] ?? 0,
  checkpointIndex: 0,
  slip0: 0,
  slip1: 0,
  slip2: 0,
  slip3: 0,
  yawRate: 0,
  pitchRate: 0,
  rollRate: 0,
  lateralG: 0,
  groundedCount: 0,
}

export const useGame = create<State>((set) => ({
  phase: 'menu',
  hasPlayed: false,
  tuneRev: 0,
  ...liveZero,
  flipPulse: 0,
  landPulse: 0,
  lossPulse: 0,
  cpHitPulse: 0,
  lastLand: 0,
  lastLoss: 0,
  lastLossMul: 0,
  highScores: loadHighScores(),
  finalScore: 0,
  finalRank: -1,
  start: () => set({
    phase: 'playing',
    hasPlayed: true,
    ...liveZero,
    flipPulse: 0,
    landPulse: 0,
    lossPulse: 0,
    cpHitPulse: 0,
    lastLand: 0,
    lastLoss: 0,
    lastLossMul: 0,
    finalScore: 0,
    finalRank: -1,
  }),
  end: () => set({ phase: 'menu' }),
  finish: (finalScore) => set((s) => {
    const { list, rank } = addHighScore(s.highScores, finalScore)
    saveHighScores(list)
    return { phase: 'finished', highScores: list, finalScore, finalRank: rank }
  }),
  timeOut: (finalScore) => set({ phase: 'expired', finalScore, finalRank: -1 }),
  setLive: (data) => set(data),
  bumpTune: () => set((s) => ({ tuneRev: s.tuneRev + 1 })),
  pulseFlip: () => set((s) => ({ flipPulse: s.flipPulse + 1 })),
  pulseLand: (amount) => set((s) => ({ landPulse: s.landPulse + 1, lastLand: amount })),
  pulseLoss: (amount, mul) => set((s) => ({ lossPulse: s.lossPulse + 1, lastLoss: amount, lastLossMul: mul })),
  pulseCpHit: () => set((s) => ({ cpHitPulse: s.cpHitPulse + 1 })),
}))
