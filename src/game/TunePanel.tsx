import { useEffect, useRef, useState } from 'react'
import { config, type TruckTunable, type CameraTunable, type WorldTunable } from '../config'
import { resetTune, saveTune } from '../systems/tune-storage'
import { ProfileBar } from './ProfileBar'
import { useGame } from '../store'

type Field<K extends string> = { key: K; min: number; max: number; step: number; tip?: string }

const truckFields: Field<TruckTunable>[] = [
  { key: 'peakTorque',         min: 500,    max: 30000,   step: 50,
    tip: 'Engine torque at zero speed.\nUp = harder pull-away (and more wheelspin).\nTry 5000 arcade, 9000 explosive.' },
  { key: 'topSpeedTarget',     min: 5,      max: 60,      step: 0.5,
    tip: 'Speed (m/s) at which torque drops to zero. Hard cap on top speed.\n25 = quick arcade, 40 = highway.' },
  { key: 'frictionSlip',       min: 0.5,    max: 12,      step: 0.1,
    tip: 'Tire grip. Low + high torque = wheelspin on full throttle.\nTry 8 (slippy), 12 (sticky).' },
  { key: 'maxSteer',           min: 0.1,    max: 1.2,     step: 0.05,
    tip: 'Front wheel angle (rad) at low speed. Up = tighter U-turns.\nTry 0.7 for ~8m radius at 5m/s.' },
  { key: 'maxSteerHighSpeed',  min: 0.02,   max: 0.6,     step: 0.01,
    tip: 'Front wheel angle (rad) at high speed. Down = stable highway.\nTry 0.05 (~3°) so 25m/s feels calm.' },
  { key: 'steerSpeedRef',      min: 5,      max: 80,      step: 1,
    tip: 'Speed (m/s) where steering transitions low→high.\nLower = transition earlier. Try 12.' },
  { key: 'rearSteerPhase',     min: -1,     max: 1,       step: 0.05,
    tip: '4WS phase for rear wheels. -1 = opposite (tight turns), 0 = straight (RWD only), 1 = parallel (crab).\nTry -1 for tight monster truck, 0 to disable.' },
  { key: 'ebrakeForce',        min: 10,     max: 25000,   step: 50,
    tip: 'Brake force on rear wheels when E-brake is held. Up = full lock.\nTry 4000+ for true lockup.' },
  { key: 'ebrakeFrictionSlip', min: 0.1,    max: 5,       step: 0.05,
    tip: 'Rear grip while E-brake held. Low = slides freely.\nTry 0.4 for drift.' },
  { key: 'stiffness',          min: 5,      max: 400,     step: 1,
    tip: 'Spring stiffness. Up = rigid (less squat/bounce). Down = floaty.\nTry 14–20 for monster truck.' },
  { key: 'maxTravel',          min: 0.1,    max: 2.0,     step: 0.05,
    tip: 'Max suspension compression distance.\nUp = more bounce on landings. Try 1.5 for monster truck.' },
  { key: 'relaxation',         min: 0,      max: 10,      step: 0.1,
    tip: 'Rebound damping (settles bounces). 0 = oscillates forever.\nTry 3–5 to stop trampoline.' },
  { key: 'comY',               min: -1.5,   max: 1.5,     step: 0.05,
    tip: 'Center-of-mass Y. Up = top-heavy (rolls easily). Down = stable (low rider).\nTry -0.3 for stable monster truck.' },
  { key: 'inertiaPitch',       min: 50,     max: 40000,   step: 10,
    tip: 'Pitch resistance (nose dive/lift). Low = snappy front-lift. High = sluggish.\nTry 5000.' },
]

