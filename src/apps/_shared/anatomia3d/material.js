// Sombreado del modelo 3D: ilustración médica (luz de estudio fija a la cámara,
// relleno, especular por material, borde de luz, oclusión horneada, fibras en los
// músculos, poro en el hueso) y holograma para las capas «peladas».
//
// Tres pasadas con la misma geometría:
//   · solid:  piezas opacas (las ocultas o en holograma no se pintan)
//   · ghost:  piezas en holograma (aditivo, sin escribir profundidad: sin ordenar)
//   · pick:   número de pieza y capa en color, para saber qué hay bajo el dedo
//
// Estado por pieza en una textura de datos (PartTable): matriz 3×4 (despiece,
// latido, articulaciones…), tinte, visibilidad, holograma, brillo y fibras.
import * as THREE from 'three';
import { MAT_CODES } from './model';

const ROWS = 6; // 0-2 matriz · 3 tinte · 4 estado · 5 fibra

export class PartTable {
  constructor(count) {
    this.width = count + 1; // 0 = contexto
    this.data = new Float32Array(this.width * ROWS * 4);
    this.texture = new THREE.DataTexture(this.data, this.width, ROWS, THREE.RGBAFormat, THREE.FloatType);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    for (let n = 0; n < this.width; n += 1) {
      this.setMatrix(n, null);
      this.setState(n, { visible: 1, ghost: 0, glow: 0, dim: 0 });
    }
    this.texture.needsUpdate = true;
  }

  at(n, row) { return (row * this.width + n) * 4; }

  // m: THREE.Matrix4 (null = identidad)
  setMatrix(n, m) {
    const e = m ? m.elements : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    for (let r = 0; r < 3; r += 1) {
      const o = this.at(n, r);
      // Matrix4.elements es por columnas: fila r = e[r], e[4 + r], e[8 + r], e[12 + r]
      this.data[o] = e[r]; this.data[o + 1] = e[4 + r]; this.data[o + 2] = e[8 + r]; this.data[o + 3] = e[12 + r];
    }
  }

  setTint(n, color, amount) {
    const o = this.at(n, 3);
    if (color) { this.data[o] = color.r; this.data[o + 1] = color.g; this.data[o + 2] = color.b; }
    this.data[o + 3] = amount;
  }

  setState(n, { visible, ghost, glow, dim }) {
    const o = this.at(n, 4);
    if (visible !== undefined) this.data[o] = visible;
    if (ghost !== undefined) this.data[o + 1] = ghost;
    if (glow !== undefined) this.data[o + 2] = glow;
    if (dim !== undefined) this.data[o + 3] = dim;
  }

  setFiber(n, axis) {
    const o = this.at(n, 5);
    if (!axis) { this.data[o + 3] = 0; return; }
    this.data[o] = axis[0]; this.data[o + 1] = axis[1]; this.data[o + 2] = axis[2]; this.data[o + 3] = 1;
  }

  commit() { this.texture.needsUpdate = true; }
}

/* ───────── materiales por clase ───────── */

// spec, brillo, borde (como tools/anatomy/shade.mjs)
const MAT_PARAMS = {
  skin: [0.14, 18, 0.32], bone: [0.12, 18, 0.25], cartilage: [0.35, 30, 0.3], tooth: [0.4, 40, 0.3],
  muscle: [0.24, 26, 0.28], tendon: [0.35, 30, 0.3], artery: [0.45, 40, 0.3], vein: [0.45, 40, 0.3],
  nerve: [0.4, 30, 0.3], brain: [0.25, 20, 0.25], organ: [0.5, 36, 0.28],
};
const SPEC = MAT_CODES.map((m) => MAT_PARAMS[m][0]);
const SHIN = MAT_CODES.map((m) => MAT_PARAMS[m][1]);
const RIM = MAT_CODES.map((m) => MAT_PARAMS[m][2]);

const COMMON = /* glsl */ `
uniform sampler2D uParts;
uniform float uTime;
uniform vec4 uClip;      // plano de corte (normal, d) en el cuerpo; activo si uClipOn
uniform float uClipOn;
uniform vec3 uLens;      // lupa de rayos X: x, y (px del lienzo), radio (px)
uniform float uLensOn;    // 1: se recorta dentro del círculo · 2: solo se ve dentro
uniform float uLayerGhost; // toda la capa en holograma
uniform float uLayerIndex;
uniform float uAo;        // cuánto se nota la oclusión horneada (menos en el despiece)
`;

