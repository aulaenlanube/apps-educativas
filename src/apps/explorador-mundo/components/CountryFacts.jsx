// Ficha de un país en el Atlas del mundo y de un territorio que no es país.
import React from 'react';
import { Users, Building2, Landmark, Ruler, MapPin } from 'lucide-react';
import { Flag, Shape } from '../../_shared/geo/Visuals';
import { BY_ISO, CONTINENTS, SUBREGIONS, formatPopulation } from '../data/countries';

export function formatArea(km2) {
  if (!km2 || km2 < 3000) return null;
  const mag = 10 ** (Math.floor(Math.log10(km2)) - 1);
  return `≈ ${(Math.round(km2 / mag) * mag).toLocaleString('es-ES')} km²`;
}

export default function CountryFacts({ world, iso, onSelect }) {
  const k = BY_ISO[iso];
  const e = world?.entries.get(iso);
  if (!k) return null;
  const neighbors = [...(world?.neighbors.get(iso) || [])].map((c) => BY_ISO[c]).filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const area = formatArea(e?.areaKm2);
  const city = k.city === false ? null : k.city || null;
  return (
    <div className="gq-facts">
      <div className="gq-facts__head">
        <Flag flag={iso} className="gq-flag--lg" alt={`Bandera de ${k.name}`} />
        <div>
          <h3 className="gq-facts__name">{k.name}</h3>
          <div className="gq-facts__chips">
            <span className="gq-cont-chip" style={{ '--c': CONTINENTS[k.cont].color }}>{CONTINENTS[k.cont].name}</span>
            {k.cont2 && <span className="gq-cont-chip" style={{ '--c': CONTINENTS[k.cont2].color }}>{CONTINENTS[k.cont2].name}</span>}
            <span className="gq-facts__sub">{SUBREGIONS[k.sub]}</span>
          </div>
        </div>
      </div>
      <dl className="gq-facts__list">
        <div><dt><Landmark size={15} /> Capital</dt><dd>{k.cap}{k.capNote && <small>{k.capNote}</small>}</dd></div>
        <div><dt><Users size={15} /> Población</dt><dd>{formatPopulation(k.pop)}</dd></div>
        {city && <div><dt><Building2 size={15} /> Ciudad más poblada</dt><dd>{city}<small>No es la capital: ¡ojo con esta trampa!</small></dd></div>}
        {k.city === undefined && <div><dt><Building2 size={15} /> Ciudad más poblada</dt><dd>{k.cap} <small>(también es la capital)</small></dd></div>}
        {area && <div><dt><Ruler size={15} /> Superficie</dt><dd>{area}</dd></div>}
        <div>
          <dt><MapPin size={15} /> Fronteras</dt>
          <dd>
            {neighbors.length ? (
              <span className="gq-facts__nb">
                {neighbors.map((n) => (
                  <button key={n.c} type="button" className="gq-nb-chip" onClick={() => onSelect?.(n.c)}>
                    <Flag flag={n.c} /> {n.name}
                  </button>
                ))}
              </span>
            ) : 'Sin fronteras terrestres: está rodeado de mar.'}
          </dd>
        </div>
      </dl>
      {e?.hasShape && (
        <div className="gq-facts__shape">
          <Shape d={world.shapePath(iso, 180, 10)} size={180} tone="sky" label={`Silueta de ${k.name}`} />
        </div>
      )}
    </div>
  );
}

// Ficha de un territorio (Groenlandia, Sáhara Occidental…) tocado en el mapa.
export function TerritoryCard({ entry }) {
  return (
    <div className="gq-atlas__empty gq-atlas__terr">
      <MapPin size={22} />
      <strong>{entry.name}</strong>
      <p>{entry.terr?.note || 'Territorio que no es un Estado independiente.'}</p>
      <small>No es uno de los 195 países del juego.</small>
    </div>
  );
}
