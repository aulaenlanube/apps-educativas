// Configuración de Huesos y Músculos para el motor de mapas y su duelo.
import React from 'react';
import { makeAnatomyConfig } from '../_shared/anatomia/makeConfig';
import { AnatomyArt, ICONS } from '../_shared/anatomia/components';
import { STRUCTURES } from '../_shared/anatomia/data/structures';
import { courseLevel, GAMES, platesFor, regionsFor } from './engine/config';
import { buildRound } from './engine/questions';
import { ZONE } from './engine/data';
import MovementFigure from './components/MovementFigure';

const { Activity, Bone, Dumbbell, ScanLine, Sparkles } = ICONS;

const ARTS = {
  huesos: { plate: 'esq-a', ghost: 'a', x: 50, y: 30, zoom: 1.7, icon: Bone },
  musculos: { plate: 'mus-a', ghost: 'a', x: 50, y: 28, zoom: 1.8, icon: Dumbbell },
  detalle: { plate: 'craneo-l', x: 50, y: 45, zoom: 1.05, icon: Bone },
  hueso: { plate: 'hueso-largo', x: 50, y: 20, zoom: 1.4, icon: Sparkles },
  articulaciones: { plate: 'articulacion', x: 50, y: 50, zoom: 1.2, icon: Activity },
  accion: { plate: 'mus-p', ghost: 'p', x: 50, y: 58, zoom: 2.1, icon: Dumbbell },
  movimientos: { plate: 'mus-a', ghost: 'a', x: 30, y: 30, zoom: 2.4, icon: Activity },
  biomecanica: { plate: 'esq-p', ghost: 'p', x: 50, y: 82, zoom: 3, icon: ScanLine },
  atlas: { plate: 'esq-a', x: 50, y: 30, zoom: 1.3, ratio: '1 / 1' },
};

const atlasPlates = (lv) => ['esq-a', 'esq-p', 'mus-a', 'mus-p', 'cuerpo-a', 'cuerpo-p',
  ...(lv >= 4 ? ['craneo-a', 'craneo-l', 'columna-l', 'hueso-largo', 'articulacion'] : []),
  ...(lv >= 5 ? ['torax-a', 'mano', 'pie', 'musculos-tipo'] : [])];

const poolSize = (lv, region) => STRUCTURES.filter((s) => (s.t === 'hue' || s.t === 'mus') && s.l <= lv && ZONE[s.k] && (!region || region === 'all' || ZONE[s.k] === region)).length;

