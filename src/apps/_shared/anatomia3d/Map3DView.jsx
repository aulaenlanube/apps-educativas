// Visor 3D con el contrato de MapView (src/apps/_shared/geo/MapView.jsx) para que
// el motor de juego (QuizPlay, GeoDuel) juegue en 3D sin cambios: lo monta un
// ámbito 3D (world3d.js, scope.View) en lugar del mapa.
//   states: { clave: estado } · pickable · onPick(clave, grupo) · labels [{ text, tone, at }]
//   view: { camera, target } (encuadre de la pregunta) · hud · interactive (preguntas de «¿qué es?»)
// Al contestar, la cámara vuela a la estructura acertada o a la que se pedía.
import { useCallback, useMemo, useState } from 'react';
import useGraphicsQuality from '@/hooks/useGraphicsQuality';
import { Body3DCanvas, Body3D } from './Body3D';
import { keyForLevel } from './world3d';
import { Trail3D, Robot3D } from './Journey3D';
import './anatomia3d.css';

export default function Map3DView({ question = null, world, view, states, pickable = false, onPick, labels, hud, className = '', ariaLabel, interactive = true }) {
  const { tier } = useGraphicsQuality();
  const [loaded, setLoaded] = useState(false);
  const scene = world.scene;
  const lv = world.lv3d ?? 6;
  const subjectKey = !pickable && states ? Object.entries(states).find(([, s]) => s === 'selected')?.[0] : null;
  const resultKey = useMemo(() => Object.entries(states || {}).find(([, s]) => s === 'correct' || s === 'target')?.[0] || null, [states]);
  const focus = question?.trail?.length ? null : (resultKey || subjectKey || null);
  const initial = view?.camera ? { camera: view.camera, target: view.target } : null;

  const pick = useCallback((key, hit) => {
    if (!pickable || !hit) return;
    const lk = keyForLevel(hit.part, lv);
    const k = world.entries.has(lk) ? lk : hit.part.k;
    onPick?.(k, world.entries.get(k)?.cont || null, null);
  }, [pickable, lv, world, onPick]);

  // Recorrido (Viaje): estela por las paradas y el robot en la última (al acertar, avanza)
  const journey = useMemo(() => {
    const trail = question?.trail;
    if (!trail?.length) return null;
    const at = (k) => world.entries.get(k)?.centroid;
    const keys = resultKey === question.target && question.kind === 'locate' ? [...trail, question.target] : trail;
    const pts = keys.map(at).filter(Boolean);
    if (!pts.length) return null;
    const robotTo = pts[pts.length - 1];
    const robotFrom = pts.length > 1 ? pts[pts.length - 2] : (question.robotFrom ? at(question.robotFrom) : null);
    return { pts, robotTo, robotFrom };
  }, [question, world, resultKey]);

  const labels3d = useMemo(() => (labels || []).filter((l) => l.at?.length === 3).map((l) => ({ at: l.at, text: l.text, tone: l.tone === 'bad' ? 'bad' : l.tone === 'good' ? 'good' : l.tone === 'target' ? 'target' : 'info' })), [labels]);

  return (
    <div className={`gq-map ana-map ana-map--3d ${className} ${pickable ? 'is-pickable' : ''}`} role="img" aria-label={ariaLabel}>
      <Body3DCanvas tier={tier} initial={initial} className={interactive || pickable ? '' : 'is-static'}>
        <Body3D
          layers={scene.layers}
          only={scene.only}
          lod={tier === 'high' ? 'h' : 'l'}
          states={states}
          pickable={scene.pick}
          onPick={pickable ? pick : null}
          onHover={pickable ? () => {} : null}
          focus={focus}
          focusPad={resultKey ? 2.4 : 2.1}
          labels={labels3d}
          onLoaded={() => setLoaded(true)}
        />
        {journey && loaded && <Trail3D points={journey.pts} />}
        {journey && loaded && <Robot3D key={journey.robotTo.join(',')} from={journey.robotFrom} to={journey.robotTo} />}
      </Body3DCanvas>
      {!loaded && <div className="a3d-loading"><span className="a3d-spinner" /></div>}
      {hud && <div className="gq-map__hud" onPointerDown={(e) => e.stopPropagation()}>{hud}</div>}
    </div>
  );
}
