// src/apps/mesa-crafteo/scene/MoleculeView.jsx
// La molécula en 3D: átomos CPK con barniz, etiquetas, huecos de valencia
// (electrones libres que brillan), pares solitarios, enlaces sencillos /
// dobles / triples con medio palo del color de cada átomo, anillo de
// selección y la celebración final. Todo lo que se mueve se actualiza en un
// único useFrame leyendo de refs (sin re-render por fotograma).
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { tokenInfo } from '../chem/elements';
import { atomStatus } from '../chem/graph';
import { glowTexture, labelTexture } from './textures';

const SLOT_GAP = 0.24;
const Y = new THREE.Vector3(0, 1, 0);
const tmpV = new THREE.Vector3();
const tmpV2 = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();

function useResources(params) {
  const res = useMemo(() => {
    const sphere = new THREE.SphereGeometry(1, params.sphereSeg, Math.round(params.sphereSeg * 0.7));
    const small = new THREE.SphereGeometry(1, 12, 8);
    const cyl = new THREE.CylinderGeometry(1, 1, 1, params.bondSeg, 1);
    const torus = new THREE.TorusGeometry(1, 0.032, 8, 48);
    const mats = new Map();
    const atomMat = (tok) => {
      const k = `a:${tok}`;
      if (!mats.has(k)) {
        const c = new THREE.Color(tokenInfo(tok).color);
        const opts = { color: c, roughness: 0.3, metalness: 0.06, emissive: c.clone().multiplyScalar(0.08) };
        mats.set(k, params.physical
          ? new THREE.MeshPhysicalMaterial({ ...opts, clearcoat: 0.85, clearcoatRoughness: 0.18 })
          : new THREE.MeshStandardMaterial(opts));
      }
      return mats.get(k);
    };
    const stickMat = (tok) => {
      const k = `s:${tok}`;
      if (!mats.has(k)) {
        const c = new THREE.Color(tokenInfo(tok).color).lerp(new THREE.Color('#cbd5e1'), 0.25);
        mats.set(k, new THREE.MeshStandardMaterial({ color: c, roughness: 0.42, metalness: 0.12 }));
      }
      return mats.get(k);
    };
    const basic = (key, color, extra = {}) => {
      if (!mats.has(key)) mats.set(key, new THREE.MeshBasicMaterial({ color, toneMapped: false, ...extra }));
      return mats.get(key);
    };
    const labelMat = (tok) => {
      const k = `l:${tok}`;
      if (!mats.has(k)) mats.set(k, new THREE.SpriteMaterial({ map: labelTexture(tok), transparent: true, depthWrite: false }));
      return mats.get(k);
    };
    const glowMat = (key, color, opacity) => {
      const k = `g:${key}`;
      if (!mats.has(k)) {
        mats.set(k, new THREE.SpriteMaterial({
          map: glowTexture(), color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending,
        }));
      }
      return mats.get(k);
    };
    const hit = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
    return { sphere, small, cyl, torus, atomMat, stickMat, basic, labelMat, glowMat, hit, mats };
  }, [params.sphereSeg, params.bondSeg, params.physical]);
  useEffect(() => () => {
    res.sphere.dispose(); res.small.dispose(); res.cyl.dispose(); res.torus.dispose(); res.hit.dispose();
    res.mats.forEach((m) => m.dispose());
  }, [res]);
  return res;
}

const SLOT_COLORS = {
  idle: '#67e8f9',
  target: '#fbbf24',
  drop: '#4ade80',
};

function Slot({ dir, radius, state, halos, res, onTap }) {
  const color = SLOT_COLORS[state] || SLOT_COLORS.idle;
  const big = state !== 'idle';
  const dist = radius + SLOT_GAP;
  const p = [dir[0] * dist, dir[1] * dist, dir[2] * dist];
  const stubLen = SLOT_GAP + 0.02;
  const mid = radius + stubLen / 2 - 0.02;
  const q = useMemo(() => {
    const qq = new THREE.Quaternion().setFromUnitVectors(Y, new THREE.Vector3(...dir).normalize());
    return [qq.x, qq.y, qq.z, qq.w];
  }, [dir]);
  return (
    <group>
      <mesh position={[dir[0] * mid, dir[1] * mid, dir[2] * mid]} quaternion={q} scale={[0.028, stubLen, 0.028]} geometry={res.cyl}
        material={res.basic(`stub:${state}`, color, { transparent: true, opacity: 0.55 })} />
      <mesh position={p} scale={big ? 0.1 : 0.075} geometry={res.small} material={res.basic(`dot:${state}`, color)} />
      {halos && <sprite position={p} scale={big ? 0.62 : 0.4} material={res.glowMat(state, color, big ? 0.9 : 0.6)} />}
      {/* zona de toque generosa (dedos) */}
      <mesh position={p} scale={0.26} geometry={res.small} material={res.hit}
        onClick={(e) => { if (e.delta > 8) return; e.stopPropagation(); onTap?.(); }} />
    </group>
  );
}

