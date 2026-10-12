// GLSL de la ciudad futurista. Todo es ShaderMaterial "a mano": sin luces de
// three, sin texturas descargadas, sin postprocesado. Los colores se escriben
// directamente en sRGB (sin tone mapping ni conversión de espacio de color).
//
// uNight (0 = tema claro, atardecer futurista · 1 = tema oscuro, noche de neón)
// mezcla las dos paletas en GPU: el cambio de tema es un fundido de un uniform,
// sin recompilar ni recrear nada (sin parpadeos).
//
// Los datos POR INSTANCIA (semillas, estilos) viajan en varyings `flat`: la
// interpolación perspectiva no es exacta ni para valores constantes y los hash
// amplificarían ese error a ruido por píxel en las ventanas.
//
// Niebla propia (distancia + altura) cuyo color sale del MISMO degradado del
// cielo en esa dirección: los edificios lejanos se funden con el horizonte.

export const COMMON = /* glsl */`
uniform float uTime;
uniform float uNight;
uniform vec3 uSunDir;   // luz principal en espacio MUNDO
uniform vec3 uSunSky;   // luz principal en espacio CIELO
uniform vec2 uSkyRot;   // cos/sin del giro del cielo (mundo -> cielo)
uniform float uFogDen;

float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec3 toSky(vec3 w) { return vec3(w.x * uSkyRot.x - w.z * uSkyRot.y, w.y, w.x * uSkyRot.y + w.z * uSkyRot.x); }

vec3 skyBase(vec3 d) {
  float y = d.y;
  vec3 top = mix(vec3(0.11, 0.17, 0.58), vec3(0.010, 0.013, 0.050), uNight);
  vec3 mid = mix(vec3(0.40, 0.32, 0.84), vec3(0.070, 0.040, 0.190), uNight);
  vec3 hor = mix(vec3(1.00, 0.54, 0.68), vec3(0.44, 0.13, 0.52), uNight);
  vec3 low = mix(vec3(0.56, 0.40, 0.66), vec3(0.055, 0.032, 0.12), uNight);
  vec3 c = mix(hor, mid, smoothstep(0.0, 0.24, y));
  c = mix(c, top, smoothstep(0.2, 0.85, y));
  c = mix(c, low, smoothstep(0.0, -0.22, y));
  float s = max(dot(d, uSunSky), 0.0);
  vec3 halo = mix(vec3(1.0, 0.66, 0.36), vec3(0.50, 0.32, 0.95), uNight);
  c += halo * (pow(s, 5.0) * mix(0.32, 0.16, uNight) + pow(s, 40.0) * mix(0.62, 0.14, uNight));
  return c;
}

// color de niebla: el cielo en esa dirección, pegado al horizonte
vec3 fogColor(vec3 viewDir) {
  vec3 d = toSky(viewDir);
  d.y *= 0.22;
  return skyBase(normalize(d));
}

float fogAmount(vec3 wpos) {
  vec3 dv = wpos - cameraPosition;
  float dist = length(dv);
  float fd = 1.0 - exp(-dist * uFogDen);
  float fh = exp(-max(wpos.y, 0.0) * 0.045) * (1.0 - exp(-dist * 0.0105));
  return clamp(fd + fh * mix(0.5, 0.72, uNight) * (1.0 - fd), 0.0, 1.0);
}

vec3 applyFog(vec3 col, vec3 wpos, float keep) {
  vec3 dv = wpos - cameraPosition;
  float f = fogAmount(wpos) * (1.0 - keep);
  return mix(col, fogColor(normalize(dv)), f);
}

vec3 neonCol(float i) {
  i = mod(i, 5.0);
  if (i < 0.5) return vec3(0.66, 0.55, 0.98);
  if (i < 1.5) return vec3(0.96, 0.45, 0.71);
  if (i < 2.5) return vec3(0.13, 0.83, 0.93);
  if (i < 3.5) return vec3(0.98, 0.75, 0.14);
  return vec3(0.51, 0.55, 0.97);
}
`;

const DITHER = /* glsl */`(hash12(gl_FragCoord.xy) - 0.5) / 180.0`;

/* --------------------------------- cielo --------------------------------- */
export const SKY_VERT = /* glsl */`
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = vec4(p.xy, p.w * 0.9999, p.w); // en el plano lejano: se pinta DETRÁS de todo (early-z)
}
`;
export const SKY_FRAG = /* glsl */`
${COMMON}
uniform sampler2D uClouds;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  vec3 c = skyBase(d);
  float s = max(dot(d, uSunSky), 0.0);
  // disco del sol (solo de día)
  c += vec3(1.0, 0.88, 0.66) * smoothstep(0.99905, 0.99955, s) * (1.0 - uNight) * 1.4;
  // banda de nubes estiradas (textura procedural diminuta generada en runtime)
  float v = d.y / 0.42;
  if (v > -0.02 && v < 1.0) {
    float az = atan(d.z, d.x) * 0.15915494 + 0.5;
    float cl = texture2D(uClouds, vec2(az * 3.0 + uTime * 0.0012, clamp(v, 0.0, 1.0))).r;
    cl *= smoothstep(-0.02, 0.1, v) * (1.0 - smoothstep(0.5, 1.0, v));
    vec3 cd = mix(vec3(1.0, 0.74, 0.82), vec3(0.98, 0.90, 0.92), smoothstep(0.0, 0.7, v));
    cd += vec3(1.0, 0.58, 0.28) * pow(s, 3.0) * 0.45;
    vec3 cn = mix(vec3(0.40, 0.13, 0.46), vec3(0.11, 0.06, 0.24), smoothstep(0.0, 0.7, v));
    c = mix(c, mix(cd, cn, uNight), cl * mix(0.62, 0.72, uNight));
  }
  gl_FragColor = vec4(c + ${DITHER}, 1.0);
}
`;

