// Escena r3f del fondo "espacio": el futuro viaje de la humanidad, los robots
// y la IA hacia las estrellas (composición en spaceLayout.js).
//
// La cámara deriva muy despacio (±8 u en lateral, ±10 u en profundidad, ciclo
// de ~4 min) con un leve balanceo de la mirada: lo que está en el infinito
// (estrellas, nebulosa, galaxia, agujero negro) apenas se mueve y lo cercano
// (rocas, estación, convoy) se desplaza más → paralaje entre capas sin mareo.
// El polvo fluye hacia la cámara y el convoy avanza hacia la puerta: viaje.
//
// Rendimiento (la fluidez manda sobre el detalle):
//   · 11 draw calls en total: cada familia es UNA malla instanciada (rocas,
//     naves, estelas, cuerpos celestes) o un único Points (puntos lejanos:
//     estrellas + galaxia; puntos cercanos: enjambre de Dyson, polvo, balizas,
//     luces de estación y puerta). Estación + puerta son una sola geometría.
//   · Sin texturas descargadas: la nebulosa se hornea UNA vez en la GPU
//     (1024×672, ~2 ms) y se rehornea solo si cambia el encuadre o se
//     recupera el contexto WebGL; el ruido es una baldosa 128² hecha en CPU.
//   · Todo el movimiento va en el vertex shader con uTime: la CPU por frame
//     solo mueve la cámara y una docena de uniforms.
//   · Sin postprocesado: la lente gravitatoria y los brillos se resuelven
//     dentro del quad de cada objeto. Los quads grandes están acotados: el
//     agujero negro es un círculo (~15 % de la pantalla) y el impostor del
//     planeta de origen descarta en cuanto sale de su atmósfera.
//   · El cielo se pinta el ÚLTIMO de los opacos en el plano lejano (early-z).
//   · Los materiales se crean UNA vez; cambiar de densidad solo cambia
//     geometrías instanciadas (sin recompilar). Cambiar de tema es un fundido
//     de uNight. Cambiar el tamaño de la ventana solo recoloca uniforms.
//
// Medido con renderer.info (window.__eduSpaceInfo() en desarrollo), por densidad:
//   high   11 draw calls · ~33 k triángulos · ~19,5 k puntos
//          (300 rocas ico-1, 9 naves, 5 cuerpos, 9 k estrellas de galaxia, 3,4 k colectores)
//   medium 11 draw calls · ~21,8 k triángulos · ~12,2 k puntos
//          (170 rocas ico-1, 7 naves, 5,6 k estrellas de galaxia, 2,1 k colectores)
//   low    11 draw calls · ~9,1 k triángulos · ~6,3 k puntos
//          (90 rocas ico-0, 5 naves, 2,8 k estrellas de galaxia, 1,1 k colectores, sin polvo)
// Casi todos los puntos miden 1-3 px (solo ~30 estrellas brillantes llegan a 16 px).
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  SPACE, DENSITY, SHIP_SPEED, composeSpace, buildBodies, buildFarPoints, buildNearPoints,
  buildRocks, buildShips, buildStreaks, makeNoiseTile, buildStructureGeometry,
  buildShipGeometry, buildRockGeometry,
} from './spaceLayout';
import * as S from './spaceShaders';
import { nowSeconds } from '@/components/ui/bg3d/FrameLimiter';

const OMEGA = (Math.PI * 2) / 250; // ciclo de la deriva de la cámara (s)
const T_START = 14;                // instante de la "foto" fija (low / movimiento reducido)
const ROBOT_SIZE = 8.5;
const GATE_R = 15;

