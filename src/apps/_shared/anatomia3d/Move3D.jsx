// Movimientos en 3D (Huesos y Músculos en modo 3D): el esqueleto real se articula
// alrededor de sus articulaciones (hombro, codo, cadera, rodilla, tobillo, cabeza)
// y hace el movimiento en un solo sentido (de la posición inicial a la final, una
// pausa y vuelta a empezar), para que se distinga flexión de extensión.
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import useGraphicsQuality from '@/hooks/useGraphicsQuality';
import { Body3DCanvas, Body3D } from './Body3D';
import { loadIndex3d } from './model';
import { MOVES3D } from './scenes';
import './anatomia3d.css';

const HAND = ['carpo', 'metacarpo', 'falanges-mano'];
const FOOT = ['tarso', 'metatarso', 'falanges-pie'];
const SEG = {
  forearm: ['radio', 'cubito', ...HAND],
  arm: ['humero', 'radio', 'cubito', ...HAND],
  leg: ['tibia', 'perone', ...FOOT],
  thigh: ['femur', 'rotula', 'tibia', 'perone', ...FOOT],
  foot: FOOT,
  head: ['craneo', 'mandibula', 'dientes'],
};

const AXES = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - ((-2 * k + 2) ** 2) / 2);

function pivotOf(landmarks, joint) {
  if (joint === 'neck') {
    const c = landmarks.chin; const j = landmarks.jugular;
    return c && j ? [(c[0] + j[0]) / 2, (c[1] + j[1]) / 2 + 0.03, (j[2] - 0.03)] : [0, 1.5, -0.02];
  }
  return landmarks[joint];
}

function Animator({ model, def, pivot }) {
  const invalidate = useThree((s) => s.invalidate);
  const L = model.layers.find((x) => x.id === 'esqueleto');
  const nums = useMemo(() => {
    if (!L) return [];
    const keys = new Set(SEG[def.seg]);
    return L.layer.parts.filter((p) => (def.seg === 'head' || p.side === 'R') && (keys.has(p.k) || p.up.some((u) => keys.has(u)))).map((p) => p.n);
  }, [L, def]);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const r = useMemo(() => new THREE.Matrix4(), []);
  const p = useMemo(() => new THREE.Vector3(...pivot), [pivot]);
  useFrame((state) => {
    if (!L) return;
    const t = state.clock.elapsedTime % 2.8;
    const k = t < 1.5 ? ease(t / 1.5) : 1;
    const deg = def.from + (def.to - def.from) * k;
    r.makeRotationAxis(AXES[def.axis], THREE.MathUtils.degToRad(deg));
    m.makeTranslation(p.x, p.y, p.z).multiply(r).multiply(new THREE.Matrix4().makeTranslation(-p.x, -p.y, -p.z));
    for (const n of nums) L.table.setMatrix(n, m);
    L.table.commit();
    invalidate();
  });
  return null;
}

export default function Move3D({ fig }) {
  const { tier } = useGraphicsQuality();
  const def = MOVES3D[fig];
  const [landmarks, setLandmarks] = useState(null);
  const [model, setModel] = useState(null);
  useEffect(() => {
    let alive = true;
    loadIndex3d().then((idx) => { if (alive) setLandmarks(idx.landmarks); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const pivot = useMemo(() => (landmarks && def ? pivotOf(landmarks, def.joint) : null), [landmarks, def]);
  const cam = useMemo(() => {
    if (!pivot) return null;
    const ty = def.seg === 'thigh' || def.seg === 'leg' || def.seg === 'foot' ? Math.max(0.35, pivot[1] - 0.2) : def.seg === 'head' ? pivot[1] + 0.02 : pivot[1] - 0.12;
    const d = def.seg === 'foot' ? 1.0 : def.seg === 'head' ? 1.05 : 2.2;
    if (def.view === 'right') return { camera: [pivot[0] - d, ty + 0.15, pivot[2] + 0.35], target: [pivot[0], ty, pivot[2]] };
    return { camera: [pivot[0] * 0.5, ty + 0.15, d], target: [pivot[0] * 0.5, ty, 0] };
  }, [pivot, def]);
  if (!def || !cam) return <div className="gq-map ana-map ana-map--3d"><div className="a3d-loading"><span className="a3d-spinner" /></div></div>;
  return (
    <div className="gq-map ana-map ana-map--3d">
      <Body3DCanvas tier={tier} initial={cam}>
        <Body3D layers={{ esqueleto: 'solid' }} lod={tier === 'high' ? 'h' : 'l'} onLoaded={setModel} />
        {model && <Animator model={model} def={def} pivot={pivot} />}
      </Body3DCanvas>
    </div>
  );
}