/* -------------------------------- estrellas ------------------------------- */
export const STARS_VERT = /* glsl */`
uniform float uTime;
uniform float uNight;
uniform float uDpr;
attribute vec2 aStar; // tamaño px, fase
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float el = normalize(position).y;
  float tw = 0.65 + 0.35 * sin(uTime * (1.2 + aStar.y * 2.0) + aStar.y * 40.0);
  vA = uNight * tw * smoothstep(0.04, 0.22, el);
  gl_PointSize = aStar.x * uDpr;
  gl_Position = projectionMatrix * mv;
}
`;
export const STARS_FRAG = /* glsl */`
varying float vA;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  if (d > 1.0) discard;
  gl_FragColor = vec4(vec3(0.85, 0.88, 1.0) * exp(-d * 3.0) * vA, 1.0);
}
`;

/* ------------------------------ planeta anillado --------------------------- */
export const PLANET_VERT = /* glsl */`
uniform float uSize;
varying vec2 vP;
void main() {
  vP = position.xy * 2.0;
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  mv.xy += position.xy * uSize;
  gl_Position = projectionMatrix * mv;
}
`;
export const PLANET_FRAG = /* glsl */`
uniform float uNight;
varying vec2 vP;
void main() {
  vec2 p = vP * 1.75;            // radio del planeta = 1
  float r = length(p);
  // anillo inclinado
  float ca = 0.93, sa = 0.36;
  vec2 q = vec2(ca * p.x + sa * p.y, -sa * p.x + ca * p.y);
  float re = length(vec2(q.x, q.y / 0.24));
  float ring = smoothstep(1.24, 1.30, re) * (1.0 - smoothstep(1.62, 1.70, re));
  ring *= 0.55 + 0.45 * sin(re * 48.0);
  ring *= 1.0 - smoothstep(1.36, 1.40, re) * (1.0 - smoothstep(1.43, 1.47, re)) * 0.9; // división
  float front = step(q.y, 0.0);
  vec3 col = vec3(0.0);
  float alpha = 0.0;
  if (r < 1.0) {
    vec3 n = vec3(p, sqrt(1.0 - r * r));
    vec3 L = normalize(vec3(-0.55, 0.38, 0.72));
    float lam = max(dot(n, L), 0.0);
    float bands = sin(p.y * 10.0 + sin(p.x * 2.6 + p.y * 3.1) * 0.9) * 0.5 + 0.5;
    vec3 a1 = mix(vec3(0.98, 0.90, 1.0), vec3(0.42, 0.24, 0.86), uNight);
    vec3 a2 = mix(vec3(0.86, 0.80, 0.98), vec3(0.15, 0.55, 0.85), uNight);
    vec3 pc = mix(a1, a2, bands) * (0.12 + 1.0 * lam);
    float rim = pow(1.0 - n.z, 2.5);
    pc += mix(vec3(1.0, 0.85, 0.95), vec3(0.55, 0.85, 1.0), uNight) * rim * 0.65;
    col = pc;
    alpha = (1.0 - smoothstep(0.985, 1.0, r)) * mix(0.62, 1.0, uNight);
  }
  // el anillo pasa por DELANTE del disco en la mitad inferior y por detrás en la superior
  float ringVis = ring * ((r < 1.0 && front < 0.5) ? 0.0 : 1.0);
  vec3 rc = mix(vec3(1.0, 0.92, 0.96), vec3(0.95, 0.55, 0.90), uNight);
  col = mix(col, rc * (0.45 + 0.4 * front), ringVis * 0.85);
  alpha = max(alpha, ringVis * mix(0.42, 0.75, uNight));
  // atmósfera (aditiva, sin alfa)
  float glow = exp(-max(r - 1.0, 0.0) * 7.0) * step(1.0, r);
  vec3 gc = mix(vec3(1.0, 0.86, 0.95), vec3(0.55, 0.40, 1.0), uNight) * glow * mix(0.25, 0.55, uNight);
  gl_FragColor = vec4(col * alpha + gc, alpha);
}
`;

