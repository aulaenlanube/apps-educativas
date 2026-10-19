// src/apps/sistema-solar/ui/PlanetSheet.jsx
// Ficha del astro (panel oscuro del kit): Resumen (descripción por curso,
// cifras clave, comparación de tamaño con la Tierra), Datos (tabla que crece
// con el curso), Tú allí (peso, salto y edad calculados) y Exploración
// (curiosidades, misiones espaciales y puntos de interés descubiertos).
import React, { useMemo, useState } from 'react';
import {
  X, Ruler, Orbit, Thermometer, Sun, Layers, PlayCircle, Scale, Cake, MoveUp, Rocket, Lightbulb, MapPin, Clock,
  RotateCw, Satellite, Gauge, Atom, Wind, Magnet, CircleDot, Weight, Timer,
} from 'lucide-react';
import { Segmented, GameButton } from '../../_shared/kit';
import {
  FACTS, SPACE_MISSIONS, BODY_COLOR, fmt, fmtSmart, fmtHours, fmtDays, fmtSeconds, fmtSci,
  volumeVsEarth, weightOn, ageOn, jumpOn, lightSeconds, theName, ofName,
} from '../model/planetFacts';
import { INTERIORS } from '../model/interiors';
import PlanetOrb from './PlanetOrb';

const TABS = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'datos', label: 'Datos' },
  { value: 'tu', label: 'Tú allí' },
  { value: 'explora', label: 'Exploración' },
];

function descriptionFor(body, level, grade) {
  const d = body?.description;
  if (!d) return '';
  if (level === 'primaria') return parseInt(grade, 10) <= 3 ? d.primaryBasic : d.primaryAdvanced;
  if (level === 'ad') return d.primaryBasic;
  return d.secondary;
}

function dataRows(f, stage) {
  const rows = [
    { min: 1, icon: Ruler, label: 'Diámetro', value: `${fmt(f.diameterKm)} km` },
    f.kind === 'moon'
      ? { min: 1, icon: Orbit, label: 'Distancia a la Tierra', value: '384.400 km' }
      : f.au ? { min: 1, icon: Sun, label: 'Distancia al Sol', value: `${fmtSmart(f.au)} UA · ${fmt(f.distMkm)} M km` } : null,
    f.orbitDays ? { min: 1, icon: Orbit, label: f.kind === 'moon' ? 'Vuelta a la Tierra' : 'Año (vuelta al Sol)', value: fmtDays(f.orbitDays) } : null,
    f.dayHours ? { min: 2, icon: Clock, label: 'Día solar', value: fmtHours(f.dayHours) } : null,
    { min: f.kind === 'star' ? 1 : 3, icon: RotateCw, label: 'Rotación', value: `${fmtHours(f.rotationHours)}${f.rotationHours < 0 ? ' (retrógrada)' : ''}` },
    { min: 1, icon: Thermometer, label: 'Temperatura', value: f.tempText, wide: true },
    f.moons != null ? { min: 1, icon: Satellite, label: 'Lunas', value: f.moonsText || fmt(f.moons) } : null,
    { min: 1, icon: CircleDot, label: 'Anillos', value: f.rings ? (f.ringsText || 'Sí') : 'No' },
    { min: 2, icon: Gauge, label: 'Gravedad', value: `${fmtSmart(f.gravity)} m/s² (${fmtSmart(f.gravity / 9.8)} g)` },
    { min: 3, icon: Weight, label: 'Masa', value: stage >= 4 ? `${fmtSci(f.massKg)} kg (${fmtSmart(f.massEarth)} M⊕)` : `${fmtSmart(f.massEarth)} veces la Tierra` },
    { min: 3, icon: Atom, label: 'Densidad', value: `${fmtSmart(f.density)} g/cm³${f.density < 1 ? ' (¡menos que el agua!)' : ''}` },
    { min: 3, icon: RotateCw, label: 'Inclinación del eje', value: `${fmtSmart(f.obliquityDeg)}°` },
    f.au && f.kind !== 'moon' ? { min: 2, icon: Timer, label: 'La luz del Sol tarda', value: fmtSeconds(lightSeconds(f.id)) } : null,
    { min: 4, icon: Rocket, label: 'Velocidad de escape', value: `${fmtSmart(f.escapeKmS)} km/s` },
    f.orbitKmS ? { min: 4, icon: Orbit, label: 'Velocidad orbital', value: `${fmtSmart(f.orbitKmS)} km/s` } : null,
    f.eccentricity != null ? { min: 5, icon: Orbit, label: 'Excentricidad', value: fmt(f.eccentricity, 3) } : null,
    f.pressureText ? { min: 4, icon: Gauge, label: 'Presión en superficie', value: f.pressureText, wide: true } : null,
    { min: 2, icon: Wind, label: 'Atmósfera', value: f.atmosphere, wide: true },
    { min: 1, icon: Layers, label: 'Composición', value: f.composition, wide: true },
    { min: 3, icon: Magnet, label: 'Campo magnético', value: f.magnetic, wide: true },
  ];
  return rows.filter((r) => r && stage >= r.min);
}