const TEXTS = {
  es: {
    modes: {
      easy: { desc: 'Para aprender: la lámina se acerca a la zona y hay pistas.', features: ['3 opciones por pregunta', 'Pistas gratis', '3 intentos en la lámina'] },
      medium: { desc: 'Opciones parecidas y el cuerpo entero.', features: ['4 opciones', 'Pista opcional (−50 %)', '2 intentos en la lámina'] },
      exam: { desc: (n) => `Diez preguntas mezcladas de los ${n} minijuegos de tu curso.`, features: ['Nota sobre 10', 'Puntos por rapidez y racha', 'Sin pistas, un intento'] },
    },
    atlasCta: { title: 'Atlas del aparato locomotor', text: 'Esqueleto y músculos de frente y de espaldas, cráneo, columna, mano y pie, con lupa de rayos X.' },
    regionQuestion: '¿Qué zona del cuerpo quieres trabajar?',
    regionScope: (name) => `Jugarás con: ${name}.`,
    allRegionsScope: 'Jugarás con todo el cuerpo.',
    ignoresRegion: 'Usa todo el cuerpo',
    pool: (lv, region) => `${poolSize(lv, region)} huesos y músculos en juego`,
    helpTitle: 'Cómo se juega: Huesos y Músculos',
    instructions: (
      <>
        <h3>🦴 Objetivo</h3>
        <p>Conoce a fondo el <strong>aparato locomotor</strong>: los huesos del esqueleto, los músculos, las articulaciones y cómo se mueve el cuerpo. Las láminas están hechas con un modelo 3D real del cuerpo humano.</p>
        <h3>🕹️ Minijuegos</h3>
        <ul>
          <li><strong>El esqueleto</strong> y <strong>Los músculos:</strong> toca cada hueso o músculo, o di cuál está iluminado.</li>
          <li><strong>Músculos en acción:</strong> qué hace cada músculo, cuáles trabajan en cada ejercicio y sus antagonistas.</li>
          <li><strong>El hueso por dentro</strong> y <strong>Articulaciones</strong> (desde 5.º): tipos de huesos, sus partes y cómo se unen.</li>
          <li><strong>Huesos en detalle</strong> y <strong>Movimientos</strong> (desde 1.º de ESO): cráneo, columna, tórax, mano y pie; un maniquí hace flexiones, extensiones, abducciones, rotaciones…</li>
          <li><strong>Biomecánica</strong> (Bachillerato): palancas, tipos de contracción, planos y ejes.</li>
        </ul>
        <h3>🎓 Modos</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Fácil</strong>3 opciones, pistas gratis, la lámina empieza cerca de la zona y tienes 3 intentos.</div>
          <div className="instr-mode medium"><strong>Medio</strong>4 opciones parecidas y 2 intentos. La pista resta la mitad de los puntos.</div>
          <div className="instr-mode exam"><strong>Examen</strong>10 preguntas mezcladas, sin pistas y con un solo intento. Nota sobre 10.</div>
        </div>
        <div className="instr-tips">
          <strong>💡 Consejos:</strong> en el <strong>Atlas</strong> usa la <strong>lupa de rayos X</strong> sobre los músculos para ver los huesos que tienen debajo. Puedes jugar en <strong>castellano, valenciano o inglés</strong>. Filtra por zona (cabeza, tronco, brazos, piernas) para estudiar por partes.
        </div>
        <h3>📚 Créditos</h3>
        <p>Modelos 3D: BodyParts3D, © The Database Center for Life Science (CC BY 4.0).</p>
      </>
    ),
  },
  en: {
    modes: {
      easy: { desc: 'To learn: the plate zooms in on the area and there are hints.', features: ['3 options per question', 'Free hints', '3 tries on the plate'] },
      medium: { desc: 'Similar options and the whole body.', features: ['4 options', 'Optional hint (−50 %)', '2 tries on the plate'] },
      exam: { desc: (n) => `Ten mixed questions from the ${n} games of your course.`, features: ['Mark out of 10', 'Points for speed and streaks', 'No hints, one try'] },
    },
    atlasCta: { title: 'Musculoskeletal atlas', text: 'Skeleton and muscles from the front and back, skull, spine, hand and foot, with an X-ray lens.' },
    regionQuestion: 'Which part of the body do you want to practise?',
    regionScope: (name) => `You will play with: ${name}.`,
    allRegionsScope: 'You will play with the whole body.',
    ignoresRegion: 'Uses the whole body',
    pool: (lv, region) => `${poolSize(lv, region)} bones and muscles to learn`,
    helpTitle: 'How to play: Bones and Muscles',
    instructions: (
      <>
        <h3>🦴 Goal</h3>
        <p>Get to know the <strong>musculoskeletal system</strong>: the bones of the skeleton, the muscles, the joints and how the body moves. The plates are made from a real 3D model of the human body.</p>
        <h3>🕹️ Games</h3>
        <ul>
          <li><strong>The skeleton</strong> and <strong>The muscles:</strong> tap each bone or muscle, or name the highlighted one.</li>
          <li><strong>Muscles in action:</strong> what each muscle does, which ones work in each exercise and their antagonists.</li>
          <li><strong>Inside a bone</strong>, <strong>Joints</strong>, <strong>Bones in detail</strong>, <strong>Movements</strong> and <strong>Biomechanics</strong> unlock as you move up through school.</li>
        </ul>
        <h3>🎓 Modes</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Easy</strong>3 options, free hints, the plate starts close to the area and you have 3 tries.</div>
          <div className="instr-mode medium"><strong>Medium</strong>4 similar options and 2 tries. Hints cost half the points.</div>
          <div className="instr-mode exam"><strong>Exam</strong>10 mixed questions, no hints and only one try. Mark out of 10.</div>
        </div>
        <div className="instr-tips">
          <strong>💡 Tips:</strong> in the <strong>Atlas</strong>, use the <strong>X-ray lens</strong> on the muscles to see the bones underneath. You can play in <strong>English, Spanish or Valencian</strong>.
        </div>
        <h3>📚 Credits</h3>
        <p>3D models: BodyParts3D, © The Database Center for Life Science (CC BY 4.0).</p>
      </>
    ),
  },
  va: {
    modes: {
      easy: { desc: 'Per a aprendre: la làmina s’acosta a la zona i hi ha pistes.', features: ['3 opcions per pregunta', 'Pistes gratis', '3 intents a la làmina'] },
      medium: { desc: 'Opcions semblants i el cos sencer.', features: ['4 opcions', 'Pista opcional (−50 %)', '2 intents a la làmina'] },
      exam: { desc: (n) => `Deu preguntes mesclades dels ${n} minijocs del teu curs.`, features: ['Nota sobre 10', 'Punts per rapidesa i ratxa', 'Sense pistes, un intent'] },
    },
    atlasCta: { title: "Atles de l'aparell locomotor", text: 'Esquelet i músculs de davant i de darrere, crani, columna, mà i peu, amb lupa de raigs X.' },
    regionQuestion: 'Quina zona del cos vols treballar?',
    regionScope: (name) => `Jugaràs amb: ${name}.`,
    allRegionsScope: 'Jugaràs amb tot el cos.',
    ignoresRegion: 'Usa tot el cos',
    pool: (lv, region) => `${poolSize(lv, region)} ossos i músculs en joc`,
    helpTitle: 'Com es juga: Ossos i Músculs',
    instructions: (
      <>
        <h3>🦴 Objectiu</h3>
        <p>Coneix a fons l'<strong>aparell locomotor</strong>: els ossos de l'esquelet, els músculs, les articulacions i com es mou el cos. Les làmines estan fetes amb un model 3D real del cos humà.</p>
        <h3>🕹️ Minijocs</h3>
        <ul>
          <li><strong>L'esquelet</strong> i <strong>Els músculs:</strong> toca cada os o múscul, o digues quin està il·luminat.</li>
          <li><strong>Músculs en acció:</strong> què fa cada múscul, quins treballen en cada exercici i els seus antagonistes.</li>
          <li><strong>L'os per dins</strong>, <strong>Articulacions</strong>, <strong>Ossos en detall</strong>, <strong>Moviments</strong> i <strong>Biomecànica</strong> es desbloquegen segons el curs.</li>
        </ul>
        <h3>🎓 Modes</h3>
        <div className="instr-modes">
          <div className="instr-mode easy"><strong>Fàcil</strong>3 opcions, pistes gratis, la làmina comença prop de la zona i tens 3 intents.</div>
          <div className="instr-mode medium"><strong>Mitjà</strong>4 opcions semblants i 2 intents. La pista resta la meitat dels punts.</div>
          <div className="instr-mode exam"><strong>Examen</strong>10 preguntes mesclades, sense pistes i amb un sol intent. Nota sobre 10.</div>
        </div>
        <div className="instr-tips">
          <strong>💡 Consells:</strong> a l'<strong>Atles</strong> usa la <strong>lupa de raigs X</strong> sobre els músculs per a veure els ossos que tenen davall. Pots jugar en <strong>valencià, castellà o anglés</strong>.
        </div>
        <h3>📚 Crèdits</h3>
        <p>Models 3D: BodyParts3D, © The Database Center for Life Science (CC BY 4.0).</p>
      </>
    ),
  },
};

export const hmConfig = makeAnatomyConfig({
  id: 'huesos-musculos',
  title: ['Huesos y Músculos', 'Bones and Muscles', 'Ossos i Músculs'],
  accent: '#fbbf24',
  accent2: '#ef4444',
  levelFor: courseLevel,
  games: GAMES,
  platesFor,
  regionsFor,
  buildRound,
  texts: TEXTS,
  atlasPlates,
  renderArt: (game) => <AnatomyArt art={ARTS[game] || ARTS.atlas} />,
  subjects: { move: (q) => <MovementFigure fig={q.subject.fig} /> },
});
