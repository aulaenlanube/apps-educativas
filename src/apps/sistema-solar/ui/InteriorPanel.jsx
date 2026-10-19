// src/apps/sistema-solar/ui/InteriorPanel.jsx
// Interfaz del visor de capas: elegir astro, abrir/cerrar el corte, separar
// las capas y la leyenda numerada (la misma numeración que las etiquetas 3D).
// Al tocar una capa (aquí o en el modelo) se abre su ficha.
import React from 'react';
import { X, Scissors, Layers3, Combine, Info, Thermometer, Droplets, Ruler, FlaskConical, AlertCircle } from 'lucide-react';
import { GameButton } from '../../_shared/kit';
import { BODY_COLOR, bodyName } from '../model/planetFacts';
import { INTERIORS, INTERIOR_IDS, layersFor, visualLayerRadii } from '../model/interiors';
import PlanetOrb from './PlanetOrb';

// «Probablemente líquido (no se sabe)» → «¿líquido?»; «Sólido (fluye…)» → «Sólido»
const shortState = (st = '') => (/^probablemente /i.test(st) ? `¿${st.split(/\s+/)[1]}?` : st.split(/[ (;,]/)[0]);

const ORDER = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].filter((id) => INTERIOR_IDS.includes(id));

export default function InteriorPanel({ bodyId, stage, open, explode, selected, onBody, onOpen, onExplode, onSelect, onClose }) {
  const it = INTERIORS[bodyId];
  const layers = visualLayerRadii(layersFor(bodyId, stage));
  const sel = layers.find((l) => l.id === selected);
  const basic = stage <= 2;

  return (
    <>
      <nav className="ssi-bodies" aria-label="Elegir astro">
        {ORDER.map((id) => (
          <button key={id} type="button" className={`ssi-bodies__item ${id === bodyId ? 'is-active' : ''}`} style={{ '--pc': BODY_COLOR[id] }} onClick={() => onBody(id)} aria-pressed={id === bodyId}>
            <PlanetOrb id={id} size={26} />
            <span>{bodyName(id)}</span>
          </button>
        ))}
      </nav>

      <aside className="ssi-panel" style={{ '--pc': BODY_COLOR[bodyId] }} aria-label={it.title}>
        <header className="ssi-panel__head">
          <span className="ssi-panel__icon"><Layers3 size={20} /></span>
          <div className="ssi-panel__titles">
            <span>Viaje al interior</span>
            <h2>{it.title}</h2>
          </div>
          <button type="button" className="ss-exit" onClick={onClose} aria-label="Cerrar el visor de capas"><X size={15} strokeWidth={3} /> <span>Salir</span></button>
        </header>

        <div className="ssi-panel__ctrl">
          <GameButton size="sm" variant={open ? 'soft' : 'warning'} icon={open ? Combine : Scissors} onClick={() => onOpen(!open)}>
            {open ? 'Cerrar el corte' : 'Abrir por la mitad'}
          </GameButton>
          <GameButton size="sm" variant={explode ? 'primary' : 'soft'} icon={Layers3} onClick={() => onExplode(!explode)} disabled={!open}>
            {explode ? 'Unir capas' : 'Separar capas'}
          </GameButton>
        </div>

        <ol className="ssi-legend">
          {layers.map((l, i) => (
            <li key={l.id}>
              <button type="button" className={`ssi-legend__item ${selected === l.id ? 'is-on' : ''}`} style={{ '--lc': l.color }} onClick={() => onSelect(selected === l.id ? null : l.id)}>
                <span className="ssi-legend__n">{i + 1}</span>
                <span className="ssi-legend__name">{l.name}</span>
                <span className="ssi-legend__state">{shortState(l.state)}</span>
              </button>
            </li>
          ))}
        </ol>

        {sel ? (
          <section className="ssi-layer" style={{ '--lc': sel.color }} key={sel.id}>
            <h3>{sel.name}</h3>
            <p>{basic ? sel.basic || sel.desc : sel.desc}</p>
            <dl>
              {sel.depth && <><dt><Ruler size={13} /> Dónde</dt><dd>{sel.depth}</dd></>}
              {sel.state && <><dt><Droplets size={13} /> Estado</dt><dd>{sel.state}</dd></>}
              {sel.temp && <><dt><Thermometer size={13} /> Temperatura</dt><dd>{sel.temp}</dd></>}
              {sel.composition && !basic && <><dt><FlaskConical size={13} /> Composición</dt><dd>{sel.composition}</dd></>}
            </dl>
            {sel.exaggerated && <p className="ssi-layer__warn"><AlertCircle size={13} /> En el modelo su grosor está exagerado para que se vea.</p>}
          </section>
        ) : (
          <p className="ssi-panel__tip"><Info size={14} /> Toca una capa del modelo o de la lista. Arrastra para girarlo.</p>
        )}
        <p className="ssi-panel__note">{it.note}</p>
      </aside>
    </>
  );
}