function SizeCompare({ id }) {
  const f = FACTS[id];
  const v = volumeVsEarth(id);
  const big = f.radiusRel >= 1;
  // el mayor ocupa 120 px; el otro, a escala (mínimo 3 px para que se vea)
  const scaleA = big ? 1 : f.radiusRel;
  const scaleB = big ? 1 / f.radiusRel : 1;
  const sun = id === 'sun';
  return (
    <div className={`ss-cmp ${sun ? 'is-sun' : ''}`}>
      <div className="ss-cmp__stage">
        <span className="ss-cmp__body" style={{ '--d': `${Math.max(3, 116 * scaleA)}px` }}><PlanetOrb id={id} size={Math.max(3, Math.round(116 * scaleA))} /></span>
        {id !== 'earth' && (
          <span className="ss-cmp__body is-earth" style={{ '--d': `${Math.max(3, 116 * scaleB)}px` }}>
            <PlanetOrb id="earth" size={Math.max(3, Math.round(116 * scaleB))} />
          </span>
        )}
      </div>
      <p className="ss-cmp__text">
        {id === 'earth' && 'Nuestro planeta: el tamaño de referencia para comparar.'}
        {id !== 'earth' && v.bigger && <>Dentro {ofName(id)} cabrían <strong>{v.times >= 1e5 ? `${fmtSmart(v.times / 1e6)} millones de` : fmt(Math.round(v.times))}</strong> Tierras.</>}
        {id !== 'earth' && !v.bigger && <>Dentro de la Tierra cabrían <strong>{fmtSmart(v.times)}</strong> {id === 'moon' ? 'lunas' : `planetas como ${theName(id)}`}.</>}
        {id !== 'earth' && <small> Tamaños a escala: la Tierra, a la derecha.</small>}
      </p>
    </div>
  );
}

