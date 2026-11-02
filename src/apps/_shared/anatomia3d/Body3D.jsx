// Cuerpo humano en 3D (react-three-fiber). Una malla por capa; el estado de cada
// pieza (tinte, brillo, holograma, oculta, matriz) va en una textura de datos.
//
// <Body3DCanvas> monta el lienzo (calidad gráfica global, pérdida de contexto,
// controles de cámara) y <Body3D> dentro pinta el cuerpo:
//   layers:  { capa: 'solid' | 'ghost' | 'hidden' }
//   states:  { clave: 'selected' | 'correct' | 'wrong' | 'target' | 'hint' | 'info' }
//   isolate: [claves] → el resto se atenúa (o pasa a holograma con isolateMode 'ghost')
//   pickable: capas que se pueden tocar (por defecto las sólidas)
//   onPick(clave, { layer, part }) · onHover(clave | null)
//   clip: { axis: 'x' | 'y' | 'z', at (m), flip }
//   lens: true (lupa de rayos X bajo el puntero): lensCut se recorta dentro del
//     círculo y lensOnly se ve solo dentro (por defecto: todas las sólidas menos la última)
//   animate: corazón que late y pulmones que respiran · explode: { key, amount }
//   focus: clave a encuadrar · labels: [{ key | at: [x, y, z], text, tone }]
//   only: { capa: [claves] } → en esa capa solo se ven esas piezas
//   offsets: { 'capa:n': [dx, dy, dz] } → piezas desplazadas (montar piezas); se mueven suave
//   drag: { id: 'capa:n', onDrop(offset, pantallaPx) } → esa pieza se arrastra con el dedo
//   markers: [{ at: [x, y, z], tone }] → anillos que laten en un punto (no tapan el toque)
import { forwardRef, Suspense, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import ContextLossGuard from '@/components/ui/bg3d/ContextLossGuard';
import { loadIndex3d, loadLayerGeometry, partsOf, boundsOf } from './model';
import { PartTable, layerUniforms, createLayerMaterials } from './material';

export const STATE_STYLE = {
  selected: { color: '#facc15', tint: 0.62, glow: 0.85 },
  correct: { color: '#22c55e', tint: 0.6, glow: 0.6 },
  wrong: { color: '#ef4444', tint: 0.62, glow: 0.35 },
  target: { color: '#f59e0b', tint: 0.62, glow: 0.9 },
  hint: { color: '#22d3ee', tint: 0.35, glow: 1 },
  info: { color: '#38bdf8', tint: 0.5, glow: 0.7 },
  hover: { color: '#ffffff', tint: 0.2, glow: 0 },
};
const STYLE_COLORS = Object.fromEntries(Object.entries(STATE_STYLE).map(([k, s]) => [k, new THREE.Color(s.color)]));

// Holograma de cada capa (color, intensidad): la piel cian; el esqueleto, más tenue y frío.
const GHOST_TUNE = {
  piel: ['#5eead4', 0.78],
  esqueleto: ['#bae6fd', 0.42],
  musculos: ['#fca5a5', 0.4],
  'musculos-prof': ['#fca5a5', 0.36],
  organos: ['#f9a8d4', 0.45],
  vasos: ['#fda4af', 0.5],
  nervios: ['#fde68a', 0.5],
};

export const BODY_TARGET = [0, 0.88, 0];
export const BODY_CAMERA = [0, 0.95, 3.75];

/* ───────── lienzo ───────── */

export const Body3DCanvas = forwardRef(function Body3DCanvas({ tier = 'medium', children, className = '', onReady, minDistance = 0.18, maxDistance = 5, initial = null }, ref) {
  const [ctxKey, setCtxKey] = useState(0);
  const controls = useRef(null);
  const placed = useRef(false);
  const dpr = tier === 'high' ? [1, 2] : tier === 'medium' ? [1, 1.5] : [1, 1];
  useImperativeHandle(ref, () => ({ controls: () => controls.current }), []);
  const cam = initial?.camera || BODY_CAMERA;
  const tgt = initial?.target || BODY_TARGET;
  return (
    <div className={`a3d-canvas ${className}`}>
      <Canvas
        key={`${tier}-${ctxKey}`}
        frameloop="demand"
        dpr={dpr}
        gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 32, near: 0.02, far: 30, position: cam }}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); onReady?.(); }}
      >
        <ContextLossGuard onLost={() => setCtxKey((k) => k + 1)} />
        <CameraControls
          ref={(c) => {
            controls.current = c;
            if (c && !placed.current) {
              placed.current = true;
              c.setLookAt(cam[0], cam[1], cam[2], tgt[0], tgt[1], tgt[2], false);
              c.dollyToCursor = true;
            }
          }}
          makeDefault
          minDistance={minDistance}
          maxDistance={maxDistance}
          smoothTime={0.28}
        />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
});