const VERT = /* glsl */ `
${COMMON}
uniform float uPass; // 0 sólido, 1 holograma, 2 selección
attribute vec4 aCol;
attribute vec2 aPC;
varying vec3 vW;
varying vec3 vNv;
varying vec3 vPv;
varying vec4 vCol;
varying vec3 vFiber;
flat varying int vId;
flat varying int vMat;
flat varying vec4 vTint;
flat varying vec4 vState;

void main() {
  int id = int(aPC.x + 0.5);
  vId = id;
  vMat = int(aPC.y + 0.5);
  vec4 st = texelFetch(uParts, ivec2(id, 4), 0);
  vState = st;
  float ghost = max(st.y, uLayerGhost);
  bool skip = st.x < 0.5
    || (uPass < 0.5 && ghost > 0.5)
    || (uPass > 0.5 && uPass < 1.5 && ghost < 0.5)
    || (uPass > 1.5 && ghost > 0.5);
  if (skip) { gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
  vec4 r0 = texelFetch(uParts, ivec2(id, 0), 0);
  vec4 r1 = texelFetch(uParts, ivec2(id, 1), 0);
  vec4 r2 = texelFetch(uParts, ivec2(id, 2), 0);
  vTint = texelFetch(uParts, ivec2(id, 3), 0);
  vec4 fb = texelFetch(uParts, ivec2(id, 5), 0);
  vFiber = fb.w > 0.5 ? fb.xyz : vec3(0.0);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec3 p = vec3(dot(r0, wp), dot(r1, wp), dot(r2, wp));
  vec3 n = normalize(mat3(modelMatrix) * normal);
  n = normalize(vec3(dot(r0.xyz, n), dot(r1.xyz, n), dot(r2.xyz, n)));
  vW = p;
  vNv = normalize((viewMatrix * vec4(n, 0.0)).xyz);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  vPv = mv.xyz;
  vCol = aCol;
  gl_Position = projectionMatrix * mv;
}
`;

const CUT = /* glsl */ `
  if (uClipOn > 0.5 && dot(uClip.xyz, vW) + uClip.w > 0.0) discard;
  if (uLensOn > 0.5) {
    float dl = distance(gl_FragCoord.xy, uLens.xy);
    if (uLensOn < 1.5 ? dl < uLens.z : dl > uLens.z) discard;
  }
`;

const NOISE = /* glsl */ `
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
`;

const FRAG_SOLID = /* glsl */ `
${COMMON}
${NOISE}
uniform float uSpec[${MAT_CODES.length}];
uniform float uShin[${MAT_CODES.length}];
uniform float uRim[${MAT_CODES.length}];
uniform vec3 uSkin;
uniform vec3 uRimColor;
varying vec3 vW;
varying vec3 vNv;
varying vec3 vPv;
varying vec4 vCol;
varying vec3 vFiber;
flat varying int vId;
flat varying int vMat;
flat varying vec4 vTint;
flat varying vec4 vState;

void main() {
  ${CUT}
  vec3 V = normalize(-vPv);
  vec3 N = normalize(vNv);
  bool cutFace = !gl_FrontFacing;
  if (cutFace) N = V; // cara interior vista por el corte: tapa plana
  vec3 albedo = vMat == 0 ? uSkin : vCol.rgb;
  float ao = mix(1.0, vCol.a, cutFace ? 0.0 : uAo);

  // textura: fibras del músculo a lo largo de su eje, poro del hueso
  if (dot(vFiber, vFiber) > 0.5) {
    vec3 a = vFiber;
    vec3 u = normalize(cross(a, abs(a.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
    vec3 w = cross(a, u);
    float f = noise3(vec3(dot(vW, u) * 900.0, dot(vW, w) * 900.0, dot(vW, a) * 40.0));
    albedo *= 0.86 + 0.24 * f;
  } else if (vMat == 1) {
    albedo *= 0.94 + 0.1 * noise3(vW * 420.0);
  }
  if (cutFace) albedo = albedo * 0.82 + 0.06;

  // estado de la pieza: atenuada (resto en modo enfoque) y tinte (acierto, fallo, selección)
  float lum = dot(albedo, vec3(0.3, 0.55, 0.15));
  albedo = mix(albedo, vec3(lum) * vec3(0.55, 0.62, 0.72), vState.w * 0.85);
  albedo = mix(albedo, vTint.rgb, vTint.a);

  // luz de estudio fija a la cámara
  vec3 L1 = normalize(vec3(-0.45, 0.62, 0.64));
  vec3 L2 = normalize(vec3(0.7, -0.15, 0.45));
  float d1 = max(0.0, (dot(N, L1) + 0.35) / 1.35);
  float d2 = max(0.0, (dot(N, L2) + 0.2) / 1.2);
  float spec = uSpec[vMat] * pow(max(0.0, dot(N, normalize(L1 + V))), uShin[vMat]);
  float fres = pow(1.0 - max(0.0, dot(N, V)), 2.6);
  vec3 col = albedo * (0.30 * ao + 0.78 * d1 * mix(1.0, ao, 0.55) + 0.22 * d2 * ao);
  col += vec3(1.0, 0.97, 0.92) * spec * ao;
  col += uRimColor * fres * uRim[vMat] * (cutFace ? 0.0 : 1.0);
  // brillo de la pieza señalada (late suave)
  float g = vState.z * (0.55 + 0.45 * sin(uTime * 4.2));
  col += vTint.rgb * g * 0.55 + vTint.rgb * fres * vState.z * 0.9;
  // borde de la lupa
  if (uLensOn > 0.5 && uLensOn < 1.5) {
    float dl = distance(gl_FragCoord.xy, uLens.xy) - uLens.z;
    col += vec3(0.37, 0.92, 0.83) * smoothstep(7.0, 0.0, dl) * 0.75;
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

const FRAG_GHOST = /* glsl */ `
${COMMON}
uniform vec3 uGhost;
uniform float uGhostAlpha;
varying vec3 vW;
varying vec3 vNv;
varying vec3 vPv;
varying vec4 vCol;
varying vec3 vFiber;
flat varying int vId;
flat varying int vMat;
flat varying vec4 vTint;
flat varying vec4 vState;

