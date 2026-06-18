// Bus de FX de impacto IMPERATIVO (sin React state por frame, que es lo que
// re-renderizaba la escena en cada disparo). Expone vía ref:
//   · onHit(point, colorHex, opts)  → onda de choque + esquirlas + chispas
//   · onShoot()                     → fogonazo (muzzle) delante de la cámara
// Todo se gestiona con POOLS de tamaño ∝ particleBudget (tier de calidad) y un
// único useFrame que recicla slots. Los meshes van en BLOOM_LAYER para brillar.
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BLOOM_LAYER } from '../engine/config';
import { makeGlowTexture } from '../engine/wordTexture';

const markBloom = (o) => { if (o) o.layers.enable(BLOOM_LAYER); };
const mat4 = new THREE.Matrix4();
const vPos = new THREE.Vector3();
const vScale = new THREE.Vector3();
const qRot = new THREE.Quaternion();
const eRot = new THREE.Euler();
const col = new THREE.Color();
const fwd = new THREE.Vector3();
const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);
const GRAV = 9.0;

const ImpactFX = forwardRef(function ImpactFX({ quality }, apiRef) {
  const { camera } = useThree();
  const budget = quality?.particleBudget ?? 0.8;
  const MAX_RING = Math.max(5, Math.round(12 * budget));
  const MAX_FRAG = Math.max(10, Math.round(34 * budget));
  const MAX_SPARK = Math.max(60, Math.round(200 * budget));

  const ringRef = useRef();
  const fragRef = useRef();
  const muzzleRef = useRef();
  const muzzleTex = useMemo(() => makeGlowTexture('#cfe9ff').texture, []);

  const ring = useMemo(() => Array.from({ length: MAX_RING }, () => ({
    active: false, t: 0, dur: 0.5, max: 3, pos: new THREE.Vector3(), color: new THREE.Color(),
  })), [MAX_RING]);
  const frag = useMemo(() => Array.from({ length: MAX_FRAG }, () => ({
    active: false, t: 0, life: 1, pos: new THREE.Vector3(), vel: new THREE.Vector3(),
    rot: new THREE.Euler(), rotV: new THREE.Vector3(), scale: 1, color: new THREE.Color(),
  })), [MAX_FRAG]);

  const sb = useMemo(() => ({
    pos: new Float32Array(MAX_SPARK * 3),
    col: new Float32Array(MAX_SPARK * 3),
    base: new Float32Array(MAX_SPARK * 3),
    vel: new Float32Array(MAX_SPARK * 3),
    life: new Float32Array(MAX_SPARK),
    maxlife: new Float32Array(MAX_SPARK),
    next: 0,
  }), [MAX_SPARK]);
  const sparkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(sb.pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(sb.col, 3));
    return g;
  }, [sb]);

  const cursor = useRef({ ring: 0, frag: 0 });
  const muzzle = useRef({ active: false, t: 0 });
  // flags de actividad por pool: si están a false el useFrame ni recorre el pool
  // ni re-sube buffers a GPU (frames en idle = trabajo cero, intención del diseño)
  const live = useRef({ ring: false, frag: false, spark: false });

  // muzzleTex es una textura CACHEADA y compartida (makeGlowTexture): NO se
  // libera aquí — la posee el cache de wordTexture y la suelta clearTextureCache
  // al desmontar la app. sparkGeo sí es propia de este componente.
  useEffect(() => () => { sparkGeo.dispose(); }, [sparkGeo]);

  // Inicializa instanceColor (lazy en three) y oculta todas las instancias.
  useEffect(() => {
    const r = ringRef.current; const f = fragRef.current;
    if (r) { for (let i = 0; i < MAX_RING; i++) { r.setMatrixAt(i, HIDDEN); r.setColorAt(i, col.set(0, 0, 0)); } r.instanceMatrix.needsUpdate = true; if (r.instanceColor) r.instanceColor.needsUpdate = true; }
    if (f) { for (let i = 0; i < MAX_FRAG; i++) { f.setMatrixAt(i, HIDDEN); f.setColorAt(i, col.set(0, 0, 0)); } f.instanceMatrix.needsUpdate = true; if (f.instanceColor) f.instanceColor.needsUpdate = true; }
  }, [MAX_RING, MAX_FRAG]);

  useImperativeHandle(apiRef, () => ({
    onHit(point, colorHex, opts = {}) {
      if (!point) return;
      const power = opts.power || 1; // 1 normal · 2 especial gordo/bomba
      const combo = Math.min(opts.combo || 0, 12);
      col.set(colorHex || '#ffffff');

      // onda de choque
      const rs = ring[cursor.current.ring]; cursor.current.ring = (cursor.current.ring + 1) % MAX_RING;
      rs.active = true; rs.t = 0; rs.dur = 0.45 + power * 0.08; rs.max = 2.4 + power * 1.4;
      rs.pos.copy(point); rs.color.copy(col);
      live.current.ring = true;

      // esquirlas
      const nFrag = Math.min(MAX_FRAG, Math.round((5 + power * 3 + combo * 0.4) * (budget * 0.6 + 0.4)));
      for (let k = 0; k < nFrag; k++) {
        const fr = frag[cursor.current.frag]; cursor.current.frag = (cursor.current.frag + 1) % MAX_FRAG;
        fr.active = true; fr.t = 0; fr.life = 0.5 + Math.random() * 0.5;
        fr.pos.copy(point);
        fr.vel.set((Math.random() - 0.5) * 5, Math.random() * 4 + 1, (Math.random() - 0.5) * 5 + 1.5);
        fr.rot.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        fr.rotV.set((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9);
        fr.scale = 0.12 + Math.random() * 0.16 * power;
        fr.color.copy(col);
      }
      if (nFrag > 0) live.current.frag = true;

      // chispas
      const nSpark = Math.min(MAX_SPARK, Math.round((10 + combo + power * 6) * budget));
      for (let k = 0; k < nSpark; k++) {
        const i = sb.next; sb.next = (sb.next + 1) % MAX_SPARK;
        const i3 = i * 3;
        sb.pos[i3] = point.x; sb.pos[i3 + 1] = point.y; sb.pos[i3 + 2] = point.z;
        const sp = 3 + Math.random() * 6;
        sb.vel[i3] = (Math.random() - 0.5) * sp;
        sb.vel[i3 + 1] = (Math.random() - 0.5) * sp + 1.5;
        sb.vel[i3 + 2] = (Math.random() - 0.5) * sp + 1.5;
        sb.base[i3] = col.r; sb.base[i3 + 1] = col.g; sb.base[i3 + 2] = col.b;
        sb.life[i] = sb.maxlife[i] = 0.35 + Math.random() * 0.45;
      }
      if (nSpark > 0) live.current.spark = true;
    },
    onShoot() { muzzle.current.active = true; muzzle.current.t = 0; },
  }), [ring, frag, sb, budget, MAX_RING, MAX_FRAG, MAX_SPARK]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);

    // ── ondas de choque (billboard a cámara) ── solo si hay alguna viva
    const r = ringRef.current;
    if (r && live.current.ring) {
      let any = false; let dirty = false;
      for (let i = 0; i < MAX_RING; i++) {
        const s = ring[i];
        if (!s.active) { continue; }
        s.t += dt;
        const k = s.t / s.dur;
        if (k >= 1) { s.active = false; r.setMatrixAt(i, HIDDEN); dirty = true; continue; }
        const sc = 0.3 + k * s.max;
        vScale.set(sc, sc, sc);
        mat4.compose(s.pos, camera.quaternion, vScale);
        r.setMatrixAt(i, mat4);
        r.setColorAt(i, col.copy(s.color).multiplyScalar((1 - k) * 1.2));
        any = true; dirty = true;
      }
      live.current.ring = any;
      if (dirty) { r.instanceMatrix.needsUpdate = true; if (r.instanceColor) r.instanceColor.needsUpdate = true; }
    }

    // ── esquirlas ──
    const f = fragRef.current;
    if (f && live.current.frag) {
      let any = false; let dirty = false;
      for (let i = 0; i < MAX_FRAG; i++) {
        const s = frag[i];
        if (!s.active) { continue; }
        s.t += dt;
        if (s.t >= s.life) { s.active = false; f.setMatrixAt(i, HIDDEN); dirty = true; continue; }
        s.vel.y -= GRAV * dt;
        s.pos.addScaledVector(s.vel, dt);
        s.rot.x += s.rotV.x * dt; s.rot.y += s.rotV.y * dt; s.rot.z += s.rotV.z * dt;
        qRot.setFromEuler(eRot.copy(s.rot));
        const fade = 1 - s.t / s.life;
        const sc = s.scale * (0.5 + fade * 0.5);
        vScale.set(sc, sc, sc);
        mat4.compose(s.pos, qRot, vScale);
        f.setMatrixAt(i, mat4);
        f.setColorAt(i, col.copy(s.color).multiplyScalar(0.4 + fade));
        any = true; dirty = true;
      }
      live.current.frag = any;
      if (dirty) { f.instanceMatrix.needsUpdate = true; if (f.instanceColor) f.instanceColor.needsUpdate = true; }
    }

    // ── chispas ──
    if (live.current.spark) {
      let any = false; let dirty = false;
      for (let i = 0; i < MAX_SPARK; i++) {
        const i3 = i * 3;
        if (sb.life[i] > 0) {
          sb.life[i] -= dt;
          sb.vel[i3 + 1] -= GRAV * 0.5 * dt;
          sb.pos[i3] += sb.vel[i3] * dt;
          sb.pos[i3 + 1] += sb.vel[i3 + 1] * dt;
          sb.pos[i3 + 2] += sb.vel[i3 + 2] * dt;
          const fade = Math.max(0, sb.life[i] / sb.maxlife[i]);
          sb.col[i3] = sb.base[i3] * fade;
          sb.col[i3 + 1] = sb.base[i3 + 1] * fade;
          sb.col[i3 + 2] = sb.base[i3 + 2] * fade;
          any = true; dirty = true;
        } else if (sb.col[i3] || sb.col[i3 + 1] || sb.col[i3 + 2]) {
          sb.col[i3] = sb.col[i3 + 1] = sb.col[i3 + 2] = 0;
          dirty = true;
        }
      }
      live.current.spark = any;
      if (dirty) {
        sparkGeo.attributes.position.needsUpdate = true;
        sparkGeo.attributes.color.needsUpdate = true;
      }
    }

    // ── muzzle flash ──
    const mz = muzzleRef.current;
    if (mz) {
      const m = muzzle.current;
      if (m.active) {
        m.t += dt;
        const k = m.t / 0.09;
        if (k >= 1) { m.active = false; mz.visible = false; }
        else {
          // brillo MINÚSCULO en el centro de la mirilla (no un fogonazo grande)
          mz.visible = true;
          fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
          mz.position.copy(camera.position).addScaledVector(fwd, 3.2);
          mz.quaternion.copy(camera.quaternion);
          const sc = 0.16 + k * 0.22;
          mz.scale.set(sc, sc, sc);
          mz.material.opacity = (1 - k) * 0.85;
        }
      } else if (mz.visible) { mz.visible = false; }
    }
  });

  return (
    <>
      <instancedMesh ref={(o) => { ringRef.current = o; markBloom(o); }} args={[null, null, MAX_RING]} frustumCulled={false}>
        <ringGeometry args={[0.6, 0.82, 36]} />
        <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </instancedMesh>

      <instancedMesh ref={(o) => { fragRef.current = o; markBloom(o); }} args={[null, null, MAX_FRAG]} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={0.9} metalness={0.5} roughness={0.3} toneMapped={false} />
      </instancedMesh>

      <points ref={(o) => markBloom(o)} geometry={sparkGeo} frustumCulled={false}>
        <pointsMaterial size={0.17} vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation toneMapped={false} />
      </points>

      <mesh ref={(o) => { muzzleRef.current = o; markBloom(o); }} visible={false} frustumCulled={false}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshBasicMaterial map={muzzleTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} opacity={0} />
      </mesh>
    </>
  );
});

export default ImpactFX;
