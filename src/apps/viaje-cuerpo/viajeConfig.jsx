// Configuración de Viaje por el Cuerpo para el motor de mapas y su duelo.
import React from 'react';
import { makeAnatomyConfig, atlasPlatesUpTo } from '../_shared/anatomia/makeConfig';
import { AnatomyArt, ICONS } from '../_shared/anatomia/components';
import { ROUTES, trackFor } from './engine/routes';
import { buildRound, platesFor } from './engine/questions';

const { Activity, Brain, Ear, Eye, HeartPulse, ScanLine, Sparkles, Wind } = ICONS;

export function courseLevel(level, grade) {
  const g = Number(grade) || 1;
  if (level === 'primaria') return g <= 4 ? 2 : 3;
  if (level === 'eso') return g <= 2 ? 4 : 5;
  if (level === 'bachillerato') return 6;
  return 2;
}

const ARTS = {
  bocado: { plate: 'digestivo-a', x: 50, y: 40, zoom: 1.6, icon: Sparkles },
  bocanada: { plate: 'bronquios-a', x: 50, y: 50, zoom: 1.15, icon: Wind },
  globulo: { plate: 'vas-a', ghost: 'a', x: 50, y: 22, zoom: 2.4, icon: HeartPulse },
  gota: { plate: 'org-prof-a', ghost: 'a', x: 50, y: 40, zoom: 2.6, icon: Sparkles },
  impulso: { plate: 'nerv-a', ghost: 'a', x: 50, y: 32, zoom: 1.8, icon: Activity },
  luz: { plate: 'ojo', x: 50, y: 50, zoom: 1.05, icon: Eye },
  sonido: { plate: 'oido', x: 50, y: 50, zoom: 1.05, icon: Ear },
  vida: { plate: 'embarazo', x: 50, y: 50, zoom: 1.05, icon: Sparkles },
  hormona: { plate: 'endocrino', x: 50, y: 20, zoom: 1.6, icon: Sparkles },
  defensa: { plate: 'linfatico', x: 50, y: 30, zoom: 1.4, icon: ScanLine },
  esfuerzo: { plate: 'vas-a', ghost: 'a', x: 50, y: 60, zoom: 2, icon: HeartPulse },
  humo: { plate: 'bronquios-a', x: 50, y: 50, zoom: 1.15, icon: Wind },
  atlas: { plate: 'vas-a', x: 50, y: 30, zoom: 1.3, ratio: '1 / 1' },
};

const GAMES = ROUTES.map((r) => ({ id: r.id, from: r.from, usesRegion: false, t: r.t, d: r.d }));
const stopsAt = (lv) => ROUTES.filter((r) => r.from <= lv).reduce((n, r) => n + trackFor(r, lv).stops.length, 0);

