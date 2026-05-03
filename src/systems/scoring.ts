import { config } from '../config'

export type ScoringState = {
  airborne: boolean
  airTimeMs: number
  pitchAccum: number
  rollAccum: number
  pitchFlipsCounted: number
  rollFlipsCounted: number
  flipsThisRun: number
  maxSpeed: number
  pendingAirScore: number
  score: number
  multiplier: number
  speed: number
}

export type ScoringInput = {
  dt: number
  speed: number
  fullyAirborne: boolean
  fullyGrounded: boolean
  topContact: boolean
  yPos: number
  angvelLocalX: number
  angvelLocalZ: number
  playing: boolean
}

export type ScoringEvents = {
  flips: number
  landed: boolean
  landAmount: number
  crashed: boolean
  lossAmount: number
  lossMul: number
}

const TWO_PI = Math.PI * 2

const noEvents = (): ScoringEvents => ({
  flips: 0, landed: false, landAmount: 0, crashed: false, lossAmount: 0, lossMul: 0,
})

export function initScoring(): ScoringState {
  return {
    airborne: false,
    airTimeMs: 0,
    pitchAccum: 0,
    rollAccum: 0,
    pitchFlipsCounted: 0,
    rollFlipsCounted: 0,
    flipsThisRun: 0,
    maxSpeed: 0,
    pendingAirScore: 0,
    score: 0,
    multiplier: 0,
    speed: 0,
  }
}

function clearRunMods(s: ScoringState) {
  s.airborne = false
  s.airTimeMs = 0
  s.pitchAccum = 0
  s.rollAccum = 0
  s.pitchFlipsCounted = 0
  s.rollFlipsCounted = 0
  s.flipsThisRun = 0
  s.maxSpeed = 0
  s.pendingAirScore = 0
  s.multiplier = 0
}

function crash(s: ScoringState): ScoringEvents {
  if (s.multiplier <= 0 && s.pendingAirScore <= 0) return noEvents()
  const lossAmount = s.pendingAirScore
  const lossMul = s.multiplier
  clearRunMods(s)
  return { flips: 0, landed: false, landAmount: 0, crashed: true, lossAmount, lossMul }
}

export function manualReset(s: ScoringState): ScoringEvents {
  const ev = crash(s)
  clearRunMods(s)
  return ev
}

function countFlipDelta(accum: number, counted: number, threshold: number): number {
  let n = counted
  while (Math.abs(accum) >= threshold + n * TWO_PI) n++
  return n - counted
}

export function updateScoring(s: ScoringState, i: ScoringInput): ScoringEvents {
  const c = config.scoring
  s.speed = i.speed
  if (!i.playing) return noEvents()

  if (i.yPos < c.fallY) return crash(s)
  if (i.topContact) return crash(s)

  if (i.speed > s.maxSpeed) s.maxSpeed = i.speed

  if (!s.airborne && i.fullyAirborne) {
    s.airborne = true
    s.airTimeMs = 0
    s.pitchAccum = 0
    s.rollAccum = 0
    s.pitchFlipsCounted = 0
    s.rollFlipsCounted = 0
    s.pendingAirScore = 0
  }

  let flipsThisTick = 0
  if (s.airborne) {
    s.airTimeMs += i.dt * 1000
    s.pitchAccum += i.angvelLocalX * i.dt
    s.rollAccum += i.angvelLocalZ * i.dt
    const dPitch = countFlipDelta(s.pitchAccum, s.pitchFlipsCounted, c.flipThreshold)
    const dRoll = countFlipDelta(s.rollAccum, s.rollFlipsCounted, c.flipThreshold)
    s.pitchFlipsCounted += dPitch
    s.rollFlipsCounted += dRoll
    flipsThisTick = dPitch + dRoll
    s.flipsThisRun += flipsThisTick
  }

  s.multiplier = Math.floor(s.maxSpeed / c.speedPerMul) + s.flipsThisRun * c.flipMulBonus

  if (s.airborne && !i.fullyGrounded) {
    s.pendingAirScore += c.airScoreRate * i.dt * s.multiplier
  }

  if (s.airborne && i.fullyGrounded) {
    const banked = s.pendingAirScore
    s.score += banked
    s.pendingAirScore = 0
    s.airborne = false
    return { flips: flipsThisTick, landed: true, landAmount: banked, crashed: false, lossAmount: 0, lossMul: 0 }
  }

  return { flips: flipsThisTick, landed: false, landAmount: 0, crashed: false, lossAmount: 0, lossMul: 0 }
}
