// Banco de pruebas del visor 3D del cuerpo humano (solo en desarrollo): /__anatomia3d
// ?lang=es|en|va  ?lv=1..6  ?stop=piel|musculos|musculos-prof|organos|esqueleto
// ?move=flex-codo → movimiento con el esqueleto articulado
// ?journey=1 → tramo de un recorrido de Viaje por el Cuerpo en 3D (estela y robot)
import { useEffect, useMemo, useState } from 'react';
import Explorer3D from '@/apps/_shared/anatomia3d/Explorer3D';
import Map3DView from '@/apps/_shared/anatomia3d/Map3DView';
import Move3D from '@/apps/_shared/anatomia3d/Move3D';
import { attach3d } from '@/apps/_shared/anatomia3d/world3d';
import { loadBodyWorld } from '@/apps/_shared/anatomia/world';
import { setLang } from '@/apps/_shared/anatomia/text';

function JourneyLab({ done }) {
  const [world, setWorld] = useState(null);
  useEffect(() => { loadBodyWorld().then((w) => attach3d(w, Map3DView)).then(setWorld); }, []);
  if (!world) return null;
  const scope = world.scope('3d:org-a');
  const q = { kind: 'locate', layer: '3d:org-a', target: 'intestino-delgado', trail: ['esofago', 'estomago'], robotFrom: 'esofago' };
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Map3DView question={q} world={scope} view={scope.views.world} states={done ? { 'intestino-delgado': 'correct' } : {}} pickable={!done} labels={[]} className="gq-map--game" />
    </div>
  );
}

export default function Anatomy3DLab() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const lang = params.get('lang') || 'es';
  setLang(lang);
  return (
    <div style={{ minHeight: '100vh', background: '#050b15', padding: 16 }}>
      {params.get('move') ? <div style={{ maxWidth: 900, margin: '0 auto', aspectRatio: '4 / 3' }}><Move3D fig={params.get('move')} /></div> : params.get('journey')
        ? <JourneyLab done={params.get('journey') === '2'} />
        : <Explorer3D lang={lang} lv={+(params.get('lv') || 6)} initialStop={params.get('stop') || 'musculos'} />}
    </div>
  );
}
