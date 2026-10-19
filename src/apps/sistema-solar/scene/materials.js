// src/apps/sistema-solar/scene/materials.js
// Materiales con shader propio de la escena (sin postproceso: todo el
// «brillo» sale de aquí, así funciona igual en equipos modestos).
// El Sol está en el origen del mundo: la dirección de la luz de cada
// fragmento es normalize(-posición), lo que da el terminador día/noche, la
// sombra del planeta sobre los anillos y el halo de la atmósfera en el lado
// iluminado. Todos acaban con tonemapping + colorspace como los de three.
import * as THREE from 'three';

const OUT = '\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n';

/* ── Sol: superficie hirviente con oscurecimiento del limbo ── */
export function createSunMaterial(map) {
  return new THREE.ShaderMaterial({
    uniforms: { uTex: { value: map }, uTime: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uTex; uniform float uTime;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        vec2 w = vec2(sin(vUv.y * 48.0 + uTime * 0.7), cos(vUv.x * 64.0 - uTime * 0.55)) * 0.0022;
        vec3 a = texture2D(uTex, vUv + w + vec2(uTime * 0.0016, 0.0)).rgb;
        vec3 b = texture2D(uTex, vUv - w * 1.7 + vec2(-uTime * 0.0011, 0.0)).rgb;
        vec3 c = mix(a, b, 0.5 + 0.5 * sin(uTime * 0.35 + vUv.x * 18.0 + vUv.y * 9.0));
        float mu = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
        float limb = pow(mu, 0.5);
        vec3 col = c * vec3(1.55, 1.12, 0.78) * (0.5 + 0.85 * limb);
        col += vec3(1.0, 0.45, 0.08) * pow(1.0 - mu, 3.0) * 0.55;
        gl_FragColor = vec4(col, 1.0);
        ${OUT}
      }`,
  });
}

/* ── Corona: billboard aditivo con rayos animados ── */
export function createCoronaMaterial({ rays = true } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uInner: { value: 1 / 3.2 }, uRays: { value: rays ? 1 : 0 }, uStrength: { value: 0.85 } },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float uTime; uniform float uInner; uniform float uRays; uniform float uStrength;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        if (r > 1.0) discard;
        float a = atan(p.y, p.x);
        float d = max(r - uInner, 0.0);
        float glow = exp(-d * 10.0) * 0.62 + exp(-d * 3.2) * 0.3;
        float rays = 0.5 + 0.5 * sin(a * 11.0 + uTime * 0.12 + sin(a * 4.0 - uTime * 0.21) * 2.2);
        rays *= 0.55 + 0.45 * sin(a * 27.0 - uTime * 0.09 + sin(a * 3.0) * 3.0);
        float streams = rays * exp(-d * 3.4) * 0.38 * uRays;
        float fade = 1.0 - smoothstep(0.72, 1.0, r);
        float i = (glow + streams) * fade * uStrength;
        vec3 col = mix(vec3(1.0, 0.42, 0.06), vec3(1.0, 0.86, 0.55), exp(-d * 6.0));
        gl_FragColor = vec4(col * i, i);
        ${OUT}
      }`,
  });
}

/* ── Atmósfera: borde de Fresnel, solo en el lado de día ── */
export function createAtmosphereMaterial({ color = '#4fc3f7', power = 3.2, intensity = 1.1, sunset = 0 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uPower: { value: power },
      uIntensity: { value: intensity },
      uSunset: { value: sunset },
    },
    vertexShader: /* glsl */`
      varying vec3 vWN; varying vec3 vWP;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWP = wp.xyz;
        vWN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uPower; uniform float uIntensity; uniform float uSunset;
      varying vec3 vWN; varying vec3 vWP;
      void main() {
        vec3 N = normalize(vWN);
        vec3 V = normalize(cameraPosition - vWP);
        vec3 L = normalize(-vWP);
        float f = 1.0 - clamp(dot(N, V), 0.0, 1.0);
        float rim = pow(f, uPower) * (1.0 - smoothstep(0.86, 1.0, f));
        float lit = dot(N, L);
        float day = smoothstep(-0.3, 0.55, lit);
        vec3 col = mix(uColor, vec3(1.0, 0.5, 0.2), uSunset * (1.0 - smoothstep(0.0, 0.35, abs(lit))));
        float i = rim * uIntensity * mix(0.06, 1.0, day);
        gl_FragColor = vec4(col * i, i);
        ${OUT}
      }`,
  });
}

