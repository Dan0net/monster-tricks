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
    initialCount: 18,
    generateAhead: 220,
    trimBehind: 80,
    startBuffer: 40,
    startEmptySegments: 2,
    checkpoints: [10, 20, 30] as number[],
    checkpointSecondsList: [30, 25, 20] as number[],
    postFinishSegments: 4,
    finishCheckerDark: '#0b0b14',
    finishCheckerLight: '#ffffff',
    finishCheckerSize: 2,
    finishLineDepth: 6,
    finishBannerHeight: 4,
    finishPostColor: '#2dd4ff',
    checkpointLineColor: '#ffffff',
    checkpointLineDepth: 2.5,
    checkpointLineHaloDepth: 7,
    checkpointLineHaloOpacity: 0.28,
    signWidth: 14,
    signHeight: 2.6,
    signTextColor: '#0b0b14',
    checkpointSignY: 9,
    finishSignY: 14,
    surfaceColor: '#000000',
    edgeColor: '#2dd4ff',
    edgeCoreColor: '#ffffff',
    edgeWidth: 10,
    edgeCoreFrac: 0.1,
    edgeBrightness: 1.0,
    obstacleEdgeWidth: 1.5,
    obstacleEdgeCoreFrac: 0.1,
    obstacleEdgeBrightness: 1.0,
    obstacleColor: '#ff2d6f',
    obstacleBgColor: '#000000',
    obstacleGridBrightness: 1.0,
    surfaceGridSize: 2,
    surfaceGridLineWidth: 1.0,
    surfaceGridColor: '#2dd4ff',
    surfaceGridBrightness: 0.5,
  },

  obstacles: {
    pairedProb: 0.5,
    quarterpipeProb: 0.5,
    tabletopProb: 0.5,
    widthFrac: 0.2,
    sideXFrac: 0.25,
    curveSegments: 5,
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
    mass: 1010,
    chassisX: 2.2,
    chassisY: 0.7,
    chassisZ: 4.0,
    cabY: 0.5,
    spawnX: 0,
    spawnY: 3,
    spawnZ: 0,
    bodyColor: '#c2185b',
    cabColor: '#9a1245',
    bevelRadius: 0.1,
    bodyXFrac: 0.72,
    bodyZFrac: 1.0,
    cabXFrac: 0.62,
    cabZFrac: 0.4,
    cabZOffset: 0.18,
    bodyY: 0.25,

    comX: 0,
    comY: -1.5,
    comZ: 0,
    inertiaPitch: 5160,
    inertiaYaw: 5480,
    inertiaRoll: 10920,

    wheelRadius: 0.9,
    wheelWidth: 0.8,
    wheelTrack: 1.13,
    wheelBase: 1.0,
    wheelY: 0.5,
    tireColor: '#0a0a18',
    rimColor: '#2dd4ff',
    rimGlow: '#2dd4ff',
    treadBlocks: 16,
    treadAxleOffsetFrac: 0.25,
    treadAxialFrac: 0.4,
    treadChevronAngle: 0.6,
    spokes: 5,
    airSpinDamp: 1.0,

    frame: {
      axleRadius: 0.12,
      armRadius: 0.08,
      xArmRadius: 0.05,
      blueColor: '#2dd4ff',
    },

    suspensionRest: 1.5,
    maxTravel: 1.1,
    stiffness: 21,
    compression: 5.2,
    relaxation: 0,
    maxSuspensionForce: 904000,
    frictionSlip: 12,

    engineForce: 2980,
    reverseScale: 0.5,
    accelRate: 20,
    ebrakeForce: 200,
    ebrakeFrictionSlip: 1.0,
    ebrakeWheels: [2, 3] as number[],
    maxSteer: 0.55,
    maxSteerHighSpeed: 0.12,
    steerSpeedRef: 25,
    steerRate: 30,

    linearDamping: 0.08,
    angularDamping: 0.6,

    steerWheels: [0, 1] as number[],
  },

  scoring: {
    flipThreshold: Math.PI,
    speedPerMul: 10,
    flipMulBonus: 10,
    airScoreRate: 1000,
    fallY: -10,
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