/* ───────── capas ───────── */

function useBodyModel(layerIds, lod) {
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);
  const key = layerIds.join(',');
  useEffect(() => {
    let alive = true;
    loadIndex3d()
      .then(async (index) => {
        const ids = key.split(',').filter((id) => index.layers[id]);
        const layers = await Promise.all(ids.map(async (id, i) => {
          const layer = index.layers[id];
          const { geometry, matrix } = await loadLayerGeometry(index, id, lod);
          const table = new PartTable(layer.parts.length);
          layer.parts.forEach((p) => table.setFiber(p.n, p.f || null));
          table.commit();
          const uniforms = layerUniforms(table, i);
          const [gc, ga] = GHOST_TUNE[id] || ['#5eead4', 0.6];
          uniforms.uGhost.value.set(gc);
          uniforms.uGhostAlpha.value = ga;
          const mats = createLayerMaterials(uniforms);
          return { id, layer, geometry, matrix, table, uniforms, mats, index: i };
        }));
        if (alive) setModel({ index, layers });
      })
      .catch((e) => { if (alive) setError(e); });
    return () => { alive = false; };
  }, [key, lod]);
  return { model, error };
}

// Estado de cada pieza a partir de las claves (una clave de grupo enciende todas sus piezas).
function applyStates(model, { layers, states, isolate, isolateMode, hover, only }) {
  for (const L of model.layers) {
    const { table, layer } = L;
    const mode = layers[L.id] || 'hidden';
    const iso = isolate?.length ? new Set(isolate.flatMap((k) => partsOf(layer, k))) : null;
    const keep = only?.[L.id] ? new Set(only[L.id].flatMap((k) => partsOf(layer, k))) : null;
    for (let n = 0; n < table.width; n += 1) {
      const out = iso && n !== 0 ? !iso.has(n) : false;
      table.setTint(n, null, 0);
      table.setState(n, {
        visible: mode === 'hidden' || (keep && !keep.has(n)) ? 0 : 1,
        ghost: mode === 'ghost' || (out && isolateMode === 'ghost') ? 1 : 0,
        glow: 0,
        dim: out && isolateMode !== 'ghost' ? 1 : 0,
      });
      if (iso && n === 0) table.setState(0, isolateMode === 'ghost' ? { ghost: 1 } : { dim: 1 });
    }
    // clave del catálogo (todas sus piezas) o 'capa:n' (una pieza concreta)
    const paint = (key, st) => {
      const s = STATE_STYLE[st];
      if (!s) return;
      const one = /^([a-z-]+):(\d+)$/.exec(key);
      const nums = one ? (one[1] === L.id ? [+one[2]] : []) : partsOf(layer, key);
      for (const n of nums) {
        table.setTint(n, STYLE_COLORS[st], s.tint);
        table.setState(n, { glow: s.glow, dim: 0 });
      }
    };
    if (hover) paint(hover, 'hover');
    for (const [k, st] of Object.entries(states || {})) paint(k, st);
    L.uniforms.uLayerGhost.value = mode === 'ghost' ? 1 : 0;
    table.commit();
  }
}

/* ───────── cuerpo ───────── */

