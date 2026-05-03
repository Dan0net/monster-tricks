import * as THREE from 'three'

const vertexShader = /* glsl */ `
#include <fog_pars_vertex>
varying vec2 vUvT;
uniform vec2 tile;
void main() {
  vUvT = uv * tile;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

const fragmentShader = /* glsl */ `
#include <fog_pars_fragment>
varying vec2 vUvT;
uniform vec3 colorA;
uniform vec3 colorB;
void main() {
  vec2 f = floor(vUvT);
  float c = mod(f.x + f.y, 2.0);
  vec3 col = mix(colorA, colorB, c);
  gl_FragColor = vec4(col, 1.0);
  #include <fog_fragment>
}
`

function makeMaterial(tileX: number, tileY: number, colorA: string, colorB: string): THREE.ShaderMaterial {
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      tile: { value: new THREE.Vector2(tileX, tileY) },
      colorA: { value: new THREE.Color(colorA) },
      colorB: { value: new THREE.Color(colorB) },
    },
  ])
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    fog: true,
    side: THREE.DoubleSide,
  })
}

const cache = new Map<string, THREE.ShaderMaterial>()

export function getCheckerMaterial(
  tileX: number,
  tileY: number,
  colorA: string,
  colorB: string,
): THREE.ShaderMaterial {
  const key = `${tileX}|${tileY}|${colorA}|${colorB}`
  let m = cache.get(key)
  if (m) return m
  m = makeMaterial(tileX, tileY, colorA, colorB)
  cache.set(key, m)
  return m
}
