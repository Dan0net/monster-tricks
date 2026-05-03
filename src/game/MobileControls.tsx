import { useEffect, useRef } from 'react'
import { config } from '../config'
import { input } from '../systems/input'
import { useGame } from '../store'

const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export function MobileControls() {
  const phase = useGame((s) => s.phase)
  const joyRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const joyPointer = useRef<number | null>(null)
  const joyCenter = useRef({ x: 0, y: 0 })
  const gasDown = useRef(false)
  const revDown = useRef(false)

  useEffect(() => {
    if (phase !== 'playing') {
      input.steer = 0
      input.throttle = 0
      input.ebrake = 0
      gasDown.current = false
      revDown.current = false
      joyPointer.current = null
    }
  }, [phase])

  if (!isTouch || phase !== 'playing') return null

  const m = config.mobile
  const radius = m.joySize / 2

  const setKnob = (dx: number, dy: number) => {
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`
  }

  const writeSteer = (nx: number) => {
    const a = Math.abs(nx)
    if (a < m.joyDeadzone) { input.steer = 0; return }
    const sign = nx < 0 ? -1 : 1
    const mag = (a - m.joyDeadzone) / (1 - m.joyDeadzone)
    input.steer = -sign * mag
  }

  const onJoyDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joyPointer.current !== null) return
    const el = joyRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    joyCenter.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    joyPointer.current = e.pointerId
    el.setPointerCapture(e.pointerId)
    onJoyMove(e)
  }

  const onJoyMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== joyPointer.current) return
    const dx = e.clientX - joyCenter.current.x
    const dy = e.clientY - joyCenter.current.y
    const len = Math.hypot(dx, dy)
    const cap = len > 0 ? Math.min(1, len / radius) : 0
    const ux = len > 0 ? dx / len : 0
    const uy = len > 0 ? dy / len : 0
    setKnob(ux * cap * radius, uy * cap * radius)
    writeSteer(ux * cap)
  }

  const onJoyUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== joyPointer.current) return
    joyPointer.current = null
    setKnob(0, 0)
    input.steer = 0
  }

  const updateThrottle = () => {
    input.throttle = (gasDown.current ? 1 : 0) - (revDown.current ? 1 : 0)
  }

  const press = (set: () => void) => (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    set()
  }
  const release = (clear: () => void) => (e: React.PointerEvent<HTMLButtonElement>) => {
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* */ }
    clear()
  }

  return (
    <div className="mobile-controls">
      <div
        ref={joyRef}
        className="mobile-joy"
        style={{ width: m.joySize, height: m.joySize, left: m.edgePad, bottom: m.bottomPad }}
        onPointerDown={onJoyDown}
        onPointerMove={onJoyMove}
        onPointerUp={onJoyUp}
        onPointerCancel={onJoyUp}
      >
        <div ref={knobRef} className="mobile-joy-knob" style={{ width: m.joyKnobSize, height: m.joyKnobSize }} />
      </div>

      <div
        className="mobile-btns"
        style={{
          right: m.edgePad,
          bottom: m.bottomPad,
          width: m.buttonSize * 2 + m.buttonGap,
          height: m.buttonSize * 2 + m.buttonGap,
        }}
      >
        <button
          className="mobile-btn mobile-btn-rev"
          style={{ width: m.buttonSize, height: m.buttonSize, left: 0, bottom: 0 }}
          onPointerDown={press(() => { revDown.current = true; updateThrottle() })}
          onPointerUp={release(() => { revDown.current = false; updateThrottle() })}
          onPointerCancel={release(() => { revDown.current = false; updateThrottle() })}
        >REV</button>
        <button
          className="mobile-btn mobile-btn-brake"
          style={{ width: m.buttonSize, height: m.buttonSize, right: 0, top: 0 }}
          onPointerDown={press(() => { input.ebrake = 1 })}
          onPointerUp={release(() => { input.ebrake = 0 })}
          onPointerCancel={release(() => { input.ebrake = 0 })}
        >BRAKE</button>
        <button
          className="mobile-btn mobile-btn-gas"
          style={{ width: m.buttonSize, height: m.buttonSize, right: 0, bottom: 0 }}
          onPointerDown={press(() => { gasDown.current = true; updateThrottle() })}
          onPointerUp={release(() => { gasDown.current = false; updateThrottle() })}
          onPointerCancel={release(() => { gasDown.current = false; updateThrottle() })}
        >GAS</button>
      </div>
    </div>
  )
}
