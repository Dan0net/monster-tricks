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
  },

  truck: {
    mass: 160,
    chassis: [2.2, 0.7, 4.0] as Vec3,
    spawn: [0, 3, 0] as Vec3,
    color: '#ff2d6f',
    centerOfMass: { x: 0, y: -0.35, z: 0 },
    principalAngularInertia: { x: 380, y: 280, z: 80 },
    wheelRadius: 0.65,
    wheelWidth: 0.55,
    wheelColor: '#0a0a18',
    wheelGlow: '#2dd4ff',
    suspensionRest: 0.65,
    maxTravel: 0.5,
    stiffness: 30,
    compression: 1.2,
    relaxation: 2.0,
    frictionSlip: 2.8,
    engineForce: 550,
    reverseScale: 0.5,
    accelRate: 4,
    brakeForce: 80,
    maxSteer: 0.55,
    angularDamping: 0.6,
    linearDamping: 0.08,
    wheels: [
      { x:  1.2, y: -0.05, z:  1.55 },
      { x: -1.2, y: -0.05, z:  1.55 },
      { x:  1.2, y: -0.05, z: -1.55 },
      { x: -1.2, y: -0.05, z: -1.55 },
    ],
    steerWheels: [0, 1] as number[],
  },
}

export type TruckTunable =
  | 'engineForce' | 'accelRate' | 'reverseScale' | 'brakeForce' | 'maxSteer'
  | 'stiffness' | 'compression' | 'relaxation' | 'maxTravel' | 'suspensionRest'
  | 'frictionSlip' | 'linearDamping' | 'angularDamping'
  | 'wheelRadius' | 'wheelWidth'