const truckPhysicsFields: Field<TruckTunable>[] = [
  { key: 'mass',               min: 50,     max: 10000,   step: 10,
    tip: 'Truck mass (kg). Affects acceleration and inertia simultaneously.\nTry 1000 monster truck.' },
  { key: 'comX',               min: -1.5,   max: 1.5,     step: 0.05,
    tip: 'Center-of-mass X (lateral). Non-zero biases handling left/right.\nUsually 0.' },
  { key: 'comZ',               min: -2,     max: 2,       step: 0.05,
    tip: 'Center-of-mass Z (front/rear). + = nose-heavy (understeer), − = tail-heavy (oversteer).' },
  { key: 'inertiaYaw',         min: 50,     max: 40000,   step: 10,
    tip: 'Yaw resistance. Low = snappy turn-in. High = stable, sluggish to rotate.' },
  { key: 'inertiaRoll',        min: 50,     max: 40000,   step: 10,
    tip: 'Roll resistance. Low = body rolls easily in turns. High = flat cornering.' },
  { key: 'reverseScale',       min: 0,      max: 1,       step: 0.05,
    tip: 'Reverse force as fraction of forward.\n0.5 = half-power reverse.' },
  { key: 'accelRate',          min: 0.5,    max: 20,      step: 0.1,
    tip: 'Throttle response damping rate. Up = snappier throttle, down = smoother.' },
  { key: 'steerRate',          min: 0.5,    max: 30,      step: 0.5,
    tip: 'Steering input damping rate. Up = quicker steer, down = filtered.' },
  { key: 'compression',        min: 0,      max: 10,      step: 0.1,
    tip: 'Suspension compression damping. Up = stiffer feel on impact, less travel used.' },
  { key: 'suspensionRest',     min: 0.3,    max: 2.5,     step: 0.05,
    tip: 'Resting suspension extension length. Higher = taller ride height.' },
  { key: 'maxSuspensionForce', min: 1000,   max: 1000000, step: 1000,
    tip: 'Max force a single suspension joint can apply. Cap to avoid jitter.' },
  { key: 'linearDamping',      min: 0,      max: 1,       step: 0.01,
    tip: 'Linear drag on chassis body. Higher = faster slowdown when coasting.' },
  { key: 'angularDamping',     min: 0,      max: 2,       step: 0.05,
    tip: 'Angular drag on chassis body. Higher = settles spin/roll faster.' },
  { key: 'chassisX',           min: 1.0,    max: 5.0,     step: 0.1,
    tip: 'Chassis width (m). Affects collider, body visual size, and wheel track.' },
  { key: 'chassisY',           min: 0.3,    max: 3.0,     step: 0.1,
    tip: 'Chassis height (m). Affects collider and body visual.' },
  { key: 'chassisZ',           min: 2.0,    max: 8.0,     step: 0.1,
    tip: 'Chassis length (m). Affects collider, body visual, and wheelbase.' },
  { key: 'wheelRadius',        min: 0.3,    max: 1.5,     step: 0.05,
    tip: 'Wheel radius (m). Affects ride height and rolling speed.' },
  { key: 'wheelWidth',         min: 0.2,    max: 1.5,     step: 0.05,
    tip: 'Wheel width (m). Affects collider thickness and visual.' },
  { key: 'wheelTrack',         min: 0.5,    max: 1.5,     step: 0.01,
    tip: 'Wheel lateral position as multiple of chassisX/2. >1 = wheels outside body.' },
  { key: 'wheelBase',          min: 0.3,    max: 1.0,     step: 0.01,
    tip: 'Wheel longitudinal position as fraction of chassisZ/2. 1 = at body ends.' },
  { key: 'wheelY',             min: -0.5,   max: 0.5,     step: 0.01,
    tip: 'Wheel hub Y (chassis-local). Lower = chassis sits higher above wheels.' },
  { key: 'spawnY',             min: 0.5,    max: 50,      step: 0.5,
    tip: 'Spawn height. Drop from this Y on respawn.' },
]

const truckCosmeticFields: Field<TruckTunable>[] = [
  { key: 'bodyY',              min: -1,     max: 1.5,     step: 0.05,
    tip: 'Body Y offset above chassis center. Higher = more ground clearance feel.' },
  { key: 'bodyXFrac',          min: 0.3,    max: 1.0,     step: 0.01,
    tip: 'Body width as fraction of chassisX. Should be < wheelTrack inner face.' },
  { key: 'bodyZFrac',          min: 0.5,    max: 1.5,     step: 0.01,
    tip: 'Body length as fraction of chassisZ.' },
  { key: 'cabXFrac',           min: 0.3,    max: 1.0,     step: 0.01,
    tip: 'Cab width as fraction of chassisX.' },
  { key: 'cabZFrac',           min: 0.2,    max: 0.8,     step: 0.01,
    tip: 'Cab depth as fraction of chassisZ.' },
  { key: 'cabZOffset',         min: -0.4,   max: 0.4,     step: 0.01,
    tip: 'Cab Z position as fraction of chassisZ. + = forward (Bigfoot pickup), − = rear.' },
  { key: 'bevelRadius',        min: 0.0,    max: 0.4,     step: 0.01,
    tip: 'RoundedBox bevel radius. Higher = more rounded body corners.' },
  { key: 'treadBlocks',        min: 4,      max: 32,      step: 1,
    tip: 'Number of tread blocks per row around the tire.' },
  { key: 'treadAxleOffsetFrac', min: 0.0,   max: 0.5,     step: 0.01,
    tip: 'Each tread row\'s axial offset as fraction of wheelWidth.' },
  { key: 'treadAxialFrac',     min: 0.1,    max: 1.0,     step: 0.01,
    tip: 'Tread block axial size as fraction of wheelWidth.' },
  { key: 'treadChevronAngle',  min: -1.5,   max: 1.5,     step: 0.05,
    tip: 'Chevron tilt angle (rad). Sign flips chevron direction.' },
  { key: 'spokes',             min: 0,      max: 12,      step: 1,
    tip: 'Number of rim spokes.' },
  { key: 'airSpinDamp',        min: 0.0,    max: 5.0,     step: 0.05,
    tip: 'How fast wheel spin decays when airborne. 0 = keep spinning, 1 = ~63% loss/sec.' },
]

