import { useState } from 'react'
import { config, type TruckTunable } from '../config'

const fields: { key: TruckTunable; min: number; max: number; step: number }[] = [
  { key: 'wheelRadius',    min: 0.2, max: 1.5,  step: 0.05 },
  { key: 'wheelWidth',     min: 0.1, max: 1.2,  step: 0.05 },
  { key: 'engineForce',    min: 100, max: 2500, step: 10 },
  { key: 'accelRate',      min: 0.5, max: 20,   step: 0.1 },
  { key: 'reverseScale',   min: 0,   max: 1,    step: 0.05 },
  { key: 'brakeForce',     min: 10,  max: 300,  step: 5 },
  { key: 'maxSteer',       min: 0.1, max: 1.2,  step: 0.05 },
  { key: 'stiffness',      min: 5,   max: 200,  step: 1 },
  { key: 'compression',    min: 0,   max: 5,    step: 0.05 },
  { key: 'relaxation',     min: 0,   max: 5,    step: 0.05 },
  { key: 'maxTravel',      min: 0.1, max: 1.5,  step: 0.05 },
  { key: 'suspensionRest', min: 0.2, max: 1.5,  step: 0.05 },
  { key: 'frictionSlip',   min: 0.5, max: 8,    step: 0.1 },
  { key: 'linearDamping',  min: 0,   max: 1,    step: 0.01 },
  { key: 'angularDamping', min: 0,   max: 2,    step: 0.05 },
]

export function TunePanel() {
  const [, bump] = useState(0)
  return (
    <div className="tune">
      <div className="tune-title">Truck</div>
      {fields.map((f) => (
        <label key={f.key}>
          <span>{f.key}</span>
          <input
            type="range"
            min={f.min}
            max={f.max}
            step={f.step}
            value={config.truck[f.key]}
            onChange={(e) => {
              config.truck[f.key] = parseFloat(e.target.value)
              bump((n) => n + 1)
            }}
          />
          <span className="val">{config.truck[f.key].toFixed(2)}</span>
        </label>
      ))}
    </div>
  )
}
