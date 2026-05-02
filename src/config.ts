export type Vec3 = [number, number, number]

export const config = {
  gravityY: -30,
  ground: { size: 400, color: '#0b0b14' },
  fog: { color: '#06060c', near: 30, far: 220 },

  track: {
    seed: 1,
    width: 52,
    segmentLength: 40,
    thickness: 0.6,
    wallHeight: 10,
    wallThickness: 1,
    initialCount: 18,
    batchCount: 8,
    generateAhead: 220,
    startBuffer: 40,
    surfaceColor: '#15152b',
    edgeColor: '#2dd4ff',
    wallColor: '#1a1a2e',
    wallGlow: '#2dd4ff',
    obstacleColor: '#ff2d6f',
  },

  obstacles: {
    pairedProb: 0.5,
    quarterpipeProb: 0.5,
    tabletopProb: 0.5,
    widthFrac: 0.2,
    sideXFrac: 0.25,
    thickness: 0.4,
    curveSegments: 10,
    quarterpipe: {
      heightMin: 4.0,
      heightMax: 7.0,
      rampLengthMin: 6,
      rampLengthMax: 10,
      topLengthMin: 8,
      topLengthMax: 16,
    },
    tabletop: {
      heightMin: 1.0,
      heightMax: 3.5,
      rampLengthMin: 3,
      rampLengthMax: 4.5,
      topLengthMin: 8,
      topLengthMax: 14,
    },
  },

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
    yawHoldThreshold: 0.1,
    yawDampSpeed: 8,
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
    cabY: 0.5,
    spawnX: 0,
    spawnY: 3,
    spawnZ: 0,
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
    ebrakeForce: 200,
    ebrakeFrictionSlip: 1.0,
    ebrakeWheels: [2, 3] as number[],
    maxSteer: 0.55,
    maxSteerHighSpeed: 0.12,
    steerSpeedRef: 25,
    steerRate: 6,

    linearDamping: 0.08,
    angularDamping: 0.6,

    steerWheels: [0, 1] as number[],
  },
}

export type WorldTunable = 'gravityY'

export type TruckTunable =
  | 'mass' | 'chassisX' | 'chassisY' | 'chassisZ'
  | 'spawnY'
  | 'comX' | 'comY' | 'comZ'
  | 'inertiaPitch' | 'inertiaYaw' | 'inertiaRoll'
  | 'wheelRadius' | 'wheelWidth' | 'wheelTrack' | 'wheelBase' | 'wheelY'
  | 'engineForce' | 'accelRate' | 'reverseScale' | 'ebrakeForce' | 'ebrakeFrictionSlip' | 'maxSteer' | 'maxSteerHighSpeed' | 'steerSpeedRef' | 'steerRate'
  | 'stiffness' | 'compression' | 'relaxation' | 'maxTravel' | 'suspensionRest'
  | 'maxSuspensionForce' | 'frictionSlip'
  | 'linearDamping' | 'angularDamping'

export type CameraTunable =
  | 'fov'
  | 'distance' | 'height' | 'lookHeight'
  | 'sensitivity' | 'decay' | 'lerp'
  | 'orbitDistance' | 'orbitHeight' | 'orbitSpeed' | 'orbitLookHeight'
