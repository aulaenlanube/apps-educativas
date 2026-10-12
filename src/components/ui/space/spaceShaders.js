// GLSL del fondo "espacio". Todo es ShaderMaterial "a mano": sin luces de
// three, sin texturas descargadas, sin postprocesado (los brillos son sprites
// o términos aditivos dentro de cada shader). Los colores se escriben en sRGB.
//
// uNight (0 = tema claro, "amanecer estelar" · 1 = tema oscuro, espacio
// profundo) mezcla las dos paletas en la GPU: cambiar de tema es un fundido de
// un uniform, sin recompilar ni recrear nada.
//
// Dos texturas, ambas generadas al arrancar:
//   uNeb   mapa de nebulosa en proyección GNOMÓNICA hacia -Z (la cámara nunca
//          mira hacia atrás), horneado UNA vez en la GPU (BAKE_FRAG):
//          R = gas cálido · G = gas frío · B = polvo oscuro · A = filamentos.
//   uNoise baldosa periódica 128² de ruido (CPU): turbulencias, bandas, nubes.
// Todo el movimiento (órbitas, convoy, estelas, rocas, polvo) se calcula en el
// vertex shader con uTime: la CPU no toca ni una partícula por frame.

export const COMMON = /* glsl */`
uniform float uTime;
uniform float uNight;
uniform vec3 uSunDir;   // dirección (desde la cámara) a la estrella del sistema
uniform vec3 uSunPos;
uniform vec3 uBhDir;    // dirección al agujero negro
uniform sampler2D uNeb;
uniform sampler2D uNoise;
uniform vec2 uNebG;

float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }

vec4 nebAt(vec3 d) {
  float fz = -d.z;
  if (fz < 0.08) return vec4(0.0);
  vec2 uv = (d.xy / fz) / (2.0 * uNebG) + 0.5;
  vec2 e = smoothstep(vec2(0.0), vec2(0.07), uv) * (1.0 - smoothstep(vec2(0.93), vec2(1.0), uv));
  return texture2D(uNeb, uv) * (e.x * e.y);
}

vec3 skyBg(vec3 d) {
  float y = d.y;
  vec3 top = mix(vec3(0.16, 0.18, 0.60), vec3(0.006, 0.007, 0.024), uNight);
  vec3 mid = mix(vec3(0.33, 0.31, 0.78), vec3(0.014, 0.012, 0.046), uNight);
  vec3 low = mix(vec3(0.58, 0.40, 0.78), vec3(0.028, 0.014, 0.056), uNight);
  vec3 c = mix(low, mid, smoothstep(-0.55, 0.0, y));
  c = mix(c, top, smoothstep(0.0, 0.62, y));
  float b = max(dot(d, uBhDir), 0.0);
  c += mix(vec3(1.0, 0.62, 0.66), vec3(0.42, 0.14, 0.34), uNight) * (pow(b, 40.0) * mix(0.3, 0.45, uNight) + pow(b, 7.0) * 0.1);
  float s = max(dot(d, uSunDir), 0.0);
  c += mix(vec3(1.0, 0.84, 0.74), vec3(0.42, 0.36, 0.90), uNight) * (pow(s, 90.0) * mix(0.35, 0.55, uNight) + pow(s, 10.0) * 0.08);
  return c;
}

// color del cielo en una dirección (lo usan la cúpula y el lente del agujero negro)
vec3 skyColor(vec3 d) {
  vec3 c = skyBg(d);
  vec4 n = nebAt(d);
  float A = n.r, B = n.g, D = n.b, F = n.a;
  vec3 eN = vec3(0.44, 0.10, 0.44) * A + vec3(1.0, 0.52, 0.66) * (A * A * F * 1.2)
          + vec3(0.05, 0.22, 0.52) * B + vec3(0.36, 0.86, 1.0) * (B * B * F * 1.3);
  c *= 1.0 - D * mix(0.16, 0.8, uNight);
  // de día: la nebulosa TIÑE el cielo hacia pasteles (sin quemar a blanco)
  vec3 cd = mix(c, vec3(0.93, 0.62, 0.86), clamp(A * 0.62, 0.0, 0.62));
  cd = mix(cd, vec3(1.0, 0.80, 0.74), clamp(A * F * 0.9, 0.0, 0.42));
  cd = mix(cd, vec3(0.56, 0.74, 0.98), clamp(B * 0.55, 0.0, 0.5));
  cd += vec3(1.0, 0.88, 0.92) * (A * A * F * 0.16 + B * B * F * 0.1);
  cd = mix(cd, cd * vec3(0.84, 0.80, 1.0), D * 0.55);
  return mix(cd, c + eN * 0.85 * (1.0 - D * 0.8), uNight);
}

// rampa de temperatura del disco de acreción (violeta → rosa → ámbar → blanco)
vec3 heat(float k) {
  k = clamp(k, 0.0, 2.2);
  vec3 c = mix(vec3(0.40, 0.14, 0.58), vec3(1.0, 0.42, 0.40), smoothstep(0.0, 0.45, k));
  c = mix(c, vec3(1.0, 0.64, 0.30), smoothstep(0.4, 1.0, k));
  c = mix(c, vec3(1.0, 0.95, 0.86), smoothstep(1.3, 2.2, k));
  return c * (0.2 + k * 0.85);
}
`;

const DITHER = /* glsl */`(hash12(gl_FragCoord.xy) - 0.5) / 160.0`;

// Ruta del convoy (bezier cuadrática estación → puerta) y marco de cada nave.
// La comparten las naves, sus estelas, las balizas, la sonda-robot y el portal.
export const ROUTE = /* glsl */`
uniform vec3 uRouteA;
uniform vec3 uRouteC;
uniform vec3 uRouteE;
uniform float uShipSpeed;
vec3 bez(vec3 a, vec3 c, vec3 e, float u) { float v = 1.0 - u; return v * v * a + 2.0 * u * v * c + u * u * e; }
vec3 bezT(vec3 a, vec3 c, vec3 e, float u) { return normalize(2.0 * (1.0 - u) * (c - a) + 2.0 * u * (e - c)); }
struct ShipF { vec3 pos; vec3 fwd; vec3 up; vec3 side; float scale; float warp; float vis; };
ShipF shipAt(float u, float lx, float ly, float sc) {
  ShipF f;
  vec3 P = bez(uRouteA, uRouteC, uRouteE, u);
  vec3 T = bezT(uRouteA, uRouteC, uRouteE, u);
  vec3 side = normalize(cross(T, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(side, T);
  float conv = 1.0 - smoothstep(0.6, 0.93, u);   // la formación se cierra antes de la puerta
  f.pos = P + (side * lx + up * ly) * conv;
  f.fwd = T; f.up = up; f.side = side;
  float grow = smoothstep(0.0, 0.08, u);          // sale del muelle de la estación
  f.warp = smoothstep(0.84, 0.97, u);              // acelera al entrar en el portal
  f.vis = grow * (1.0 - smoothstep(0.985, 1.0, u));
  f.scale = sc * mix(0.25, 1.0, grow);
  return f;
}
`;