/* ── Tierra: día/noche con luces de ciudades y brillo en los océanos ── */
export function createEarthMaterial(day, night) {
  return new THREE.ShaderMaterial({
    uniforms: { uDay: { value: day }, uNight: { value: night } },
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vWN; varying vec3 vWP;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWP = wp.xyz;
        vWN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uDay; uniform sampler2D uNight;
      varying vec2 vUv; varying vec3 vWN; varying vec3 vWP;
      void main() {
        vec3 N = normalize(vWN);
        vec3 L = normalize(-vWP);
        vec3 V = normalize(cameraPosition - vWP);
        float d = dot(N, L);
        vec3 dayC = texture2D(uDay, vUv).rgb;
        vec3 nightC = texture2D(uNight, vUv).rgb;
        float diff = max(d, 0.0);
        vec3 col = dayC * (0.035 + diff * 1.25);
        float ocean = clamp((dayC.b - max(dayC.r, dayC.g)) * 9.0, 0.0, 1.0);
        vec3 H = normalize(L + V);
        col += vec3(1.0, 0.93, 0.8) * pow(max(dot(N, H), 0.0), 36.0) * ocean * 0.55 * smoothstep(0.0, 0.1, d);
        float dayMix = smoothstep(-0.12, 0.22, d);
        vec3 lights = nightC * vec3(1.25, 0.95, 0.62) * 1.6;
        col = mix(lights + dayC * 0.02, col, dayMix);
        col += vec3(0.5, 0.2, 0.06) * max(0.0, 1.0 - abs(d) * 6.0) * 0.035;
        gl_FragColor = vec4(col, 1.0);
        ${OUT}
      }`,
  });
}

/* ── Anillos: textura radial, luz del Sol y sombra del planeta ── */
export function createRingMaterial({ map = null, inner, outer, planetRadius, tint = '#c9c4b8', opacity = 1, bands = false }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTex: { value: map },
      uHasTex: { value: map ? 1 : 0 },
      uInner: { value: inner },
      uOuter: { value: outer },
      uPlanetPos: { value: new THREE.Vector3() },
      uPlanetR: { value: planetRadius },
      uTint: { value: new THREE.Color(tint) },
      uOpacity: { value: opacity },
      uBands: { value: bands ? 1 : 0 },
    },
    vertexShader: /* glsl */`
      varying vec3 vLocal; varying vec3 vWP; varying vec3 vWN;
      void main() {
        vLocal = position;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWP = wp.xyz;
        vWN = normalize(mat3(modelMatrix) * vec3(0.0, 0.0, 1.0));
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uTex; uniform float uHasTex; uniform float uInner; uniform float uOuter;
      uniform vec3 uPlanetPos; uniform float uPlanetR; uniform vec3 uTint; uniform float uOpacity; uniform float uBands;
      varying vec3 vLocal; varying vec3 vWP; varying vec3 vWN;
      float band(float u, float c, float w) { return exp(-pow((u - c) / w, 2.0)); }
      void main() {
        float r = length(vLocal.xy);
        float u = (r - uInner) / (uOuter - uInner);
        if (u < 0.0 || u > 1.0) discard;
        vec4 t;
        if (uHasTex > 0.5) {
          t = texture2D(uTex, vec2(u, 0.5));
        } else {
          float a = band(u, 0.06, 0.012) * 0.5 + band(u, 0.2, 0.01) * 0.4 + band(u, 0.34, 0.012) * 0.45
                  + band(u, 0.52, 0.01) * 0.4 + band(u, 0.64, 0.012) * 0.5 + band(u, 0.95, 0.025) * 1.0;
          t = vec4(uTint, a * uBands + (1.0 - uBands) * 0.6);
        }
        vec3 L = normalize(-vWP);
        vec3 oc = vWP - uPlanetPos;
        float b = dot(oc, L);
        float h = b * b - (dot(oc, oc) - uPlanetR * uPlanetR);
        float sh = step(b, 0.0) * smoothstep(-uPlanetR * uPlanetR * 0.03, uPlanetR * uPlanetR * 0.03, h);
        float light = 0.42 + 0.58 * abs(dot(normalize(vWN), L));
        vec3 col = t.rgb * light * (1.0 - 0.86 * sh);
        gl_FragColor = vec4(col, t.a * uOpacity);
        ${OUT}
      }`,
  });
}

/* ── Órbitas: línea con estela que se enciende detrás del planeta ── */
export function createOrbitMaterial(color = '#818cf8', opacity = 0.25) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity }, uAngle: { value: 0 }, uFade: { value: 1 } },
    vertexShader: /* glsl */`
      attribute float aAngle; varying float vA;
      void main() { vA = aAngle; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uOpacity; uniform float uAngle; uniform float uFade;
      varying float vA;
      void main() {
        float da = mod(uAngle - vA, 6.2831853);
        float trail = exp(-da * 1.4);
        float a = uOpacity * (0.32 + 2.2 * trail) * uFade;
        gl_FragColor = vec4(mix(uColor, vec3(1.0), trail * 0.5) * a, a);
        ${OUT}
      }`,
  });
}

export function createOrbitGeometry(segments = 256) {
  const pos = new Float32Array(segments * 3);
  const ang = new Float32Array(segments);
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pos[i * 3] = Math.cos(a);
    pos[i * 3 + 1] = 0;
    pos[i * 3 + 2] = -Math.sin(a);
    ang[i] = a;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aAngle', new THREE.BufferAttribute(ang, 1));
  return g;
}

/* ── Halo de marcador (sprite): textura radial generada una vez ── */
let _glowTex = null;
export function glowTexture() {
  if (_glowTex) return _glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  _glowTex = new THREE.CanvasTexture(c);
  return _glowTex;
}

/* ── Interior: cara de corte con degradado, vetas y brillo térmico ── */
export function createCutFaceMaterial({ colorIn, colorOut, rIn, rOut, glow = 0, opacity = 1, shade = 1 }) {
  return new THREE.ShaderMaterial({
    transparent: opacity < 1,
    depthWrite: opacity >= 1,
    side: THREE.DoubleSide,
    uniforms: {
      uIn: { value: rIn }, uOut: { value: rOut },
      uColIn: { value: new THREE.Color(colorIn) }, uColOut: { value: new THREE.Color(colorOut) },
      uGlow: { value: glow }, uHi: { value: 0 }, uDim: { value: 0 }, uOk: { value: 0 },
      uOpacity: { value: opacity }, uShade: { value: shade }, uTime: { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec3 vP;
      void main() { vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float uIn; uniform float uOut; uniform vec3 uColIn; uniform vec3 uColOut; uniform float uGlow;
      uniform float uHi; uniform float uDim; uniform float uOk; uniform float uOpacity; uniform float uShade; uniform float uTime;
      varying vec3 vP;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      void main() {
        float r = length(vP.xy);
        float t = clamp((r - uIn) / max(uOut - uIn, 1e-4), 0.0, 1.0);
        vec3 c = mix(uColIn, uColOut, t);
        float n = noise(vP.xy * 26.0) * 0.6 + noise(vP.xy * 70.0) * 0.4;
        c *= 0.86 + 0.28 * n;
        float flow = 0.5 + 0.5 * sin(r * 40.0 - uTime * 0.8 + n * 3.0);
        c += c * uGlow * (0.35 + 0.25 * flow);
        float edge = smoothstep(0.0, 0.025, t) * smoothstep(1.0, 0.975, t);
        c *= mix(0.55, 1.0, edge);
        c *= uShade;
        c = mix(c, vec3(1.0, 0.97, 0.85), uHi * (0.14 + 0.07 * sin(uTime * 5.0)));
        c *= 1.0 + uHi * 0.18;
        c = mix(c, uOk > 0.5 ? vec3(0.2, 0.95, 0.55) : vec3(1.0, 0.3, 0.35), step(0.5, abs(uOk)) * 0.45);
        c *= 1.0 - uDim * 0.62;
        gl_FragColor = vec4(c, uOpacity * (1.0 - uDim * 0.4));
        ${OUT}
      }`,
  });
}

/* ── Capa gaseosa muy tenue (corona, cromosfera, atmósfera de Venus) en el
   visor de interior: halo de Fresnel aditivo con la misma cuña recortada ── */
export function createGlowShellMaterial(color, wedge, strength = 1) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uCenter: wedge.uCenter, uHalf: wedge.uHalf, uStrength: { value: strength }, uHi: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec3 vObj; varying vec3 vWN; varying vec3 vWP;
      void main() {
        vObj = position;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWP = wp.xyz;
        vWN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; uniform float uCenter; uniform float uHalf; uniform float uStrength; uniform float uHi;
      varying vec3 vObj; varying vec3 vWN; varying vec3 vWP;
      void main() {
        float wa = atan(vObj.z, vObj.x);
        float wd = mod(wa - uCenter + 3.14159265, 6.2831853) - 3.14159265;
        if (abs(wd) < uHalf) discard;
        float f = 1.0 - abs(dot(normalize(vWN), normalize(cameraPosition - vWP)));
        float i = (pow(f, 2.2) * 0.75 + 0.05) * uStrength * (1.0 + uHi * 0.8);
        gl_FragColor = vec4(uColor * i, i);
        ${OUT}
      }`,
  });
}

// Recorta una cuña (en el plano XZ, ángulos de atan(z, x)) de cualquier
// material estándar. uniforms → { uCenter, uHalf }.
export function addWedgeCut(material, uniforms) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCenter = uniforms.uCenter;
    shader.uniforms.uHalf = uniforms.uHalf;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObj;\nuniform float uCenter;\nuniform float uHalf;')
      .replace('void main() {', `void main() {
        float wa = atan(vObj.z, vObj.x);
        float wd = mod(wa - uCenter + 3.14159265, 6.2831853) - 3.14159265;
        if (abs(wd) < uHalf) discard;`);
  };
  material.customProgramCacheKey = () => 'ss-wedge';
  return material;
}