/* -------------------------------- edificios ------------------------------- */
export const BUILDING_VERT = /* glsl */`
attribute vec4 aData;   // semilla, estilo, neón (+10 = con perfiles), % ventanas encendidas
attribute vec2 aTier;   // altura total de la torre, y superior de este tramo
varying vec3 vWorld;
varying vec3 vNormal;
varying vec4 vFace;     // fachada: (u, y mundo, ancho, -) · azotea: (x, z, ancho, fondo)
flat varying vec4 vData;
flat varying vec2 vTier;
varying float vRoof;
#ifdef CYL
varying vec2 vLocal;
flat varying float vRad;
#endif
void main() {
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
  vData = aData;
  vTier = aTier;
  vRoof = step(0.5, normal.y);
  if (normal.y > 0.5) {
    vFace = vec4((position.x + 0.5) * sc.x, (position.z + 0.5) * sc.z, sc.x, sc.z);
  } else if (abs(normal.x) > 0.5) {
    vFace = vec4((position.z + 0.5) * sc.z, wp.y, sc.z, 0.0);
  } else {
    vFace = vec4((position.x + 0.5) * sc.x, wp.y, sc.x, 0.0);
  }
#ifdef CYL
  vLocal = position.xz;
  vRad = sc.x * 0.5;
#endif
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
export const BUILDING_FRAG = /* glsl */`
${COMMON}
varying vec3 vWorld;
varying vec3 vNormal;
varying vec4 vFace;
flat varying vec4 vData;
flat varying vec2 vTier;
varying float vRoof;
#ifdef CYL
varying vec2 vLocal;
flat varying float vRad;
#endif
void main() {
  // Derivadas SIEMPRE antes de cualquier rama: dentro de control de flujo no
  // uniforme no están definidas (en algunos drivers salen como ruido por píxel).
  float fwX = fwidth(vFace.x);
  float fwY = fwidth(vFace.y);
#ifdef CYL
  float fwL = length(fwidth(vLocal));
#endif
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  float seed = vData.x;
  float style = vData.y;
  float trim = step(9.5, vData.z);
  vec3 neon = neonCol(mod(vData.z, 10.0));
  float day = 1.0 - uNight;
  float h1 = hash11(seed * 7.13);
  float h2 = hash11(seed * 3.71);
  // cristal de día: cobalto, violeta, turquesa, perla o rosa (por torre)
  vec3 tint = h1 < 0.3 ? vec3(0.20, 0.27, 0.58) : h1 < 0.55 ? vec3(0.36, 0.29, 0.66) : h1 < 0.7 ? vec3(0.15, 0.44, 0.58) : h1 < 0.85 ? vec3(0.66, 0.66, 0.84) : vec3(0.62, 0.40, 0.62);
  tint *= 0.9 + 0.2 * h2;
  vec3 tintN = mix(vec3(0.026, 0.030, 0.068), vec3(0.050, 0.034, 0.092), h2);
  vec3 base = mix(tint, tintN, uNight);
  float sunL = max(dot(N, uSunDir), 0.0);
  vec3 col;
  vec3 emis = vec3(0.0);

  if (vRoof > 0.5) {
    // ---- azotea: equipos (cuadros) + perfil de neón en el borde ----
    vec2 rp = vFace.xy;
    vec2 rs = vFace.zw;
#ifdef CYL
    float edgeD = (0.5 - length(vLocal)) * vRad * 2.0;
#else
    float edgeD = min(min(rp.x, rs.x - rp.x), min(rp.y, rs.y - rp.y));
    // tableros de autopista/puentes: perfil solo en los bordes largos (sin juntas)
    if (style > 3.5) edgeD = rs.x < rs.y ? min(rp.x, rs.x - rp.x) : min(rp.y, rs.y - rp.y);
#endif
    col = base * mix(0.9 + 0.35 * sunL, 0.8, uNight);
    // equipos de cubierta (cuadros) salvo en tableros de autopista/puentes
    float eq = step(0.7, hash12(floor(rp / 3.0) + seed)) * step(style, 3.5);
    col *= (1.0 - eq * 0.28) * mix(1.0, 0.6, step(3.5, style));
    float ew = max(0.3, fwX * 1.5);
    emis += neon * (1.0 - smoothstep(ew * 0.5, ew, edgeD)) * trim * mix(0.45, 1.35, uNight);
  } else if (style > 3.5) {
    // ---- pasarela aérea: cuerpo de cristal con franja luminosa ----
    float strip = 1.0 - smoothstep(0.18, 0.32, abs(fract(vFace.y) - 0.5));
    col = base * 0.85;
    emis += neon * (0.35 + 0.65 * strip) * mix(0.35, 1.2, uNight);
  } else {
    // ---- fachada ----
#ifdef CYL
    float ang = atan(vLocal.y, vLocal.x);
    float u = (ang + 3.14159265) * vRad;
    float fwU = fwL * vRad * 2.0;
    float width = 6.2831853 * vRad;
#else
    float u = vFace.x;
    float fwU = fwX;
    float width = vFace.z;
#endif
    float v = vFace.y + seed * 2.7;
    // cristal: reflejo del cielo con Fresnel + luz del sol
    vec3 R = reflect(-V, N);
    R.y = abs(R.y) * 0.7 + mix(0.16, 0.03, uNight); // de día refleja más cielo alto (azul/violeta)
    vec3 refl = skyBase(toSky(normalize(R)));
    float ndv = max(dot(N, V), 0.0);
    float fres = 0.16 + 0.72 * pow(1.0 - ndv, 3.0);
    vec3 glass = base * (0.5 + 0.35 * sunL * day);
    glass = mix(glass, refl * mix(0.9, 1.0, uNight), fres * mix(0.8, 0.42, uNight));
    // borde dorado del sol de contraluz en las caras que lo miran de refilón
    glass += vec3(1.0, 0.6, 0.3) * pow(sunL, 1.6) * 0.42 * day;
    // brillo especular falso del sol en el cristal (destellos al moverse la cámara)
    float glint = pow(max(dot(R, uSunDir), 0.0), 40.0) * day * 0.38;
    // ventanas en rejilla (estilos: rejilla, banda corrida, paño ancho, rasgadas)
    vec2 cs = style < 0.5 ? vec2(1.7, 3.2) : style < 1.5 ? vec2(1.3, 3.5) : style < 2.5 ? vec2(2.6, 3.0) : vec2(0.95, 3.8);
    vec2 lo = style < 0.5 ? vec2(0.16, 0.24) : style < 1.5 ? vec2(0.02, 0.22) : style < 2.5 ? vec2(0.10, 0.12) : vec2(0.28, 0.06);
    vec2 hi = 1.0 - lo;
    vec2 g = vec2(u, v) / cs;
    vec2 fw = vec2(fwU, fwY) / cs;
    vec2 cell = floor(g);
    vec2 f = fract(g);
    // lejos la rejilla se sustituye por su valor medio: sin moiré ni parpadeo al moverse
    float farF = smoothstep(0.22, 0.62, max(fw.x, fw.y));
    vec2 e = fw * 0.8 + 0.002;
    vec2 mm = smoothstep(lo - e, lo + e, f) * (1.0 - smoothstep(hi - e, hi + e, f));
    float win = mm.x * mm.y;
    float cover = (hi.x - lo.x) * (hi.y - lo.y);
    float rnd = hash12(cell + seed * 13.7);
    float lit = step(1.0 - vData.w, rnd);
    float sw = step(0.94, hash12(cell * 1.7 + seed));
    lit = mix(lit, step(0.45, hash12(cell + floor(uTime * 0.03 + rnd * 9.0))), sw);
    float wl = mix(win * lit, cover * vData.w, farF);
    float wm = mix(win, cover, farF);
    float pick = hash11(cell.y * 1.31 + seed * 5.3 + floor(cell.x / 5.0) * 0.7);
    vec3 wc = pick < 0.5 ? vec3(1.0, 0.78, 0.50) : pick < 0.78 ? vec3(0.60, 0.88, 1.0) : pick < 0.92 ? vec3(0.92, 0.93, 1.0) : vec3(1.0, 0.52, 0.82);
    wc = mix(wc, vec3(0.92, 0.78, 0.68), farF);
    float bright = mix(0.7 + 0.6 * hash11(rnd * 91.7), 1.0, farF);
    col = mix(glass * 0.78, glass * 1.05 + refl * 0.06, wm);
    col += vec3(1.0, 0.78, 0.55) * glint * (0.35 + 0.65 * wm); // destello sobre todo en los paños
    emis += wc * wl * bright * mix(0.16, 1.1, uNight);
    // perfiles de neón: aristas verticales (o franjas en cilindros) + corona del tramo
#ifdef CYL
    float sp = width * 0.25;
    float du = abs(fract(u / sp) - 0.5) * sp;
#else
    float du = min(u, width - u);
#endif
    float ew = max(0.22, fwU * 1.4);
    float edge = 1.0 - smoothstep(ew * 0.5, ew, du);
    float cw = max(0.3, fwY * 1.4);
    float crown = 1.0 - smoothstep(cw * 0.5, cw, abs(vTier.y - vFace.y - 1.1));
    emis += neon * max(edge, crown) * trim * mix(0.5, 1.5, uNight);
    // bandas LED horizontales en algunas torres (solo se notan de noche)
    float band = (1.0 - smoothstep(cw * 0.5, cw, abs(fract(vFace.y / 14.0 + h2) - 0.5) * 14.0 - 0.15)) * step(0.72, h2) * trim;
    emis += neon * band * 0.8 * uNight;
    // luz de la calle subiendo por la fachada (noche) + contacto con el suelo
    emis += neon * exp(-vFace.y / 12.0) * 0.2 * uNight;
    col *= mix(0.5, 1.0, smoothstep(0.0, 16.0, vFace.y));
  }
  float el = clamp(dot(emis, vec3(0.3, 0.5, 0.2)), 0.0, 1.0);
  vec3 c = applyFog(col + emis, vWorld, el * 0.4);
  gl_FragColor = vec4(c + ${DITHER}, 1.0);
}
`;

/* --------------------------------- agujas --------------------------------- */
export const SPIRE_VERT = /* glsl */`
attribute vec2 aSpire; // semilla, y base
varying vec3 vWorld;
varying vec3 vNormal;
varying float vH;
void main() {
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vH = position.y;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
export const SPIRE_FRAG = /* glsl */`
${COMMON}
varying vec3 vWorld;
varying vec3 vNormal;
varying float vH;
void main() {
  vec3 N = normalize(vNormal);
  float sunL = max(dot(N, uSunDir), 0.0);
  vec3 base = mix(vec3(0.62, 0.62, 0.86) * (0.55 + 0.6 * sunL), vec3(0.05, 0.05, 0.11), uNight);
  float bands = step(0.82, fract(vH * 7.0));
  vec3 emis = mix(vec3(0.35, 0.85, 1.0), vec3(0.9, 0.5, 1.0), vH) * bands * mix(0.4, 1.3, uNight);
  emis += vec3(1.0, 0.6, 0.95) * smoothstep(0.82, 1.0, vH) * mix(0.5, 1.6, uNight);
  gl_FragColor = vec4(applyFog(base + emis, vWorld, 0.3), 1.0);
}
`;

/* ------------------------------ anillos de neón ---------------------------- */
export const RING_VERT = /* glsl */`
attribute vec2 aRing; // neón, semilla
varying vec3 vWorld;
flat varying vec2 vRing;
varying float vAng;
void main() {
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vRing = aRing;
  vAng = atan(position.z, position.x);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
export const RING_FRAG = /* glsl */`
${COMMON}
varying vec3 vWorld;
flat varying vec2 vRing;
varying float vAng;
void main() {
  vec3 n = neonCol(vRing.x);
  float dir = vRing.y > 0.5 ? 1.0 : -1.0;
  float pulse = pow(0.5 + 0.5 * sin(vAng * 3.0 - uTime * 1.3 * dir + vRing.y * 20.0), 6.0);
  vec3 c = n * mix(0.75, 1.1, uNight) + vec3(1.0) * pulse * mix(0.35, 0.8, uNight);
  c = mix(vec3(0.92, 0.94, 1.0) * 0.9, c, mix(0.7, 1.0, uNight));
  gl_FragColor = vec4(applyFog(c, vWorld, 0.45), 1.0);
}
`;

/* ------------------------------- hologramas ------------------------------- */
export const HOLO_VERT = /* glsl */`
attribute vec4 aHolo; // tipo, color, semilla, aspecto
varying vec2 vUv;
flat varying vec4 vHolo;
varying vec3 vWorld;
void main() {
  vUv = uv;
  vHolo = aHolo;
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
export const HOLO_FRAG = /* glsl */`
${COMMON}
varying vec2 vUv;
flat varying vec4 vHolo;
varying vec3 vWorld;
float sdBox(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float fill(float d, float aa) { return 1.0 - smoothstep(-aa, aa, d); }
void main() {
  float type = vHolo.x;
  vec3 hc = neonCol(vHolo.y);
  float sd = vHolo.z;
  float asp = vHolo.w;
  vec2 p = vUv * 2.0 - 1.0;         // -1..1
  vec2 pa = vec2(p.x * asp, p.y);   // con aspecto
  float aa = max(fwidth(p.y), 0.004) * 1.5;
  float t = uTime + sd * 50.0;
  vec3 c = vec3(0.0);
  float a = 0.0;
  // marco luminoso + fondo de cristal tintado
  float frame = abs(sdBox(p, vec2(0.96), 0.08));
  float border = 1.0 - smoothstep(0.0, aa * 2.0 + 0.015, frame);
  c += hc * border * 1.1;
  a += 0.16;
  if (type < 0.5) {
    // robot mascota: cabeza índigo, visor oscuro, ojos blancos (el derecho mayor), sonrisa cian, antena con orbe
    vec2 q = p * 1.12 + vec2(0.0, 0.06);
    float head = fill(sdBox(q - vec2(0.0, -0.06), vec2(0.74, 0.6), 0.26), aa);
    float visor = fill(sdBox(q - vec2(0.0, 0.0), vec2(0.56, 0.36), 0.16), aa);
    float blink = step(0.06, fract(t * 0.23)) ;
    float eyeL = fill(length((q - vec2(-0.25, 0.04)) * vec2(1.0, mix(4.0, 1.0, blink))) - 0.13, aa);
    float eyeR = fill(length((q - vec2(0.25, 0.05)) * vec2(1.0, mix(4.0, 1.0, blink))) - 0.17, aa);
    vec2 look = vec2(sin(t * 0.5) * 0.04, 0.0);
    float pupL = fill(length(q - vec2(-0.25, 0.04) - look) - 0.06, aa) * blink;
    float pupR = fill(length(q - vec2(0.25, 0.05) - look) - 0.08, aa) * blink;
    float smile = (1.0 - smoothstep(0.0, aa * 2.0 + 0.012, abs(length(q - vec2(0.0, -0.06)) - 0.2) - 0.025)) * step(q.y, -0.16) * visor;
    float ant = (1.0 - smoothstep(0.0, aa * 2.0, abs(q.x) - 0.025)) * step(0.52, q.y) * step(q.y, 0.78);
    float orb = fill(length(q - vec2(0.0, 0.86)) - 0.09, aa);
    vec3 headC = mix(vec3(0.39, 0.40, 0.95), vec3(0.55, 0.36, 0.96), vUv.y);
    c = mix(c, headC, head * 0.95);
    c = mix(c, vec3(0.05, 0.05, 0.16), visor);
    c = mix(c, vec3(1.0), max(eyeL, eyeR));
    c = mix(c, vec3(0.08, 0.08, 0.2), max(pupL, pupR));
    c += vec3(0.2, 0.9, 1.0) * smile * 1.3;
    c = mix(c, vec3(0.75, 0.72, 1.0), ant);
    c = mix(c, vec3(1.0, 0.45, 0.85), orb);
    a = max(a, max(head, max(ant, orb)) * 0.92);
  } else if (type < 1.5) {
    // rótulo vertical: glifos que se desplazan
    float rows = 7.0;
    float y = vUv.y * rows + floor(t * 0.6);
    vec2 gc = vec2(floor(vUv.x * 3.0), floor(y));
    vec2 gf = vec2(fract(vUv.x * 3.0), fract(y));
    float on = step(0.45, hash12(gc + floor(gf * vec2(3.0, 3.0)) * 0.17 + sd));
    float cellm = step(0.15, gf.x) * step(gf.x, 0.85) * step(0.12, gf.y) * step(gf.y, 0.88);
    float glyph = on * cellm * step(0.12, vUv.x) * step(vUv.x, 0.88);
    c += hc * glyph * 1.2;
    a = max(a, glyph * 0.85);
  } else if (type < 2.5) {
    // radar: anillos concéntricos + barrido
    float r = length(pa) / max(asp, 1.0);
    float rings = 1.0 - smoothstep(0.0, aa * 2.0 + 0.01, abs(fract(r * 4.0 - t * 0.25) - 0.5) - 0.44);
    float ang = atan(pa.y, pa.x);
    float sweep = pow(fract((ang + t * 1.2) / 6.2831853), 6.0) * step(r, 0.92);
    float dot1 = fill(length(pa - vec2(0.35, 0.2)) - 0.06, aa) * (0.5 + 0.5 * sin(t * 3.0));
    c += hc * (rings * step(r, 0.95) * 0.9 + sweep * 0.9) + vec3(1.0, 0.8, 0.3) * dot1;
    a = max(a, (rings * step(r, 0.95) + sweep) * 0.6);
  } else if (type < 3.5) {
    // ecualizador
    float nb = 12.0;
    float bx = floor(vUv.x * nb);
    float fx = fract(vUv.x * nb);
    float hgt = 0.18 + 0.7 * abs(sin(t * (1.5 + hash11(bx) * 2.0) + bx * 0.7));
    float bar = step(0.18, fx) * step(fx, 0.82) * step(vUv.y, hgt * 0.86 + 0.07) * step(0.07, vUv.y);
    vec3 bc = mix(hc, vec3(1.0, 0.5, 0.85), vUv.y);
    c += bc * bar * 1.2;
    a = max(a, bar * 0.8);
  } else {
    // insignia: estrella dentro de un círculo (logros de la plataforma)
    float ang = atan(p.y, p.x) + t * 0.2;
    float r = length(p);
    float star = r - (0.42 + 0.18 * cos(5.0 * ang)) * 0.95;
    float sF = fill(star, aa);
    float circ = 1.0 - smoothstep(0.0, aa * 2.0 + 0.012, abs(r - 0.78) - 0.03);
    c += mix(vec3(1.0, 0.78, 0.25), vec3(1.0, 0.92, 0.6), sF) * sF * 1.1 + hc * circ;
    a = max(a, max(sF, circ) * 0.85);
  }
  // líneas de barrido, parpadeo y fallo ocasional
  float scan = 0.82 + 0.18 * sin(vUv.y * 160.0 - uTime * 6.0);
  float flick = 0.9 + 0.1 * sin(t * 37.0) * step(0.93, fract(t * 0.21));
  float k = scan * flick * mix(0.95, 1.0, uNight);
  float fog = fogAmount(vWorld);
  float keep = 1.0 - fog * 0.85;
  // premultiplicado: el color suma luz, alfa oscurece lo que hay detrás
  gl_FragColor = vec4(c * k * keep, a * keep * mix(0.9, 0.85, uNight));
}
`;

/* ------------------------------- tráfico aéreo ----------------------------- */
export const VEHICLE_VERT = /* glsl */`
${COMMON}
uniform float uLineL;
attribute vec4 aLane;   // tipo (0 anillo, 1/3 recta en x, 2/4 recta en z; 3/4 con túnel), radio/eje, altura, velocidad
attribute vec4 aLook;   // color rgb, largo de la estela
attribute float aPhase;
varying vec2 vUv;
varying vec3 vCol;
varying float vA;
void main() {
  vec3 P;
  vec3 T;
  float a = 1.0;
  if (aLane.x < 0.5) {
    float ang = aPhase * 6.2831853 + aLane.w * uTime;
    P = vec3(cos(ang) * aLane.y, aLane.z, sin(ang) * aLane.y);
    T = vec3(-sin(ang), 0.0, cos(ang)) * sign(aLane.w);
  } else {
    float L = uLineL;
    float s = fract(aPhase + aLane.w * uTime / (2.0 * L)) * 2.0 * L - L;
    a = 1.0 - smoothstep(L * 0.75, L, abs(s));
    // tipos 3/4 (puentes): desaparecen en el "túnel" bajo la isla
    if (aLane.x > 2.5) a *= smoothstep(64.0, 72.0, abs(s));
    bool alongX = aLane.x < 1.5 || (aLane.x > 2.5 && aLane.x < 3.5);
    if (alongX) { P = vec3(s, aLane.z, aLane.y); T = vec3(sign(aLane.w), 0.0, 0.0); }
    else { P = vec3(aLane.y, aLane.z, s); T = vec3(0.0, 0.0, sign(aLane.w)); }
  }
  P.y += sin(uTime * 0.7 + aPhase * 40.0) * 0.35;
  vec3 toC = cameraPosition - P;
  float dist = length(toC);
  vec3 side = normalize(cross(T, toC / dist));
  float w = max(0.26, dist * 0.0021);
  float len = aLook.w + w * 3.0;
  float along = position.x + 0.5;   // 0 cola -> 1 cabeza
  vec3 wp = P + T * (along - 0.85) * len + side * position.y * w * 2.0;
  vUv = vec2(along, position.y * 2.0);
  vCol = aLook.rgb;
  vA = a * (1.0 - fogAmount(P) * 0.9) * (1.0 - smoothstep(420.0, 720.0, dist));
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`;
export const VEHICLE_FRAG = /* glsl */`
uniform float uNight;
varying vec2 vUv;
varying vec3 vCol;
varying float vA;
void main() {
  float x = vUv.x;
  float y = abs(vUv.y);
  float across = 1.0 - smoothstep(0.0, 1.0, y);
  across *= across;
  float tail = smoothstep(0.0, 0.85, x);
  tail = tail * tail * tail;
  float head = 1.0 - smoothstep(0.0, 0.14, abs(x - 0.85));
  vec3 c = vCol * tail * across * 1.15 + vec3(1.0, 0.97, 0.92) * head * across * 1.35;
  // premultiplicado: de noche suma luz pura; de día además tapa un poco el
  // fondo para que la estela se vea sobre la neblina clara
  float shape = max(tail * across, head * across);
  gl_FragColor = vec4(c * vA, shape * vA * mix(0.55, 0.0, uNight));
}
`;

/* -------------------------- puntos de luz (balizas) ------------------------ */
export const GLOW_VERT = /* glsl */`
${COMMON}
uniform float uPx;      // píxeles por unidad a distancia 1
attribute vec4 aGlow;   // rgb, tamaño (m)
attribute vec2 aBlink;  // modo (0 fijo, 1 intermitente, 2 pulso), fase
varying vec3 vCol;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float dist = -mv.z;
  float size = aGlow.w * uPx / max(dist, 1.0);
  float a = 1.0;
  if (aBlink.x > 0.5 && aBlink.x < 1.5) a = 0.15 + 0.85 * step(0.55, fract(uTime * 0.55 + aBlink.y));
  else if (aBlink.x > 1.5) a = 0.65 + 0.35 * sin(uTime * 2.0 + aBlink.y * 6.28);
  float s = clamp(size, 2.0, 72.0);
  vA = a * clamp(size / 2.0, 0.3, 1.0) * (1.0 - fogAmount(position) * 0.8) * mix(0.45, 1.0, uNight);
  vCol = aGlow.rgb;
  gl_PointSize = s;
  gl_Position = projectionMatrix * mv;
}
`;
export const GLOW_FRAG = /* glsl */`
varying vec3 vCol;
varying float vA;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  if (d > 1.0) discard;
  float core = exp(-d * 10.0);
  float halo = exp(-d * 2.8) * 0.4;
  gl_FragColor = vec4(vCol * (core * 1.3 + halo) * vA, 1.0);
}
`;

/* ------------------------------ focos (haces) ------------------------------ */
export const BEAM_VERT = /* glsl */`
${COMMON}
attribute vec4 aBase;  // x, y, z, largo
attribute vec4 aBeam;  // inclinación, fase, velocidad, neón
varying float vV;
varying float vEdge;
varying vec3 vCol;
varying float vFog;
void main() {
  vec3 p = position;
  vec3 n = normal;
  p.y *= aBase.w;
  float ct = cos(aBeam.x), st = sin(aBeam.x);
  p = vec3(p.x, p.y * ct - p.z * st, p.y * st + p.z * ct);
  n = vec3(n.x, n.y * ct - n.z * st, n.y * st + n.z * ct);
  float ang = aBeam.y + uTime * aBeam.z;
  float cy = cos(ang), sy = sin(ang);
  p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
  n = vec3(n.x * cy + n.z * sy, n.y, -n.x * sy + n.z * cy);
  vec3 wp = aBase.xyz + p;
  vV = position.y;
  vEdge = abs(dot(normalize(n), normalize(cameraPosition - wp)));
  vCol = neonCol(aBeam.w);
  vFog = fogAmount(wp);
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`;
export const BEAM_FRAG = /* glsl */`
uniform float uNight;
varying float vV;
varying float vEdge;
varying vec3 vCol;
varying float vFog;
void main() {
  float a = pow(1.0 - vV, 1.7) * pow(vEdge, 1.6) * 0.2 * mix(0.12, 1.0, uNight) * (1.0 - vFog * 0.7);
  gl_FragColor = vec4(mix(vCol, vec3(1.0), 0.35) * a, 1.0);
}
`;

/* ------------------------- suelo: calles + canal --------------------------- */
export const GROUND_VERT = /* glsl */`
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
export const GROUND_FRAG = /* glsl */`
${COMMON}
uniform float uBlock;
uniform float uBayIn;
uniform float uBayOut;
uniform float uCamR;
uniform float uOuterFrom;
varying vec3 vWorld;

// una dirección de una calle: d = distancia con signo al eje (m), along = coordenada a lo largo
vec3 streetFlow(float d, float along, float id, float fw, float nearF, float density) {
  float side = d > 0.0 ? 1.0 : -1.0;
  float off = abs(abs(d) - 1.5);
  float lane = 1.0 - smoothstep(0.25, 0.25 + fw * 1.5 + 0.35, off);
  float avenue = step(1.0 - density, hash11(id * 3.17));
  float spd = 7.0 + 9.0 * hash11(id * 1.9);
  float seg = fract((along * side + uTime * spd) / (10.0 + 8.0 * hash11(id)) + hash11(id * 7.0 + side));
  float car = smoothstep(0.5, 0.58, seg) * (1.0 - smoothstep(0.6, 0.98, seg));
  vec3 cc = side > 0.0 ? vec3(0.95, 0.96, 1.0) : vec3(1.0, 0.25, 0.36);
  return cc * car * lane * avenue * nearF;
}

void main() {
  // derivadas antes de cualquier rama
  vec2 p = vWorld.xz;
  vec2 fw = fwidth(p);
  float r = length(p);
  float fwr = fwidth(r);
  vec3 V = normalize(cameraPosition - vWorld);
  float dist = length(cameraPosition - vWorld);
  vec3 col = mix(vec3(0.40, 0.37, 0.58), vec3(0.020, 0.020, 0.048), uNight);
  vec3 emis = vec3(0.0);
  float nearF = 1.0 - smoothstep(120.0, 300.0, dist);

  // ---- calles (isla y barrios exteriores) ----
  float land = 1.0 - smoothstep(uBayIn - 2.0, uBayIn, r) * (1.0 - smoothstep(uOuterFrom - 6.0, uOuterFrom - 4.0, r));
  vec2 q = p / uBlock;
  vec2 dq = (fract(q + 0.5) - 0.5) * uBlock;
  float sx = (1.0 - smoothstep(3.0, 3.0 + fw.x, abs(dq.x))) * land;
  float sz = (1.0 - smoothstep(3.0, 3.0 + fw.y, abs(dq.y))) * land;
  col *= mix(1.12, 0.78, max(sx, sz));
  float lw = max(0.12, fw.x);
  float mark = (1.0 - smoothstep(lw * 0.5, lw, abs(dq.x))) * sx + (1.0 - smoothstep(lw * 0.5, lw, abs(dq.y))) * sz;
  emis += vec3(0.98, 0.75, 0.3) * mark * 0.3 * nearF * mix(0.4, 1.0, uNight);
  emis += streetFlow(dq.x, p.y, floor(q.x + 0.5), fw.x, nearF, 0.6) * sx;
  emis += streetFlow(dq.y, p.x, floor(q.y + 0.5) + 71.0, fw.y, nearF, 0.6) * sz;
  float curb = ((1.0 - smoothstep(3.0, 4.6, abs(dq.x))) * (1.0 - sx) + (1.0 - smoothstep(3.0, 4.6, abs(dq.y))) * (1.0 - sz)) * land;
  emis += vec3(0.55, 0.35, 0.95) * curb * 0.22 * uNight * nearF;

  // ---- plaza de la megatorre: anillos concéntricos luminosos ----
  float plaza = 1.0 - smoothstep(24.0, 25.0, r);
  float pr = 1.0 - smoothstep(0.0, max(0.15, fwr * 1.5), abs(fract(r / 4.0) - 0.5) * 4.0 - 0.15);
  emis += vec3(0.4, 0.8, 1.0) * pr * plaza * 0.5 * mix(0.4, 1.0, uNight);

  // ---- paseo de la orilla exterior: avenida en anillo con tráfico ----
  float dc = r - uCamR;
  float road = 1.0 - smoothstep(7.0, 7.0 + fwr, abs(dc));
  col = mix(col, col * 0.7, road);
  float ang = atan(p.y, p.x);
  emis += streetFlow(dc + (dc > 0.0 ? -1.5 : 1.5) * 0.0, ang * uCamR, 5.0, fwr, 1.0, 1.0) * road;
  emis += vec3(0.6, 0.45, 1.0) * (1.0 - smoothstep(0.0, max(0.25, fwr * 1.5), abs(abs(dc) - 7.4))) * 0.6 * mix(0.4, 1.0, uNight);

  // ---- bahía: agua con reflejo del cielo y de la isla (cilindro "proxy") ----
  float water = smoothstep(uBayIn - fwr, uBayIn + fwr, r) * (1.0 - smoothstep(uBayOut - fwr, uBayOut + fwr, r));
  if (water > 0.001) {
    // ondas: perturban el rayo reflejado (brillos que tiemblan)
    float wv = sin(p.x * 0.35 + uTime * 1.1) * sin(p.y * 0.31 - uTime * 0.9) + sin((p.x + p.y) * 0.9 + uTime * 1.7) * 0.4;
    vec3 Rv = reflect(-V, vec3(0.0, 1.0, 0.0));
    Rv.xz += vec2(wv * 0.035, wv * 0.025);
    Rv = normalize(Rv);
    vec3 sky = skyBase(toSky(Rv));
    float fres = 0.3 + 0.62 * pow(1.0 - max(V.y, 0.0), 4.0);
    vec3 deep = mix(vec3(0.26, 0.25, 0.52), vec3(0.008, 0.008, 0.03), uNight);
    vec3 wcol = mix(deep, sky, fres);
    // reflejo de la isla: rayo desde el agua contra un cilindro de radio 62
    vec2 o = p;
    vec2 dd = Rv.xz;
    float A = dot(dd, dd);
    float B = dot(o, dd);
    float C = dot(o, o) - 62.0 * 62.0;
    float disc = B * B - A * C;
    if (disc > 0.0 && A > 1e-5) {
      float t = (-B - sqrt(disc)) / A;
      if (t > 0.0) {
        vec2 hp = o + dd * t;
        float hy = t * Rv.y;
        float haz = atan(hp.y, hp.x);
        float bid = floor(haz * 14.0);
        float hgt = 46.0 + 70.0 * hash11(bid * 1.7) + 40.0 * step(0.8, hash11(bid * 3.1));
        if (hy < hgt) {
          vec3 bcol = mix(vec3(0.42, 0.42, 0.72), vec3(0.03, 0.03, 0.08), uNight);
          // ventanas reflejadas (puntos estirados por las ondas)
          float wd = step(0.7, hash12(vec2(floor(haz * 90.0), floor(hy / 3.6)))) * mix(0.2, 0.8, uNight);
          vec3 wc = mix(vec3(1.0, 0.78, 0.5), vec3(0.6, 0.88, 1.0), hash11(floor(hy / 3.2) + bid));
          float edgeN = 1.0 - smoothstep(0.0, 2.5, hgt - hy);
          bcol += wc * wd * 0.6 + neonCol(bid) * edgeN * mix(0.5, 1.2, uNight);
          wcol = mix(wcol, bcol, 0.82 * fres + 0.12);
        }
      }
    }
    // estelas de colores (luces de la ciudad estiradas hacia la cámara)
    vec3 toP = vWorld - cameraPosition;
    float az = atan(toP.x, toP.z);
    float hs = hash11(floor(az * 260.0));
    float ripple = 0.5 + 0.5 * sin(dist * 1.3 - uTime * 2.2 + hs * 30.0);
    float streak = step(0.8, hs) * ripple * (1.0 - smoothstep(40.0, 240.0, dist));
    wcol += neonCol(floor(hs * 50.0)) * streak * mix(0.18, 0.7, uNight);
    col = mix(col, wcol, water);
    emis *= 1.0 - water;
  }
  // orillas: línea de neón + halo (isla en violeta, orilla exterior en cian)
  float b1 = abs(r - uBayIn);
  float b2 = abs(r - uBayOut);
  float bw = max(0.2, fwr * 1.5);
  emis += vec3(0.75, 0.45, 1.0) * ((1.0 - smoothstep(bw * 0.5, bw, b1)) * 1.2 + exp(-b1 * 0.9) * 0.3) * mix(0.5, 1.0, uNight);
  emis += vec3(0.25, 0.85, 1.0) * ((1.0 - smoothstep(bw * 0.5, bw, b2)) * 1.2 + exp(-b2 * 0.9) * 0.3) * mix(0.5, 1.0, uNight);
  float el = clamp(dot(emis, vec3(0.3, 0.5, 0.2)), 0.0, 1.0);
  gl_FragColor = vec4(applyFog(col + emis, vWorld, el * 0.3) + ${DITHER}, 1.0);
}
`;

/* --------------------------- silueta del horizonte ------------------------- */
export const FAR_VERT = /* glsl */`
varying vec3 vLocal;
varying vec3 vWorld;
void main() {
  vLocal = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
export const FAR_FRAG = /* glsl */`
${COMMON}
uniform float uFarH;
varying vec3 vLocal;
varying vec3 vWorld;
void main() {
  float az = atan(vLocal.z, vLocal.x);
  float x = (az * 0.15915494 + 0.5) * 820.0;
  float id = floor(x);
  float fx = fract(x);
  float h = 0.05 + pow(hash11(id * 1.37), 2.4) * 0.34;
  float cl = pow(max(0.0, sin(az * 3.0 + 1.3) * 0.5 + 0.5), 3.0) * 0.32 + pow(max(0.0, sin(az * 7.0 + 0.4)), 6.0) * 0.22;
  h += cl * hash11(id * 0.71 + 3.0);
  // agujas ocasionales
  float sp = step(0.965, hash11(id * 4.1)) * (1.0 - smoothstep(0.0, 0.12, abs(fx - 0.5))) * 0.18;
  float y = vLocal.y / uFarH;
  float gap = step(0.84, fx);
  if (y > h + sp || (gap > 0.5 && y > 0.03)) discard;
  vec3 dir = normalize(vWorld - cameraPosition);
  vec3 hz = fogColor(dir);
  vec3 c = mix(hz * mix(0.80, 0.42, uNight), hz, (1.0 - smoothstep(0.0, 0.35, y)) * 0.55);
  // ventanas diminutas encendidas de noche
  vec2 wg = vec2(x * 4.0, y * uFarH / 2.6);
  float dots = step(0.83, hash12(floor(wg))) * step(0.3, fract(wg.x)) * step(0.35, fract(wg.y));
  c += mix(vec3(1.0, 0.75, 0.5), vec3(0.5, 0.85, 1.0), hash11(floor(wg.y) + id)) * dots * uNight * 0.38;
  gl_FragColor = vec4(c + ${DITHER}, 1.0);
}
`;
