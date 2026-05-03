import * as THREE from 'three'
import { config } from '../config'

const vertexShader = /* glsl */ `
#include <fog_pars_vertex>
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

const fragmentShader = /* glsl */ `
#include <fog_pars_fragment>
varying vec2 vUv;
uniform vec3 coreColor;
uniform vec3 haloColor;
uniform float coreFrac;
uniform float brightness;
void main() {
  float d = abs(vUv.x - 0.5) * 2.0;
  float core = 1.0 - smoothstep(coreFrac * 0.85, coreFrac, d);
  float halo = pow(1.0 - d, 1.5);
  vec3 col = mix(haloColor, coreColor, core);
  float a = max(halo * brightness, core);
  if (a < 0.01) discard;
  gl_FragColor = vec4(col, a);
  #include <fog_fragment>
}
`

function makeMaterial(coreColor: string, haloColor: string, coreFrac: number, brightness: number): THREE.ShaderMaterial {
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      coreColor: { value: new THREE.Color(coreColor) },
      haloColor: { value: new THREE.Color(haloColor) },
      coreFrac: { value: coreFrac },
      brightness: { value: brightness },
    },
  ])
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    fog: true,
    side: THREE.DoubleSide,
  })
}

let trackCached: THREE.ShaderMaterial | null = null
export function getEdgeMaterial(): THREE.ShaderMaterial {
  if (trackCached) return trackCached
  const t = config.track
  trackCached = makeMaterial(t.edgeCoreColor, t.edgeColor, t.edgeCoreFrac, t.edgeBrightness)
  return trackCached
}

let obstacleCached: THREE.ShaderMaterial | null = null
export function getObstacleEdgeMaterial(): THREE.ShaderMaterial {
  if (obstacleCached) return obstacleCached
  const t = config.track
  obstacleCached = makeMaterial(t.edgeCoreColor, t.obstacleColor, t.obstacleEdgeCoreFrac, t.obstacleEdgeBrightness)
  return obstacleCached
}