export function Body3D({
  layers = { esqueleto: 'solid' },
  lod = 'l',
  states = null,
  isolate = null,
  isolateMode = 'dim',
  only = null,
  pickable = null,
  onPick = null,
  onHover = null,
  clip = null,
  lens = false,
  lensCut = null,
  lensOnly = null,
  lensRadius = 90,
  animate = false,
  explode = null,
  offsets = null,
  drag = null,
  markers = null,
  focus = null,
  focusPad = 1.35,
  labels = null,
  ghostAlpha = 1,
  onLoaded = null,
}) {
  const ids = useMemo(() => Object.keys(layers), [layers]);
  const { model, error } = useBodyModel(ids, lod);
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const controls = useThree((s) => s.controls);
  const [hover, setHover] = useState(null);
  const pointer = useRef({ x: -9999, y: -9999, inside: false });
  const loopNeeded = useRef(false);

  useEffect(() => { if (model) onLoaded?.(model); }, [model, onLoaded]);
  useEffect(() => { if (error) console.error('Cuerpo 3D:', error); }, [error]);

  // estados de las piezas
  useEffect(() => {
    if (!model) return;
    applyStates(model, { layers, states, isolate, isolateMode, hover, only });
    loopNeeded.current = Boolean(animate || Object.keys(states || {}).length);
    invalidate();
  }, [model, layers, states, isolate, isolateMode, hover, only, animate, invalidate]);

  // corte
  useEffect(() => {
    if (!model) return;
    for (const L of model.layers) {
      const on = clip ? 1 : 0;
      L.uniforms.uClipOn.value = on;
      if (clip) {
        const nrm = clip.axis === 'x' ? [1, 0, 0] : clip.axis === 'y' ? [0, 1, 0] : [0, 0, 1];
        const s = clip.flip ? -1 : 1;
        L.uniforms.uClip.value.set(nrm[0] * s, nrm[1] * s, nrm[2] * s, -clip.at * s);
      }
      L.mats.solid.side = clip ? THREE.DoubleSide : THREE.FrontSide;
      L.mats.pick.side = L.mats.solid.side;
      L.mats.solid.needsUpdate = true;
      L.mats.pick.needsUpdate = true;
      L.uniforms.uGhostAlpha.value = (GHOST_TUNE[L.id]?.[1] ?? 0.6) * ghostAlpha;
    }
    invalidate();
  }, [model, clip, ghostAlpha, invalidate]);

  // Capas que la lupa recorta y capas que solo se ven dentro de ella.
  const lensLayers = useMemo(() => {
    if (!lens || !model) return new Set();
    if (lensCut) return new Set(lensCut);
    const solid = model.index.order.filter((id) => layers[id] === 'solid');
    return new Set(solid.slice(0, -1));
  }, [lens, lensCut, model, layers]);
  const lensInside = useMemo(() => new Set(lens && lensOnly ? lensOnly : []), [lens, lensOnly]);

  // Desplazamiento de cada pieza: despiece (cada pieza del grupo se aleja del centro
  // del grupo) + piezas sueltas (offsets). Las sueltas van hacia su destino poco a poco.
  const moved = useRef(new Map()); // 'capa:n' → { cur: Vector3, to: Vector3 }
  const dragging = useRef(null);
  const applyMatrices = useCallback(() => {
    if (!model) return false;
    const m = new THREE.Matrix4();
    let busy = false;
    for (const L of model.layers) {
      const nums = explode?.key ? partsOf(L.layer, explode.key) : [];
      // al separar las piezas se ven caras que estaban tapadas (y su oclusión horneada)
      L.uniforms.uAo.value = explode || moved.current.size ? 0.9 - 0.6 * Math.min(1, (explode?.amount ?? 0.5) * 2) : 0.9;
      for (let n = 0; n < L.table.width; n += 1) L.table.setMatrix(n, null);
      if (explode) {
        const c = boundsOf(L.layer, nums).getCenter(new THREE.Vector3());
        for (const n of nums) {
          const p = L.layer.parts[n - 1].c;
          const d = new THREE.Vector3(p[0] - c.x, p[1] - c.y, p[2] - c.z).multiplyScalar(explode.amount * 1.1);
          L.table.setMatrix(n, m.makeTranslation(d.x, d.y, d.z));
        }
      }
      for (const [id, o] of moved.current) {
        const [lid, ns] = id.split(':');
        if (lid !== L.id) continue;
        if (dragging.current?.id !== id && o.cur.distanceToSquared(o.to) > 1e-8) { o.cur.lerp(o.to, 0.2); busy = true; }
        L.table.setMatrix(+ns, m.makeTranslation(o.cur.x, o.cur.y, o.cur.z));
      }
      L.table.commit();
    }
    return busy;
  }, [model, explode]);
  useEffect(() => {
    if (!model) return;
    const seen = new Set();
    for (const [id, v] of Object.entries(offsets || {})) {
      seen.add(id);
      const to = new THREE.Vector3(...v);
      const o = moved.current.get(id);
      if (o) o.to.copy(to); else moved.current.set(id, { cur: to.clone(), to });
    }
    for (const id of [...moved.current.keys()]) if (!seen.has(id)) moved.current.delete(id);
    applyMatrices();
    invalidate();
  }, [model, offsets, applyMatrices, invalidate]);

  // encuadre
  useEffect(() => {
    if (!model || !controls || !focus) return;
    const box = new THREE.Box3();
    for (const L of model.layers) {
      const nums = partsOf(L.layer, focus);
      if (nums.length) box.union(boundsOf(L.layer, nums));
    }
    if (box.isEmpty()) return;
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const r = Math.max(sphere.radius, 0.05);
    const dist = (r / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) * focusPad;
    controls.moveTo(sphere.center.x, sphere.center.y, sphere.center.z, true);
    controls.dollyTo(Math.min(dist, 4.5), true);
  }, [model, controls, focus, focusPad, camera]);

  /* ── selección por color (un píxel) ── */
  const pickRT = useMemo(() => new THREE.WebGLRenderTarget(1, 1), []);
  const pickScene = useMemo(() => new THREE.Scene(), []);
  const pickBuf = useMemo(() => new Uint8Array(4), []);
  useEffect(() => () => pickRT.dispose(), [pickRT]);

  const pickAt = useCallback((x, y) => {
    if (!model) return null;
    const allow = pickable ? new Set(pickable) : null;
    pickScene.clear();
    for (const L of model.layers) {
      const mode = layers[L.id];
      if (mode !== 'solid') continue;
      // dentro de la lupa no cuentan las capas recortadas; fuera, las que solo se ven dentro
      const inLens = lens && Math.hypot(x - pointer.current.x, y - pointer.current.y) < lensRadius;
      if (inLens && lensLayers.has(L.id)) continue;
      if (!inLens && lensInside.has(L.id)) continue;
      const mesh = new THREE.Mesh(L.geometry, L.mats.pick);
      mesh.matrixAutoUpdate = false;
      mesh.matrix.copy(L.matrix);
      mesh.matrixWorld.copy(L.matrix);
      mesh.frustumCulled = false;
      pickScene.add(mesh);
    }
    const prevLens = model.layers.map((L) => L.uniforms.uLensOn.value);
    model.layers.forEach((L) => { L.uniforms.uLensOn.value = 0; });
    camera.setViewOffset(size.width, size.height, Math.round(x), Math.round(y), 1, 1);
    const prevTarget = gl.getRenderTarget();
    const prevClear = gl.getClearAlpha();
    gl.setRenderTarget(pickRT);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    gl.render(pickScene, camera);
    gl.readRenderTargetPixels(pickRT, 0, 0, 1, 1, pickBuf);
    gl.setRenderTarget(prevTarget);
    gl.setClearColor(0x000000, prevClear);
    camera.clearViewOffset();
    model.layers.forEach((L, i) => { L.uniforms.uLensOn.value = prevLens[i]; });
    pickScene.clear();
    if (pickBuf[3] === 0 || pickBuf[2] === 255) return null;
    const L = model.layers[pickBuf[2]];
    if (!L || (allow && !allow.has(L.id))) return null;
    const part = L.layer.parts[pickBuf[0] + pickBuf[1] * 256 - 1];
    return part ? { key: part.k, layer: L.id, part } : null;
  }, [model, pickable, layers, lens, lensLayers, lensInside, lensRadius, camera, size, gl, pickRT, pickScene, pickBuf]);

  // puntero: toque = selección; ratón encima = resaltado; lupa sigue al puntero
  useEffect(() => {
    const el = gl.domElement;
    let down = null;
    let raf = 0;
    const local = (e) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    // el visor entero (las etiquetas y anillos de drei Html cuelgan fuera del lienzo)
    const container = el.closest('.a3d-canvas') || el.parentElement || el;
    const onDown = (e) => { down = { ...local(e), t: performance.now() }; };
    // Arrastrar una pieza suelta: se decide antes que los controles de cámara (captura en window).
    const onDragStart = (e) => {
      if (!drag?.id || !model || !container.contains(e.target)) return;
      const p = local(e);
      const [lid, ns] = drag.id.split(':');
      const L = model.layers.find((x) => x.id === lid);
      const part = L?.layer.parts[+ns - 1];
      if (!part) return;
      const o = moved.current.get(drag.id) || { cur: new THREE.Vector3(), to: new THREE.Vector3() };
      // vale tocar la pieza o muy cerca de ella (las finas, como el nasal, son difíciles de atinar)
      const hit = pickAt(p.x, p.y);
      const sc = new THREE.Vector3(...part.c).add(o.cur).project(camera);
      const near = Math.hypot((sc.x + 1) / 2 * size.width - p.x, (1 - sc.y) / 2 * size.height - p.y) < 34;
      if (!near && (!hit || `${hit.layer}:${hit.part.n}` !== drag.id)) return;
      moved.current.set(drag.id, o);
      dragging.current = { id: drag.id, last: p, part };
      // la cámara no debe enterarse de este toque
      e.stopPropagation();
      if (controls) controls.enabled = false;
      el.setPointerCapture?.(e.pointerId);
    };
    const onDragMove = (e) => {
      const d = dragging.current;
      if (!d) return;
      const p = local(e);
      const o = moved.current.get(d.id);
      const c = d.part.c;
      const at = new THREE.Vector3(c[0], c[1], c[2]).add(o.cur);
      const dist = camera.position.distanceTo(at);
      const k = (2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / size.height;
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
      o.cur.addScaledVector(right, (p.x - d.last.x) * k).addScaledVector(up, -(p.y - d.last.y) * k);
      o.to.copy(o.cur);
      d.last = p;
      applyMatrices();
      invalidate();
    };
    const onDragEnd = () => {
      const d = dragging.current;
      if (!d) return;
      dragging.current = null;
      if (controls) controls.enabled = true;
      const o = moved.current.get(d.id);
      const c = new THREE.Vector3(...d.part.c);
      const a = c.clone().add(o.cur).project(camera);
      const b = c.clone().project(camera);
      const px = Math.hypot((a.x - b.x) * size.width / 2, (a.y - b.y) * size.height / 2);
      down = null;
      drag.onDrop?.(o.cur.toArray(), px);
    };
    const onUp = (e) => {
      if (!down || dragging.current) return;
      const p = local(e);
      const moved = Math.hypot(p.x - down.x, p.y - down.y);
      const quick = performance.now() - down.t < 600;
      down = null;
      if (moved > 7 || !quick || !onPick) return;
      const hit = pickAt(p.x, p.y);
      onPick(hit?.key || null, hit);
    };
    const onMove = (e) => {
      const p = local(e);
      pointer.current = { ...p, inside: true };
      if (lens) invalidate();
      if (e.pointerType !== 'mouse' || down || !onHover) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const hit = pickAt(p.x, p.y);
        const k = hit?.key || null;
        setHover((h) => (h === k ? h : k));
        onHover(k, hit);
      });
    };
    const onLeave = () => {
      pointer.current = { x: -9999, y: -9999, inside: false };
      setHover(null);
      onHover?.(null);
      invalidate();
    };
    window.addEventListener('pointerdown', onDragStart, true);
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragEnd);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointerdown', onDragStart, true);
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', onDragEnd);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [gl, pickAt, onPick, onHover, lens, invalidate, drag, model, controls, camera, size, applyMatrices]);

  /* ── animación (latido, respiración, brillo) y lupa ── */
  const anim = useMemo(() => {
    if (!model) return null;
    const out = [];
    for (const L of model.layers) {
      const heart = partsOf(L.layer, 'corazon');
      const lungs = [...partsOf(L.layer, 'pulmones')];
      const diaphragm = partsOf(L.layer, 'diafragma');
      if (heart.length) out.push({ L, nums: heart, c: boundsOf(L.layer, heart).getCenter(new THREE.Vector3()), kind: 'heart' });
      if (lungs.length) out.push({ L, nums: lungs, c: boundsOf(L.layer, lungs).getCenter(new THREE.Vector3()), kind: 'lungs' });
      if (diaphragm.length) out.push({ L, nums: diaphragm, c: null, kind: 'diaphragm' });
    }
    return out;
  }, [model]);

  const m4 = useMemo(() => new THREE.Matrix4(), []);
  useFrame((state) => {
    if (!model) return;
    const t = state.clock.elapsedTime;
    const dpr = gl.getPixelRatio();
    for (const L of model.layers) {
      L.uniforms.uTime.value = t;
      const inside = lens && pointer.current.inside;
      L.uniforms.uLensOn.value = inside && lensLayers.has(L.id) ? 1 : lens && lensInside.has(L.id) ? 2 : 0;
      // gl_FragCoord tiene el origen abajo a la izquierda y va en píxeles del dispositivo
      L.uniforms.uLens.value.set(pointer.current.x * dpr, (size.height - pointer.current.y) * dpr, lensRadius * dpr);
    }
    if (animate && anim && !explode) {
      const beatT = (t % 0.86) / 0.86;
      const beat = Math.exp(-((beatT - 0.12) ** 2) / 0.002) * 1 + Math.exp(-((beatT - 0.32) ** 2) / 0.003) * 0.55;
      const breath = 0.5 - 0.5 * Math.cos((t / 4.3) * Math.PI * 2);
      for (const a of anim) {
        if (a.kind === 'heart') {
          const s = 1 + 0.045 * beat;
          m4.makeTranslation(a.c.x, a.c.y, a.c.z).multiply(new THREE.Matrix4().makeScale(s, s, s)).multiply(new THREE.Matrix4().makeTranslation(-a.c.x, -a.c.y, -a.c.z));
        } else if (a.kind === 'lungs') {
          const sx = 1 + 0.03 * breath; const sy = 1 + 0.045 * breath; const sz = 1 + 0.04 * breath;
          m4.makeTranslation(a.c.x, a.c.y, a.c.z).multiply(new THREE.Matrix4().makeScale(sx, sy, sz)).multiply(new THREE.Matrix4().makeTranslation(-a.c.x, -a.c.y, -a.c.z));
        } else {
          m4.makeTranslation(0, -0.018 * breath, 0);
        }
        for (const n of a.nums) a.L.table.setMatrix(n, m4);
        a.L.table.commit();
      }
    }
    const busy = moved.current.size ? applyMatrices() : false;
    if (loopNeeded.current || lens || busy) invalidate();
  });

  if (!model) return null;
  return (
    <group>
      {model.layers.map((L) => (
        <group key={L.id} visible={layers[L.id] && layers[L.id] !== 'hidden'}>
          <mesh geometry={L.geometry} material={L.mats.solid} matrixAutoUpdate={false} matrix={L.matrix} frustumCulled={false} renderOrder={0} />
          <mesh geometry={L.geometry} material={L.mats.ghost} matrixAutoUpdate={false} matrix={L.matrix} frustumCulled={false} renderOrder={10} />
        </group>
      ))}
      {markers?.map((mk) => (
        <Html key={mk.at.join(',')} position={mk.at} center zIndexRange={[19, 0]} pointerEvents="none">
          <span className={`a3d-marker a3d-marker--${mk.tone || 'info'}`} />
        </Html>
      ))}
      {labels?.map((lb) => <PartLabel key={`${lb.key || lb.at?.join(',')}-${lb.text}`} model={model} k={lb.key} at={lb.at} text={lb.text} tone={lb.tone} />)}
    </group>
  );
}

function PartLabel({ model, k, at, text, tone = 'info' }) {
  const pos = useMemo(() => {
    if (at) return new THREE.Vector3(at[0], at[1], at[2]);
    for (const L of model.layers) {
      const nums = partsOf(L.layer, k);
      if (nums.length) return boundsOf(L.layer, nums).getCenter(new THREE.Vector3());
    }
    return null;
  }, [model, k, at]);
  if (!pos) return null;
  return (
    <Html position={pos} center zIndexRange={[20, 0]} pointerEvents="none">
      <span className={`a3d-label a3d-label--${tone}`}>{text}</span>
    </Html>
  );
}
