import { create } from 'zustand'

export type Phase = 'menu' | 'playing'

type State = {
  phase: Phase
  score: number
  multiplier: number
  start: () => void
  end: () => void
}

export const useGame = create<State>((set) => ({
  phase: 'menu',
  score: 0,
  multiplier: 1,
  start: () => set({ phase: 'playing' }),
  end: () => set({ phase: 'menu' }),
}))
