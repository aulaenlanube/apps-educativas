// "Modo partida" de los fondos 3D decorativos (ciudad, espacio, isla).
//
// Dentro de una app (ruta /curso/…/app/:appId) el fondo no debe competir con el
// juego por la GPU: el fondo deja de animarse (0 fps, sin bucle) y se cubre con
// una FOTO difuminada de su último fotograma, que entra con un fundido.
//
// La foto se hace UNA vez: se pinta el fotograma y, en la misma tarea (el búfer
// de WebGL sigue intacto), se copia reducido a un <canvas> 2D con desenfoque.
// Ese canvas es una imagen estática: mientras se juega no cuesta nada. Nada de
// `filter: blur()` en CSS (se recalcularía en cada composición con el juego
// repintándose encima) ni de bajar la resolución del 3D (se ve pixelado).
//
// Al volver a las páginas de asignatura/apps la foto se desvanece y el 3D sigue.
//
// Uso en cada fondo:
//   const snap = usePlaySnapshot();
//   <Canvas …> … <PlaySnapshot playing={playing} snap={snap} /> </Canvas>
//   <PlaySnapshotLayer snap={snap} playing={playing} />
import React, { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import './bg3d.css';

// Reducción de la foto respecto al lienzo y desenfoque (px de la foto reducida).
const SNAP_SCALE = 1 / 5;
const SNAP_BLUR = 2.5;
// Espera antes de la foto: deja que la escena termine de asentarse (al entrar
// directamente en una app el fondo acaba de montarse).
const SNAP_DELAY = 260;

export function usePlaySnapshot() {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  return { ref, ready, setReady };
}

export function PlaySnapshot({ playing, snap }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const { ref, setReady } = snap;

  useEffect(() => {
    if (!playing) { setReady(false); return undefined; }
    const id = setTimeout(() => {
      const out = ref.current;
      const src = gl.domElement;
      if (!out || !src.width || !src.height) return;
      try {
        gl.render(scene, camera);
        const w = Math.max(48, Math.round(src.width * SNAP_SCALE));
        const h = Math.max(32, Math.round(src.height * SNAP_SCALE));
        out.width = w;
        out.height = h;
        const ctx = out.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        // sin ctx.filter (Safari antiguo) la reducción ya suaviza bastante
        if ('filter' in ctx) ctx.filter = `blur(${SNAP_BLUR}px)`;
        // margen para que el desenfoque no oscurezca los bordes
        const m = SNAP_BLUR * 2;
        ctx.drawImage(src, -m, -m, w + m * 2, h + m * 2);
        setReady(true);
      } catch {
        // sin foto el fondo se queda congelado y nítido: también vale
      }
    }, SNAP_DELAY);
    return () => clearTimeout(id);
  }, [playing, gl, scene, camera, size.width, size.height, ref, setReady]);

  return null;
}

export function PlaySnapshotLayer({ snap, playing }) {
  return (
    <>
      <canvas ref={snap.ref} className={`bg3d-snap ${playing && snap.ready ? 'is-on' : ''}`} aria-hidden="true" />
      <div className={`bg3d-play-veil ${playing ? 'is-on' : ''}`} />
    </>
  );
}