/* ------------------------- horneado de la nebulosa ------------------------- */
export const BAKE_VERT = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
export const BAKE_FRAG = /* glsl */`
uniform vec2 uNebG;
uniform vec3 uBhDir;
uniform vec3 uGalDir;
uniform vec3 uSunDir;
varying vec2 vUv;
float h13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float vn(vec3 p) {
  vec3 i = floor(p); vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = h13(i), b = h13(i + vec3(1.0, 0.0, 0.0)), c = h13(i + vec3(0.0, 1.0, 0.0)), d = h13(i + vec3(1.0, 1.0, 0.0));
  float e = h13(i + vec3(0.0, 0.0, 1.0)), g = h13(i + vec3(1.0, 0.0, 1.0)), h = h13(i + vec3(0.0, 1.0, 1.0)), k = h13(i + vec3(1.0));
  return mix(mix(mix(a, b, f.x), mix(c, d, f.x), f.y), mix(mix(e, g, f.x), mix(h, k, f.x), f.y), f.z);
}
float fbm(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 6; i++) { s += a * vn(p); p = p * 2.03 + vec3(1.7, 9.2, 3.3); a *= 0.5; } return s / 0.984; }
float ridge(vec3 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { float n = 1.0 - abs(vn(p) * 2.0 - 1.0); s += a * n * n; p = p * 2.07 + vec3(5.1, 1.3, 7.7); a *= 0.5; } return s / 0.97; }
vec2 gno(vec3 d) { return d.xy / -d.z; }
void main() {
  vec2 g = (vUv * 2.0 - 1.0) * uNebG;
  vec3 d = normalize(vec3(g, -1.0));
  vec3 p = d * 2.4 + vec3(3.0, 1.0, 7.0);
  vec3 w = vec3(fbm(p), fbm(p + vec3(8.3, 2.8, 1.2)), fbm(p + vec3(1.4, 6.6, 9.1)));
  vec3 pw = p + (w - 0.5) * 2.6;
  float n1 = fbm(pw * 1.15);
  float n2 = fbm(pw * 1.4 + 11.0);
  float dn = fbm(pw * 2.3 + 4.0);
  float fil = ridge(pw * 2.6 + w * 1.5);
  // máscaras de composición (en coordenadas gnomónicas)
  vec2 bh = gno(uBhDir);
  vec2 ga = gno(uGalDir);
  vec2 su = gno(uSunDir);
  // banda galáctica: entra por abajo a la izquierda y sube hacia el agujero negro
  vec2 bd = normalize(vec2(1.0, 0.5));
  vec2 rel = g - bh;
  float across = dot(rel, vec2(-bd.y, bd.x)) + (fbm(p * 0.7) - 0.5) * 0.35;
  float along = dot(rel, bd);
  float band = exp(-across * across / 0.045) * smoothstep(-2.8, -0.9, along) * (1.0 - smoothstep(0.35, 1.0, along));
  float nearBh = exp(-dot(rel, rel) / 0.07);
  float nearGal = exp(-dot(g - ga, g - ga) / 0.18);
  float nearSun = exp(-dot(g - su, g - su) / 0.05);
  // el centro-izquierda (donde va el titular de las páginas) queda más limpio
  float calm = 1.0 - 0.55 * exp(-dot((g - vec2(-0.32, 0.05)) * vec2(1.0, 1.6), (g - vec2(-0.32, 0.05)) * vec2(1.0, 1.6)) / 0.12);
  float A = smoothstep(0.42, 0.86, n1) * (band * 0.95 + nearBh * 0.3 + nearSun * 0.35 + 0.07) * (1.0 - 0.45 * exp(-dot(rel, rel) / 0.012));
  float B = smoothstep(0.44, 0.88, n2) * (nearGal * 0.8 + band * 0.45 + nearSun * 0.4 + 0.1);
  float D = smoothstep(0.5, 0.78, dn) * (band * 0.85 + 0.15) * smoothstep(0.25, 0.6, fil + 0.2);
  A *= calm; B *= calm;
  gl_FragColor = vec4(clamp(A, 0.0, 1.0), clamp(B, 0.0, 1.0), clamp(D, 0.0, 1.0), fil);
}
`;

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
varying vec3 vDir;
void main() {
  vec3 c = skyColor(normalize(vDir));
  gl_FragColor = vec4(c + ${DITHER}, 1.0);
}
`;

/* ------------------- puntos lejanos: estrellas + galaxia ------------------- */
export const FARPTS_VERT = /* glsl */`
uniform float uTime;
uniform float uNight;
uniform float uDpr;
uniform mat4 uGalM;      // marco local de la galaxia → mundo (relativo a la cámara)
uniform float uGalRot;
attribute vec4 aStar;    // tamaño px, fase, temperatura/color, tipo
varying vec3 vCol;
varying float vA;
varying float vSpike;
void main() {
  float kind = aStar.w;
  float t = aStar.z;
  float size = aStar.x;
  float a = 0.8 + 0.2 * sin(uTime * (0.6 + aStar.y * 2.0) + aStar.y * 60.0);
  vec3 col = t < 0.5 ? mix(vec3(0.66, 0.76, 1.0), vec3(1.0, 0.98, 0.94), t * 2.0)
                     : mix(vec3(1.0, 0.98, 0.94), vec3(1.0, 0.78, 0.56), t * 2.0 - 1.0);
  vec3 wp;
  if (kind < 0.5) {
    wp = cameraPosition + position;
  } else if (kind < 1.5) {
    wp = position;
  } else {
    float c = cos(uGalRot), s = sin(uGalRot);
    vec3 lp = vec3(position.x * c - position.y * s, position.x * s + position.y * c, position.z);
    wp = cameraPosition + (uGalM * vec4(lp, 1.0)).xyz;
    col = (t > 0.4 && t < 0.5) ? vec3(1.0, 0.52, 0.80) : (t > 0.7 ? vec3(1.0, 0.88, 0.72) : mix(vec3(0.62, 0.72, 1.0), vec3(0.92, 0.94, 1.0), t * 3.0));
    a *= 0.8;
  }
  vSpike = step(5.0, size);
  // de día las estrellas débiles se pierden en el cielo pastel; quedan las brillantes
  a *= mix(smoothstep(1.3, 3.0, size) * 0.85 + 0.06, 1.0, uNight);
  float px = size * uDpr;
  vA = a * clamp(px, 0.35, 1.0);
  vCol = col;
  gl_PointSize = max(px, 1.0);
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`;
export const FARPTS_FRAG = /* glsl */`
varying vec3 vCol;
varying float vA;
varying float vSpike;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  if (d > 1.0) discard;
  float b;
  if (vSpike > 0.5) {
    float spk = (exp(-abs(p.x) * 30.0) + exp(-abs(p.y) * 30.0)) * (1.0 - sqrt(d));
    b = exp(-d * 34.0) * 1.8 + exp(-d * 5.0) * 0.22 + spk * 0.85;
  } else {
    b = exp(-d * 6.0);
  }
  gl_FragColor = vec4(vCol * b * vA, 1.0);
}
`;

/* ----------------------------- disco de la galaxia ------------------------- */
export const GALAXY_VERT = /* glsl */`
varying vec2 vP;
void main() {
  vP = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
export const GALAXY_FRAG = /* glsl */`
uniform float uNight;
uniform float uGalRot;
uniform sampler2D uNoise;
varying vec2 vP;
void main() {
  vec2 p = vP;
  float r = length(p);
  if (r > 1.2) discard;
  float c = cos(-uGalRot), s = sin(-uGalRot);
  vec2 q = vec2(p.x * c - p.y * s, p.x * s + p.y * c);     // marco que gira con la galaxia
  float a = atan(q.y, q.x);
  float ph = a - log(max(r, 0.012)) * 2.4;                  // espiral logarítmica de 2 brazos
  float arm = pow(0.5 + 0.5 * cos(2.0 * ph), 3.0);
  float n = texture2D(uNoise, q * 1.1 + 0.5).r;
  float n2 = texture2D(uNoise, q * 3.3 + 0.21).g;
  float disk = exp(-r * 3.0) * (1.0 - smoothstep(0.82, 1.15, r));
  float bulge = exp(-r * r * 110.0) * 1.5 + exp(-r * 10.0) * 0.5;
  float arms = arm * disk * (0.6 + 1.1 * n) * smoothstep(0.03, 0.16, r) * 1.6;
  float knots = smoothstep(0.72, 0.9, n2) * arm * disk * 1.4;
  float dust = pow(0.5 + 0.5 * cos(2.0 * (ph + 0.45)), 7.0) * smoothstep(0.05, 0.2, r) * (1.0 - smoothstep(0.55, 0.95, r)) * (0.4 + n2 * 0.9);
  vec3 coreC = mix(vec3(1.0, 0.94, 0.88), vec3(1.0, 0.86, 0.64), uNight);
  vec3 armC = mix(vec3(0.86, 0.90, 1.0), vec3(0.50, 0.60, 1.0), uNight);
  vec3 knotC = mix(vec3(1.0, 0.74, 0.90), vec3(1.0, 0.38, 0.72), uNight);
  vec3 col = coreC * bulge + armC * (arms + disk * 0.22) + knotC * knots;
  col *= mix(0.55, 0.95, uNight);
  float alpha = clamp(dust * mix(0.25, 0.55, uNight), 0.0, 0.7);
  gl_FragColor = vec4(col * (1.0 - alpha), alpha);
}
`;

/* -------------------------------- agujero negro ---------------------------- */
// Lente gravitatoria FALSEADA dentro de un único quad: cada píxel calcula la
// dirección de la que vendría su luz (lente puntual con radio de Einstein uE,
// atenuada hacia el borde del quad para casar con el cielo de detrás) y vuelve
// a evaluar skyColor() ahí + un campo de estrellas procedural: las nebulosas
// y las estrellas se curvan en arcos alrededor del horizonte. Encima: sombra,
// anillo de fotones, disco de acreción (imagen directa + arco lensado por
// encima + arco fino por debajo), brillo Doppler y chorros. Unidades: radio
// de la sombra = 1.
export const BH_VERT = /* glsl */`
uniform float uSize;
varying vec2 vP;
varying vec3 vCenterV;
void main() {
  vP = position.xy;
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vCenterV = mv.xyz;
  mv.xy += position.xy * uSize;
  gl_Position = projectionMatrix * mv;
}
`;
export const BH_FRAG = /* glsl */`
${COMMON}
uniform float uSize;   // semilado del quad en mundo
uniform float uQR;     // semilado del quad en radios de sombra
uniform float uRoll;
uniform float uIncl;   // seno de la elevación sobre el plano del disco
uniform float uE;      // radio de Einstein
varying vec2 vP;
varying vec3 vCenterV;

float emis(float rho, float ang, float speedK) {
  float w = 0.5 * pow(max(rho, 1.0) / 1.4, -1.5) * speedK;
  float u = ang * 0.15915494;
  float n1 = texture2D(uNoise, vec2(u * 3.0 - uTime * w * 0.05, rho * 0.21)).r;
  float n2 = texture2D(uNoise, vec2(u * 8.0 - uTime * w * 0.08, rho * 0.6 + 0.3)).g;
  float streak = 0.4 + 1.0 * n1 * (0.55 + 0.9 * n2);
  return streak * pow(1.45 / max(rho, 1.0), 1.9) * 1.35;
}

void main() {
  float QR = uQR;
  vec2 p = vP * QR;
  float r = length(p);
  if (r > QR) discard;
  float cr = cos(uRoll), sr = sin(uRoll);
  vec2 q = vec2(cr * p.x + sr * p.y, -sr * p.x + cr * p.y);   // marco del disco (horizontal)
  float rq = max(r, 1e-3);

  // ---- fondo lensado ----
  float taper = 1.0 - smoothstep(0.42 * QR, 0.92 * QR, r);
  float defl = (uE * uE) / max(r * r, 0.6) * taper;
  vec2 ps = p * (1.0 - defl);
  vec3 dv = normalize(vCenterV + vec3(ps * (uSize / QR), 0.0));
  vec3 dw = (vec4(dv, 0.0) * viewMatrix).xyz;
  vec3 bg = skyColor(dw);
  vec2 g = dw.xy / max(-dw.z, 0.05) * 330.0;
  vec2 cell = floor(g);
  vec2 h = hash22(cell);
  float st = step(0.975, h.x) * smoothstep(0.34, 0.05, length(fract(g) - 0.25 - 0.5 * h.yx));
  bg += mix(vec3(0.85, 0.85, 1.0), vec3(1.0, 0.95, 0.88), h.y) * st * mix(0.25, 1.1, uNight);
  bg *= 1.0 + 0.3 * exp(-abs(r - uE) * 3.0) * step(1.0, r);  // magnificación junto al anillo de Einstein

  // ---- disco de acreción ----
  float rin = 1.45, rout = 4.6;
  vec2 dq = vec2(q.x, q.y / uIncl);
  float rho = length(dq);
  float phi = atan(dq.y, dq.x);
  float bandD = smoothstep(rin - 0.1, rin + 0.15, rho) * (1.0 - smoothstep(rout * 0.62, rout, rho));
  float hidden = step(0.0, q.y) * (1.0 - smoothstep(0.97, 1.03, r));   // mitad lejana tapada por la sombra
  float direct = bandD * (1.0 - hidden);
  float th = atan(q.y, q.x);
  float rhoL = rin + (r - 1.06) / 0.27;
  float arcB = smoothstep(rin - 0.1, rin + 0.15, rhoL) * (1.0 - smoothstep(rout * 0.62, rout, rhoL));
  float up = smoothstep(-0.08, 0.4, q.y / rq);
  float arc = arcB * up;
  float rhoU = rin + (r - 1.03) / 0.17;
  float dn = smoothstep(0.0, -0.55, q.y / rq);
  float under = smoothstep(rin - 0.06, rin + 0.12, rhoU) * (1.0 - smoothstep(rin + 0.5, rin + 1.5, rhoU)) * dn;

  float beamD = 1.0 - 0.5 * dq.x / max(rho, 0.01);   // el lado que se acerca (izquierda) brilla más
  float beamA = 1.0 - 0.5 * cos(th);
  float eD = emis(rho, phi, 1.0) * beamD;
  float eA = emis(rhoL, th, 1.0) * beamA * 1.5;
  float eU = emis(rhoU * 1.3, -th, 1.0) * beamA * 0.55;
  float gain = mix(1.0, 1.15, uNight);
  vec3 disk = heat(eD * 1.3) * direct + heat(eA) * arc + heat(eU) * under * (1.0 - direct);
  disk *= gain;
  // la mitad cercana del disco es casi opaca: tapa la sombra y el arco inferior
  float occ = clamp(direct * eD * 1.6, 0.0, 1.0) * step(q.y, 0.0);

  // ---- sombra + anillo de fotones ----
  float shadow = 1.0 - smoothstep(0.96, 1.0, r);
  vec3 shadowC = mix(vec3(0.05, 0.035, 0.12), vec3(0.0), uNight);
  vec3 base = mix(bg, shadowC, shadow);
  base *= 1.0 - occ * 0.85;
  float ring = exp(-abs(r - 1.025) * 70.0) * 1.1 + exp(-abs(r - 1.03) * 14.0) * 0.22;
  vec3 ringC = mix(vec3(1.0, 0.86, 0.70), vec3(1.0, 0.80, 0.62), uNight) * (0.8 + 0.5 * beamA);

  // ---- halo y chorros ----
  float halo = exp(-max(r - 1.0, 0.0) * 0.85) * 0.16 + exp(-abs(q.y) * 4.5) * exp(-abs(q.x) * 0.45) * 0.14;
  vec3 haloC = mix(vec3(1.0, 0.62, 0.66), vec3(0.95, 0.42, 0.62), uNight);
  float ay = abs(q.y);
  float jet = exp(-abs(q.x) * 9.0 / (1.0 + ay * 0.3)) * smoothstep(1.15, 2.0, ay) * (1.0 - smoothstep(2.4, QR * 0.9, ay));
  jet *= 0.75 + 0.25 * sin(ay * 5.0 - uTime * 2.4);
  vec3 jetC = vec3(0.45, 0.78, 1.0) * jet * mix(0.18, 0.3, uNight);

  vec3 emissive = disk + ringC * ring * (1.0 - occ) + (haloC * halo * mix(0.7, 1.0, uNight) + jetC) * (1.0 - shadow);
  float A = 1.0 - smoothstep(0.8 * QR, 0.97 * QR, r);
  float fade = 1.0 - smoothstep(0.9 * QR, QR, r);
  gl_FragColor = vec4(base * A + emissive * fade + ${DITHER}, A);
}
`;

/* ------------------- cuerpos: planetas, luna y estrella -------------------- */
// Un quad por cuerpo (instanciado, una llamada) que hace de "impostor": cada
// píxel intersecta su rayo con la esfera EXACTA (sirve igual para el planeta de
// origen, enorme y muy fuera del eje, que para la luna diminuta). Encima:
// iluminación, atmósfera (fresnel), bandas, continentes con ciudades en el lado
// nocturno, cráteres, anillos (intersección rayo-plano) con sombras mutuas y la
// estrella con su corona.
export const BODY_VERT = /* glsl */`
uniform vec3 uSunPos;
uniform float uNight;
attribute vec4 aCenter;  // xyz + radio
attribute vec4 aAxis;    // eje de giro (mundo) + radio exterior del anillo
attribute vec4 aKind;    // tipo, semilla, radio interior del anillo, escala del quad
varying vec3 vRay;
flat varying vec3 vC;
flat varying vec4 vKind;
flat varying vec3 vL;
flat varying vec3 vAx;
flat varying vec2 vRad;
flat varying vec3 vG;
void main() {
  vec4 mv = viewMatrix * vec4(aCenter.xyz, 1.0);
  vG = vec3(0.0, 0.0, -1.0);
  vC = mv.xyz;
  // Quad alineado con la pantalla a la profundidad del centro. Con anillos, fuera
  // del eje la perspectiva estira su proyección por encima de aKind.w radios y el
  // anillo se cortaría en seco: el semilado cubre la proyección de la esfera
  // envolvente (radio E) vista con ángulo th respecto al eje de la cámara.
  float halfQ = aCenter.w * aKind.w;
  if (aAxis.w > 0.0) {
    float D = length(mv.xyz);
    float th = acos(clamp(-mv.z / D, 0.0, 1.0));
    float al = asin(clamp(halfQ / D, 0.0, 0.9));
    float edge = min(th + al, 1.45);
    halfQ = max(halfQ, -mv.z * (tan(edge) - tan(th)) * 1.04);
  }
  mv.xy += position.xy * 2.0 * halfQ;
  vRay = mv.xyz;
  vKind = aKind;
  vec3 Lw = normalize(uSunPos - aCenter.xyz);
  vec3 dc = normalize(aCenter.xyz - cameraPosition);
  if (aKind.x > 0.5 && aKind.x < 1.5) {
    // planeta de origen: contraluz con el sol asomando por el limbo superior
    // (de noche casi todo es lado nocturno con ciudades; de día, media fase)
    vec3 upo = normalize(vec3(0.0, 1.0, 0.0) - dc * dc.y);
    float al = asin(clamp(aCenter.w / length(aCenter.xyz - cameraPosition), 0.0, 1.0));
    float k = al * mix(1.32, 0.9, uNight);
    Lw = normalize(dc * cos(k) + upo * sin(k));
    // punto del limbo por donde "sale el sol" (destello del amanecer)
    vG = normalize(mat3(viewMatrix) * normalize(dc * cos(al * 0.985) + upo * sin(al * 0.985)));
  } else if (aKind.x < 3.5) {
    // resto: algo de luz frontal para que se lea la fase
    Lw = normalize(Lw - dc * 0.7);
  }
  vL = normalize(mat3(viewMatrix) * Lw);
  vAx = normalize(mat3(viewMatrix) * aAxis.xyz);
  vRad = vec2(aCenter.w, aAxis.w);
  gl_Position = projectionMatrix * mv;
}
`;
export const BODY_FRAG = /* glsl */`
uniform float uTime;
uniform float uNight;
uniform sampler2D uNoise;
varying vec3 vRay;
flat varying vec3 vC;
flat varying vec4 vKind;
flat varying vec3 vL;
flat varying vec3 vAx;
flat varying vec2 vRad;
flat varying vec3 vG;

vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float tx(vec2 uv, int ch) { vec4 t = texture2D(uNoise, uv); return ch == 0 ? t.r : ch == 1 ? t.g : ch == 2 ? t.b : t.a; }

void main() {
  vec3 dir = normalize(vRay);
  vec3 C = vC;
  float R = vRad.x;
  float b = dot(dir, C);
  float perp2 = max(dot(C, C) - b * b, 0.0);
  float r = sqrt(perp2) / R;                 // distancia del rayo al centro, en radios
  float aa = max(fwidth(r) * 1.2, 1e-4);
  vec3 q3 = (dir * b - C) / R;               // punto más cercano del rayo, relativo al centro
  float type = vKind.x;

  // ---------------- estrella (con enjambre de Dyson alrededor) ----------------
  if (type > 3.5) {
    float ang = atan(q3.y, q3.x);
    float rays = texture2D(uNoise, vec2(ang * 0.477 + 0.5, uTime * 0.004)).r;
    float rays2 = texture2D(uNoise, vec2(ang * 1.114 + 0.2, uTime * 0.006 + 0.5)).g;
    float disc = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, r);
    float limb = sqrt(max(1.0 - r * r, 0.0));
    vec3 hot = vec3(1.0, 0.96, 0.88);
    vec3 cor = mix(vec3(1.0, 0.80, 0.60), vec3(1.0, 0.64, 0.44), uNight);
    vec3 col = hot * (0.8 + 0.3 * limb) * disc;
    float rr = max(r - 1.0, 0.0);
    float corona = exp(-rr * 2.4) * (0.5 + 0.9 * rays * rays2) * (1.0 - disc);
    float glow = exp(-rr * 0.5) * 0.2 + exp(-rr * 0.12) * 0.05;
    float streak = exp(-abs(q3.y) * 7.0) * exp(-abs(q3.x) * 0.3) * 0.4;  // destello horizontal
    vec3 add = cor * (corona + glow) + mix(vec3(0.95, 0.86, 1.0), vec3(0.78, 0.72, 1.0), uNight) * streak;
    float fade = 1.0 - smoothstep(0.7 * vKind.w, vKind.w, r);
    gl_FragColor = vec4(col + add * fade, disc);
    return;
  }

  vec3 L = vL;
  vec3 N = vAx;
  float ri = vKind.z;
  float ro = vRad.y;
  vec3 col = vec3(0.0);
  float alpha = 0.0;
  vec3 add = vec3(0.0);
  vec3 atmoC = type < 0.5 ? vec3(1.0, 0.72, 0.62) : type < 1.5 ? vec3(0.36, 0.72, 1.0) : type < 2.5 ? vec3(0.7, 0.7, 0.8) : vec3(0.62, 0.92, 1.0);
  float atmo = type < 0.5 ? 0.55 : type < 1.5 ? 1.15 : type < 2.5 ? 0.0 : 0.6;
  float tHit = 1e9;

  if (r < 1.0 + aa) {
    float tc = sqrt(max(1.0 - r * r, 0.0)) * R;
    tHit = b - tc;
    vec3 n = (dir * tHit - C) / R;
    float ndl = dot(n, L);
    float ndv = max(dot(n, -dir), 0.0);
    float lat = dot(n, N);
    vec3 e1 = normalize(cross(N, vec3(0.0, 0.0, 1.0)) + vec3(1e-4));
    vec3 e2 = cross(N, e1);
    float lon = atan(dot(n, e2), dot(n, e1));
    float u = lon * 0.15915494;
    float v = asin(clamp(lat, -1.0, 1.0)) * 0.3183099 + 0.5;
    vec3 alb;
    vec3 emit = vec3(0.0);
    if (type < 0.5) {
      // gigante gaseoso: bandas turbulentas + tormenta
      float uu = u * 2.0 + uTime * 0.0025;
      float w1 = tx(vec2(uu, v * 1.5), 0);
      float w2 = tx(vec2(uu * 3.0, v * 4.0), 1);
      float f = v * 13.0 + (w1 - 0.5) * 1.5 + (w2 - 0.5) * 0.45;
      float bands = 0.5 + 0.5 * sin(f * 3.14159);
      vec3 c1 = mix(vec3(0.98, 0.90, 0.82), vec3(0.95, 0.82, 0.72), uNight);
      vec3 c2 = mix(vec3(0.92, 0.62, 0.50), vec3(0.86, 0.48, 0.42), uNight);
      vec3 c3 = mix(vec3(0.78, 0.60, 0.86), vec3(0.60, 0.40, 0.78), uNight);
      alb = mix(c1, c2, bands);
      alb = mix(alb, c3, smoothstep(0.55, 0.85, tx(vec2(uu * 0.5, v * 0.8), 2)) * 0.6);
      vec2 sp = vec2((fract(uu + 0.35) - 0.5) * 3.2, (v - 0.36) * 9.0);
      float storm = exp(-dot(sp, sp) * 2.2);
      alb = mix(alb, vec3(0.96, 0.54, 0.44), storm * 0.85);
    } else if (type < 1.5) {
      // planeta de origen: océanos, continentes, nubes, casquetes y ciudades de noche
      float uu = u * 2.0 + uTime * 0.0012;
      float c0 = tx(vec2(uu, v * 1.3), 1) * 0.6 + tx(vec2(uu * 3.0, v * 3.9), 2) * 0.3 + tx(vec2(uu * 9.0, v * 11.7), 3) * 0.1;
      float land = smoothstep(0.53, 0.56, c0);
      float coast = smoothstep(0.47, 0.53, c0) * (1.0 - land);
      vec3 ocean = mix(vec3(0.07, 0.24, 0.55), vec3(0.03, 0.11, 0.30), smoothstep(0.3, 0.5, c0));
      ocean = mix(ocean, vec3(0.12, 0.46, 0.70), coast);
      vec3 ground = mix(vec3(0.24, 0.44, 0.30), vec3(0.64, 0.56, 0.42), tx(vec2(uu * 4.0, v * 5.2), 0));
      alb = mix(ocean, ground, land);
      alb = mix(alb, vec3(0.92, 0.96, 1.0), smoothstep(0.78, 0.86, abs(lat)));
      float cu = u * 2.0 + uTime * 0.004;
      float cl = smoothstep(0.5, 0.78, tx(vec2(cu, v * 2.6), 0) * 0.7 + tx(vec2(cu * 4.0, v * 8.0), 3) * 0.3);
      alb = mix(alb, vec3(0.96, 0.97, 1.0), cl * 0.85);
      // luces de ciudades (puntos nítidos sobre tierra firme, solo de noche)
      vec2 cg = vec2(u * 1500.0, v * 700.0);
      vec2 ci = floor(cg);
      vec2 ch = hash22(ci);
      float metro = smoothstep(0.5, 0.82, tx(vec2(uu * 14.0, v * 18.2), 0) * 0.7 + tx(vec2(uu * 41.0, v * 53.0), 2) * 0.3);
      float coastal = smoothstep(0.53, 0.575, c0) * (1.0 - smoothstep(0.6, 0.7, c0));
      float dens = land * (metro * 0.8 + coastal * 0.35 + 0.03);
      vec2 jit = (hash22(ci + 17.0) - 0.5) * 0.62;
      vec2 dl = (fract(cg) - 0.5 - jit) * vec2(1.0, 1.6);
      float bri = 0.45 + 0.55 * fract(ch.y * 7.3);
      float dotm = step(1.0 - dens, fract(ch.x * 13.7 + ch.y * 3.1)) * smoothstep(0.26, 0.02, length(dl)) * bri;
      float night = smoothstep(0.08, -0.2, ndl);
      emit = mix(vec3(1.0, 0.78, 0.42), vec3(0.55, 0.9, 1.0), step(0.85, ch.y)) * dotm * night * (1.0 - cl * 0.8) * mix(1.1, 2.0, uNight);
      // red orbital: anillo de luz sobre el ecuador (la humanidad conectada)
      emit += vec3(0.5, 0.8, 1.0) * exp(-abs(lat) * 260.0) * 0.45 * smoothstep(0.1, -0.1, ndl);
    } else if (type < 2.5) {
      // luna: gris con mares y cráteres
      float c0 = tx(vec2(u * 2.0, v * 1.4), 2);
      float cr = tx(vec2(u * 6.0, v * 4.0), 3);
      alb = mix(vec3(0.74, 0.72, 0.76), vec3(0.44, 0.44, 0.50), smoothstep(0.45, 0.65, c0));
      alb *= 0.8 + 0.35 * smoothstep(0.3, 0.7, cr);
    } else {
      // planeta helado lejano
      float f = v * 8.0 + (tx(vec2(u * 2.0, v * 2.0), 1) - 0.5) * 1.5;
      alb = mix(vec3(0.82, 0.92, 1.0), vec3(0.70, 0.66, 0.96), 0.5 + 0.5 * sin(f * 3.14159));
    }
    // sombra de los anillos sobre el planeta
    float rs = 1.0;
    if (ro > 0.0) {
      float dl = dot(L, N);
      if (abs(dl) > 1e-3) {
        float t = -dot(n, N) / dl;
        if (t > 0.0) {
          float rr = length(n + L * t);
          float band = smoothstep(ri, ri + 0.06, rr) * (1.0 - smoothstep(ro - 0.1, ro, rr));
          rs = 1.0 - band * 0.6 * (0.6 + 0.4 * sin(rr * 40.0));
        }
      }
    }
    float diff = max(ndl, 0.0);
    float wrap = smoothstep(-0.25, 0.4, ndl);
    vec3 amb = mix(vec3(0.17, 0.15, 0.32), vec3(0.03, 0.025, 0.07), uNight);
    // relleno frontal tenue (luz de la nebulosa): el lado oscuro no es un agujero negro
    vec3 fill = mix(vec3(0.16, 0.15, 0.30), vec3(0.06, 0.05, 0.13), uNight) * ndv;
    col = alb * (amb + fill + diff * 1.05 * rs) + emit;
    // atmósfera: fresnel estrecho en el lado iluminado (y algo más allá del terminador)
    float fres = pow(1.0 - ndv, type > 0.5 && type < 1.5 ? 6.0 : 3.0);
    float fwd = pow(max(dot(dir, L), 0.0), 3.0);
    col += atmoC * fres * (wrap + fwd * 2.0) * atmo * 0.8;
    // terminador cálido (amanecer)
    col += vec3(1.0, 0.55, 0.38) * exp(-abs(ndl) * 9.0) * fres * atmo * 0.7;
    alpha = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, r);
  }
  // atmósfera exterior (aditiva): más ancha cuanto más luz recibe ese borde
  if (r > 1.0 - aa && atmo > 0.1) {
    float rr = max(r - 1.0, 0.0);
    float side = dot(normalize(q3), L);
    float lit = smoothstep(-0.55, 0.65, side);
    float k = (type > 0.5 && type < 1.5) ? 30.0 : 14.0;
    float fwd = pow(max(dot(dir, L), 0.0), 3.0);
    vec3 aC = atmoC;
    if (type > 0.5 && type < 1.5) aC = mix(atmoC, vec3(1.0, 0.74, 0.58), smoothstep(0.55, 1.0, side) * mix(0.75, 0.45, uNight));
    add += aC * exp(-rr * k) * (lit + fwd * 1.6) * atmo * mix(0.55, 0.85, uNight);
    add += vec3(1.0, 0.62, 0.42) * exp(-rr * k * 0.6) * exp(-abs(side) * 5.0) * atmo * 0.35; // amanecer en el limbo
  }
  // amanecer: destello del sol asomando por el limbo del planeta de origen
  if (type > 0.5 && type < 1.5) {
    float th = acos(clamp(dot(dir, vG), -1.0, 1.0));
    vec2 dg = dir.xy / -dir.z - vG.xy / -vG.z;
    float glare = exp(-th * 70.0) * 1.1 + exp(-th * 16.0) * 0.28;
    float streak = exp(-abs(dg.y) * 160.0) * exp(-abs(dg.x) * 3.2) * 0.6;
    vec3 sunC = mix(vec3(1.0, 0.78, 0.56), vec3(1.0, 0.88, 0.74), uNight);
    add += sunC * (glare + streak) * mix(0.75, 1.0, uNight);
  }
  // ---------------- anillos (rayo contra el plano del anillo) ----------------
  if (ro > 0.0) {
    float dn = dot(dir, N);
    if (abs(dn) > 1e-4) {
      float tp = dot(C, N) / dn;
      vec3 P = (dir * tp - C) / R;
      float rr = length(P);
      if (tp > 0.0 && rr > ri && rr < ro) {
        float vis = (r >= 1.0 || tp < tHit) ? 1.0 : 0.0;
        float x = (rr - ri) / (ro - ri);
        float dens = 0.3 + 0.7 * texture2D(uNoise, vec2(x * 1.3, 0.37)).r;
        dens *= 0.7 + 0.3 * texture2D(uNoise, vec2(x * 6.1, 0.71)).g;
        dens *= 0.88 + 0.12 * sin(rr * 70.0 + texture2D(uNoise, vec2(x * 3.0, 0.9)).b * 6.0);
        dens *= mix(0.55, 1.0, smoothstep(0.12, 0.3, x));
        dens *= 1.0 - 0.92 * (smoothstep(0.52, 0.55, x) * (1.0 - smoothstep(0.6, 0.63, x)));   // división
        dens *= smoothstep(0.0, 0.05, x) * (1.0 - smoothstep(0.9, 1.0, x));
        float pl = dot(P, L);
        float sh = (pl < 0.0 && length(P - L * pl) < 1.0) ? 0.2 : 1.0;
        vec3 rc = mix(vec3(1.0, 0.92, 0.86), vec3(0.94, 0.82, 0.80), uNight) * (0.35 + 0.75 * abs(dot(N, L))) * sh;
        rc += mix(vec3(0.7, 0.6, 1.0), vec3(0.55, 0.40, 0.95), uNight) * 0.12 * (1.0 - x);
        float ra = dens * 0.85 * vis;
        // premultiplicado: el anillo por delante del disco (o donde el disco no lo tapa)
        col = rc * ra + col * alpha * (1.0 - ra);
        alpha = ra + alpha * (1.0 - ra);
        gl_FragColor = vec4(col + add, alpha);
        return;
      }
    }
  }
  if (alpha <= 0.0 && dot(add, add) < 1e-6) discard;
  gl_FragColor = vec4(col * alpha + add, alpha);
}
`;

/* ---------------- puntos cercanos: enjambre, polvo, balizas, luces -------- */
export const NEARPTS_VERT = /* glsl */`
${COMMON}
${ROUTE}
uniform float uDpr;
uniform float uPx;          // px CSS por unidad de mundo a distancia 1
uniform float uSunR;
uniform mat4 uStationM;
uniform float uStationSpin;
uniform mat4 uGateM;
uniform float uGateR;
attribute vec4 aA;          // rgb + tamaño
attribute vec4 aB;          // tipo + parámetros
varying vec3 vCol;
varying float vA;
void main() {
  float kind = aB.x;
  vec3 wp;
  float px;
  float a = 1.0;
  vec3 col = aA.rgb;
  if (kind < 1.5) {
    // enjambre de Dyson: colectores en órbitas inclinadas alrededor de la estrella
    float rr = position.x * uSunR;
    float ang = position.y + uTime * position.z;
    float node = aB.y, inc = aB.z;
    vec3 e1 = vec3(cos(node), 0.0, sin(node));
    vec3 e2 = vec3(-sin(node) * cos(inc), sin(inc), cos(node) * cos(inc));
    vec3 off = (cos(ang) * e1 + sin(ang) * e2) * rr;
    wp = uSunPos + off;
    vec3 toCam = normalize(cameraPosition - uSunPos);
    float dc = dot(off, toCam);
    float behind = step(dc, 0.0) * step(length(off - toCam * dc), uSunR * 1.1);
    a = (1.0 - behind) * (0.45 + 0.55 * pow(0.5 + 0.5 * sin(ang * 2.0 + aB.w * 40.0 + uTime * 0.6), 2.0));
    a *= 0.75 + 0.25 * step(0.5, fract(aB.w * 7.0)) * sin(uTime * 3.0 + aB.w * 90.0);
    px = aA.w;
  } else if (kind < 2.5) {
    // polvo: caja que envuelve a la cámara y fluye hacia ella (viaje)
    vec3 box = vec3(64.0, 40.0, 90.0);
    vec3 lp = mod(position * box - cameraPosition + vec3(0.0, 0.0, uTime * 1.5), box) - box * 0.5;
    wp = cameraPosition + lp;
    float d = length(lp);
    a = smoothstep(3.0, 9.0, d) * (1.0 - smoothstep(26.0, 42.0, d)) * 0.6;
    px = aA.w;
  } else if (kind < 3.5) {
    // balizas de la ruta: dos filas, con un pulso que corre hacia la puerta
    float s = position.x;
    vec3 P = bez(uRouteA, uRouteC, uRouteE, s);
    vec3 T = bezT(uRouteA, uRouteC, uRouteE, s);
    vec3 side = normalize(cross(T, vec3(0.0, 1.0, 0.0)));
    vec3 upv = cross(side, T);
    wp = P + side * position.y * 6.5 - upv * 3.0;
    float chase = pow(fract(s * 3.0 - uTime * 0.28), 12.0);
    a = 0.55 + 1.6 * chase;
    col = mix(col, vec3(0.55, 0.92, 1.0), chase);
    px = aA.w * uPx / max(length(wp - cameraPosition), 1.0);
  } else if (kind < 4.5) {
    float ang = position.x;
    wp = (uGateM * vec4(vec3(cos(ang), sin(ang), 0.0) * uGateR * 1.12, 1.0)).xyz;
    a = 0.55 + 0.45 * sin(uTime * 2.2 - aB.z * 12.566);
    px = aA.w * uPx / max(length(wp - cameraPosition), 1.0);
  } else {
    vec3 lp = position;
    if (aB.y > 0.5) {
      float c = cos(uStationSpin), s = sin(uStationSpin);
      lp = vec3(lp.x * c + lp.z * s, lp.y, -lp.x * s + lp.z * c);
    }
    wp = (uStationM * vec4(lp, 1.0)).xyz;
    a = aB.w > 1.5 ? 0.7 + 0.3 * sin(uTime * 1.6 + aB.z) : step(0.6, fract(uTime * 0.45 + aB.z * 0.37));
    px = aA.w * uPx / max(length(wp - cameraPosition), 1.0);
  }
  vec4 mv = viewMatrix * vec4(wp, 1.0);
  float s = clamp(px, 1.0, 40.0);
  vA = a * clamp(px, 0.3, 1.0) * mix(0.8, 1.0, uNight);
  vCol = col;
  gl_PointSize = s * uDpr;
  gl_Position = projectionMatrix * mv;
}
`;
export const NEARPTS_FRAG = /* glsl */`
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

/* ------------------------------- asteroides -------------------------------- */
export const ROCK_VERT = /* glsl */`
uniform float uTime;
uniform vec3 uRock0;
uniform vec3 uRock1;
uniform vec3 uRock2;
attribute vec4 aRock;    // fase, ángulo y radio en la sección, tamaño
attribute vec4 aSpin;    // eje + velocidad de giro
varying vec3 vW;
varying vec3 vV;
flat varying float vSeed;
vec3 rot(vec3 v, vec3 k, float a) { float c = cos(a), s = sin(a); return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c); }
void main() {
  float s = fract(aRock.x + uTime * 0.0032);     // fluye de lejos (s=0) hacia la cámara (s=1)
  float v = 1.0 - s;
  vec3 P = v * v * uRock2 + 2.0 * s * v * uRock1 + s * s * uRock0;
  vec3 T = normalize(2.0 * v * (uRock1 - uRock2) + 2.0 * s * (uRock0 - uRock1));
  vec3 side = normalize(cross(T, vec3(0.0, 1.0, 0.0)));
  vec3 upv = cross(side, T);
  float spread = mix(24.0, 7.0, s);
  vec3 off = (side * cos(aRock.y) + upv * sin(aRock.y) * 0.55) * aRock.z * spread;
  float fade = smoothstep(0.0, 0.08, s) * (1.0 - smoothstep(0.9, 1.0, s));
  vec3 lp = rot(position, aSpin.xyz, uTime * aSpin.w + aRock.x * 30.0) * aRock.w * fade;
  vec3 wp = P + off + lp;
  vW = wp;
  vec4 mv = viewMatrix * vec4(wp, 1.0);
  vV = mv.xyz;
  vSeed = aRock.x;
  gl_Position = projectionMatrix * mv;
}
`;
export const ROCK_FRAG = /* glsl */`
${COMMON}
varying vec3 vW;
varying vec3 vV;
flat varying float vSeed;
void main() {
  vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));      // facetas (low-poly)
  vec3 V = normalize(cameraPosition - vW);
  if (dot(n, V) < 0.0) n = -n;
  vec3 L = normalize(uSunPos - vW);
  float diff = max(dot(n, L), 0.0);
  float rim = pow(1.0 - max(dot(n, V), 0.0), 3.0);
  vec3 Lb = uBhDir;
  float bh = max(dot(n, Lb), 0.0);
  float front = max(dot(n, V), 0.0);
  vec3 alb = mix(vec3(0.42, 0.38, 0.46), vec3(0.55, 0.46, 0.40), hash11(vSeed * 91.0));
  vec3 amb = mix(vec3(0.30, 0.27, 0.48), vec3(0.075, 0.06, 0.13), uNight);
  vec3 col = alb * (amb + diff * mix(vec3(1.1, 1.0, 0.95), vec3(1.15, 1.02, 0.92), uNight))
           + alb * bh * mix(vec3(0.55, 0.30, 0.36), vec3(0.85, 0.40, 0.45), uNight)
           + alb * front * mix(vec3(0.42, 0.40, 0.62), vec3(0.10, 0.09, 0.18), uNight)
           + rim * mix(vec3(0.55, 0.50, 0.85), vec3(0.42, 0.34, 0.80), uNight) * 0.8;
  // perspectiva "atmosférica" del espacio: lo lejano se funde con el cielo
  float d = length(vV);
  vec3 sky = skyColor(-V);
  col = mix(col, sky, smoothstep(40.0, 280.0, d) * 0.7);
  gl_FragColor = vec4(col + ${DITHER}, 1.0);
}
`;

/* ----------------------- estación en anillo + puerta ----------------------- */
export const STRUCT_VERT = /* glsl */`
uniform mat4 uStationM;
uniform mat4 uGateM;
uniform float uStationSpin;
attribute float aPart;
varying vec3 vW;
varying vec3 vN;
varying vec2 vUv;
varying vec3 vLocal;
flat varying float vPart;
void main() {
  vec3 lp = position;
  vec3 ln = normal;
  mat4 M;
  if (aPart < 3.5) {
    if (aPart < 1.5) {
      float c = cos(uStationSpin), s = sin(uStationSpin);
      lp = vec3(lp.x * c + lp.z * s, lp.y, -lp.x * s + lp.z * c);
      ln = vec3(ln.x * c + ln.z * s, ln.y, -ln.x * s + ln.z * c);
    }
    M = uStationM;
  } else {
    M = uGateM;
  }
  vec4 wp = M * vec4(lp, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(M) * ln);
  vUv = uv;
  vLocal = position;
  vPart = aPart;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
export const STRUCT_FRAG = /* glsl */`
${COMMON}
uniform float uGateR;
uniform float uShipSpeed;
uniform float uShipPh[12];
uniform int uShipN;
varying vec3 vW;
varying vec3 vN;
varying vec2 vUv;
varying vec3 vLocal;
flat varying float vPart;
void main() {
  vec3 n = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  if (dot(n, V) < 0.0) n = -n;
  vec3 L = normalize(uSunPos - vW);
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(reflect(-L, n), V), 0.0), 24.0);
  float rim = pow(1.0 - max(dot(n, V), 0.0), 2.5);
  vec3 amb = mix(vec3(0.30, 0.28, 0.50), vec3(0.04, 0.035, 0.09), uNight);
  vec3 rimC = mix(vec3(0.70, 0.62, 1.0), vec3(0.45, 0.36, 0.95), uNight);
  vec3 col;
  float part = vPart;
  if (part > 5.5) {
    // ---- portal: otro cielo al otro lado, en remolino ----
    vec2 q = vLocal.xy / 14.3;
    float r = length(q);
    float a = atan(q.y, q.x);
    float sw = a + (1.0 - r) * 4.0 - uTime * 0.35;
    float n1 = texture2D(uNoise, vec2(sw * 0.477, r * 0.8 - uTime * 0.05)).r;
    float n2 = texture2D(uNoise, vec2(sw * 0.954 + 0.3, r * 1.6 - uTime * 0.09)).g;
    vec3 deep = mix(vec3(0.32, 0.30, 0.78), vec3(0.04, 0.03, 0.16), uNight);
    vec3 c1 = vec3(0.30, 0.86, 1.0);
    vec3 c2 = vec3(0.70, 0.45, 1.0);
    col = deep + mix(c1, c2, n2) * pow(n1, 3.0) * (0.25 + 0.9 * r) * mix(0.55, 0.9, uNight);
    // estrellas del otro lado, girando
    vec2 g = vec2(sw * 6.0, r * 18.0);
    vec2 h = hash22(floor(g));
    col += vec3(1.0) * step(0.93, h.x) * smoothstep(0.35, 0.0, length(fract(g) - 0.5)) * (1.0 - r);
    col += vec3(0.9, 0.95, 1.0) * exp(-r * 7.0) * 0.45;                 // garganta
    col += mix(c1, vec3(1.0), 0.3) * smoothstep(0.86, 1.0, r) * 0.6;   // borde del horizonte
    // destello cuando entra una nave (mismas fases que el convoy)
    float fl = 0.0;
    for (int i = 0; i < 12; i++) {
      if (i >= uShipN) break;
      float u = fract(uShipPh[i] + uTime * uShipSpeed);
      fl = max(fl, smoothstep(0.93, 0.95, u) * (1.0 - smoothstep(0.95, 0.975, u)));   // ~1,5 s por nave
    }
    col += vec3(0.75, 0.92, 1.0) * fl * (0.15 + 0.5 * (1.0 - r)) * mix(0.7, 1.0, uNight);
    gl_FragColor = vec4(col + ${DITHER}, 1.0);
    return;
  }
  if (part < 0.5) {
    // anillo habitado: casco claro con filas de ventanas (más visibles de noche)
    vec3 hull = mix(vec3(0.86, 0.86, 0.94), vec3(0.62, 0.62, 0.74), uNight);
    col = hull * (amb + diff * 1.05) + spec * 0.4 + rimC * rim * 0.35;
    float u = vUv.x * 80.0;
    float v = vUv.y;
    float row = (1.0 - smoothstep(0.03, 0.06, abs(v - 0.25))) + (1.0 - smoothstep(0.03, 0.06, abs(v - 0.75)));
    float win = step(0.35, fract(u * 3.0)) * step(0.25, hash11(floor(u * 3.0)));
    vec3 wc = mix(vec3(1.0, 0.80, 0.50), vec3(0.55, 0.90, 1.0), step(0.6, hash11(floor(u * 3.0) + 7.0)));
    col += wc * row * win * mix(0.55, 1.25, uNight);
    float seg = 1.0 - smoothstep(0.0, 0.04, abs(fract(vUv.x * 8.0) - 0.5) - 0.44);
    col *= 1.0 - seg * 0.35;
  } else if (part < 2.5) {
    vec3 hull = mix(vec3(0.74, 0.74, 0.84), vec3(0.50, 0.50, 0.62), uNight);
    col = hull * (amb + diff) + spec * 0.35 + rimC * rim * 0.3;
    col += vec3(0.6, 0.55, 1.0) * step(0.92, fract(vLocal.y * 0.6)) * 0.5 * uNight;
  } else if (part < 3.5) {
    // paneles solares: celdas azules con brillo especular
    vec2 c = fract(vLocal.xz * vec2(1.6, 1.4));
    float grid = step(0.08, c.x) * step(0.08, c.y);
    vec3 cell = mix(vec3(0.20, 0.30, 0.70), vec3(0.08, 0.12, 0.38), uNight);
    col = mix(vec3(0.7), cell, grid) * (amb + diff * 0.9) + spec * 1.2 * vec3(0.8, 0.9, 1.0) + rimC * rim * 0.2;
  } else if (part < 4.5) {
    // anillo de la puerta: metal oscuro con franjas de neón que laten
    vec3 hull = mix(vec3(0.42, 0.40, 0.58), vec3(0.16, 0.15, 0.26), uNight);
    col = hull * (amb + diff) + spec * 0.4 + rimC * rim * 0.45;
    float a = atan(vLocal.y, vLocal.x);
    float strip = 1.0 - smoothstep(0.08, 0.14, abs(vUv.y - 0.5));
    float pulse = 0.55 + 0.45 * sin(a * 8.0 - uTime * 2.0);
    col += mix(vec3(0.30, 0.85, 1.0), vec3(0.75, 0.50, 1.0), 0.5 + 0.5 * sin(a * 2.0)) * strip * pulse * mix(0.8, 1.4, uNight);
  } else {
    // nodos de la puerta: emisores
    vec3 hull = mix(vec3(0.52, 0.50, 0.68), vec3(0.22, 0.20, 0.34), uNight);
    col = hull * (amb + diff) + spec * 0.5 + rimC * rim * 0.4;
    col += vec3(0.40, 0.85, 1.0) * step(0.7, abs(n.z)) * 0.18 * (0.6 + 0.4 * sin(uTime * 2.0 + vLocal.x));
  }
  // perspectiva "atmosférica"
  float d = length(vW - cameraPosition);
  col = mix(col, skyColor(-V), smoothstep(150.0, 420.0, d) * 0.45);
  gl_FragColor = vec4(col + ${DITHER}, 1.0);
}
`;

/* --------------------------------- naves ----------------------------------- */
export const SHIP_VERT = /* glsl */`
uniform float uTime;
${ROUTE}
attribute vec4 aRoute;    // fase, desvío x/y, escala
attribute vec4 aShip;     // tipo, semilla
attribute float aPart;
varying vec3 vW;
varying vec3 vN;
varying vec3 vLocal;
flat varying float vPart;
flat varying vec2 vShip;
varying float vWarp;
void main() {
  float u = fract(aRoute.x + uTime * uShipSpeed);
  ShipF f = shipAt(u, aRoute.y, aRoute.z, aRoute.w);
  vec3 lp = position;
  vec3 ln = normal;
  if (aPart > 0.5 && aPart < 1.5) {
    float a = uTime * 0.5 + aShip.y * 6.28;
    float c = cos(a), s = sin(a);
    lp.xy = mat2(c, -s, s, c) * lp.xy;
    ln.xy = mat2(c, -s, s, c) * ln.xy;
  }
  float sc = f.scale * (aShip.x < 0.5 ? 1.0 : 0.72) * step(0.002, f.vis);
  lp.z *= 1.0 + f.warp * 2.5;
  lp *= sc;
  vec3 wp = f.pos + f.side * lp.x + f.up * lp.y + f.fwd * lp.z;
  vW = wp;
  vN = normalize(f.side * ln.x + f.up * ln.y + f.fwd * ln.z);
  vLocal = position;
  vPart = aPart;
  vShip = aShip.xy;
  vWarp = f.warp;
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`;
export const SHIP_FRAG = /* glsl */`
${COMMON}
varying vec3 vW;
varying vec3 vN;
varying vec3 vLocal;
flat varying float vPart;
flat varying vec2 vShip;
varying float vWarp;
void main() {
  vec3 n = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  if (dot(n, V) < 0.0) n = -n;
  vec3 L = normalize(uSunPos - vW);
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(reflect(-L, n), V), 0.0), 30.0);
  float rim = pow(1.0 - max(dot(n, V), 0.0), 2.5);
  vec3 amb = mix(vec3(0.34, 0.32, 0.54), vec3(0.05, 0.045, 0.11), uNight);
  vec3 accent = vShip.x < 0.5 ? vec3(0.66, 0.55, 0.98) : vec3(0.96, 0.45, 0.71);
  vec3 hull = mix(vec3(0.92, 0.92, 0.98), vec3(0.70, 0.70, 0.82), uNight);
  // franja de color de la flota a lo largo del casco
  float stripe = 1.0 - smoothstep(0.06, 0.12, abs(vLocal.x));
  hull = mix(hull, accent, stripe * step(vPart, 0.5) * 0.85);
  vec3 col = hull * (amb + diff * 1.05) + spec * 0.5 + mix(vec3(0.7, 0.62, 1.0), vec3(0.45, 0.36, 0.95), uNight) * rim * 0.4;
  if (vPart > 0.5 && vPart < 1.5) {
    float a = atan(vLocal.y, vLocal.x);
    float w = step(0.45, fract(a * 3.82)) * step(abs(vLocal.z - 0.5), 0.12);
    col += vec3(1.0, 0.82, 0.55) * w * mix(0.6, 1.3, uNight);
  } else if (vPart > 1.5 && vPart < 2.5) {
    col = mix(col, vec3(0.55, 0.92, 1.0) * 1.6, step(vLocal.z, -2.85));
  } else if (vPart > 2.5) {
    col += vec3(0.4, 0.85, 1.0) * step(0.62, vLocal.z - 2.3) * 0.4 * uNight;
  }
  col = mix(col, vec3(0.85, 0.95, 1.0) * 1.4, vWarp * 0.8);
  float d = length(vW - cameraPosition);
  col = mix(col, skyColor(-V), smoothstep(150.0, 400.0, d) * 0.4);
  gl_FragColor = vec4(col + ${DITHER}, 1.0);
}
`;

/* -------------------------------- estelas ---------------------------------- */
export const STREAK_VERT = /* glsl */`
${COMMON}
${ROUTE}
uniform vec3 uLinkA;
uniform vec3 uLinkC;
uniform vec3 uLinkE;
uniform vec3 uCometPos;
uniform float uPx;
uniform float uRobotSize;
attribute vec4 aStr;
attribute vec4 aStr2;
varying vec2 vQ;
varying float vLen;
varying vec3 vCol;
varying vec3 vCol2;
varying float vA;
varying float vHead;
void main() {
  float type = aStr.x;
  vec3 H;
  vec3 dir;
  float L;
  float W;
  vec3 col;
  vec3 col2;
  float a = 1.0;
  float head = 1.0;
  if (type < 0.5) {
    // motor de nave (y estela de warp al entrar en la puerta)
    float u = fract(aStr.y + uTime * uShipSpeed);
    ShipF f = shipAt(u, aStr.z, aStr.w, aStr2.x);
    float sc = f.scale * (aStr2.y < 0.5 ? 1.0 : 0.72);
    H = f.pos - f.fwd * 3.0 * sc * (1.0 + f.warp * 2.5);
    dir = -f.fwd;
    W = 0.95 * sc;
    L = (7.0 + 34.0 * f.warp) * sc;
    col = mix(vec3(0.40, 0.82, 1.0), vec3(0.78, 0.55, 1.0), aStr2.y);
    col2 = vec3(0.62, 0.40, 1.0);
    a = f.vis * (0.9 + 0.1 * sin(uTime * 23.0 + aStr.y * 50.0));
  } else if (type < 1.5) {
    // propulsor de la sonda-robot (va por delante del convoy)
    float u = fract(0.2 + uTime * uShipSpeed * 1.25);
    ShipF f = shipAt(u, -5.5, 6.5, 1.0);
    float bob = sin(uTime * 1.3) * 0.5;
    H = f.pos + f.up * (bob - 0.36 * uRobotSize);
    dir = normalize(-f.fwd * 0.75 - f.up * 0.65);
    W = 0.75;
    L = 8.0;
    col = vec3(0.40, 0.90, 1.0);
    col2 = vec3(0.92, 0.45, 0.85);
    a = f.vis;
  } else if (type < 2.5) {
    // cometas: cola opuesta a la estrella, deriva lenta
    float i = aStr.y;
    float per = 520.0;
    float ph = fract(uTime / per + i * 0.47);
    vec3 drift = normalize(vec3(1.0, -0.22 - i * 0.2, 0.15)) * (ph - 0.5) * per * 0.55;
    H = uCometPos + vec3(i * -420.0, i * -160.0, i * 380.0) + drift;
    dir = normalize(normalize(H - uSunPos) * 0.8 + vec3(0.0, 0.25, 0.0));
    float dist = length(H - cameraPosition);
    W = dist * mix(0.004, 0.0026, i);
    L = dist * mix(0.12, 0.07, i);
    col = vec3(0.70, 0.92, 1.0);
    col2 = vec3(1.0, 0.72, 0.58);
    a = smoothstep(0.0, 0.12, ph) * (1.0 - smoothstep(0.88, 1.0, ph)) * mix(0.9, 1.0, uNight);
  } else {
    // pulsos del enlace de datos: la IA alimenta la puerta con la estrella
    float u = fract(aStr.y + uTime * 0.012);
    H = bez(uLinkA, uLinkC, uLinkE, u);
    dir = -bezT(uLinkA, uLinkC, uLinkE, u);
    float dist = length(H - cameraPosition);
    W = dist * 1.6 / uPx;
    L = W * (10.0 + 14.0 * aStr2.x);
    col = mix(vec3(0.35, 0.90, 1.0), vec3(0.72, 0.52, 1.0), aStr.z);
    col2 = col;
    a = smoothstep(0.0, 0.08, u) * (1.0 - smoothstep(0.92, 1.0, u)) * 0.85;
    head = 0.6;
  }
  vec3 toCam = normalize(cameraPosition - H);
  vec3 side = normalize(cross(dir, toCam));
  float along = (position.y + 0.5) * (L + 2.0 * W) - W;
  float across = position.x * 2.0 * W;
  vec3 wp = H + dir * along + side * across;
  vQ = vec2(position.x * 2.0, along / W);
  vLen = L / W;
  vCol = col;
  vCol2 = col2;
  vHead = head;
  vA = a * mix(0.75, 1.0, uNight);
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`;
export const STREAK_FRAG = /* glsl */`
varying vec2 vQ;
varying float vLen;
varying vec3 vCol;
varying vec3 vCol2;
varying float vA;
varying float vHead;
void main() {
  float x = vQ.x;
  float y = vQ.y;
  float t = clamp(y / vLen, 0.0, 1.0);
  float hd = exp(-(x * x + y * y) * 2.4) * vHead;
  float wdt = mix(0.55, 0.12, t);
  float tail = step(0.0, y) * pow(1.0 - t, 1.6) * exp(-x * x / (wdt * wdt));
  float core = step(0.0, y) * pow(1.0 - t, 3.0) * exp(-x * x / (wdt * wdt * 0.12));
  vec3 c = mix(vCol, vCol2, t) * (tail * 0.75 + hd * 1.2) + vec3(1.0) * (hd * hd * 0.9 + core * 0.35);
  gl_FragColor = vec4(c * vA, 1.0);
}
`;

/* ----------------------- sonda-robot (la mascota) -------------------------- */
// La mascota de EduApps volando por la ruta como sonda de exploración: dibujada
// con SDF en un quad (cabeza-monitor índigo, visor oscuro, ojo derecho mayor,
// antena con orbe rosa, núcleo cian y propulsor). Proporciones de RobotMascot.
export const ROBOT_VERT = /* glsl */`
uniform float uTime;
${ROUTE}
uniform float uRobotSize;
varying vec2 vP;
varying float vVis;
void main() {
  float u = fract(0.2 + uTime * uShipSpeed * 1.25);
  ShipF f = shipAt(u, -5.5, 6.5, 1.0);
  float bob = sin(uTime * 1.3) * 0.5;
  vec3 c = f.pos + f.up * bob;
  vec4 mv = viewMatrix * vec4(c, 1.0);
  // inclinación hacia donde vuela (en pantalla)
  vec3 fv = mat3(viewMatrix) * f.fwd;
  float tilt = clamp(-fv.x * 0.35, -0.3, 0.3) + sin(uTime * 0.9) * 0.05;
  float ct = cos(tilt), st = sin(tilt);
  vec2 q = position.xy;
  mv.xy += mat2(ct, st, -st, ct) * q * uRobotSize * f.vis;
  vP = position.xy * 2.0;
  vVis = f.vis;
  gl_Position = projectionMatrix * mv;
}
`;
export const ROBOT_FRAG = /* glsl */`
uniform float uTime;
uniform float uNight;
varying vec2 vP;
varying float vVis;
float sdRR(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float sdSeg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
// capa por encima (premultiplicado)
void lay(inout vec4 acc, vec3 c, float d, float aa) {
  float m = 1.0 - smoothstep(-aa, aa, d);
  acc.rgb = c * m + acc.rgb * (1.0 - m);
  acc.a = m + acc.a * (1.0 - m);
}
void main() {
  // coordenadas del SVG de RobotMascot (320 de ancho): x 0..320, y hacia abajo
  vec2 s = vec2(160.0 + vP.x * 175.0, 172.0 - vP.y * 175.0);
  float aa = fwidth(s.x) * 0.9;
  vec4 acc = vec4(0.0);
  vec3 glow = vec3(0.0);
  // propulsor (llama que parpadea)
  float fl = 0.85 + 0.15 * sin(uTime * 31.0);
  vec2 fq = vec2((s.x - 160.0) / (16.0 * (1.0 - (s.y - 290.0) / (54.0 * fl))), s.y);
  float flame = (s.y > 288.0 && s.y < 290.0 + 52.0 * fl) ? 1.0 - smoothstep(0.7, 1.0, abs(fq.x)) : 0.0;
  glow += mix(vec3(0.40, 0.92, 1.0), vec3(0.95, 0.5, 0.9), clamp((s.y - 290.0) / 50.0, 0.0, 1.0)) * flame * 1.3;
  // cuerpo
  vec3 body = mix(vec3(0.55, 0.52, 0.98), vec3(0.22, 0.20, 0.55), clamp((s.y - 184.0) / 100.0, 0.0, 1.0));
  lay(acc, body * 0.9, sdRR(s - vec2(160.0, 278.0), vec2(30.0, 14.0), 10.0), aa);
  lay(acc, body, sdRR(s - vec2(160.0, 228.0), vec2(50.0, 44.0), 36.0), aa);
  // brazos
  vec3 limb = vec3(0.50, 0.48, 0.92);
  lay(acc, limb, sdSeg(s, vec2(100.0, 206.0), vec2(96.0, 250.0)) - 10.0, aa);
  lay(acc, limb, sdSeg(s, vec2(220.0, 206.0), vec2(224.0, 250.0)) - 10.0, aa);
  // núcleo IA
  float core = length(s - vec2(160.0, 226.0));
  lay(acc, vec3(0.06, 0.45, 0.56), core - 13.0, aa);
  lay(acc, vec3(0.93, 1.0, 1.0), core - 5.0, aa);
  glow += vec3(0.4, 0.9, 1.0) * exp(-core * 0.09) * 0.35;
  // cuello
  lay(acc, vec3(0.70, 0.70, 0.86), sdRR(s - vec2(160.0, 178.0), vec2(14.0, 10.0), 5.0), aa);
  // antena + orbe
  lay(acc, vec3(0.31, 0.27, 0.90), sdSeg(s, vec2(160.0, 64.0), vec2(160.0, 40.0)) - 3.0, aa);
  lay(acc, vec3(0.31, 0.27, 0.90), sdSeg(s, vec2(160.0, 40.0), vec2(154.0, 28.0)) - 3.0, aa);
  float orb = length(s - vec2(154.0, 24.0));
  lay(acc, mix(vec3(0.99, 0.90, 1.0), vec3(0.75, 0.20, 0.72), clamp(orb / 10.0, 0.0, 1.0)), orb - 10.0, aa);
  glow += vec3(0.95, 0.55, 0.95) * exp(-orb * 0.1) * (0.35 + 0.15 * sin(uTime * 3.0));
  // orejeras
  lay(acc, limb, sdRR(s - vec2(86.0, 122.0), vec2(10.0, 22.0), 10.0), aa);
  lay(acc, limb, sdRR(s - vec2(234.0, 122.0), vec2(10.0, 22.0), 10.0), aa);
  // carcasa (cabeza-monitor índigo)
  vec3 head = mix(vec3(0.66, 0.68, 0.99), vec3(0.22, 0.19, 0.58), clamp((s.y - 60.0) / 116.0, 0.0, 1.0));
  lay(acc, head, sdRR(s - vec2(160.0, 118.0), vec2(72.0, 58.0), 42.0), aa);
  // visor
  lay(acc, vec3(0.05, 0.045, 0.16), sdRR(s - vec2(160.0, 116.0), vec2(57.0, 32.0), 30.0), aa);
  // ojos (el derecho, mayor) con iris cian
  float e1 = length(s - vec2(138.0, 116.0));
  float e2 = length(s - vec2(182.0, 114.0));
  lay(acc, vec3(0.96, 0.97, 1.0), e1 - 15.0, aa);
  lay(acc, vec3(0.96, 0.97, 1.0), e2 - 19.0, aa);
  lay(acc, vec3(0.32, 0.62, 0.95), e1 - 8.5, aa);
  lay(acc, vec3(0.32, 0.62, 0.95), e2 - 10.5, aa);
  lay(acc, vec3(0.04, 0.04, 0.14), e1 - 4.0, aa);
  lay(acc, vec3(0.04, 0.04, 0.14), e2 - 5.0, aa);
  lay(acc, vec3(1.0), length(s - vec2(135.0, 112.5)) - 2.6, aa);
  lay(acc, vec3(1.0), length(s - vec2(178.0, 109.5)) - 3.2, aa);
  // boca-pantalla con sonrisa cian
  lay(acc, vec3(0.04, 0.04, 0.14), sdRR(s - vec2(160.0, 160.0), vec2(22.0, 8.0), 8.0), aa);
  float sm = abs(length(s - vec2(160.0, 150.0)) - 11.0) - 1.4;
  lay(acc, vec3(0.40, 0.91, 0.98), max(sm, 154.0 - s.y), aa);
  // halo suave alrededor (se lee sobre fondos oscuros y claros)
  float silh = sdRR(s - vec2(160.0, 170.0), vec2(80.0, 140.0), 60.0);
  glow += mix(vec3(0.55, 0.50, 1.0), vec3(0.45, 0.40, 1.0), uNight) * exp(-max(silh, 0.0) * 0.06) * 0.22 * (1.0 - acc.a);
  float lit = mix(1.0, 0.92, uNight);
  gl_FragColor = vec4((acc.rgb * lit + glow) * vVis, acc.a * vVis);
}
`;
