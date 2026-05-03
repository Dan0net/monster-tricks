import { create } from 'zustand'

export type Phase = 'menu' | 'playing'

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
}

type State = Live & {
  phase: Phase
  hasPlayed: boolean
  tuneRev: number
  flipPulse: number
  landPulse: number
  lossPulse: number
  lastLand: number
  lastLoss: number
  lastLossMul: number
  start: () => void
  end: () => void
  setLive: (data: Live) => void
  bumpTune: () => void
  pulseFlip: () => void
  pulseLand: (amount: number) => void
  pulseLoss: (amount: number, mul: number) => void
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
}

export const useGame = create<State>((set) => ({
  phase: 'menu',
  hasPlayed: false,
  tuneRev: 0,
  ...liveZero,
  flipPulse: 0,
  landPulse: 0,
  lossPulse: 0,
  lastLand: 0,
  lastLoss: 0,
  lastLossMul: 0,
  start: () => set({
    phase: 'playing',
    hasPlayed: true,
    ...liveZero,
    flipPulse: 0,
    landPulse: 0,
    lossPulse: 0,
    lastLand: 0,
    lastLoss: 0,
    lastLossMul: 0,
  }),
  end: () => set({ phase: 'menu' }),
  setLive: (data) => set(data),
  bumpTune: () => set((s) => ({ tuneRev: s.tuneRev + 1 })),
  pulseFlip: () => set((s) => ({ flipPulse: s.flipPulse + 1 })),
  pulseLand: (amount) => set((s) => ({ landPulse: s.landPulse + 1, lastLand: amount })),
  pulseLoss: (amount, mul) => set((s) => ({ lossPulse: s.lossPulse + 1, lastLoss: amount, lastLossMul: mul })),
}))
