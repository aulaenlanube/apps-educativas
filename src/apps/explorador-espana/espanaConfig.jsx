// Configuración del Explorador de España para el motor de mapas
// (src/apps/_shared/geo/GeoQuizApp.jsx) y para su duelo.
import React from 'react';
import {
  CCAA, CCAA_BY_ID, PROVINCES, ZONES, FLAG_CREDITS, provKey, ccaaShort, ccaaFlag, isProvKey,
} from './data/spain';
import { loadSpain } from './geo/spain';
import { courseLevel, gamesFor, poolText } from './engine/config';
import { buildRound } from './engine/questions';
import { CcaaFacts, ProvFacts, GibraltarCard } from './components/SpainFacts';
import EspanaArt from './components/EspanaArt';

const geoCache = new WeakMap();
export function geoOf(spain) {
  if (!geoCache.has(spain)) {
    geoCache.set(spain, {
      neighbors: (key, layer) => spain.neighborsOf(key, layer),
      hasFeature: (id) => spain.features.has(id),
    });
  }
  return geoCache.get(spain);
}

const instructions = (
  <>
    <h3>🇪🇸 Objetivo</h3>
    <p>
      Conoce el mapa de España: sus <strong>comunidades autónomas</strong>, sus <strong>provincias</strong>,
      sus capitales, sus banderas y su <strong>relieve</strong> (ríos, montañas, mares e islas).
      El contenido crece con tu curso: primero las comunidades y, desde 5.º de Primaria, también las provincias.
    </p>
    <h3>🕹️ Minijuegos</h3>
    <ul>
      <li><strong>¿Dónde está?</strong> Toca la comunidad o la provincia en el mapa. Canarias está en el recuadro de abajo a la izquierda; Ceuta y Melilla son los puntos del norte de África.</li>
      <li><strong>Siluetas:</strong> reconoce cada comunidad (y, en la ESO, cada provincia) por su forma.</li>
      <li><strong>Banderas:</strong> las banderas de las comunidades autónomas.</li>
      <li><strong>Capitales</strong> (desde 3.º de Primaria): ¡cuidado con Santiago de Compostela, Mérida o Vitoria-Gasteiz!</li>
      <li><strong>Provincias</strong> (desde 5.º de Primaria): a qué comunidad pertenece cada provincia y cuántas tiene cada una.</li>
      <li><strong>Relieve</strong> (desde 3.º de Primaria): ríos y sus vertientes, sistemas montañosos, mares e islas.</li>
      <li><strong>Fronteras</strong> (desde 1.º de ESO): qué comunidades y provincias son vecinas.</li>
    </ul>
    <h3>🎓 Modos</h3>
    <div className="instr-modes">
      <div className="instr-mode easy"><strong>Fácil</strong>3 opciones, pistas gratis y 3 intentos; en provincias, el mapa se acerca a su comunidad.</div>
      <div className="instr-mode medium"><strong>Medio</strong>4 opciones con vecinas y parecidas, mapa sin colores y 2 intentos.</div>
      <div className="instr-mode exam"><strong>Examen</strong>10 preguntas mezcladas, sin pistas y con un solo intento. Nota sobre 10.</div>
    </div>
    <div className="instr-tips">
      <strong>💡 Consejos:</strong> abre el <strong>Atlas</strong> (botón del libro) para repasar cada comunidad y provincia con su ficha.
      Los sistemas montañosos se dibujan de forma esquemática, como en los mapas de relieve del libro.
    </div>
    <h3>📚 Créditos</h3>
    <p>Mapa de comunidades y provincias: © Instituto Geográfico Nacional (CC BY 4.0), vía es-atlas. Ríos: Natural Earth (dominio público).</p>
    <ul>{FLAG_CREDITS.map((c) => <li key={c.text}>{c.text}</li>)}</ul>
  </>
);

export const espanaConfig = {
  id: 'explorador-espana',
  title: 'Explorador de España',
  shell: { accent: '#ef4444', accent2: '#f59e0b' },
  load: loadSpain,
  levelFor: courseLevel,
  games: gamesFor,
  regions: () => null,
  regionLabel: () => '',
  poolText: (lv) => `${poolText(lv)} en juego`,
  buildRound: ({ lv, difficulty, world, rng }, gameId, n) => buildRound({ lv, difficulty, geo: geoOf(world), rng }, gameId, n),
  modes: {
    easy: { desc: 'Para aprender: mapa con colores, pistas y más intentos.', features: ['3 opciones por pregunta', 'Pistas gratis', '3 intentos en el mapa'] },
    medium: { desc: 'Opciones con comunidades vecinas y el mapa sin colores.', features: ['4 opciones', 'Pista opcional (−50 %)', '2 intentos en el mapa'] },
    exam: { desc: (n) => `Diez preguntas mezcladas de los ${n} minijuegos de tu curso.`, features: ['Nota sobre 10', 'Puntos por rapidez y racha', 'Sin pistas, un intento'] },
  },
  allRegionsScope: 'Jugarás con toda España.',
  instructions,
  atlasCta: { title: 'Atlas de España', text: 'Explora las comunidades y provincias con su bandera, capital, población, silueta y vecinas.' },
  atlas: (world) => ({
    title: 'Atlas de España',
    subtitle: '17 comunidades, 2 ciudades autónomas y 50 provincias',
    searchPlaceholder: 'Busca una comunidad, provincia o capital…',
    layers: [{ id: 'ccaa', label: 'Comunidades' }, { id: 'prov', label: 'Provincias' }],
    itemLayer: (key) => (isProvKey(key) ? 'prov' : 'ccaa'),
    items: [
      ...CCAA.map((c) => ({ key: c.id, name: c.name, sub: `Capital: ${c.cap}`, flag: ccaaFlag(c), group: c.zone, search: [c.cap, ...(c.alias || [])] })),
      ...PROVINCES.filter((p) => !p.autonomous).map((p) => {
        const c = CCAA_BY_ID[p.ccaa];
        return { key: provKey(p), name: p.name, sub: `${ccaaShort(c)} · ${p.cap}`, flag: ccaaFlag(c), group: c.zone, search: [p.cap, ...(p.alias || [])] };
      }),
    ],
    groups: ZONES,
    groupView: (zone) => world.views[`z-${zone}`] || world.views.world,
    colorBy: 'own',
    emptyTitle: 'Elige una comunidad o una provincia',
    emptyText: 'Tócala en el mapa, búscala o elígela en la lista. Cambia de capa para ver las provincias.',
    renderFacts: (key, select) => (isProvKey(key)
      ? <ProvFacts world={world} provKeyValue={key} onSelect={select} />
      : <CcaaFacts world={world} id={key} onSelect={select} />),
    renderOther: (key) => {
      const e = world.layers.ccaa.get(key) || world.layers.prov.get(key);
      return e?.terr ? <GibraltarCard entry={e} /> : null;
    },
    credits: 'Mapa: © Instituto Geográfico Nacional (CC BY 4.0) vía es-atlas · Ríos: Natural Earth · Créditos de las banderas en «Cómo se juega».',
  }),
  GameArt: EspanaArt,
};