void main() {
  if (uClipOn > 0.5 && dot(uClip.xyz, vW) + uClip.w > 0.0) discard;
  vec3 V = normalize(-vPv);
  vec3 N = normalize(vNv);
  float fres = pow(1.0 - abs(dot(N, V)), 1.7);
  vec3 c = mix(uGhost, vTint.rgb, vTint.a);
  float g = vState.z * (0.6 + 0.4 * sin(uTime * 4.2));
  float a = (fres * 0.85 + 0.035 + g * 0.25) * uGhostAlpha * (gl_FrontFacing ? 1.0 : 0.45);
  gl_FragColor = vec4(c * a, a);
}
`;

const FRAG_PICK = /* glsl */ `
${COMMON}
varying vec3 vW;
varying vec3 vNv;
varying vec3 vPv;
varying vec4 vCol;
varying vec3 vFiber;
flat varying int vId;
flat varying int vMat;
flat varying vec4 vTint;
flat varying vec4 vState;

void main() {
  ${CUT}
  if (vId == 0) { gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); return; } // contexto: tapa, pero no se toca
  gl_FragColor = vec4(float(vId % 256) / 255.0, float(vId / 256) / 255.0, uLayerIndex / 255.0, 1.0);
}
`;

// Uniformes compartidos por las tres pasadas de una capa.
export function layerUniforms(table, layerIndex) {
  return {
    uParts: { value: table.texture },
    uTime: { value: 0 },
    uClip: { value: new THREE.Vector4(0, 0, -1, 0) },
    uClipOn: { value: 0 },
    uLens: { value: new THREE.Vector3(-9999, -9999, 0) },
    uLensOn: { value: 0 },
    uLayerGhost: { value: 0 },
    uLayerIndex: { value: layerIndex },
    uAo: { value: 0.9 },
    uSpec: { value: SPEC },
    uShin: { value: SHIN },
    uRim: { value: RIM },
    uSkin: { value: new THREE.Color('#cdd6e0') },
    uRimColor: { value: new THREE.Color('#bfe9ff') },
    uGhost: { value: new THREE.Color('#5eead4') },
    uGhostAlpha: { value: 1 },
  };
}

export function createLayerMaterials(uniforms) {
  const solid = new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uPass: { value: 0 } },
    vertexShader: VERT,
    fragmentShader: FRAG_SOLID,
    side: THREE.FrontSide,
  });
  const ghost = new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uPass: { value: 1 } },
    vertexShader: VERT,
    fragmentShader: FRAG_GHOST,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    side: THREE.DoubleSide,
  });
  const pick = new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uPass: { value: 2 } },
    vertexShader: VERT,
    fragmentShader: FRAG_PICK,
    side: THREE.FrontSide,
  });
  for (const m of [solid, ghost, pick]) m.toneMapped = false;
  return { solid, ghost, pick };
}
