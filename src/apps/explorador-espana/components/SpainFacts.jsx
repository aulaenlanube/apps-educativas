// Fichas del Atlas de España: comunidad autónoma, provincia y Gibraltar.
import React from 'react';
import { Users, Landmark, Ruler, MapPin, Layers } from 'lucide-react';
import { Flag, Shape } from '../../_shared/geo/Visuals';
import { formatPopulation } from '../../explorador-mundo/data/countries';
import { formatArea } from '../../explorador-mundo/components/CountryFacts';
import {
  CCAA_BY_ID, ZONES, provincesOf, provKey, ccaaShort, ccaaFlag, provOfKey,
} from '../data/spain';

const zoneLabel = (id) => ZONES.find((z) => z.id === id)?.label || '';

function Chips({ items, onSelect }) {
  return (
    <span className="gq-facts__nb">
      {items.map((it) => (
        <button key={it.key} type="button" className="gq-nb-chip" onClick={() => onSelect?.(it.key)}>
          {it.flag && <Flag flag={it.flag} />} {it.label}
        </button>
      ))}
    </span>
  );
}

export function CcaaFacts({ world, id, onSelect }) {
  const c = CCAA_BY_ID[id];
  const e = world.layers.ccaa.get(id);
  if (!c || !e) return null;
  const provs = provincesOf(id);
  const neighbors = [...world.neighborsOf(id, 'ccaa')].map((k) => CCAA_BY_ID[k]).filter(Boolean)
    .sort((a, b) => ccaaShort(a).localeCompare(ccaaShort(b), 'es'));
  const area = formatArea(e.areaKm2);
  return (
    <div className="gq-facts">
      <div className="gq-facts__head">
        <Flag flag={ccaaFlag(c)} className="gq-flag--lg" alt={`Bandera de ${c.name}`} />
        <div>
          <h3 className="gq-facts__name">{c.name}</h3>
          <div className="gq-facts__chips">
            <span className="gq-cont-chip" style={{ '--c': c.color }}>{c.autonomous ? 'Ciudad autónoma' : 'Comunidad autónoma'}</span>
            <span className="gq-facts__sub">{zoneLabel(c.zone)}</span>
          </div>
        </div>
      </div>
      <dl className="gq-facts__list">
        <div><dt><Landmark size={15} /> Capital</dt><dd>{c.cap}{c.capNote && <small>{c.capNote}</small>}</dd></div>
        <div><dt><Users size={15} /> Población</dt><dd>{formatPopulation(c.pop)}</dd></div>
        {area && <div><dt><Ruler size={15} /> Superficie</dt><dd>{area}</dd></div>}
        {!c.autonomous && (
          <div>
            <dt><Layers size={15} /> {provs.length === 1 ? 'Provincia' : `Provincias (${provs.length})`}</dt>
            <dd><Chips items={provs.map((p) => ({ key: provKey(p), label: p.name }))} onSelect={onSelect} /></dd>
          </div>
        )}
        <div>
          <dt><MapPin size={15} /> Limita con</dt>
          <dd>
            {neighbors.length
              ? <Chips items={neighbors.map((n) => ({ key: n.id, label: ccaaShort(n), flag: ccaaFlag(n) }))} onSelect={onSelect} />
              : (c.autonomous ? 'Con Marruecos: no limita con ninguna comunidad.' : 'Es un archipiélago: no limita por tierra con ninguna comunidad.')}
          </dd>
        </div>
      </dl>
      {!c.autonomous && (
        <div className="gq-facts__shape">
          <Shape d={world.shapePath(id, 180, 10, 'ccaa')} size={180} tone="sky" label={`Silueta de ${c.name}`} />
        </div>
      )}
    </div>
  );
}

export function ProvFacts({ world, provKeyValue, onSelect }) {
  const p = provOfKey(provKeyValue);
  if (!p) return null;
  const c = CCAA_BY_ID[p.ccaa];
  const e = world.layers.prov.get(provKeyValue);
  const neighbors = [...world.neighborsOf(provKeyValue, 'prov')].map(provOfKey).filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const area = formatArea(e?.areaKm2);
  return (
    <div className="gq-facts">
      <div className="gq-facts__head">
        <Flag flag={ccaaFlag(c)} className="gq-flag--lg" alt={`Bandera de ${c.name}`} />
        <div>
          <h3 className="gq-facts__name">{p.autonomous ? p.name : `Provincia de ${p.name}`}</h3>
          <div className="gq-facts__chips">
            <button type="button" className="gq-cont-chip" style={{ '--c': c.color }} onClick={() => onSelect?.(c.id)}>{ccaaShort(c)}</button>
          </div>
        </div>
      </div>
      <dl className="gq-facts__list">
        <div><dt><Landmark size={15} /> Capital</dt><dd>{p.cap}{p.trap && <small>{p.trap} es más poblada, pero no es la capital.</small>}</dd></div>
        {area && <div><dt><Ruler size={15} /> Superficie</dt><dd>{area}</dd></div>}
        <div>
          <dt><MapPin size={15} /> Limita con</dt>
          <dd>
            {neighbors.length
              ? <Chips items={neighbors.map((n) => ({ key: provKey(n), label: n.name }))} onSelect={onSelect} />
              : 'No limita por tierra con otras provincias.'}
          </dd>
        </div>
      </dl>
      <div className="gq-facts__shape">
        <Shape d={world.shapePath(provKeyValue, 180, 10, 'prov')} size={180} tone="sky" label={`Silueta de ${p.name}`} />
      </div>
    </div>
  );
}

export function GibraltarCard({ entry }) {
  return (
    <div className="gq-atlas__empty gq-atlas__terr">
      <MapPin size={22} />
      <strong>{entry.name}</strong>
      <p>{entry.terr?.note}</p>
    </div>
  );
}