function LonePair({ dir, radius, res }) {
  const d = new THREE.Vector3(...dir).normalize();
  const perp = new THREE.Vector3().crossVectors(d, Math.abs(d.y) < 0.9 ? Y : new THREE.Vector3(1, 0, 0)).normalize().multiplyScalar(0.075);
  const base = d.clone().multiplyScalar(radius + 0.14);
  const m = res.basic('lp', '#ddd6fe', { transparent: true, opacity: 0.8 });
  return (
    <group>
      <mesh position={base.clone().add(perp).toArray()} scale={0.042} geometry={res.small} material={m} />
      <mesh position={base.clone().sub(perp).toArray()} scale={0.042} geometry={res.small} material={m} />
    </group>
  );
}

export default function MoleculeView({
  model, layout, params, selectedId = null, attachId = null, nextSlot = null, linkFrom = null, dropTarget = null,
  showLP = true, showSlots = true, interactive = true, celebrateKey = 0,
  onAtomTap, onSlotTap, onBondTap, pickerRef, extentRef, activity, spawnFrom,
}) {
  const res = useResources(params);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const disp = useRef(new Map()); // id → { p: Vector3, s, born }
  const nodes = useRef(new Map()); // id → { group, label, ring }
  const bondNodes = useRef(new Map()); // key → { meshes: [], hit }
  const celebrate = useRef({ key: celebrateKey, t: -1 });

  // cualquier cambio de props → unos fotogramas para animar
  useEffect(() => { activity?.wake(900); }, [model, layout, selectedId, attachId, dropTarget, linkFrom, showLP, showSlots, activity]);
  useEffect(() => {
    if (celebrateKey !== celebrate.current.key) {
      celebrate.current = { key: celebrateKey, t: 0 };
      activity?.wake(2600);
    }
  }, [celebrateKey, activity]);

  const statusById = useMemo(() => {
    const m = new Map();
    model.atoms.forEach((a) => m.set(a.id, atomStatus(model, a.id)));
    return m;
  }, [model]);

  // Picker para soltar elementos arrastrados desde la paleta (coordenadas de pantalla).
  const pick = useCallback((cx, cy) => {
    const rect = gl.domElement.getBoundingClientRect();
    const toScreen = (v) => {
      tmpV.copy(v).project(camera);
      return [(tmpV.x * 0.5 + 0.5) * rect.width + rect.left, (-tmpV.y * 0.5 + 0.5) * rect.height + rect.top, tmpV.z];
    };
    let best = null; let bestD = Infinity;
    for (const a of model.atoms) {
      const st = statusById.get(a.id);
      const d = disp.current.get(a.id);
      if (!st || !d || st.room < 1) continue;
      const r = tokenInfo(a.tok).radius;
      const slots = layout.dom[a.id]?.slots || [];
      slots.forEach((dir, k) => {
        tmpV2.set(dir[0], dir[1], dir[2]).multiplyScalar(r + SLOT_GAP).add(d.p);
        const [sx, sy, sz] = toScreen(tmpV2);
        if (sz > 1) return;
        const dd = Math.hypot(sx - cx, sy - cy);
        if (dd < 56 && dd < bestD) { bestD = dd; best = { atomId: a.id, slotIdx: k }; }
      });
      const [ax, ay] = toScreen(d.p);
      tmpV2.copy(d.p).addScaledVector(camera.up, r);
      const [, ry] = toScreen(tmpV2);
      const pr = Math.abs(ry - ay) + 22;
      const da = Math.hypot(ax - cx, ay - cy);
      if (da < pr && da * 0.8 < bestD) { bestD = da * 0.8; best = { atomId: a.id, slotIdx: null }; }
    }
    return best;
  }, [camera, gl, model, layout, statusById]);
  useEffect(() => { if (pickerRef) pickerRef.current = pick; }, [pick, pickerRef]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const k = 1 - Math.exp(-11 * dt);
    let moving = false;
    const D = disp.current;
    // altas y bajas
    const alive = new Set(model.atoms.map((a) => a.id));
    for (const id of [...D.keys()]) if (!alive.has(id)) D.delete(id);
    for (const a of model.atoms) {
      const tgt = layout.pos[a.id];
      if (!tgt) continue;
      let d = D.get(a.id);
      if (!d) {
        const from = spawnFrom?.(a.id);
        const src = from != null && D.get(from) ? D.get(from).p.clone().lerp(new THREE.Vector3(...tgt), 0.45) : new THREE.Vector3(...tgt);
        d = { p: src, s: 0.05, v: 0 };
        D.set(a.id, d);
      }
      tmpV.set(tgt[0], tgt[1], tgt[2]);
      const dist = d.p.distanceTo(tmpV);
      if (dist > 0.002) { d.p.lerp(tmpV, k); moving = true; }
      // muelle de escala con rebote
      const acc = (1 - d.s) * 220 - d.v * 16;
      d.v += acc * dt; d.s += d.v * dt;
      if (Math.abs(1 - d.s) > 0.002 || Math.abs(d.v) > 0.01) moving = true;
    }
    // celebración: onda de pulsos desde el centro
    const cel = celebrate.current;
    let celT = -1;
    if (cel.t >= 0) {
      cel.t += dt;
      celT = cel.t;
      if (cel.t > 2.4) cel.t = -1;
      moving = true;
    }
    // extensión para la mesa y el encuadre
    let r = 0.6; let low = 0;
    D.forEach((d, id) => {
      const tok = model.atoms.find((a) => a.id === id)?.tok;
      const rad = tok ? tokenInfo(tok).radius : 0.4;
      r = Math.max(r, d.p.length() + rad);
      low = Math.min(low, d.p.y - rad);
    });
    if (extentRef) extentRef.current = { r, low };

    // átomos
    const camPos = state.camera.position;
    nodes.current.forEach((n, id) => {
      const d = D.get(id);
      if (!d || !n.group) return;
      n.group.position.copy(d.p);
      let s = Math.max(0.01, d.s);
      if (celT >= 0) {
        const delay = d.p.length() * 0.18;
        const t = celT - delay;
        if (t > 0) s *= 1 + 0.22 * Math.exp(-t * 5) * Math.sin(t * 14);
      }
      n.group.scale.setScalar(s);
      if (n.label) {
        tmpV.subVectors(camPos, d.p).normalize().multiplyScalar(n.radius * 1.02);
        n.label.position.copy(tmpV);
      }
      if (n.ring) n.ring.quaternion.copy(state.camera.quaternion);
    });
    // enlaces
    bondNodes.current.forEach((b) => {
      const da = D.get(b.a); const db = D.get(b.b);
      if (!da || !db) return;
      const pa = da.p; const pb = db.p;
      tmpV.subVectors(pb, pa);
      const L = tmpV.length();
      if (L < 1e-4) return;
      const dir = tmpV.clone().divideScalar(L);
      tmpQ.setFromUnitVectors(Y, dir);
      // desplazamiento lateral de los enlaces múltiples: en el plano de un vecino
      let perp = null;
      if (b.order > 1) {
        const ref = b.refId != null ? D.get(b.refId) : null;
        if (ref) {
          tmpV2.subVectors(ref.p, b.refFromA ? pa : pb);
          perp = tmpV2.clone().addScaledVector(dir, -tmpV2.dot(dir));
        }
        if (!perp || perp.lengthSq() < 1e-4) {
          tmpV2.subVectors(camPos, pa);
          perp = new THREE.Vector3().crossVectors(dir, tmpV2);
        }
        perp.normalize();
      }
      const offs = b.order === 3 ? [-0.15, 0, 0.15] : b.order === 2 ? [-0.1, 0.1] : [0];
      const rad = b.order === 3 ? 0.052 : b.order === 2 ? 0.062 : 0.085;
      const sa = Math.max(0.01, da.s); const sb = Math.max(0.01, db.s);
      b.meshes.forEach((m, i) => {
        const o = offs[i >> 1] || 0;
        const half = i % 2; // 0: mitad de a, 1: mitad de b
        const t0 = half ? 0.5 : 0; const t1 = half ? 1 : 0.5;
        const c = pa.clone().addScaledVector(dir, L * (t0 + t1) / 2);
        if (perp) c.addScaledVector(perp, o);
        m.position.copy(c);
        m.quaternion.copy(tmpQ);
        const sc = half ? sb : sa;
        m.scale.set(rad * sc, (L / 2) * Math.min(1, sc + 0.2), rad * sc);
      });
      if (b.hit) {
        b.hit.position.copy(pa).addScaledVector(dir, L / 2);
        b.hit.quaternion.copy(tmpQ);
        b.hit.scale.set(0.2, L * 0.55, 0.2);
      }
    });
    if (moving) activity?.wake(120);
  });

  const regAtom = (id, radius) => (g) => {
    const n = nodes.current.get(id) || { radius };
    n.group = g; n.radius = radius;
    if (g) nodes.current.set(id, n); else nodes.current.delete(id);
  };
  // Los refs de los hijos llegan antes que el del grupo: el nodo se crea con el primero.
  const regPart = (id, part) => (o) => {
    let n = nodes.current.get(id);
    if (!n) { if (!o) return; n = {}; nodes.current.set(id, n); }
    n[part] = o;
  };

  // Datos de enlaces (con un vecino de referencia para orientar los múltiples).
  const bondData = useMemo(() => model.bonds.map((b) => {
    const nbA = model.bonds.find((x) => x !== b && (x.a === b.a || x.b === b.a));
    const nbB = model.bonds.find((x) => x !== b && (x.a === b.b || x.b === b.b));
    let refId = null; let refFromA = true;
    if (nbA) refId = nbA.a === b.a ? nbA.b : nbA.a;
    else if (nbB) { refId = nbB.a === b.b ? nbB.b : nbB.a; refFromA = false; }
    return { ...b, key: `${Math.min(b.a, b.b)}-${Math.max(b.a, b.b)}`, refId, refFromA };
  }), [model]);

  const tokById = useMemo(() => new Map(model.atoms.map((a) => [a.id, a.tok])), [model]);

  return (
    <group>
      {model.atoms.map((a) => {
        const info = tokenInfo(a.tok);
        const st = statusById.get(a.id);
        const dom = layout.dom[a.id] || { slots: [], lps: [] };
        const isSel = selectedId === a.id;
        const isAttach = attachId === a.id;
        const isLink = linkFrom === a.id;
        const isDrop = dropTarget?.atomId === a.id;
        return (
          <group key={a.id} ref={regAtom(a.id, info.radius)}>
            <mesh geometry={res.sphere} material={res.atomMat(a.tok)} scale={info.radius}
              onClick={interactive ? (e) => { if (e.delta > 8) return; e.stopPropagation(); onAtomTap?.(a.id); } : undefined}
              onPointerOver={interactive ? (e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; } : undefined}
              onPointerOut={interactive ? () => { document.body.style.cursor = ''; } : undefined}
            />
            <sprite ref={regPart(a.id, 'label')} material={res.labelMat(a.tok)} scale={info.radius * 1.25} renderOrder={2} />
            {(isSel || isLink || isDrop) && (
              <mesh ref={regPart(a.id, 'ring')} geometry={res.torus} scale={info.radius + 0.13}
                material={res.basic(isDrop ? 'ring:drop' : isLink ? 'ring:link' : 'ring:sel', isDrop ? '#4ade80' : isLink ? '#22d3ee' : '#fbbf24')} />
            )}
            {showSlots && st && dom.slots.map((dir, k) => {
              let state = isAttach ? 'target' : 'idle';
              if (isDrop && (dropTarget.slotIdx === k || dropTarget.slotIdx == null)) state = 'drop';
              else if (isAttach && nextSlot?.atomId === a.id && nextSlot.idx === k) state = 'drop';
              return (
                <Slot key={`s${k}`} dir={dir} radius={info.radius} state={state} halos={params.halos} res={res}
                  onTap={interactive ? () => onSlotTap?.(a.id, k) : undefined} />
              );
            })}
            {showLP && dom.lps.map((dir, k) => <LonePair key={`l${k}`} dir={dir} radius={info.radius} res={res} />)}
          </group>
        );
      })}
      {bondData.map((b) => {
        const n = b.order * 2;
        const ta = tokById.get(b.a); const tb = tokById.get(b.b);
        if (!ta || !tb) return null;
        return (
          <group key={b.key}>
            {Array.from({ length: n }, (_, i) => (
              <mesh key={i} geometry={res.cyl} material={res.stickMat(i % 2 ? tb : ta)}
                ref={(m) => {
                  const e = bondNodes.current.get(b.key) || { meshes: [] };
                  e.a = b.a; e.b = b.b; e.order = b.order; e.refId = b.refId; e.refFromA = b.refFromA;
                  e.meshes[i] = m;
                  e.meshes.length = n;
                  if (m) bondNodes.current.set(b.key, e);
                  else if (e.meshes.every((x) => !x)) bondNodes.current.delete(b.key);
                }}
              />
            ))}
            {interactive && (
              <mesh geometry={res.cyl} material={res.hit}
                ref={(m) => { const e = bondNodes.current.get(b.key); if (e) e.hit = m; }}
                onClick={(e) => { if (e.delta > 8) return; e.stopPropagation(); onBondTap?.(b.a, b.b); }}
                onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { document.body.style.cursor = ''; }}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
