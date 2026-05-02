export type Vec3 = [number, number, number]

export const config = {
  gravity: [0, -30, 0] as Vec3,
  ground: { size: 400, color: '#0b0b14' },
  fog: { color: '#06060c', near: 30, far: 220 },

  camera: {
    fov: 60,
    distance: 11,
    height: 4.5,
    lookHeight: 1.2,
    sensitivity: 0.0025,
    pitchMin: -0.5,
    pitchMax: 0.7,
    decay: 0.88,
    lerp: 0.12,
    orbitDistance: 14,
    orbitHeight: 6,
    orbitSpeed: 0.25,
    orbitLookHeight: 1.0,
  },

  truck: {
    mass: 160,
    chassisX: 2.2,
    chassisY: 0.7,
    chassisZ: 4.0,
    spawn: [0, 3, 0] as Vec3,
    color: '#ff2d6f',

    comX: 0,
    comY: -0.35,
    comZ: 0,
    inertiaPitch: 380,
    inertiaYaw: 280,
    inertiaRoll: 80,

    wheelRadius: 0.65,
    wheelWidth: 0.55,
    wheelTrack: 1.09,
    wheelBase: 0.775,
    wheelY: -0.05,
    wheelColor: '#0a0a18',
    wheelGlow: '#2dd4ff',

    suspensionRest: 1.5,
    maxTravel: 0.5,
    stiffness: 30,
    compression: 2.5,
    relaxation: 4.0,
    maxSuspensionForce: 50000,
    frictionSlip: 2.8,

    engineForce: 1100,
    reverseScale: 0.5,
    accelRate: 4,
    brakeForce: 80,
    maxSteer: 0.55,

    linearDamping: 0.08,
    angularDamping: 0.6,

    steerWheels: [0, 1] as number[],
  },
}

export type TruckTunable =
  | 'mass' | 'chassisX' | 'chassisY' | 'chassisZ'
  | 'comX' | 'comY' | 'comZ'
  | 'inertiaPitch' | 'inertiaYaw' | 'inertiaRoll'
  | 'wheelRadius' | 'wheelWidth' | 'wheelTrack' | 'wheelBase' | 'wheelY'
  | 'engineForce' | 'accelRate' | 'reverseScale' | 'brakeForce' | 'maxSteer'
  | 'stiffness' | 'compression' | 'relaxation' | 'maxTravel' | 'suspensionRest'
  | 'maxSuspensionForce' | 'frictionSlip'
  | 'linearDamping' | 'angularDamping'

export type CameraTunable =
  | 'distance' | 'height' | 'lookHeight'
  | 'sensitivity' | 'decay' | 'lerp'
  | 'orbitDistance' | 'orbitHeight' | 'orbitSpeed' | 'orbitLookHeight'
