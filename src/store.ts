import { create } from 'zustand'

export type Phase = 'menu' | 'playing'

type State = {
  phase: Phase
  hasPlayed: boolean
  score: number
  multiplier: number
  start: () => void
  end: () => void
}

export const useGame = create<State>((set) => ({
  phase: 'menu',
  hasPlayed: false,
  score: 0,
  multiplier: 1,
  start: () => set({ phase: 'playing', hasPlayed: true }),
  end: () => set({ phase: 'menu' }),
}))