function makeNoiseTexture() {
  const N = SPACE.NOISE;
  const tex = new THREE.DataTexture(makeNoiseTile(N), N, N, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  // sin mipmaps: las coordenadas polares tienen costura y el ruido es suave
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeNebulaTarget() {
  const [w, h] = SPACE.NEB_SIZE;
  const rt = new THREE.WebGLRenderTarget(w, h, {
    depthBuffer: false, stencilBuffer: false, generateMipmaps: false,
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    type: THREE.UnsignedByteType, format: THREE.RGBAFormat,
  });
  rt.texture.colorSpace = THREE.NoColorSpace;
  return rt;
}

function createShared(night, noise, neb) {
  return {
    uTime: { value: T_START },
    uNight: { value: night },
    uSunDir: { value: new THREE.Vector3(0, 0.3, -1).normalize() },
    uSunPos: { value: new THREE.Vector3(0, 700, -2500) },
    uBhDir: { value: new THREE.Vector3(0.4, 0.27, -0.9).normalize() },
    uNeb: { value: neb },
    uNoise: { value: noise },
    uNebG: { value: new THREE.Vector2(SPACE.NEB_G[0], SPACE.NEB_G[1]) },
    uRouteA: { value: new THREE.Vector3() },
    uRouteC: { value: new THREE.Vector3() },
    uRouteE: { value: new THREE.Vector3() },
    uShipSpeed: { value: SHIP_SPEED },
    uStationM: { value: new THREE.Matrix4() },
    uStationSpin: { value: 0 },
    uGateM: { value: new THREE.Matrix4() },
    uGateR: { value: GATE_R },
    uPx: { value: 900 },
    uDpr: { value: 1 },
  };
}

function createMaterials(shared) {
  const U = (extra = {}) => ({ ...shared, ...extra });
  const base = { toneMapped: false, fog: false };
  const additive = { ...base, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
  const premult = {
    ...base, transparent: true, depthWrite: false, blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendEquation: THREE.AddEquation,
  };
  return {
    sky: new THREE.ShaderMaterial({ ...base, uniforms: U(), vertexShader: S.SKY_VERT, fragmentShader: S.SKY_FRAG, side: THREE.BackSide, depthWrite: false }),
    far: new THREE.ShaderMaterial({
      ...additive,
      uniforms: U({ uGalM: { value: new THREE.Matrix4() }, uGalRot: { value: 0 } }),
      vertexShader: S.FARPTS_VERT, fragmentShader: S.FARPTS_FRAG,
    }),
    galaxy: new THREE.ShaderMaterial({ ...premult, side: THREE.DoubleSide, uniforms: U({ uGalRot: { value: 0 } }), vertexShader: S.GALAXY_VERT, fragmentShader: S.GALAXY_FRAG }),
    bh: new THREE.ShaderMaterial({
      ...premult,
      uniforms: U({ uSize: { value: 100 }, uQR: { value: 5.2 }, uRoll: { value: -0.2 }, uIncl: { value: 0.2 }, uE: { value: 1.75 } }),
      vertexShader: S.BH_VERT, fragmentShader: S.BH_FRAG,
    }),
    body: new THREE.ShaderMaterial({ ...premult, uniforms: U(), vertexShader: S.BODY_VERT, fragmentShader: S.BODY_FRAG }),
    near: new THREE.ShaderMaterial({ ...additive, uniforms: U({ uSunR: { value: 26 } }), vertexShader: S.NEARPTS_VERT, fragmentShader: S.NEARPTS_FRAG }),
    rock: new THREE.ShaderMaterial({
      ...base,
      uniforms: U({ uRock0: { value: new THREE.Vector3() }, uRock1: { value: new THREE.Vector3() }, uRock2: { value: new THREE.Vector3() } }),
      vertexShader: S.ROCK_VERT, fragmentShader: S.ROCK_FRAG,
    }),
    struct: new THREE.ShaderMaterial({
      ...base,
      uniforms: U({ uShipPh: { value: new Array(SPACE.MAX_SHIPS).fill(0) }, uShipN: { value: 0 } }),
      vertexShader: S.STRUCT_VERT, fragmentShader: S.STRUCT_FRAG,
    }),
    ship: new THREE.ShaderMaterial({ ...base, uniforms: U(), vertexShader: S.SHIP_VERT, fragmentShader: S.SHIP_FRAG }),
    // el quad se orienta en el vertex shader: DoubleSide para que el sentido de giro no lo descarte
    streak: new THREE.ShaderMaterial({
      ...additive, side: THREE.DoubleSide,
      uniforms: U({
        uLinkA: { value: new THREE.Vector3() }, uLinkC: { value: new THREE.Vector3() }, uLinkE: { value: new THREE.Vector3() },
        uCometPos: { value: new THREE.Vector3() }, uRobotSize: { value: ROBOT_SIZE },
      }),
      vertexShader: S.STREAK_VERT, fragmentShader: S.STREAK_FRAG,
    }),
    robot: new THREE.ShaderMaterial({ ...premult, side: THREE.DoubleSide, uniforms: U({ uRobotSize: { value: ROBOT_SIZE } }), vertexShader: S.ROBOT_VERT, fragmentShader: S.ROBOT_FRAG }),
  };
}

// quads instanciados (una llamada por familia)
function instancedQuads(count, attrs) {
  const quad = new THREE.PlaneGeometry(1, 1);
  const g = new THREE.InstancedBufferGeometry();
  g.index = quad.index;
  g.setAttribute('position', quad.getAttribute('position'));
  for (const [name, arr, size] of attrs) g.setAttribute(name, new THREE.InstancedBufferAttribute(arr, size));
  g.instanceCount = count;
  quad.dispose();
  return g;
}

function instancedFrom(baseGeo, count, attrs) {
  const g = new THREE.InstancedBufferGeometry();
  for (const name of Object.keys(baseGeo.attributes)) g.setAttribute(name, baseGeo.getAttribute(name));
  if (baseGeo.index) g.index = baseGeo.index;
  for (const [name, arr, size] of attrs) g.setAttribute(name, new THREE.InstancedBufferAttribute(arr, size));
  g.instanceCount = count;
  return g;
}

function createStatic() {
  const shipBase = buildShipGeometry();
  const bodyGeo = instancedQuads(5, [
    ['aCenter', new Float32Array(20), 4], ['aAxis', new Float32Array(20), 4], ['aKind', new Float32Array(20), 4],
  ]);
  bodyGeo.instanceCount = 0;
  return {
    sky: new THREE.SphereGeometry(SPACE.SKY_R, 32, 16),
    galaxy: new THREE.PlaneGeometry(2.4, 2.4),
    bh: new THREE.CircleGeometry(1, 48),
    body: bodyGeo,
    struct: buildStructureGeometry(),
    shipBase,
    robot: new THREE.PlaneGeometry(1, 1),
    rockGeo: [buildRockGeometry(0), buildRockGeometry(1)],
    bake: new THREE.PlaneGeometry(2, 2),
  };
}

function mesh(geo, mat, order) {
  const m = new THREE.Mesh(geo, mat);
  m.frustumCulled = false;
  m.renderOrder = order;
  return m;
}

// Mallas que dependen de la densidad (se recrean al cambiar de nivel)
function buildDynamic(density, M, ST) {
  const D = DENSITY[density] || DENSITY.medium;
  const geos = [];
  const track = (g) => { geos.push(g); return g; };

  const F = buildFarPoints(density);
  const fg = track(new THREE.BufferGeometry());
  fg.setAttribute('position', new THREE.BufferAttribute(F.pos, 3));
  fg.setAttribute('aStar', new THREE.BufferAttribute(F.data, 4));
  const far = new THREE.Points(fg, M.far);
  far.frustumCulled = false;
  far.renderOrder = -4;

  const N = buildNearPoints(density);
  const ng = track(new THREE.BufferGeometry());
  ng.setAttribute('position', new THREE.BufferAttribute(N.pos, 3));
  ng.setAttribute('aA', new THREE.BufferAttribute(N.A, 4));
  ng.setAttribute('aB', new THREE.BufferAttribute(N.B, 4));
  const near = new THREE.Points(ng, M.near);
  near.frustumCulled = false;
  near.renderOrder = 2;

  const R = buildRocks(density);
  const rockGeo = ST.rockGeo[D.rockDetail];
  const rg = track(instancedFrom(rockGeo, R.count, [['aRock', R.rock, 4], ['aSpin', R.spin, 4]]));
  const rocks = mesh(rg, M.rock, 0);

  const SH = buildShips(density);
  const sg = track(instancedFrom(ST.shipBase, SH.count, [['aRoute', SH.route, 4], ['aShip', SH.ship, 4]]));
  const ships = mesh(sg, M.ship, 0);

  const STK = buildStreaks(density, SH);
  const kg = track(instancedQuads(STK.count, [['aStr', STK.a, 4], ['aStr2', STK.b, 4]]));
  const streaks = mesh(kg, M.streak, 3);

  return {
    far, near, rocks, ships, streaks, geos, phases: SH.phases,
    counts: { far: F.count, near: N.count, rocks: R.count, ships: SH.count, streaks: STK.count },
  };
}

export default function SpaceScene({ density = 'medium', frozen = false, night = false }) {
  const { camera, gl, size, invalidate } = useThree();
  const [noise] = useState(makeNoiseTexture);
  const [nebRT] = useState(makeNebulaTarget);
  const [shared] = useState(() => createShared(night ? 1 : 0, noise, nebRT.texture));
  const [M] = useState(() => createMaterials(shared));
  const [ST] = useState(createStatic);
  const [bake] = useState(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uNebG: shared.uNebG,
        uBhDir: { value: new THREE.Vector3() },
        uGalDir: { value: new THREE.Vector3() },
        uSunDir: { value: new THREE.Vector3() },
      },
      vertexShader: S.BAKE_VERT, fragmentShader: S.BAKE_FRAG, depthTest: false, depthWrite: false, toneMapped: false,
    });
    const scene = new THREE.Scene();
    const quad = new THREE.Mesh(ST.bake, mat);
    quad.frustumCulled = false;
    scene.add(quad);
    return { mat, scene, cam: new THREE.Camera(), key: '' };
  });
  const dyn = useMemo(() => buildDynamic(density, M, ST), [density, M, ST]);

  const skyRef = useRef(null);
  const bhRef = useRef(null);
  const galRef = useRef(null);
  const frozenRef = useRef(frozen);
  const lastT = useRef(T_START);
  const nightTarget = useRef(night ? 1 : 0);
  const t0 = useRef(nowSeconds());
  const compRef = useRef(null);

  useEffect(() => { frozenRef.current = frozen; }, [frozen]);

  useEffect(() => {
    nightTarget.current = night ? 1 : 0;
    if (frozenRef.current) {
      shared.uNight.value = nightTarget.current;
      invalidate();
    }
  }, [night, shared, invalidate]);

  // fases del convoy para el destello del portal
  useEffect(() => {
    const arr = M.struct.uniforms.uShipPh.value;
    arr.fill(0);
    dyn.phases.forEach((p, i) => { arr[i] = p; });
    M.struct.uniforms.uShipN.value = dyn.phases.length;
  }, [dyn, M]);

  useEffect(() => () => { dyn.geos.forEach((g) => g.dispose()); }, [dyn]);
  useEffect(() => () => {
    Object.values(M).forEach((m) => m.dispose());
    ST.sky.dispose(); ST.galaxy.dispose(); ST.bh.dispose(); ST.body.dispose(); ST.struct.dispose();
    ST.shipBase.dispose(); ST.robot.dispose(); ST.bake.dispose();
    ST.rockGeo.forEach((g) => g.dispose());
    bake.mat.dispose();
    noise.dispose();
    nebRT.dispose();
  }, [M, ST, bake, noise, nebRT]);

  // Horneado de la nebulosa (y re-horneado tras recuperar el contexto WebGL)
  const doBake = useMemo(() => () => {
    const comp = compRef.current;
    if (!comp) return;
    bake.mat.uniforms.uBhDir.value.copy(comp.bhDir);
    bake.mat.uniforms.uGalDir.value.copy(comp.galDir);
    bake.mat.uniforms.uSunDir.value.copy(comp.sunDir);
    const prev = gl.getRenderTarget();
    gl.setRenderTarget(nebRT);
    gl.render(bake.scene, bake.cam);
    gl.setRenderTarget(prev);
  }, [gl, nebRT, bake]);

  useEffect(() => {
    const el = gl.domElement;
    const onRestored = () => { doBake(); invalidate(); };
    el.addEventListener('webglcontextrestored', onRestored);
    return () => el.removeEventListener('webglcontextrestored', onRestored);
  }, [gl, doBake, invalidate]);

  // Encuadre según la forma de la pantalla: recoloca todo por uniforms.
  useLayoutEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const comp = composeSpace(aspect);
    compRef.current = comp;
    camera.fov = comp.fov;
    camera.near = 0.5;
    camera.far = SPACE.FAR;
    camera.updateProjectionMatrix();

    shared.uSunPos.value.copy(comp.sunPos);
    shared.uSunDir.value.copy(comp.sunDir);
    shared.uBhDir.value.copy(comp.bhDir);
    shared.uRouteA.value.copy(comp.route[0]);
    shared.uRouteC.value.copy(comp.route[1]);
    // el convoy termina un poco DETRÁS del plano del portal (lo tapa al cruzarlo)
    shared.uRouteE.value.copy(comp.route[2]).addScaledVector(comp.gateAxis, -9);
    M.streak.uniforms.uLinkA.value.copy(comp.link[0]);
    M.streak.uniforms.uLinkC.value.copy(comp.link[1]);
    M.streak.uniforms.uLinkE.value.copy(comp.link[2]);
    M.streak.uniforms.uCometPos.value.copy(comp.cometPos);
    M.rock.uniforms.uRock0.value.copy(comp.rockP[0]);
    M.rock.uniforms.uRock1.value.copy(comp.rockP[1]);
    M.rock.uniforms.uRock2.value.copy(comp.rockP[2]);
    M.near.uniforms.uSunR.value = comp.C.sun.R;

    // estación: eje inclinado hacia la cámara (el anillo se ve en elipse)
    const sQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.95, 0.35, -0.42));
    shared.uStationM.value.compose(comp.stationPos, sQ, new THREE.Vector3(1, 1, 1).multiplyScalar(comp.C.station.R / 9.6));
    // puerta: su eje local Z mira hacia la estación (y algo hacia la cámara)
    const gQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), comp.gateAxis);
    shared.uGateM.value.compose(comp.gatePos, gQ, new THREE.Vector3(1, 1, 1).multiplyScalar(comp.C.gate.R / GATE_R));

    // cuerpos (billboards instanciados)
    const B = buildBodies(comp);
    const g = ST.body;
    g.getAttribute('aCenter').array.set(B.center);
    g.getAttribute('aAxis').array.set(B.axis);
    g.getAttribute('aKind').array.set(B.kind);
    ['aCenter', 'aAxis', 'aKind'].forEach((n) => { g.getAttribute(n).needsUpdate = true; });
    g.instanceCount = B.count;

    // agujero negro (en el infinito: grupo del cielo)
    const bhDist = 2100;
    const QR = M.bh.uniforms.uQR.value;
    M.bh.uniforms.uSize.value = bhDist * Math.tan(comp.C.bh.b * QR);
    M.bh.uniforms.uRoll.value = comp.C.bh.roll;
    if (bhRef.current) bhRef.current.position.copy(comp.bhDir).multiplyScalar(bhDist);

    // galaxia: disco inclinado (marco local → relativo a la cámara)
    const gal = comp.C.gal;
    const galDist = 2000;
    const n0 = comp.galDir.clone().negate();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), n0).normalize();
    const axisA = right.clone().applyAxisAngle(n0, gal.pa * Math.PI / 180);
    const nrm = n0.clone().applyAxisAngle(axisA, gal.tilt * Math.PI / 180);
    const yv = new THREE.Vector3().crossVectors(nrm, axisA);
    const R = galDist * Math.tan(gal.rad);
    const GM = new THREE.Matrix4().makeBasis(axisA.multiplyScalar(R), yv.multiplyScalar(R), nrm.multiplyScalar(R));
    GM.setPosition(comp.galDir.clone().multiplyScalar(galDist));
    M.far.uniforms.uGalM.value.copy(GM);
    if (galRef.current) {
      galRef.current.matrix.copy(GM);
      galRef.current.matrixWorldNeedsUpdate = true;
    }

    const key = [comp.bhDir, comp.galDir, comp.sunDir].map((v) => v.toArray().map((x) => x.toFixed(3)).join(',')).join('|');
    if (key !== bake.key) {
      bake.key = key;
      doBake();
    }
    invalidate();
  }, [size.width, size.height, camera, M, ST, shared, bake, doBake, invalidate]);

  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const u = shared;
    // (en desarrollo, window.__eduSpaceT adelanta el reloj para revisar el recorrido)
    const dev = import.meta.env.DEV ? Number(window.__eduSpaceT) || 0 : 0;
    const t = frozenRef.current ? lastT.current + dev : nowSeconds() - t0.current + T_START + dev;
    if (!frozenRef.current) lastT.current = t;
    u.uTime.value = t;

    const target = nightTarget.current;
    if (frozenRef.current) u.uNight.value = target;
    else u.uNight.value += (target - u.uNight.value) * (1 - Math.exp(-Math.min(delta, 0.1) * 3.5));
    if (Math.abs(target - u.uNight.value) < 0.002) u.uNight.value = target;

    // cámara: deriva lenta en un lazo cerrado + leve balanceo de la mirada
    const w = OMEGA * t;
    const cam = state.camera;
    cam.position.set(8 * Math.sin(w), 3 * Math.sin(0.73 * w + 1.1), 10 * Math.sin(0.53 * w + 2.0));
    const yaw = 0.022 * Math.sin(0.37 * w + 0.4);
    const pitch = 0.012 * Math.sin(0.61 * w + 0.5);
    look.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(100).add(cam.position);
    cam.lookAt(look);

    if (skyRef.current) skyRef.current.position.copy(cam.position);
    const galRot = t * 0.0035;
    M.far.uniforms.uGalRot.value = galRot;
    M.galaxy.uniforms.uGalRot.value = galRot;
    u.uStationSpin.value = t * 0.05;

    const fovR = (cam.fov * Math.PI) / 180;
    u.uPx.value = (state.size.height * 0.5) / Math.tan(fovR / 2);
    u.uDpr.value = state.gl.getPixelRatio();
  });

  // métricas para medir presupuestos en desarrollo: window.__eduSpaceInfo()
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__eduSpaceInfo = () => ({
      density,
      frozen: frozenRef.current,
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      points: gl.info.render.points,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      dpr: gl.getPixelRatio(),
      instances: dyn.counts,
    });
    window.__eduSpaceDebug = { M, ST, shared, invalidate, dyn, compRef };
    return () => { delete window.__eduSpaceInfo; delete window.__eduSpaceDebug; };
  }, [gl, density, M, ST, shared, invalidate, dyn]);

  return (
    <>
      <group ref={skyRef}>
        <mesh geometry={ST.sky} material={M.sky} renderOrder={10} frustumCulled={false} />
        <mesh ref={galRef} geometry={ST.galaxy} material={M.galaxy} renderOrder={-5} frustumCulled={false} matrixAutoUpdate={false} />
        <mesh ref={bhRef} geometry={ST.bh} material={M.bh} renderOrder={-3} frustumCulled={false} />
      </group>
      <primitive object={dyn.far} />
      <mesh geometry={ST.body} material={M.body} renderOrder={-2} frustumCulled={false} />
      <mesh geometry={ST.struct} material={M.struct} renderOrder={0} frustumCulled={false} />
      <primitive object={dyn.rocks} />
      <primitive object={dyn.ships} />
      <primitive object={dyn.near} />
      <primitive object={dyn.streaks} />
      <mesh geometry={ST.robot} material={M.robot} renderOrder={4} frustumCulled={false} />
    </>
  );
}
