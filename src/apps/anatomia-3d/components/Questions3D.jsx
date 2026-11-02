// Preguntas y sujetos propios de Anatomía 3D (se cargan con el visor 3D):
//   PlaceQuestion  «Monta el cuerpo»: arrastrar una pieza suelta hasta su sitio
//   UnderSubject   «¿Qué hay debajo?»: un punto en la piel; al contestar, la piel se vuelve holograma
//   CutSubject     «Cortes y TAC»: el cuerpo cortado por un plano, mirando la cara del corte
import { useCallback, useMemo, useRef, useState } from 'react';
import useGraphicsQuality from '@/hooks/useGraphicsQuality';
import { Body3DCanvas, Body3D } from '../../_shared/anatomia3d/Body3D';
import { cameraFor } from '../../_shared/anatomia3d/world3d';
import '../../_shared/anatomia3d/anatomia3d.css';

const TOLERANCE = { easy: 48, medium: 38, exam: 32 }; // px entre la pieza y su sitio
const TRIES = { es: (n) => `Intentos: ${n}`, en: (n) => `Tries left: ${n}`, va: (n) => `Intents: ${n}` };

export function PlaceQuestion({ q, done, difficulty, paused, onAnswer, lang = 'es' }) {
  const { tier } = useGraphicsQuality();
  const id = `${q.layer}:${q.n}`;
  const [offset, setOffset] = useState(q.start);
  const [tries, setTries] = useState(0);
  const [result, setResult] = useState(null); // 'correct' | 'target'
  const [flash, setFlash] = useState(0);
  const [holding, setHolding] = useState(false);
  const triesRef = useRef(0);

  const onDrop = useCallback((_off, px) => {
    setHolding(false);
    if (done || paused || result) return;
    const attempt = triesRef.current + 1;
    if (px <= (TOLERANCE[difficulty] || 38)) {
      setOffset([0, 0, 0]);
      setResult('correct');
      onAnswer(true, q.key, attempt);
      return;
    }
    triesRef.current = attempt;
    setTries(attempt);
    if (attempt >= q.attempts) {
      // se coloca sola para que se vea dónde iba
      setOffset([0, 0, 0]);
      setResult('target');
      onAnswer(false, null, attempt);
    } else {
      setOffset([...q.start]);
      setFlash((n) => n + 1);
    }
  }, [done, paused, result, difficulty, q, onAnswer]);

  const layers = useMemo(() => ({ piel: 'ghost', [q.layer]: 'solid' }), [q.layer]);
  const offsets = useMemo(() => ({ [id]: offset }), [id, offset]);
  const drag = useMemo(() => (result || done ? null : { id, onDrop }), [result, done, id, onDrop]);
  const states = useMemo(() => {
    const st = result || (done ? 'target' : 'hint');
    return { [id]: st };
  }, [id, result, done]);
  const layer = q.layer;
  // anillo de agarre sobre la pieza suelta y, en fácil, el hueco donde va
  const markers = useMemo(() => {
    if (result || !q.slot) return null;
    const out = [];
    if (q.hintSlot) out.push({ at: q.slot, tone: 'slot' });
    if (!holding) out.push({ at: q.slot.map((v, i) => v + q.start[i]), tone: 'grip' });
    return out;
  }, [q.hintSlot, q.slot, q.start, result, holding]);

  return (
    <div className="a3d-q" onPointerDownCapture={() => setHolding(true)} onPointerUpCapture={() => setTimeout(() => setHolding(false), 0)}>
      <div className="gq-map ana-map ana-map--3d gq-map--game">
        <Body3DCanvas tier={tier} initial={q.camera}>
          <Body3D
            layers={layers}
            lod={tier === 'high' ? 'h' : 'l'}
            states={states}
            pickable={[layer]}
            offsets={offsets}
            drag={drag}
            markers={markers}
            isolate={null}
          />
        </Body3DCanvas>
        <div key={flash} className={`a3d-q__flash${flash ? ' is-on' : ''}`} />
        <div className="a3d-q__bar">
          {!result && <span className="a3d-q__help">{q.helpText}</span>}
          {!result && q.attempts > 1 && <span className="a3d-q__tries">{(TRIES[lang] || TRIES.es)(q.attempts - tries)}</span>}
        </div>
      </div>
    </div>
  );
}

const TORSO = [-0.24, 0.8, -0.18, 0.24, 1.78, 0.2];

export function UnderSubject({ s, done }) {
  const { tier } = useGraphicsQuality();
  const cam = useMemo(() => {
    const c = cameraFor(TORSO, s.dir === 'back' ? 'back' : 'front', 0.95);
    // el punto en el centro de la imagen
    return { camera: [s.at[0] + (c.camera[0] - c.target[0]), s.at[1] + 0.05 + (c.camera[1] - c.target[1]), c.camera[2]], target: [s.at[0], s.at[1] + 0.05, c.target[2]] };
  }, [s]);
  const layers = useMemo(() => (done ? { piel: 'ghost', organos: 'solid', esqueleto: 'ghost' } : { piel: 'solid', organos: 'hidden', esqueleto: 'hidden' }), [done]);
  const states = useMemo(() => (done ? { [s.key]: 'correct' } : null), [done, s.key]);
  const markers = useMemo(() => [{ at: s.at, tone: 'info' }], [s.at]);
  return (
    <div className="gq-map ana-map ana-map--3d">
      <Body3DCanvas tier={tier} initial={cam}>
        <Body3D layers={layers} lod={tier === 'high' ? 'h' : 'l'} states={states} markers={markers} />
      </Body3DCanvas>
    </div>
  );
}

const CUT_LAYERS = { piel: 'solid', musculos: 'solid', 'musculos-prof': 'solid', organos: 'solid', esqueleto: 'solid' };

export function CutSubject({ s, done }) {
  const { tier } = useGraphicsQuality();
  const cam = useMemo(() => {
    if (s.axis === 'x') return { camera: [1.75, 1.25, 0.25], target: [0, 1.2, 0] };
    if (s.axis === 'z') return { camera: [0.22, 1.25, 1.85], target: [0, 1.2, 0] };
    return { camera: [0, s.at + 0.95, 0.42], target: [0, s.at - 0.02, 0] };
  }, [s]);
  const clip = useMemo(() => ({ axis: s.axis, at: s.at }), [s.axis, s.at]);
  const states = useMemo(() => (s.key ? { [s.key]: done ? 'correct' : 'selected' } : null), [s.key, done]);
  return (
    <div className="gq-map ana-map ana-map--3d">
      <Body3DCanvas tier={tier} initial={cam}>
        <Body3D layers={CUT_LAYERS} lod="l" clip={clip} states={states} />
      </Body3DCanvas>
    </div>
  );
}
