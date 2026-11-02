// Configuración del Explorador del Mundo para el motor de mapas
// (src/apps/_shared/geo/GeoQuizApp.jsx) y para su duelo.
import React from 'react';
import { COUNTRIES, CONTINENTS, INHABITED } from './data/countries';
import { loadWorld, loadRelief } from './geo/world';
import {
  LEVELS, REGIONS, courseLevel, gamesFor, poolSize, regionLabel,
} from './engine/config';
import { buildRound } from './engine/questions';
import CountryFacts, { TerritoryCard } from './components/CountryFacts';
import GameArt from './components/GameArt';

// Acceso del motor de preguntas a la geometría.
const geoCache = new WeakMap();
export function geoOf(world) {
  if (!geoCache.has(world)) {
    geoCache.set(world, {
      locatable: (iso) => world.entries.has(iso),
      hasShape: (iso) => Boolean(world.entries.get(iso)?.hasShape),
      neighbors: (iso) => world.neighbors.get(iso) || [],
      hasFeature: (id) => world.features.has(id),
    });
  }
  return geoCache.get(world);
}

const needsRelief = (gameId, lv) => gameId === 'relieve' || ((gameId === 'exam' || gameId === 'duel') && LEVELS[lv].reliefTier > 0);

const instructions = (
  <>
    <h3>🌍 Objetivo</h3>
    <p>
      Conoce los <strong>países</strong>, <strong>continentes</strong>, <strong>océanos</strong> y el <strong>relieve</strong> del mundo:
      dónde están, qué forma tienen, sus banderas, sus capitales, sus ríos y montañas y sus ciudades más importantes.
      El contenido se adapta a tu curso: cuanto más avanzas, más países y más minijuegos.
    </p>
    <h3>🕹️ Minijuegos</h3>
    <ul>
      <li><strong>¿Dónde está?</strong> Toca el país en el mapa. Arrastra para moverte y haz zoom con la rueda, los botones o pellizcando. Los puntos blancos son países muy pequeños.</li>
      <li><strong>Siluetas:</strong> adivina el país solo por su forma.</li>
      <li><strong>Banderas:</strong> ¿de quién es esta bandera? ¿Y cuál es la bandera de este país?</li>
      <li><strong>Continentes y océanos:</strong> sitúa países, toca continentes en el mapa y reconoce los cinco océanos.</li>
      <li><strong>Capitales</strong> (desde 3.º de Primaria): la capital de cada país y al revés. ¡Cuidado con las trampas, como Sídney y Canberra!</li>
      <li><strong>Relieve</strong> (desde 5.º de Primaria): ríos, cordilleras, desiertos, mares y lagos del mundo.</li>
      <li><strong>Grandes ciudades</strong> (desde 1.º de ESO): ciudades famosas y la más poblada de cada país.</li>
      <li><strong>Fronteras</strong> (desde 3.º de ESO): ¿qué países son vecinos?</li>
    </ul>
    <h3>🎓 Modos</h3>
    <div className="instr-modes">
      <div className="instr-mode easy"><strong>Fácil</strong>3 opciones, pistas gratis, el mapa se acerca al continente y tienes 3 intentos.</div>
      <div className="instr-mode medium"><strong>Medio</strong>4 opciones más parecidas, el mapa del mundo entero y 2 intentos. La pista resta la mitad de los puntos.</div>
      <div className="instr-mode exam"><strong>Examen</strong>10 preguntas mezcladas de todos los minijuegos. Sin pistas y con un solo intento. Nota sobre 10.</div>
    </div>
    <div className="instr-tips">
      <strong>💡 Consejos:</strong> abre el <strong>Atlas</strong> (botón del libro) para estudiar cada país con su ficha.
      En las opciones puedes responder con las teclas <kbd>1</kbd>–<kbd>5</kbd> y pasar con <kbd>Intro</kbd>.
      Responder rápido y encadenar aciertos da puntos extra.
    </div>
    <h3>📚 Créditos</h3>
    <p>Mapas y relieve: Natural Earth (dominio público). Banderas: flag-icons (licencia MIT).</p>
  </>
);

export const mundoConfig = {
  id: 'explorador-mundo',
  title: 'Explorador del Mundo',
  shell: { accent: '#0ea5e9', accent2: '#10b981' },
  load: loadWorld,
  prepare: (gameId, world, lv) => (needsRelief(gameId, lv) ? loadRelief(world) : Promise.resolve(world)),
  levelFor: courseLevel,
  games: gamesFor,
  regions: (lv) => (LEVELS[lv].regions ? REGIONS : null),
  regionLabel,
  regionQuestion: '¿Qué parte del mundo quieres explorar?',
  allRegionsLabel: 'Todo el mundo',
  regionScope: (id) => `Jugarás con los países de ${regionLabel(id)}.`,
  allRegionsScope: 'Jugarás con países de todo el mundo.',
  ignoresRegionNote: 'Usa el mundo entero',
  poolText: (lv, region) => `${poolSize(lv, region)} países en juego`,
  buildRound: ({ lv, region, difficulty, world, rng }, gameId, n) => buildRound({ lv, region, difficulty, geo: geoOf(world), rng }, gameId, n),
  modes: {
    easy: { desc: 'Para aprender: el mapa se acerca al continente y hay pistas.', features: ['3 opciones por pregunta', 'Pistas gratis', '3 intentos en el mapa'] },
    medium: { desc: 'Opciones más parecidas entre sí y el mapa del mundo entero.', features: ['4 opciones', 'Pista opcional (−50 %)', '2 intentos en el mapa'] },
    exam: { desc: (n) => `Diez preguntas mezcladas de los ${n} minijuegos de tu curso.`, features: ['Nota sobre 10', 'Puntos por rapidez y racha', 'Sin pistas, un intento'] },
  },
  instructions,
  atlasCta: { title: 'Atlas del mundo', text: 'Explora los 195 países con su bandera, capital, población, silueta y vecinos.' },
  atlas: (world) => ({
    title: 'Atlas del mundo',
    subtitle: `${COUNTRIES.length} países · toca uno para ver su ficha`,
    searchPlaceholder: 'Busca un país o una capital…',
    items: COUNTRIES.map((k) => ({ key: k.c, name: k.name, sub: k.cap, flag: k.c, group: k.cont, search: [k.cap, ...(k.alias || [])] })),
    groups: INHABITED.map((c) => ({ id: c, label: CONTINENTS[c].name, color: CONTINENTS[c].color })),
    groupView: (c) => world.views[c],
    colorBy: 'continent',
    emptyTitle: 'Elige un país',
    emptyText: 'Tócalo en el mapa, búscalo por su nombre o su capital, o elígelo en la lista.',
    renderFacts: (key, select) => <CountryFacts world={world} iso={key} onSelect={select} />,
    renderOther: (key) => {
      const e = world.entries.get(key);
      return e?.terr ? <TerritoryCard entry={e} /> : null;
    },
    credits: 'Mapa: Natural Earth (dominio público) · Banderas: flag-icons (MIT).',
  }),
  GameArt,
};
