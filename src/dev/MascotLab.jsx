// Laboratorio de la mascota — SOLO en desarrollo (ruta /__mascot).
// Muestra cada número del robot en bucle para revisarlos uno a uno.
//   /__mascot                → todos los números en rejilla
//   /__mascot?act=dance      → solo uno, grande
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import RobotMascot from '@/components/RobotMascot';
import { ACTS } from '@/components/mascot/acts';

function Looping({ act, size }) {
  const [key, setKey] = useState(1);
  useEffect(() => {
    const dur = Math.min(ACTS[act].dur, 6000);
    const id = setInterval(() => setKey((k) => k + 1), dur + 700);
    return () => clearInterval(id);
  }, [act]);
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
      <div style={{ width: size }}><RobotMascot act={act} actKey={key} /></div>
      <code style={{ color: '#e0e7ff', font: '700 13px ui-monospace, monospace' }}>{act}</code>
    </div>
  );
}

export default function MascotLab() {
  const [params] = useSearchParams();
  const only = params.get('act');
  useEffect(() => { document.documentElement.dataset.fx = 'high'; }, []);
  const acts = only ? only.split(',') : Object.keys(ACTS).filter((a) => a !== 'watch');
  return (
    <div style={{ minHeight: '100vh', padding: 40, background: 'linear-gradient(160deg,#1e1b4b,#312e81 50%,#4c1d95)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${only ? Math.min(acts.length, 3) : 5}, 1fr)`, gap: '56px 24px', paddingTop: 40 }}>
        {acts.map((a) => <Looping key={a} act={a} size={only ? 300 : 190} />)}
      </div>
    </div>
  );
}
