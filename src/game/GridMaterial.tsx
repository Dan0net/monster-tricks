import * as THREE from 'three'
import { config } from '../config'

const vertexShader = /* glsl */ `
#include <fog_pars_vertex>
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

const fragmentShader = /* glsl */ `
#include <fog_pars_fragment>
varying vec3 vWorld;
uniform float cellSize;
uniform float lineWidth;
uniform vec3 lineColor;
uniform float brightness;
void main() {
  vec2 c = vWorld.xz / cellSize;
  vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
  float d = min(g.x, g.y);
  float line = 1.0 - clamp(d / lineWidth, 0.0, 1.0);
  if (line < 0.01) discard;
  gl_FragColor = vec4(lineColor * brightness, line);
  #include <fog_fragment>
}
`

let cached: THREE.ShaderMaterial | null = null

export function getGridMaterial(): THREE.ShaderMaterial {
  if (cached) return cached
  const t = config.track
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      cellSize: { value: t.surfaceGridSize },
      lineWidth: { value: t.surfaceGridLineWidth },
      lineColor: { value: new THREE.Color(t.surfaceGridColor) },
      brightness: { value: t.surfaceGridBrightness },
    },
  ])
  cached = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    fog: true,
  })
  return cached
}
