import * as THREE from 'three'
import { config } from '../config'

const vertexShader = /* glsl */ `
#include <fog_pars_vertex>
varying vec3 vWorld;
varying vec3 vNormal;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

const fragmentShader = /* glsl */ `
#include <fog_pars_fragment>
varying vec3 vWorld;
varying vec3 vNormal;
uniform float cellSize;
uniform float lineWidth;
uniform vec3 lineColor;
uniform vec3 bgColor;
uniform float brightness;
uniform float solid;
void main() {
  vec2 c = vWorld.xz / cellSize;
  vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
  float d = min(g.x, g.y);
  float line = (1.0 - clamp(d / lineWidth, 0.0, 1.0)) * (1.0 - step(0.7, abs(vNormal.x)));
  float a = max(line, solid);
  if (a < 0.01) discard;
  gl_FragColor = vec4(mix(bgColor, lineColor * brightness, line), a);
  #include <fog_fragment>
}
`

function makeMaterial(opts: {
  cellSize: number
  lineWidth: number
  lineColor: string
  bgColor: string
  brightness: number
  solid: boolean
}): THREE.ShaderMaterial {
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      cellSize: { value: opts.cellSize },
      lineWidth: { value: opts.lineWidth },
      lineColor: { value: new THREE.Color(opts.lineColor) },
      bgColor: { value: new THREE.Color(opts.bgColor) },
      brightness: { value: opts.brightness },
      solid: { value: opts.solid ? 1 : 0 },
    },
  ])
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: !opts.solid,
    depthWrite: opts.solid,
    fog: true,
  })
}

let trackCached: THREE.ShaderMaterial | null = null
export function getGridMaterial(): THREE.ShaderMaterial {
  if (trackCached) return trackCached
  const t = config.track
  trackCached = makeMaterial({
    cellSize: t.surfaceGridSize,
    lineWidth: t.surfaceGridLineWidth,
    lineColor: t.surfaceGridColor,
    bgColor: t.surfaceColor,
    brightness: t.surfaceGridBrightness,
    solid: false,
  })
  return trackCached
}

let obstacleCached: THREE.ShaderMaterial | null = null
export function getObstacleGridMaterial(): THREE.ShaderMaterial {
  if (obstacleCached) return obstacleCached
  const t = config.track
  obstacleCached = makeMaterial({
    cellSize: t.surfaceGridSize,
    lineWidth: t.surfaceGridLineWidth,
    lineColor: t.obstacleColor,
    bgColor: t.obstacleBgColor,
    brightness: t.obstacleGridBrightness,
    solid: true,
  })
  return obstacleCached
}
