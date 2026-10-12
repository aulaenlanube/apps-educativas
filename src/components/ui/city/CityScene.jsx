// Escena r3f de la ciudad futurista (fondo 3D por defecto de la plataforma).
//
// Composición: la cámara vuela despacio por la orilla exterior de una bahía
// anular (radio CITY.CAM_R) en "travelling" lateral mirando la isla central —
// la megatorre con anillos queda a la derecha y el skyline baja hacia la
// izquierda, donde va el texto de las páginas —. Capas de profundidad: agua con
// reflejos y autopista elevada en primer plano, rascacielos de la isla, la
// orilla de enfrente con sus barrios, luces del extrarradio, silueta lejana en
// el horizonte, niebla de altura, cielo con nubes, planeta anillado y estrellas.
//
// Rendimiento (la fluidez manda sobre el detalle):
//   · ~14 draw calls en total: cada familia de piezas es UNA malla instanciada
//     (torres caja, torres cilindro, agujas, anillos, hologramas, vehículos,
//     focos) o un único Points (balizas + luces lejanas, estrellas).
//   · Ventanas, neones, calles, agua y hologramas son PROCEDURALES en el
//     fragment shader (sin texturas; la única es la banda de nubes, 512×128
//     generada en runtime).
//   · El tráfico se mueve en el vertex shader con uTime: la CPU solo actualiza
//     media docena de uniforms y la cámara por frame.
//   · El cielo se pinta el ÚLTIMO de los opacos en el plano lejano y el suelo
//     después de los edificios: el early-z se ahorra el sombreado tapado.
//   · Los materiales se crean UNA vez; cambiar de densidad solo cambia las
//     geometrías instanciadas (sin recompilar shaders). Cambiar de tema es un
//     fundido de uNight (sin recrear nada).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildCityLayout, CITY } from './cityLayout';
import * as S from './cityShaders';
import { nowSeconds } from '@/components/ui/bg3d/FrameLimiter';

const OMEGA = 0.016;       // rad/s de la órbita (≈1,5 m/s sobre el canal: travelling lento, sin mareo)
const SKY_FOLLOW = 0.96;   // el cielo acompaña el giro: el planeta se queda (casi) sobre la isla
const THETA0 = 0.35;       // ángulo de salida de la cámara (encuadre inicial)
const T_START = 40;        // instante de la "foto" fija (low / movimiento reducido)

