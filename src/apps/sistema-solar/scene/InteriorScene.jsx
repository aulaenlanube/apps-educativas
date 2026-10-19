// src/apps/sistema-solar/scene/InteriorScene.jsx
// Visor 3D del interior: el astro se abre con una cuña (open 0→1) y al
// «separar capas» (explode 0→1) cada capa interior se recorta menos que la
// de fuera y avanza un poco hacia el espectador, en escalera: se ven a la vez
// el corte (anillo de grosor) y la superficie esférica de cada capa.
// Geometría procedural: esferas completas con la cuña descartada en el shader
// (addWedgeCut) + dos semicoronas por capa como caras de corte. Las caras se
// colocan con rotación (transform), así la animación no regenera geometría.
// La selección por toque ignora los impactos dentro de la cuña (la geometría
// sigue ahí para el raycaster aunque el shader no la pinte).
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useTexture, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { layersFor, visualLayerRadii } from '../model/interiors';
import { textureSet } from './textures';
import { createCutFaceMaterial, addWedgeCut, createGlowShellMaterial } from './materials';

const CENTER = Math.atan2(3.1, 2.9); // la cuña mira a la cámara inicial
const BASE_HALF = Math.PI / 4;
const TWO_PI = Math.PI * 2;
// cámara algo girada respecto a la cuña: una cara casi de frente y la otra en escorzo
const CAM_AZ = CENTER - 0.42;
const CAM_DIR = new THREE.Vector3(Math.cos(CAM_AZ), 0.42, Math.sin(CAM_AZ)).normalize();
const _local = new THREE.Vector3();

