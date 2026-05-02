import { useState } from 'react'
import { config, type TruckTunable, type CameraTunable, type WorldTunable } from '../config'

type Field<K extends string> = { key: K; min: number; max: number; step: number }

const truckFields: Field<TruckTunable>[] = [
  { key: 'mass',               min: 50,     max: 10000,   step: 10 },
  { key: 'chassisX',           min: 1.0,    max: 5.0,     step: 0.1 },
  { key: 'chassisY',           min: 0.3,    max: 3.0,     step: 0.1 },
  { key: 'chassisZ',           min: 2.0,    max: 8.0,     step: 0.1 },
  { key: 'spawnY',             min: 0.5,    max: 50,      step: 0.5 },
  { key: 'comX',               min: -1.5,   max: 1.5,     step: 0.05 },
  { key: 'comY',               min: -1.5,   max: 1.5,     step: 0.05 },
  { key: 'comZ',               min: -2,     max: 2,       step: 0.05 },
  { key: 'inertiaPitch',       min: 50,     max: 40000,   step: 10 },
  { key: 'inertiaYaw',         min: 50,     max: 40000,   step: 10 },
  { key: 'inertiaRoll',        min: 50,     max: 40000,   step: 10 },
  { key: 'wheelRadius',        min: 0.3,    max: 1.5,     step: 0.05 },
  { key: 'wheelWidth',         min: 0.2,    max: 1.5,     step: 0.05 },
  { key: 'wheelTrack',         min: 0.5,    max: 1.5,     step: 0.01 },
  { key: 'wheelBase',          min: 0.3,    max: 1.0,     step: 0.01 },
  { key: 'wheelY',             min: -0.5,   max: 0.5,     step: 0.01 },
  { key: 'engineForce',        min: 100,    max: 60000,   step: 10 },
  { key: 'accelRate',          min: 0.5,    max: 20,      step: 0.1 },
  { key: 'reverseScale',       min: 0,      max: 1,       step: 0.05 },
  { key: 'brakeForce',         min: 10,     max: 25000,   step: 10 },
  { key: 'maxSteer',           min: 0.1,    max: 1.2,     step: 0.05 },
  { key: 'stiffness',          min: 5,      max: 400,     step: 1 },
  { key: 'compression',        min: 0,      max: 10,      step: 0.1 },
  { key: 'relaxation',         min: 0,      max: 10,      step: 0.1 },
  { key: 'maxTravel',          min: 0.1,    max: 2.0,     step: 0.05 },
  { key: 'suspensionRest',     min: 0.3,    max: 2.5,     step: 0.05 },
  { key: 'maxSuspensionForce', min: 1000,   max: 1000000, step: 1000 },
  { key: 'frictionSlip',       min: 0.5,    max: 12,      step: 0.1 },
  { key: 'linearDamping',      min: 0,      max: 1,       step: 0.01 },
  { key: 'angularDamping',     min: 0,      max: 2,       step: 0.05 },
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

function Section<K extends string>({
  title, obj, fields, bump,
}: { title: string; obj: Record<K, number>; fields: Field<K>[]; bump: () => void }) {
  return (
    <>
      <div className="tune-title">{title}</div>
      {fields.map((f) => (
        <label key={f.key}>
          <span>{f.key}</span>
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
          <span className="val">{obj[f.key].toFixed(f.step < 0.01 ? 4 : 2)}</span>
        </label>
      ))}
    </>
  )
}

export function TunePanel() {
  const [, setN] = useState(0)
  const bump = () => setN((n) => n + 1)
  return (
    <div className="tune">
      <Section title="World" obj={config} fields={worldFields} bump={bump} />
      <Section title="Truck" obj={config.truck} fields={truckFields} bump={bump} />
      <Section title="Camera" obj={config.camera} fields={cameraFields} bump={bump} />
    </div>
  )
}