function mulberry32(a) {
  return function rng() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Banda de nubes estiradas: canvas 512×128 en escala de grises, cíclico en X.
function makeCloudTexture() {
  const W = 512;
  const H = 128;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  const rng = mulberry32(2026);
  for (let i = 0; i < 64; i++) {
    const x = rng() * W;
    const y = H * (0.4 + 0.55 * Math.pow(rng(), 0.7));
    const rx = 18 + rng() * 75;
    const k = 0.1 + rng() * 0.16;
    const a = 0.12 + rng() * 0.32;
    for (const ox of [-W, 0, W]) {
      ctx.save();
      ctx.translate(x + ox, y);
      ctx.scale(1, k);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.6, `rgba(255,255,255,${a * 0.45})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

function createShared(night) {
  return {
    uTime: { value: T_START },
    uNight: { value: night },
    uSunDir: { value: new THREE.Vector3(0, 0.2, 1).normalize() },
    uSunSky: { value: new THREE.Vector3(0, 0.2, 1).normalize() },
    uSkyRot: { value: new THREE.Vector2(1, 0) },
    uFogDen: { value: 0.0024 },
  };
}

function createMaterials(shared, clouds) {
  const U = (extra = {}) => ({ ...shared, ...extra });
  const base = { toneMapped: false, fog: false };
  const additive = { ...base, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
  const premult = {
    ...base, transparent: true, depthWrite: false, blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendEquation: THREE.AddEquation,
  };
  return {
    sky: new THREE.ShaderMaterial({ ...base, uniforms: U({ uClouds: { value: clouds } }), vertexShader: S.SKY_VERT, fragmentShader: S.SKY_FRAG, side: THREE.BackSide, depthWrite: false }),
    stars: new THREE.ShaderMaterial({ ...additive, uniforms: U({ uDpr: { value: 1 } }), vertexShader: S.STARS_VERT, fragmentShader: S.STARS_FRAG }),
    planet: new THREE.ShaderMaterial({ ...premult, uniforms: U({ uSize: { value: 120 } }), vertexShader: S.PLANET_VERT, fragmentShader: S.PLANET_FRAG }),
    box: new THREE.ShaderMaterial({ ...base, uniforms: U(), vertexShader: S.BUILDING_VERT, fragmentShader: S.BUILDING_FRAG }),
    cyl: new THREE.ShaderMaterial({ ...base, uniforms: U(), defines: { CYL: '' }, vertexShader: S.BUILDING_VERT, fragmentShader: S.BUILDING_FRAG }),
    spire: new THREE.ShaderMaterial({ ...base, uniforms: U(), vertexShader: S.SPIRE_VERT, fragmentShader: S.SPIRE_FRAG }),
    ring: new THREE.ShaderMaterial({ ...base, uniforms: U(), vertexShader: S.RING_VERT, fragmentShader: S.RING_FRAG }),
    holo: new THREE.ShaderMaterial({ ...premult, side: THREE.DoubleSide, uniforms: U(), vertexShader: S.HOLO_VERT, fragmentShader: S.HOLO_FRAG }),
    // el quad se orienta en el vertex shader: DoubleSide para que el sentido de giro no lo descarte
    vehicle: new THREE.ShaderMaterial({ ...premult, side: THREE.DoubleSide, uniforms: U({ uLineL: { value: CITY.LINE_L } }), vertexShader: S.VEHICLE_VERT, fragmentShader: S.VEHICLE_FRAG }),
    glow: new THREE.ShaderMaterial({ ...additive, uniforms: U({ uPx: { value: 500 } }), vertexShader: S.GLOW_VERT, fragmentShader: S.GLOW_FRAG }),
    beam: new THREE.ShaderMaterial({ ...additive, side: THREE.DoubleSide, uniforms: U(), vertexShader: S.BEAM_VERT, fragmentShader: S.BEAM_FRAG }),
    ground: new THREE.ShaderMaterial({
      ...base,
      uniforms: U({
        uBlock: { value: CITY.BLOCK }, uBayIn: { value: CITY.BAY_IN }, uBayOut: { value: CITY.BAY_OUT },
        uCamR: { value: CITY.CAM_R }, uOuterFrom: { value: CITY.OUTER_FROM },
      }),
      vertexShader: S.GROUND_VERT, fragmentShader: S.GROUND_FRAG,
    }),
    far: new THREE.ShaderMaterial({ ...base, side: THREE.BackSide, uniforms: U({ uFarH: { value: 150 } }), vertexShader: S.FAR_VERT, fragmentShader: S.FAR_FRAG }),
  };
}

// Geometrías estáticas (no dependen de la densidad salvo los segmentos del cilindro)
function createStatic() {
  return {
    sky: new THREE.SphereGeometry(900, 32, 16),
    planet: new THREE.PlaneGeometry(1, 1),
    ground: new THREE.CircleGeometry(800, 72).rotateX(-Math.PI / 2),
    far: new THREE.CylinderGeometry(CITY.FAR_R, CITY.FAR_R, 150, 160, 1, true).translate(0, 73, 0),
  };
}

function instanced(geo, mat, pack, attrs) {
  for (const [name, arr, size] of attrs) geo.setAttribute(name, new THREE.InstancedBufferAttribute(arr, size));
  const mesh = new THREE.InstancedMesh(geo, mat, Math.max(pack.count, 1));
  if (pack.count) mesh.instanceMatrix = new THREE.InstancedBufferAttribute(pack.matrices, 16);
  mesh.count = pack.count;
  mesh.frustumCulled = false;
  mesh.visible = pack.count > 0;
  return mesh;
}

// Construye todas las mallas que dependen de la densidad (las que se recrean al
// cambiar de nivel). Devuelve también la lista de geometrías para liberarlas.
function buildDynamic(layout, M) {
  const L = layout;
  const geos = [];
  const track = (g) => { geos.push(g); return g; };

  const boxGeo = track(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0));
  const boxes = instanced(boxGeo, M.box, L.boxes, [['aData', L.boxes.data, 4], ['aTier', L.boxes.tier, 2]]);
  const cylGeo = track(new THREE.CylinderGeometry(0.5, 0.5, 1, L.D.segs, 1, false).translate(0, 0.5, 0));
  const cyls = instanced(cylGeo, M.cyl, L.cyls, [['aData', L.cyls.data, 4], ['aTier', L.cyls.tier, 2]]);
  const spireGeo = track(new THREE.ConeGeometry(0.5, 1, 6, 1, true).translate(0, 0.5, 0));
  const spires = instanced(spireGeo, M.spire, L.spires, [['aSpire', L.spires.data, 2]]);
  const ringGeo = track(new THREE.TorusGeometry(1, 0.035, 5, L.D.segs * 5).rotateX(Math.PI / 2));
  const rings = instanced(ringGeo, M.ring, L.rings, [['aRing', L.rings.data, 2]]);
  const holoGeo = track(new THREE.PlaneGeometry(1, 1));
  const holos = instanced(holoGeo, M.holo, L.holos, [['aHolo', L.holos.data, 4]]);

  // tráfico: un quad instanciado por vehículo (cabeza + estela)
  const quad = new THREE.PlaneGeometry(1, 1);
  const vg = track(new THREE.InstancedBufferGeometry());
  vg.index = quad.index;
  vg.setAttribute('position', quad.getAttribute('position'));
  vg.setAttribute('aLane', new THREE.InstancedBufferAttribute(L.vehicles.lane, 4));
  vg.setAttribute('aLook', new THREE.InstancedBufferAttribute(L.vehicles.look, 4));
  vg.setAttribute('aPhase', new THREE.InstancedBufferAttribute(L.vehicles.phase, 1));
  vg.instanceCount = L.vehicles.count;
  quad.dispose();
  const vehicles = new THREE.Mesh(vg, M.vehicle);
  vehicles.frustumCulled = false;
  vehicles.renderOrder = 5;

  // balizas + luces del extrarradio
  const gg = track(new THREE.BufferGeometry());
  gg.setAttribute('position', new THREE.BufferAttribute(L.glow.pos.subarray(0, L.glow.count * 3), 3));
  gg.setAttribute('aGlow', new THREE.BufferAttribute(L.glow.col.subarray(0, L.glow.count * 4), 4));
  gg.setAttribute('aBlink', new THREE.BufferAttribute(L.glow.blink.subarray(0, L.glow.count * 2), 2));
  const glow = new THREE.Points(gg, M.glow);
  glow.frustumCulled = false;
  glow.renderOrder = 4;

  const sg = track(new THREE.BufferGeometry());
  sg.setAttribute('position', new THREE.BufferAttribute(L.stars.pos, 3));
  sg.setAttribute('aStar', new THREE.BufferAttribute(L.stars.data, 2));
  const stars = new THREE.Points(sg, M.stars);
  stars.frustumCulled = false;
  stars.renderOrder = -2;

  // focos (haces de luz) desde azoteas del centro
  let beams = null;
  if (L.beams.count) {
    const cone = new THREE.CylinderGeometry(7, 0.45, 1, 12, 1, true).translate(0, 0.5, 0);
    const bg = track(new THREE.InstancedBufferGeometry());
    bg.index = cone.index;
    bg.setAttribute('position', cone.getAttribute('position'));
    bg.setAttribute('normal', cone.getAttribute('normal'));
    bg.setAttribute('aBase', new THREE.InstancedBufferAttribute(L.beams.base, 4));
    bg.setAttribute('aBeam', new THREE.InstancedBufferAttribute(L.beams.data, 4));
    bg.instanceCount = L.beams.count;
    cone.dispose();
    beams = new THREE.Mesh(bg, M.beam);
    beams.frustumCulled = false;
    beams.renderOrder = 6;
  }

  const city = new THREE.Group();
  city.add(boxes, cyls, spires, rings, holos, vehicles, glow);
  if (beams) city.add(beams);
  return { city, stars, geos, meshes: [boxes, cyls, spires, rings, holos] };
}

export default function CityScene({ density = 'medium', frozen = false, night = false }) {
  const { camera, gl, size, invalidate } = useThree();
  // objetos estables durante toda la vida del fondo (el primer frame ya sale con
  // la paleta del tema actual, sin fundido)
  const [shared] = useState(() => createShared(night ? 1 : 0));
  const [clouds] = useState(makeCloudTexture);
  const [M] = useState(() => createMaterials(shared, clouds));
  const [ST] = useState(createStatic);
  const layout = useMemo(() => buildCityLayout(density), [density]);
  const dyn = useMemo(() => buildDynamic(layout, M), [layout, M]);

  const skyRef = useRef(null);
  const planetRef = useRef(null);
  const frozenRef = useRef(frozen);
  const lastT = useRef(T_START);
  const nightTarget = useRef(night ? 1 : 0);
  const view = useRef({ aspect: 0, inward: 0.95 });
  const t0 = useRef(nowSeconds());

  useEffect(() => { frozenRef.current = frozen; }, [frozen]);

  useEffect(() => {
    nightTarget.current = night ? 1 : 0;
    if (frozenRef.current) {
      shared.uNight.value = nightTarget.current;
      invalidate();
    }
  }, [night, shared, invalidate]);

  useEffect(() => () => {
    dyn.geos.forEach((g) => g.dispose());
    dyn.meshes.forEach((m) => m.dispose?.());
  }, [dyn]);
  useEffect(() => () => {
    Object.values(M).forEach((m) => m.dispose());
    Object.values(ST).forEach((g) => g.dispose());
    clouds.dispose();
  }, [M, ST, clouds]);

  // Ajustes de encuadre según la forma de la pantalla: en vertical (móvil) se
  // abre el campo de visión y se mira más hacia el centro para que la megatorre
  // y el planeta sigan dentro del plano.
  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const k = THREE.MathUtils.clamp((aspect - 0.5) / 1.3, 0, 1);
    view.current.aspect = aspect;
    view.current.inward = THREE.MathUtils.lerp(1.24, 1.17, k);
    camera.fov = aspect < 0.8 ? 66 : aspect < 1.25 ? 60 : 56;
    camera.near = 0.5;
    camera.far = 2400;
    camera.updateProjectionMatrix();
    // planeta (en espacio del cielo): arriba, en el centro del encuadre (encima
    // de la isla; a la izquierda va el titular de las páginas)
    const look0 = THETA0 + (1 - SKY_FOLLOW) * OMEGA * T_START + Math.PI / 2 + view.current.inward;
    const az = look0 + THREE.MathUtils.lerp(-0.02, -0.06, k);
    const el = THREE.MathUtils.lerp(0.42, 0.34, k);
    if (planetRef.current) {
      planetRef.current.position.set(Math.cos(az) * Math.cos(el) * 850, Math.sin(el) * 850, Math.sin(az) * Math.cos(el) * 850);
    }
    M.planet.uniforms.uSize.value = THREE.MathUtils.lerp(80, 110, k);
    // luz principal: de día el sol bajo DETRÁS de la isla (contraluz: siluetas
    // con borde dorado); de noche, el propio planeta
    const sunAz = az + THREE.MathUtils.lerp(0.12, 0.24, k);
    view.current.daySun = new THREE.Vector3(Math.cos(sunAz) * Math.cos(0.06), Math.sin(0.06), Math.sin(sunAz) * Math.cos(0.06));
    view.current.nightSun = new THREE.Vector3(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el));
    invalidate();
  }, [size.width, size.height, camera, M, invalidate]);

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const u = shared;
    // (en desarrollo, window.__eduCityT adelanta el reloj para revisar el recorrido)
    const dev = import.meta.env.DEV ? Number(window.__eduCityT) || 0 : 0;
    const t = frozenRef.current ? lastT.current + dev : nowSeconds() - t0.current + T_START + dev;
    if (!frozenRef.current) lastT.current = t;
    u.uTime.value = t;

    // fundido de tema (≈1 s); congelado → directo
    const target = nightTarget.current;
    if (frozenRef.current) u.uNight.value = target;
    else u.uNight.value += (target - u.uNight.value) * (1 - Math.exp(-Math.min(delta, 0.1) * 3.5));
    if (Math.abs(target - u.uNight.value) < 0.002) u.uNight.value = target;
    // de día la neblina es más ligera (se ven los colores del cristal)
    u.uFogDen.value = THREE.MathUtils.lerp(0.0017, 0.0024, u.uNight.value);

    // cámara: travelling lateral sobre el canal mirando al centro
    const v = view.current;
    const th = THETA0 + OMEGA * t;
    const ch = 30 + 3 * Math.sin(t * 0.045);
    const R = CITY.CAM_R;
    const cam = state.camera;
    cam.position.set(R * Math.cos(th), ch, R * Math.sin(th));
    const inward = v.inward + 0.06 * Math.sin(t * 0.029);
    const tx = -Math.sin(th); const tz = Math.cos(th);
    const ix = -Math.cos(th); const iz = -Math.sin(th);
    const dx = tx * Math.cos(inward) + ix * Math.sin(inward);
    const dz = tz * Math.cos(inward) + iz * Math.sin(inward);
    const pitch = 0.03 + 0.018 * Math.sin(t * 0.021);
    cam.lookAt(cam.position.x + dx * 100, ch + pitch * 100, cam.position.z + dz * 100);

    // cielo: centrado en la cámara y girando casi con ella (objetos "en el infinito")
    const rot = -SKY_FOLLOW * OMEGA * t;
    if (skyRef.current) {
      skyRef.current.position.copy(cam.position);
      skyRef.current.rotation.y = rot;
    }
    const c = Math.cos(rot); const s = Math.sin(rot);
    u.uSkyRot.value.set(c, s);
    if (v.daySun) {
      tmp.copy(v.daySun).lerp(v.nightSun, u.uNight.value).normalize();
      u.uSunSky.value.copy(tmp);
      // cielo → mundo: rotación de `rot` alrededor de Y
      u.uSunDir.value.set(tmp.x * c + tmp.z * s, tmp.y, -tmp.x * s + tmp.z * c);
    }
    // tamaño de los puntos de luz en píxeles reales
    const fovR = (cam.fov * Math.PI) / 180;
    M.glow.uniforms.uPx.value = (state.size.height * state.gl.getPixelRatio() * 0.5) / Math.tan(fovR / 2);
    M.stars.uniforms.uDpr.value = state.gl.getPixelRatio();
  });

  // métricas para medir presupuestos en desarrollo: window.__eduCityInfo()
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__eduCityInfo = () => ({
      density,
      frozen: frozenRef.current,
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      points: gl.info.render.points,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      dpr: gl.getPixelRatio(),
      instances: {
        boxes: layout.boxes.count, cyls: layout.cyls.count, spires: layout.spires.count, rings: layout.rings.count,
        holos: layout.holos.count, vehicles: layout.vehicles.count, glow: layout.glow.count, stars: layout.stars.count, beams: layout.beams.count,
      },
    });
    window.__eduCityDebug = { M, shared, invalidate, dyn };
    return () => { delete window.__eduCityInfo; delete window.__eduCityDebug; };
  }, [gl, density, layout, M, shared, invalidate, dyn]);

  return (
    <>
      <group ref={skyRef}>
        <mesh geometry={ST.sky} material={M.sky} renderOrder={10} frustumCulled={false} />
        <primitive object={dyn.stars} />
        <mesh ref={planetRef} geometry={ST.planet} material={M.planet} frustumCulled={false} renderOrder={-1} />
      </group>
      <primitive object={dyn.city} />
      <mesh geometry={ST.ground} material={M.ground} renderOrder={1} frustumCulled={false} />
      <mesh geometry={ST.far} material={M.far} renderOrder={2} frustumCulled={false} />
    </>
  );
}