const inWedge = (angle, half) => {
  const d = (((angle - CENTER + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI - Math.PI;
  return Math.abs(d) < half;
};

function halfFor(i, n, open, explode) {
  const step = n > 1 ? i / (n - 1) : 1;
  return open * (BASE_HALF + (BASE_HALF * 1.55 * step - BASE_HALF) * explode);
}

function Layer({ layer, index, count, seg, surfaceMap, isSun, cur, selected, feedback, onPick, showMarker, markerMode, number }) {
  const group = useRef();
  const faceA = useRef();
  const faceB = useRef();
  const markerRef = useRef();
  const wedge = useMemo(() => ({ uCenter: { value: CENTER }, uHalf: { value: 0 } }), []);
  const translucent = layer.translucent || 0;
  const isSurface = !!layer.surface;

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(layer.vOut, seg, Math.round(seg / 2)), [layer.vOut, seg]);
  const faceGeo = useMemo(() => new THREE.RingGeometry(Math.max(0.0001, layer.vIn), layer.vOut, Math.round(seg * 0.75), 1, -Math.PI / 2, Math.PI), [layer.vIn, layer.vOut, seg]);
  const sphereMat = useMemo(() => {
    if (translucent > 0) return createGlowShellMaterial(layer.color, wedge, 0.6 + translucent);
    const c = new THREE.Color(layer.color);
    const m = new THREE.MeshStandardMaterial({
      color: surfaceMap && isSurface ? '#ffffff' : c,
      map: surfaceMap && isSurface ? surfaceMap : null,
      roughness: 0.85,
      metalness: 0,
      emissive: isSun && isSurface ? new THREE.Color('#ffffff') : c,
      emissiveMap: isSun && isSurface ? surfaceMap : null,
      emissiveIntensity: isSun && isSurface ? 1.15 : (layer.glow || 0) * 0.55,
      side: THREE.DoubleSide,
    });
    return addWedgeCut(m, wedge);
  }, [layer, surfaceMap, isSurface, isSun, translucent, wedge]);
  const matA = useMemo(() => createCutFaceMaterial({
    colorIn: layer.colorIn, colorOut: layer.color, rIn: layer.vIn, rOut: layer.vOut, glow: layer.glow || 0, opacity: translucent ? Math.min(0.85, translucent + 0.25) : 1, shade: 1,
  }), [layer, translucent]);
  const matB = useMemo(() => createCutFaceMaterial({
    colorIn: layer.colorIn, colorOut: layer.color, rIn: layer.vIn, rOut: layer.vOut, glow: layer.glow || 0, opacity: translucent ? Math.min(0.85, translucent + 0.25) : 1, shade: 0.8,
  }), [layer, translucent]);
  useEffect(() => () => { sphereGeo.dispose(); faceGeo.dispose(); sphereMat.dispose(); matA.dispose(); matB.dispose(); }, [sphereGeo, faceGeo, sphereMat, matA, matB]);

  const isSel = selected === layer.id;
  const fb = feedback?.[layer.id] || 0; // 1 acierto · −1 fallo

  useFrame(({ clock }) => {
    const c = cur.current;
    const half = halfFor(index, count, c.open, c.explode);
    wedge.uHalf.value = half;
    const push = c.explode * Math.min(0.42, 0.11 * (count - 1 - index));
    if (group.current) group.current.position.set(Math.cos(CENTER) * push, push * 0.25, Math.sin(CENTER) * push);
    const show = half > 0.004 && !translucent;
    if (faceA.current) { faceA.current.visible = show; faceA.current.rotation.y = -(CENTER + half); }
    if (faceB.current) { faceB.current.visible = show; faceB.current.rotation.y = -(CENTER - half); }
    const t = clock.getElapsedTime();
    const anySel = !!selected;
    for (const m of [matA, matB]) {
      m.uniforms.uTime.value = t;
      m.uniforms.uHi.value = isSel ? 1 : 0;
      m.uniforms.uDim.value = anySel && !isSel ? 0.35 : 0;
      m.uniforms.uOk.value = fb;
    }
    if (translucent) {
      sphereMat.uniforms.uHi.value = isSel ? 1 : 0;
    } else {
      const base = isSun && isSurface ? 1.15 : (layer.glow || 0) * 0.55;
      sphereMat.emissiveIntensity = isSel ? base + 0.35 + Math.sin(t * 5) * 0.1 : base;
    }
    if (markerRef.current) {
      // en la cara de la derecha (la de la izquierda queda tras el panel), escalonadas en altura
      const a = CENTER - half * 0.98;
      const r = (layer.vIn + layer.vOut) / 2;
      const y = (index - (count - 1) / 2) * -0.13;
      markerRef.current.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    }
  });

  const handle = (e) => {
    if (e.delta > 6) return;
    e.object.worldToLocal(_local.copy(e.point));
    if (e.object.userData.sphere && inWedge(Math.atan2(_local.z, _local.x), wedge.uHalf.value)) return; // impacto en la cuña: sigue al siguiente
    e.stopPropagation();
    onPick?.(layer.id);
  };
  const over = (e) => { e.stopPropagation(); if (onPick) document.body.style.cursor = 'pointer'; };
  const out = () => { document.body.style.cursor = ''; };
  const noRay = translucent ? () => null : undefined;

  return (
    <group ref={group}>
      <mesh geometry={sphereGeo} material={sphereMat} userData={{ sphere: true }} onClick={handle} onPointerOver={over} onPointerOut={out} raycast={noRay} renderOrder={translucent ? 5 : 0} />
      <mesh ref={faceA} geometry={faceGeo} material={matA} onClick={handle} onPointerOver={over} onPointerOut={out} renderOrder={translucent ? 6 : 1} />
      <mesh ref={faceB} geometry={faceGeo} material={matB} onClick={handle} onPointerOver={over} onPointerOut={out} renderOrder={translucent ? 6 : 1} />
      {showMarker && (
        <group ref={markerRef}>
          <Html center zIndexRange={[12, 0]} style={{ pointerEvents: 'auto' }}>
            <button
              type="button"
              className={`ss-layer-tag ${isSel ? 'is-on' : ''} ${fb === 1 ? 'is-ok' : fb === -1 ? 'is-ko' : ''} ${markerMode === 'numbers' ? 'is-num' : ''}`}
              style={{ '--lc': layer.color }}
              onClick={(ev) => { ev.stopPropagation(); onPick?.(layer.id); }}
            >
              <span className="ss-layer-tag__n">{number}</span>
              {markerMode !== 'numbers' && <span className="ss-layer-tag__name">{layer.name}</span>}
            </button>
          </Html>
        </group>
      )}
    </group>
  );
}

function InteriorBody({ bodyId, tier, Q, open, explode, selected, feedback, onPick, showMarkers, markerMode, reduced }) {
  const T = textureSet(Q.tex);
  const map = useTexture(bodyId === 'earth' ? T.earth : T[bodyId]);
  useMemo(() => { map.colorSpace = THREE.SRGBColorSpace; map.needsUpdate = true; }, [map]);
  const layers = useMemo(() => visualLayerRadii(layersFor(bodyId, tier)), [bodyId, tier]);
  const cur = useRef({ open: 0, explode: 0 });
  useEffect(() => { cur.current = { open: reduced ? open : 0, explode: reduced ? explode : 0 }; }, [bodyId]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    const k = reduced ? 1 : 1 - Math.exp(-dt * 2.6);
    cur.current.open += (open - cur.current.open) * k;
    cur.current.explode += (explode - cur.current.explode) * k;
  });

  return (
    <group>
      {layers.map((l, i) => (
        <Layer
          key={`${bodyId}-${l.id}`}
          layer={l}
          index={i}
          count={layers.length}
          seg={Q.interiorSeg}
          surfaceMap={map}
          isSun={bodyId === 'sun'}
          cur={cur}
          selected={selected}
          feedback={feedback}
          onPick={onPick}
          showMarker={showMarkers}
          markerMode={markerMode}
          number={i + 1}
        />
      ))}
    </group>
  );
}

function InteriorCamera({ bodyId, reduced, frame }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const size = useThree((s) => s.size);
  const fl = useRef(null);
  useEffect(() => {
    if (!controls) return;
    const aspect = size.width / Math.max(1, size.height);
    const reach = bodyId === 'sun' ? 1.5 : 1.08;
    const dist = 3.7 * reach * Math.max(1, 1.15 / aspect);
    const to = CAM_DIR.clone().multiplyScalar(dist);
    // desplaza el encuadre para que el panel no tape el modelo
    const target = new THREE.Vector3();
    if (frame === 'left') target.copy(new THREE.Vector3().crossVectors(CAM_DIR, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(0.62 * reach));
    if (frame === 'bottom') target.set(0, -1.2 * reach, 0);
    if (frame === 'right') target.copy(new THREE.Vector3().crossVectors(CAM_DIR, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(-0.62 * reach));
    to.add(target);
    fl.current = { from: camera.position.clone(), fromT: controls.target.clone(), to, toT: target, t: 0, dur: reduced ? 0.01 : 1.3 };
  }, [bodyId, controls, camera, reduced, frame]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((_, dt) => {
    const f = fl.current;
    if (!f || !controls) return;
    f.t = Math.min(1, f.t + dt / f.dur);
    const e = f.t < 0.5 ? 4 * f.t ** 3 : 1 - (-2 * f.t + 2) ** 3 / 2;
    camera.position.lerpVectors(f.from, f.to, e);
    controls.target.lerpVectors(f.fromT, f.toT, e);
    if (f.t >= 1) fl.current = null;
  });
  return null;
}

export default function InteriorScene({
  Q, bodyId = 'earth', tier = 3, open = 1, explode = 0, selected = null, feedback = null, onPick,
  showMarkers = true, markerMode = 'names', reduced = false, frame = 'center',
}) {
  return (
    <>
      <color attach="background" args={['#04040f']} />
      <ambientLight intensity={0.42} color="#c7d2fe" />
      <directionalLight position={[5, 4, 6]} intensity={2.1} color="#fff4e0" />
      <directionalLight position={[-6, -2, -4]} intensity={0.5} color="#7c8cff" />
      <Stars radius={60} depth={40} count={Math.round(Q.stars / 3)} factor={3} saturation={0.1} fade speed={0.4} />
      <InteriorBody
        bodyId={bodyId} tier={tier} Q={Q} open={open} explode={explode} selected={selected} feedback={feedback}
        onPick={onPick} showMarkers={showMarkers} markerMode={markerMode} reduced={reduced}
      />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} enablePan={false} minDistance={1.8} maxDistance={10} rotateSpeed={0.7} />
      <InteriorCamera bodyId={bodyId} reduced={reduced} frame={frame} />
    </>
  );
}