function Hero({ f }) {
  const items = f.kind === 'star'
    ? [
      { icon: Thermometer, label: 'Superficie', value: '5.500 °C' },
      { icon: Weight, label: 'Masa', value: '333.000 Tierras' },
      { icon: Clock, label: 'Edad', value: '4.600 M años' },
    ]
    : [
      f.kind === 'moon' ? { icon: Orbit, label: 'De la Tierra', value: '384.400 km' } : { icon: Sun, label: 'Del Sol', value: `${fmtSmart(f.au)} UA` },
      { icon: Orbit, label: f.kind === 'moon' ? 'Vuelta' : 'Año', value: fmtDays(f.orbitDays) },
      { icon: Thermometer, label: 'Media', value: `${fmt(f.tempMeanC)} °C` },
    ];
  return (
    <div className="ss-hero">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="ss-hero__cell">
          <Icon size={15} />
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function YouThere({ id, stage }) {
  const f = FACTS[id];
  const [mass, setMass] = useState(40);
  const [age, setAge] = useState(stage <= 2 ? 10 : stage <= 4 ? 13 : 17);
  const w = weightOn(id, mass);
  const a = ageOn(id, age);
  const jump = jumpOn(id, 50);
  const giant = f.kind === 'planet' && f.radiusRel > 3;
  return (
    <div className="ss-you">
      <section className="ss-you__card">
        <h4><Scale size={15} /> Tu peso en {theName(id)}</h4>
        <label className="ss-you__input">
          <span>Tu masa</span>
          <input type="range" min={15} max={120} step={1} value={mass} onChange={(e) => setMass(Number(e.target.value))} style={{ '--p': `${((mass - 15) / 105) * 100}%` }} />
          <input type="number" min={1} max={300} value={mass} onChange={(e) => setMass(Math.max(1, Math.min(300, Number(e.target.value) || 0)))} aria-label="Tu masa en kilos" />
          <em>kg</em>
        </label>
        {w && (
          <div className="ss-you__result">
            <div className="ss-you__scale" aria-hidden="true">
              <span className="ss-you__bar is-earth" style={{ transform: `scaleY(${Math.min(1, 1 / Math.max(1, w.ratio))})` }} />
              <span className="ss-you__bar" style={{ '--pc': BODY_COLOR[id], transform: `scaleY(${Math.min(1, w.ratio)})` }} />
            </div>
            <p>
              La báscula marcaría <strong>{fmtSmart(w.scaleKg)} kg</strong>
              {w.ratio >= 1.15 ? ` (${fmtSmart(w.ratio)} veces más que en la Tierra)` : w.ratio <= 0.85 ? ` (${fmtSmart(1 / w.ratio)} veces menos que en la Tierra)` : w.ratio > 1.02 ? ' (un poco más que en la Tierra)' : w.ratio < 0.98 ? ' (un poco menos que en la Tierra)' : ' (lo mismo que aquí)'}.
            </p>
            {stage >= 3 && (
              <p className="ss-you__note">Tu masa sigue siendo {fmt(mass)} kg: lo que cambia es tu <strong>peso</strong>, P = m · g = {fmt(mass)} kg · {fmtSmart(f.gravity)} m/s² ≈ <strong>{fmt(w.newtons)} N</strong> (en la Tierra, {fmt(mass * 9.8)} N).</p>
            )}
            {giant && <p className="ss-you__note">No tiene suelo: sería flotando en lo alto de sus nubes.</p>}
            {id === 'sun' && <p className="ss-you__note">Experimento mental: ¡a 5.500 °C nadie podría estar ahí!</p>}
          </div>
        )}
      </section>

      <section className="ss-you__card">
        <h4><MoveUp size={15} /> Tu salto</h4>
        <p>Si en la Tierra saltas <strong>50 cm</strong>, aquí saltarías <strong>{jump >= 100 ? `${fmtSmart(jump / 100)} m` : `${fmt(jump)} cm`}</strong>.</p>
      </section>

      {a != null && (
        <section className="ss-you__card">
          <h4><Cake size={15} /> Tu edad en {theName(id)}</h4>
          <label className="ss-you__input">
            <span>Tu edad</span>
            <input type="range" min={5} max={90} step={1} value={age} onChange={(e) => setAge(Number(e.target.value))} style={{ '--p': `${((age - 5) / 85) * 100}%` }} />
            <input type="number" min={1} max={120} value={age} onChange={(e) => setAge(Math.max(1, Math.min(120, Number(e.target.value) || 0)))} aria-label="Tu edad en años" />
            <em>años</em>
          </label>
          <p>Tendrías <strong>{a >= 10 ? fmt(a) : fmtSmart(a)} {Math.abs(a - 1) < 0.05 ? 'año' : 'años'}</strong> de {theName(id)}: allí un año dura {fmtDays(f.orbitDays)}.</p>
        </section>
      )}

      {f.dayHours && f.kind === 'planet' && id !== 'earth' && (
        <section className="ss-you__card">
          <h4><Clock size={15} /> Un día allí</h4>
          <p>Del amanecer al siguiente amanecer pasan <strong>{fmtHours(f.dayHours)}</strong>{f.dayHours > 48 ? ` (${fmtSmart(f.dayHours / 24)} días terrestres)` : ''}.</p>
        </section>
      )}
    </div>
  );
}

function Explore({ id, body, found, foundTotal }) {
  const missions = SPACE_MISSIONS[id] || [];
  const curiosities = body?.advanced?.curiosities || [];
  return (
    <div className="ss-xp">
      <section className="ss-xp__spots">
        <MapPin size={16} />
        <div>
          <strong>Puntos de interés: {found}/{foundTotal}</strong>
          <span>{found < foundTotal ? 'Toca los puntos dorados sobre el astro para descubrirlos.' : '¡Todos descubiertos!'}</span>
        </div>
        <span className="ss-xp__bar"><i style={{ transform: `scaleX(${foundTotal ? found / foundTotal : 0})` }} /></span>
      </section>
      {curiosities.length > 0 && (
        <section className="ss-xp__block">
          <h4><Lightbulb size={14} /> Curiosidades</h4>
          <ul>{curiosities.map((c) => <li key={c}>{c}</li>)}</ul>
        </section>
      )}
      {missions.length > 0 && (
        <section className="ss-xp__block">
          <h4><Rocket size={14} /> Misiones espaciales</h4>
          <ol className="ss-timeline">
            {missions.map((m) => (
              <li key={m.name}>
                <span className="ss-timeline__year">{m.year}</span>
                <div>
                  <strong>{m.name} <small>{m.agency}</small></strong>
                  <p>{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

export default function PlanetSheet({ id, body, stage, level, grade, onClose, onInterior, onVideo, video, found = 0, foundTotal = 0 }) {
  const [tab, setTab] = useState('resumen');
  const f = FACTS[id];
  const rows = useMemo(() => dataRows(f, stage), [f, stage]);
  if (!f) return null;
  const description = descriptionFor(body, level, grade);
  const comp = body?.advanced?.composition;

  return (
    <aside className="ss-info" style={{ '--pc': BODY_COLOR[id] }} aria-label={`Ficha: ${f.name}`}>
      <div className="ss-info__head">
        <PlanetOrb id={id} size={60} />
        <div className="ss-info__titles">
          <span className="ss-info__kind">{f.typeLabel}</span>
          <h2>{f.name}</h2>
        </div>
        <button type="button" className="ss-exit" onClick={onClose} aria-label="Cerrar ficha">
          <X size={15} strokeWidth={3} /> <span>Salir</span>
        </button>
      </div>
      <div className="ss-info__tabs">
        <Segmented size="sm" options={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="ss-info__body">
        {tab === 'resumen' && (
          <>
            <p className="ss-info__desc">{description}</p>
            <Hero f={f} />
            <SizeCompare id={id} />
            <div className="ss-info__ctas">
              {INTERIORS[id] && <GameButton variant="primary" icon={Layers} onClick={onInterior}>Ver el interior en 3D</GameButton>}
              {video && <GameButton variant="soft" icon={PlayCircle} onClick={onVideo}>Vídeo</GameButton>}
            </div>
          </>
        )}

        {tab === 'datos' && (
          <>
            <div className="ss-data">
              {rows.map(({ icon: Icon, label, value, wide }) => (
                <div key={label} className={`ss-data__cell ${wide ? 'is-wide' : ''}`}>
                  <span className="ss-data__icon"><Icon size={14} /></span>
                  <span className="ss-data__label">{label}</span>
                  <span className="ss-data__value">{value}</span>
                </div>
              ))}
            </div>
            {stage >= 3 && comp && (
              <div className="ss-chips">
                {comp.elements.map((e) => <span key={e} className="ss-chip">{e}</span>)}
                {comp.compounds.map((c) => <span key={c} className="ss-chip is-soft">{c}</span>)}
              </div>
            )}
            {body?.advanced?.geography && stage >= 2 && <p className="ss-info__geo">{body.advanced.geography}</p>}
            <p className="ss-info__src">Fuente: NASA Planetary Fact Sheet. Gigantes gaseosos: datos a 1 bar.</p>
          </>
        )}

        {tab === 'tu' && <YouThere id={id} stage={stage} />}

        {tab === 'explora' && <Explore id={id} body={body} found={found} foundTotal={foundTotal} />}
      </div>
    </aside>
  );
}