const TEXTS = {
  es: {
    modes: {
      easy: { desc: 'Para aprender: 3 intentos por parada, opciones fáciles y pistas.', features: ['3 opciones por pregunta', 'Pistas gratis', '3 intentos en la lámina'] },
      medium: { desc: 'Opciones parecidas y menos intentos.', features: ['4 opciones', 'Pista opcional (−50 %)', '2 intentos en la lámina'] },
      exam: { desc: (n) => `Diez preguntas mezcladas de los ${n} viajes de tu curso.`, features: ['Nota sobre 10', 'Puntos por rapidez y racha', 'Sin pistas, un intento'] },
    },
    atlasCta: { title: 'Atlas del cuerpo', text: 'Repasa los órganos de cada viaje: aparatos, cortes y esquemas, con lupa de rayos X.' },
    regionScope: () => '',
    allRegionsScope: 'Cada viaje sigue su ruta parada a parada.',
    ignoresRegion: '',
    pool: (lv) => `${stopsAt(lv)} paradas en juego`,
    helpTitle: 'Cómo se juega: Viaje por el Cuerpo',
    instructions: (
      <>
        <h3>🤖 Objetivo</h3>
        <p>El robot de la plataforma se ha hecho diminuto y <strong>viaja por dentro del cuerpo</strong>. Acompáñalo y descubre <strong>cómo funciona</strong>: por dónde va la comida, el aire, la sangre o un impulso nervioso y qué pasa en cada parada.</p>
        <h3>🗺️ Viajes</h3>
        <ul>
          <li><strong>El bocado</strong> (digestión) y <strong>La bocanada</strong> (respiración).</li>
          <li><strong>El glóbulo rojo</strong> (circulación), <strong>La gota</strong> (excreción), <strong>El impulso</strong> (acto reflejo), <strong>La luz</strong> (vista), <strong>El sonido</strong> (oído) y <strong>La vida</strong> (reproducción), desde 5.º.</li>
          <li><strong>El esfuerzo</strong> (el oxígeno hasta el músculo que trabaja) y <strong>El humo</strong> (lo que daña el tabaco), desde 1.º de ESO.</li>
          <li><strong>La hormona</strong> (desde 3.º de ESO) y <strong>La defensa</strong> (Bachillerato).</li>
        </ul>
        <p>En cada viaje: toca la primera parada, adivina la siguiente (la estela te enseña por dónde has pasado), elige qué ocurre en cada sitio y, al final, <strong>ordena el recorrido completo</strong> tocando las paradas.</p>
        <h3>🎓 Modos</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Fácil</strong>3 opciones, pistas gratis y 3 intentos por parada.</div>
          <div className="instr-mode medium"><strong>Medio</strong>4 opciones parecidas y 2 intentos. La pista resta la mitad de los puntos.</div>
          <div className="instr-mode exam"><strong>Examen</strong>10 preguntas mezcladas de todos los viajes, sin pistas y con un solo intento. Nota sobre 10.</div>
        </div>
        <div className="instr-tips"><strong>💡 Consejo:</strong> puedes jugar en <strong>castellano, valenciano o inglés</strong>. Abre el atlas para repasar las láminas antes de viajar.</div>
        <h3>📚 Créditos</h3>
        <p>Modelos 3D: BodyParts3D, © The Database Center for Life Science (CC BY 4.0).</p>
      </>
    ),
  },
  en: {
    modes: {
      easy: { desc: 'To learn: 3 tries per stop, easy options and hints.', features: ['3 options per question', 'Free hints', '3 tries on the plate'] },
      medium: { desc: 'Similar options and fewer tries.', features: ['4 options', 'Optional hint (−50 %)', '2 tries on the plate'] },
      exam: { desc: (n) => `Ten mixed questions from the ${n} journeys of your course.`, features: ['Mark out of 10', 'Points for speed and streaks', 'No hints, one try'] },
    },
    atlasCta: { title: 'Body atlas', text: 'Review the organs of every journey: systems, sections and diagrams, with an X-ray lens.' },
    regionScope: () => '',
    allRegionsScope: 'Each journey follows its route stop by stop.',
    ignoresRegion: '',
    pool: (lv) => `${stopsAt(lv)} stops to visit`,
    helpTitle: 'How to play: Journey Through the Body',
    instructions: (
      <>
        <h3>🤖 Goal</h3>
        <p>The platform robot has shrunk and is <strong>travelling inside the body</strong>. Go with it and find out <strong>how the body works</strong>: where food, air, blood or a nerve impulse go, and what happens at each stop.</p>
        <h3>🗺️ Journeys</h3>
        <ul>
          <li><strong>The bite</strong> (digestion) and <strong>A breath of air</strong> (breathing).</li>
          <li><strong>The red blood cell</strong>, <strong>The drop</strong>, <strong>The nerve impulse</strong>, <strong>Light</strong>, <strong>Sound</strong> and <strong>Life</strong> in higher years.</li>
          <li><strong>The workout</strong> (oxygen on its way to a working muscle) and <strong>The smoke</strong> (the damage tobacco does), from Year 8.</li>
          <li><strong>The hormone</strong> and <strong>The defence</strong> for older students.</li>
        </ul>
        <p>In each journey: tap the first stop, guess the next one (the trail shows where you have been), choose what happens at each place and, at the end, <strong>put the whole route in order</strong>.</p>
        <h3>🎓 Modes</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Easy</strong>3 options, free hints and 3 tries per stop.</div>
          <div className="instr-mode medium"><strong>Medium</strong>4 similar options and 2 tries. Hints cost half the points.</div>
          <div className="instr-mode exam"><strong>Exam</strong>10 mixed questions from every journey, no hints and only one try. Mark out of 10.</div>
        </div>
        <div className="instr-tips"><strong>💡 Tip:</strong> you can play in <strong>English, Spanish or Valencian</strong>.</div>
        <h3>📚 Credits</h3>
        <p>3D models: BodyParts3D, © The Database Center for Life Science (CC BY 4.0).</p>
      </>
    ),
  },
  va: {
    modes: {
      easy: { desc: 'Per a aprendre: 3 intents per parada, opcions fàcils i pistes.', features: ['3 opcions per pregunta', 'Pistes gratis', '3 intents a la làmina'] },
      medium: { desc: 'Opcions semblants i menys intents.', features: ['4 opcions', 'Pista opcional (−50 %)', '2 intents a la làmina'] },
      exam: { desc: (n) => `Deu preguntes mesclades dels ${n} viatges del teu curs.`, features: ['Nota sobre 10', 'Punts per rapidesa i ratxa', 'Sense pistes, un intent'] },
    },
    atlasCta: { title: 'Atles del cos', text: "Repassa els òrgans de cada viatge: aparells, talls i esquemes, amb lupa de raigs X." },
    regionScope: () => '',
    allRegionsScope: 'Cada viatge segueix la seua ruta parada a parada.',
    ignoresRegion: '',
    pool: (lv) => `${stopsAt(lv)} parades en joc`,
    helpTitle: 'Com es juga: Viatge pel Cos',
    instructions: (
      <>
        <h3>🤖 Objectiu</h3>
        <p>El robot de la plataforma s'ha fet diminut i <strong>viatja per dins del cos</strong>. Acompanya'l i descobreix <strong>com funciona</strong>: per on va el menjar, l'aire, la sang o un impuls nerviós i què passa a cada parada.</p>
        <h3>🗺️ Viatges</h3>
        <ul>
          <li><strong>La mossegada</strong> (digestió) i <strong>L'alenada</strong> (respiració).</li>
          <li><strong>El glòbul roig</strong>, <strong>La gota</strong>, <strong>L'impuls</strong>, <strong>La llum</strong>, <strong>El so</strong> i <strong>La vida</strong> des de 5é.</li>
          <li><strong>L'esforç</strong> (l'oxigen fins al múscul que treballa) i <strong>El fum</strong> (el que danya el tabac), des de 1r d'ESO.</li>
          <li><strong>L'hormona</strong> (des de 3r d'ESO) i <strong>La defensa</strong> (Batxillerat).</li>
        </ul>
        <p>En cada viatge: toca la primera parada, endevina la següent (l'estela t'ensenya per on has passat), tria què passa a cada lloc i, al final, <strong>ordena el recorregut complet</strong>.</p>
        <h3>🎓 Modes</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Fàcil</strong>3 opcions, pistes gratis i 3 intents per parada.</div>
          <div className="instr-mode medium"><strong>Mitjà</strong>4 opcions semblants i 2 intents. La pista resta la meitat dels punts.</div>
          <div className="instr-mode exam"><strong>Examen</strong>10 preguntes mesclades de tots els viatges, sense pistes i amb un sol intent. Nota sobre 10.</div>
        </div>
        <div className="instr-tips"><strong>💡 Consell:</strong> pots jugar en <strong>valencià, castellà o anglés</strong>.</div>
        <h3>📚 Crèdits</h3>
        <p>Models 3D: BodyParts3D, © The Database Center for Life Science (CC BY 4.0).</p>
      </>
    ),
  },
};

export const viajeConfig = makeAnatomyConfig({
  id: 'viaje-cuerpo',
  title: ['Viaje por el Cuerpo', 'Journey Through the Body', 'Viatge pel Cos'],
  accent: '#a78bfa',
  accent2: '#22d3ee',
  levelFor: courseLevel,
  games: GAMES,
  platesFor,
  regionsFor: () => null,
  buildRound,
  texts: TEXTS,
  atlasPlates: (lv) => atlasPlatesUpTo(lv, ['cuerpo', 'organos', 'dentro', 'esquemas']),
  renderArt: (game) => <AnatomyArt art={ARTS[game] || ARTS.atlas} />,
});