const worldFields: Field<WorldTunable>[] = [
  { key: 'gravityY',         min: -80,    max: -1,    step: 0.5 },
]

const cameraFields: Field<CameraTunable>[] = [
  { key: 'fov',              min: 30,     max: 110,   step: 1 },
  { key: 'distance',         min: 4,      max: 30,    step: 0.5 },
  { key: 'height',           min: 1,      max: 15,    step: 0.25 },
  { key: 'lookHeight',       min: 0,      max: 5,     step: 0.1 },
  { key: 'sensitivity',      min: 0.0005, max: 0.01,  step: 0.0005 },
  { key: 'decay',            min: 0.7,    max: 0.99,  step: 0.005 },
  { key: 'lerp',             min: 0.02,   max: 0.5,   step: 0.01 },
  { key: 'orbitDistance',    min: 5,      max: 40,    step: 0.5 },
  { key: 'orbitHeight',      min: 1,      max: 20,    step: 0.25 },
  { key: 'orbitSpeed',       min: 0,      max: 2,     step: 0.05 },
  { key: 'orbitLookHeight',  min: 0,      max: 5,     step: 0.1 },
]

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v
}

function NumInput({ value, min, max, step, onCommit }: { value: number; min: number; max: number; step: number; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => { setDraft(String(value)) }, [value])
  return (
    <input
      type="number"
      className="num"
      min={min}
      max={max}
      step={step}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const n = parseFloat(draft)
        if (!Number.isFinite(n)) { setDraft(String(value)); return }
        const c = clamp(n, min, max)
        onCommit(c)
        setDraft(String(c))
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
      }}
    />
  )
}

function Section<K extends string>({
  title, obj, fields, bump, open,
}: {
  title: string
  obj: Record<K, number>
  fields: Field<K>[]
  bump: () => void
  open: boolean
}) {
  return (
    <details open={open}>
      <summary className="tune-title">{title}</summary>
      {fields.map((f) => (
        <label key={f.key}>
          <span {...(f.tip ? { 'data-tip': f.tip } : {})}>{f.key}</span>
          <input
            type="range"
            min={f.min}
            max={f.max}
            step={f.step}
            value={obj[f.key]}
            onChange={(e) => {
              obj[f.key] = parseFloat(e.target.value)
              bump()
            }}
          />
          <NumInput
            value={obj[f.key]}
            min={f.min}
            max={f.max}
            step={f.step}
            onCommit={(v) => { obj[f.key] = v; bump() }}
          />
        </label>
      ))}
    </details>
  )
}

export function TunePanel() {
  const [, setN] = useState(0)
  const saveTimer = useRef<number | null>(null)
  const bump = () => {
    setN((n) => n + 1)
    useGame.getState().bumpTune()
    if (saveTimer.current != null) clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null
      void saveTune()
    }, 300)
  }
  const onReset = () => {
    resetTune()
    bump()
  }
  return (
    <div className="tune">
      <ProfileBar onChange={bump} onReset={onReset} />
      <Section title="World" obj={config} fields={worldFields} bump={bump} open={false} />
      <Section title="Truck" obj={config.truck} fields={truckFields} bump={bump} open={true} />
      <Section title="Truck Physics" obj={config.truck} fields={truckPhysicsFields} bump={bump} open={false} />
      <Section title="Truck Cosmetic" obj={config.truck} fields={truckCosmeticFields} bump={bump} open={false} />
      <Section title="Camera" obj={config.camera} fields={cameraFields} bump={bump} open={false} />
    </div>
  )
}
