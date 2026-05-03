import { config } from '../config'

export type CheckpointState = {
  timeRemaining: number
  nextIndex: number
  finished: boolean
  expired: boolean
}

export type CheckpointTick = {
  hit: boolean
  finished: boolean
  expired: boolean
}

const noTick: CheckpointTick = { hit: false, finished: false, expired: false }

export function checkpointZ(index: number): number {
  return config.track.checkpoints[index] * config.track.segmentLength - config.track.startBuffer
}

export function finishZ(): number {
  const list = config.track.checkpoints
  return checkpointZ(list.length - 1)
}

function legSeconds(legIndex: number): number {
  const list = config.track.checkpointSecondsList
  return list[legIndex] ?? list[list.length - 1] ?? 0
}

export function initCheckpoints(): CheckpointState {
  return {
    timeRemaining: legSeconds(0),
    nextIndex: 0,
    finished: false,
    expired: false,
  }
}

export function updateCheckpoints(s: CheckpointState, z: number, dt: number): CheckpointTick {
  if (s.finished || s.expired) return noTick
  const list = config.track.checkpoints
  if (list.length === 0) return noTick
  s.timeRemaining = Math.max(0, s.timeRemaining - dt)
  if (s.timeRemaining <= 0) {
    s.expired = true
    return { hit: false, finished: false, expired: true }
  }
  const cpZ = checkpointZ(s.nextIndex)
  if (z >= cpZ) {
    s.nextIndex++
    if (s.nextIndex >= list.length) {
      s.finished = true
      return { hit: true, finished: true, expired: false }
    }
    s.timeRemaining = legSeconds(s.nextIndex)
    return { hit: true, finished: false, expired: false }
  }
  return noTick
}
